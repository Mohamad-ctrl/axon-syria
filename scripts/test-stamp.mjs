/**
 * Spike harness for src/lib/sign-pdf.ts. Run after make-test-pdfs.mjs:
 *   node scripts/test-stamp.mjs
 * Writes out-*.pdf next to the fixtures; open them to eyeball placement.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { stampSignature } from "../src/lib/sign-pdf.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(here, "fixtures");
const sig = new Uint8Array(fs.readFileSync(path.join(dir, "signature.png")));

const cases = [
  { file: "contract-en.pdf", expect: "detected", expectPage: 2 },
  { file: "header-trap.pdf", expect: "detected", expectPage: 2 },
  // Without ANTHROPIC_API_KEY in the env this must land on the fixed fallback.
  { file: "scan-like.pdf", expect: process.env.ANTHROPIC_API_KEY ? "ai" : "fallback", expectPage: 1 },
];

let failed = 0;
for (const c of cases) {
  const pdf = new Uint8Array(fs.readFileSync(path.join(dir, c.file)));
  const res = await stampSignature(pdf, sig, {
    approvedAt: new Date(),
    signatureMime: "image/png",
  });
  if (!res) {
    console.error(`FAIL ${c.file}: stampSignature returned null`);
    failed++;
    continue;
  }
  fs.writeFileSync(path.join(dir, `out-${c.file}`), res.bytes);
  const ok = res.placement === c.expect && res.page === c.expectPage;
  console.log(
    `${ok ? "PASS" : "FAIL"} ${c.file}: placement=${res.placement} page=${res.page} ` +
      `(expected ${c.expect} p${c.expectPage})`,
  );
  if (!ok) failed++;
}

// Hostile input: truncated PDF must yield null, not a crash.
const broken = new Uint8Array(fs.readFileSync(path.join(dir, "contract-en.pdf"))).slice(0, 400);
const res = await stampSignature(broken, sig, { approvedAt: new Date(), signatureMime: "image/png" });
console.log(`${res === null ? "PASS" : "FAIL"} truncated.pdf: ${res === null ? "null as expected" : "unexpected result"}`);
if (res !== null) failed++;

process.exit(failed ? 1 : 0);
