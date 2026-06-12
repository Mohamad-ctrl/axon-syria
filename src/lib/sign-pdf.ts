/**
 * Server-only PDF signature stamping for the approval-requests pilot.
 *
 * When the CEO approves a request, his stored signature image is stamped into
 * the request's PDF. The stamp position is found in three tiers:
 *   1. Text-layer keyword scan (free, deterministic): signature labels in
 *      EN/AR/TR ("Signature", "التوقيع", "İmza", ...) and nearby signature
 *      lines, preferring the last page and the lower part of a page.
 *   2. Claude vision (runs only when ANTHROPIC_API_KEY is set, mirroring
 *      lib/translate.ts): the last pages of the PDF are sent as a document
 *      block and the model returns the signing area as a normalized box.
 *   3. Fixed fallback: bottom-right of the last page.
 *
 * Returns null on ANY problem (encrypted/malformed PDF, bad signature image,
 * API outage) so the approve action can fall back to a record-only approval.
 * Approving a request is never blocked by stamping. Never import this into a
 * Client Component.
 */
import { PDFDocument } from "pdf-lib";
import { getDocumentProxy } from "unpdf";

export type StampPlacement = "detected" | "ai" | "fallback" | "manual";

export type StampResult = {
  bytes: Uint8Array;
  /** How the position was found, for the audit log / UI. */
  placement: StampPlacement;
  /** 1-based page number that was stamped. */
  page: number;
};

/**
 * An exact spot the CEO chose in the browser placement editor, as fractions of
 * the page with a TOP-LEFT origin (nx/ny = the box's top-left corner; nw/nh =
 * its size). The box already matches the signature's aspect ratio.
 */
export type ManualPlacement = {
  pageIndex: number;
  nx: number;
  ny: number;
  nw: number;
  nh: number;
};

type Spot = { pageIndex: number; x: number; y: number; placement: StampPlacement };

/** Stamp box in PDF points (origin bottom-left, same space pdf-lib draws in). */
const BOX_W = 180;
const BOX_H = 70;
const IMG_MAX_W = 180;
const IMG_MAX_H = 52;
const MARGIN = 36;

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-haiku-4-5";

/* ------------------------------------------------------------ entry point */

export async function stampSignature(
  pdfBytes: Uint8Array,
  signatureBytes: Uint8Array,
  opts: { approvedAt: Date; signatureMime: string; version?: number; manual?: ManualPlacement },
): Promise<StampResult | null> {
  try {
    const doc = await PDFDocument.load(pdfBytes, {
      ignoreEncryption: true,
      updateMetadata: false,
    });
    const count = doc.getPageCount();
    if (count === 0) return null;

    const img =
      opts.signatureMime === "image/png"
        ? await doc.embedPng(signatureBytes)
        : await doc.embedJpg(signatureBytes);

    // Manual: the CEO positioned the signature himself in the editor. Stamp the
    // image filling exactly that box (no date label) and skip all detection.
    if (opts.manual) {
      const pageIndex = clamp(Math.round(opts.manual.pageIndex), 0, count - 1);
      const page = doc.getPage(pageIndex);
      const { width: pw, height: ph } = page.getSize();
      const boxW = Math.min(Math.max(opts.manual.nw, 0) * pw, pw);
      const boxH = Math.min(Math.max(opts.manual.nh, 0) * ph, ph);
      const boxX = clamp(opts.manual.nx * pw, 0, pw - boxW);
      // Convert the top-left-origin fraction to pdf-lib's bottom-left points.
      const boxY = clamp(ph - (opts.manual.ny * ph + boxH), 0, ph - boxH);
      const scale = Math.min(boxW / img.width, boxH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      page.drawImage(img, {
        x: boxX + (boxW - w) / 2,
        y: boxY + (boxH - h) / 2,
        width: w,
        height: h,
      });

      const bytes = await doc.save();
      await PDFDocument.load(bytes, { ignoreEncryption: true });
      return { bytes, placement: "manual", page: pageIndex + 1 };
    }

    let spot: Spot | null = null;
    try {
      spot = await detectFromText(pdfBytes);
    } catch (err) {
      console.error("[sign-pdf] text-layer detection failed", err);
    }
    if (!spot) {
      try {
        spot = await detectWithClaude(doc);
      } catch (err) {
        console.error("[sign-pdf] AI detection failed", err);
      }
    }
    if (!spot) spot = fallbackSpot(doc);

    const page = doc.getPage(spot.pageIndex);
    const { width: pw, height: ph } = page.getSize();
    const x = clamp(spot.x, MARGIN, pw - MARGIN - BOX_W);
    const y = clamp(spot.y, 20, ph - 20 - BOX_H);

    const scale = Math.min(IMG_MAX_W / img.width, IMG_MAX_H / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    // Just the signature, centered in the box (no date label).
    page.drawImage(img, { x: x + (BOX_W - w) / 2, y: y + (BOX_H - h) / 2, width: w, height: h });

    const bytes = await doc.save();
    // pdf-lib can silently emit corrupt output for some encrypted/malformed
    // inputs; a reload is a cheap sanity check before we publish the copy.
    await PDFDocument.load(bytes, { ignoreEncryption: true });

    return { bytes, placement: spot.placement, page: spot.pageIndex + 1 };
  } catch (err) {
    console.error("[sign-pdf] stamping failed", err);
    return null;
  }
}

/* -------------------------------------------- tier 1: text-layer keywords */

type PdfTextItem = { str: string; transform: number[]; width: number; height: number };

const STRONG_KEYWORDS = [
  "authorized signatory",
  "for and on behalf",
  "signed by",
  "المفوض بالتوقيع",
];
const KEYWORDS = [
  ...STRONG_KEYWORDS,
  "signature",
  "approved by",
  "توقيع", // also matches التوقيع
  "imza", // "İmza" lowercases to "i̇mza"; the U+0307 is stripped below
];

/** A run of underscores/dots/dashes (incl. Arabic tatweel) drawn as a line. */
const LINE_RE = /^[\s_.\-–—…·ـ]{6,}$/u;

/**
 * NFKC folds Arabic presentation forms (how pdf.js often extracts Arabic)
 * back to base letters; then strip the combining dot from a lowercased "İ",
 * Arabic tashkeel, and tatweel so elongated labels still match.
 */
function normalize(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u0307\u064B-\u065F\u0670\u0640]/g, "");
}

async function detectFromText(pdfBytes: Uint8Array): Promise<Spot | null> {
  const pdf = await getDocumentProxy(new Uint8Array(pdfBytes));
  try {
    const pageCount = pdf.numPages;
    let best: {
      score: number;
      pageIndex: number;
      x: number;
      y: number;
      kwY: number;
    } | null = null;

    // Signature blocks live near the end; scanning the last 4 pages is enough.
    for (let pageNum = pageCount; pageNum >= Math.max(1, pageCount - 3); pageNum--) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1 });
      if (viewport.rotation % 360 !== 0) continue; // skip rotated pages
      const content = await page.getTextContent();
      // pdf.js TextItem carries more fields than we model; the local shape is enough.
      const items = content.items.filter(
        (it) => "str" in it && typeof (it as { str: unknown }).str === "string",
      ) as unknown as PdfTextItem[];
      const lines = items.filter((it) => LINE_RE.test(it.str) && it.width >= 40);

      for (const it of items) {
        const norm = normalize(it.str);
        if (!norm) continue;
        const kw = KEYWORDS.find((k) => norm.includes(k));
        if (!kw) continue;

        const itX = it.transform[4];
        const itY = it.transform[5];

        let score = 1;
        if (STRONG_KEYWORDS.includes(kw)) score += 1;
        if (pageNum === pageCount) score += 3;
        else if (pageNum === pageCount - 1) score += 1;
        if (itY < viewport.height * 0.4) score += 2;

        // A drawn line just above/beside the label is a strong signal and
        // also gives the best stamp position.
        const line = lines
          .filter(
            (l) =>
              l.transform[5] >= itY - 12 &&
              l.transform[5] <= itY + 70 &&
              Math.abs(l.transform[4] - itX) < 260,
          )
          .sort(
            (a, b) =>
              Math.abs(a.transform[5] - itY) - Math.abs(b.transform[5] - itY),
          )[0];
        if (line) score += 2;

        if (score < 4) continue;

        // Stamp above the line when we have one, else above the label itself.
        const x = line
          ? line.transform[4] + line.width / 2 - BOX_W / 2
          : itX + it.width / 2 - BOX_W / 2;
        const y = line ? line.transform[5] + 4 : itY + it.height + 6;

        // Prefer the higher score; on ties prefer the lower position on the page.
        if (!best || score > best.score || (score === best.score && itY < best.kwY)) {
          best = { score, pageIndex: pageNum - 1, x, y, kwY: itY };
        }
      }
      if (best && pageNum === pageCount) break; // a last-page hit wins outright
    }

    return best
      ? { pageIndex: best.pageIndex, x: best.x, y: best.y, placement: "detected" }
      : null;
  } finally {
    await pdf.destroy().catch(() => {});
  }
}

/* ----------------------------------------------- tier 2: Claude vision */

const AI_PROMPT =
  "This PDF is a business document (quotation, contract, or letter) awaiting approval. " +
  "Locate the area where the APPROVING party should place their signature: an empty " +
  "signature box, a line labeled Signature / التوقيع / İmza, or a signatory block. If " +
  "several exist, pick the one intended for the approving/second party, preferring the " +
  "last occurrence. Return normalized coordinates between 0 and 1 with the origin at the " +
  "TOP-LEFT of the page: x and y for the area's top-left corner, w and h for its size, " +
  "and the 1-based page number within THIS document. If no signature area exists " +
  "(for example a plain letter), set found to false.";

const AI_SCHEMA = {
  type: "object",
  properties: {
    found: { type: "boolean" },
    page: { type: "integer" },
    x: { type: "number" },
    y: { type: "number" },
    w: { type: "number" },
    h: { type: "number" },
  },
  required: ["found", "page", "x", "y", "w", "h"],
  additionalProperties: false,
} as const;

async function detectWithClaude(doc: PDFDocument): Promise<Spot | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  // Send only the last pages to bound cost; map the answer back afterwards.
  const pageCount = doc.getPageCount();
  const sendCount = Math.min(pageCount, 4);
  const firstSent = pageCount - sendCount;
  const sub = await PDFDocument.create();
  const copied = await sub.copyPages(
    doc,
    Array.from({ length: sendCount }, (_, i) => firstSent + i),
  );
  copied.forEach((p) => sub.addPage(p));
  const subBytes = await sub.save();

  const res = await fetch(ENDPOINT, {
    method: "POST",
    signal: AbortSignal.timeout(25_000),
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      output_config: { format: { type: "json_schema", schema: AI_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: Buffer.from(subBytes).toString("base64"),
              },
            },
            { type: "text", text: AI_PROMPT },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    console.error("[sign-pdf] Anthropic API error", res.status, await res.text().catch(() => ""));
    return null;
  }

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const raw = json.content?.find((b) => b.type === "text")?.text?.trim();
  if (!raw) return null;
  const out = JSON.parse(raw) as {
    found?: boolean;
    page?: number;
    x?: number;
    y?: number;
    w?: number;
    h?: number;
  };

  if (
    out.found !== true ||
    typeof out.page !== "number" ||
    !Number.isInteger(out.page) ||
    out.page < 1 ||
    out.page > sendCount ||
    typeof out.x !== "number" ||
    typeof out.y !== "number" ||
    typeof out.w !== "number" ||
    typeof out.h !== "number" ||
    out.x < 0 ||
    out.y < 0 ||
    out.w <= 0 ||
    out.h <= 0 ||
    out.x > 1 ||
    out.y > 1 ||
    out.w > 1 ||
    out.h > 1
  ) {
    return null;
  }

  const pageIndex = firstSent + (out.page - 1);
  const { width, height } = doc.getPage(pageIndex).getSize();
  // Model coords are top-left-origin and normalized; pdf-lib wants
  // bottom-left points. Center the stamp box on the reported area.
  const x = (out.x + out.w / 2) * width - BOX_W / 2;
  const y = height - (out.y + out.h) * height;
  return { pageIndex, x, y, placement: "ai" };
}

/* -------------------------------------------------- tier 3: fixed fallback */

function fallbackSpot(doc: PDFDocument): Spot {
  const pageIndex = doc.getPageCount() - 1;
  const { width } = doc.getPage(pageIndex).getSize();
  return { pageIndex, x: width - MARGIN - BOX_W, y: 60, placement: "fallback" };
}

/* ---------------------------------------------------------------- helpers */

function clamp(v: number, min: number, max: number): number {
  if (max < min) return Math.max((min + max) / 2, 0);
  return Math.min(Math.max(v, min), max);
}
