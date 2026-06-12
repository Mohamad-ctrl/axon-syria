"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

export type Placement = { pageIndex: number; nx: number; ny: number; nw: number; nh: number };

type Interaction = {
  type: "move" | "resize";
  startX: number;
  startY: number;
  startLeft: number;
  startTop: number;
  startWidth: number;
};

const clampPx = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * A lightweight "place the signature" editor: renders the request PDF with
 * pdf.js, overlays the CEO's signature as a draggable, resizable box (locked to
 * the signature's aspect ratio so it never distorts), and reports the chosen
 * spot as page-relative fractions. The CEO can only move/scale the signature,
 * nothing else. Loaded only when opened (dynamic import keeps pdf.js out of the
 * main admin bundle).
 */
export default function SignaturePlacer({
  pdfUrl,
  signatureUrl,
  initialPageIndex,
  onConfirm,
  onCancel,
}: {
  pdfUrl: string;
  signatureUrl: string;
  initialPageIndex?: number;
  onConfirm: (p: Placement) => void;
  onCancel: () => void;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const pdfRef = useRef<PDFDocumentProxy | null>(null);
  const interaction = useRef<Interaction | null>(null);

  const [numPages, setNumPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aspect, setAspect] = useState(3);
  const [box, setBox] = useState({ left: 0, top: 0, width: 0 });

  const boxHeight = box.width / aspect;

  // Lock background scroll + close on Escape while open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onCancel]);

  // Signature aspect ratio (so the box shows it undistorted).
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth && img.naturalHeight) setAspect(img.naturalWidth / img.naturalHeight);
    };
    img.src = signatureUrl;
  }, [signatureUrl]);

  // Load the PDF once.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).href;
        const res = await fetch(pdfUrl);
        if (!res.ok) throw new Error(`fetch ${res.status}`);
        const data = await res.arrayBuffer();
        if (cancelled) return;
        const pdf = await pdfjs.getDocument({ data }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setPageIndex(Math.min(Math.max(initialPageIndex ?? pdf.numPages - 1, 0), pdf.numPages - 1));
        setLoading(false);
      } catch (err) {
        console.error("[placer] could not load PDF", err);
        if (!cancelled) {
          setError("Could not open the PDF here. Use automatic placement instead.");
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, initialPageIndex]);

  // Render the selected page; (re)initialise or clamp the box to its size.
  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || loading || error) return;
    let task: RenderTask | null = null;
    let cancelled = false;
    (async () => {
      const page = await pdf.getPage(pageIndex + 1);
      if (cancelled) return;
      const stage = stageRef.current;
      const canvas = canvasRef.current;
      if (!stage || !canvas) return;
      const cssWidth = stage.clientWidth;
      const vp1 = page.getViewport({ scale: 1 });
      const dpr = window.devicePixelRatio || 1;
      const scale = (cssWidth / vp1.width) * dpr;
      const vp = page.getViewport({ scale });
      canvas.width = Math.floor(vp.width);
      canvas.height = Math.floor(vp.height);
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${vp.height / dpr}px`;

      // Place/clamp the box as soon as the page size is known, so an
      // interrupted render (Strict Mode / HMR) can't leave it uninitialised.
      const dispW = canvas.clientWidth;
      const dispH = canvas.clientHeight;
      if (dispW > 0 && dispH > 0) {
        // width <= 0 means "not placed yet". Keep this updater pure (no ref
        // mutation) so React's Strict-Mode double-invoke stays consistent.
        setBox((b) => {
          if (b.width <= 0) {
            const width = dispW * 0.32;
            const height = width / aspect;
            return {
              width,
              left: clampPx(dispW * 0.6, 0, dispW - width),
              top: clampPx(dispH * 0.82 - height, 0, dispH - height),
            };
          }
          const width = Math.min(b.width, dispW);
          const height = width / aspect;
          return {
            width,
            left: clampPx(b.left, 0, dispW - width),
            top: clampPx(b.top, 0, dispH - height),
          };
        });
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      task = page.render({ canvas, canvasContext: ctx, viewport: vp });
      try {
        await task.promise;
      } catch {
        /* cancelled render */
      }
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
      try {
        task?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [pageIndex, loading, error, aspect]);

  const onBoxPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      const isHandle = (e.target as HTMLElement).dataset.handle === "1";
      interaction.current = {
        type: isHandle ? "resize" : "move",
        startX: e.clientX,
        startY: e.clientY,
        startLeft: box.left,
        startTop: box.top,
        startWidth: box.width,
      };
      boxRef.current?.setPointerCapture(e.pointerId);
    },
    [box],
  );

  const onBoxPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const it = interaction.current;
    const canvas = canvasRef.current;
    if (!it || !canvas) return;
    const dispW = canvas.clientWidth;
    const dispH = canvas.clientHeight;
    if (it.type === "move") {
      const width = it.startWidth;
      const height = width / aspect;
      setBox({
        width,
        left: clampPx(it.startLeft + (e.clientX - it.startX), 0, dispW - width),
        top: clampPx(it.startTop + (e.clientY - it.startY), 0, dispH - height),
      });
    } else {
      let width = it.startWidth + (e.clientX - it.startX);
      width = clampPx(width, 48, dispW - it.startLeft);
      width = Math.min(width, (dispH - it.startTop) * aspect);
      setBox({ left: it.startLeft, top: it.startTop, width });
    }
  }, [aspect]);

  const endInteraction = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    interaction.current = null;
    try {
      boxRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  function confirm() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dispW = canvas.clientWidth;
    const dispH = canvas.clientHeight;
    if (!dispW || !dispH) return;
    onConfirm({
      pageIndex,
      nx: box.left / dispW,
      ny: box.top / dispH,
      nw: box.width / dispW,
      nh: boxHeight / dispH,
    });
  }

  return (
    <div
      className="sig-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Place signature"
      onClick={onCancel}
    >
      <div className="sig-modal sig-modal--wide" onClick={(e) => e.stopPropagation()}>
        <h3>Place the signature</h3>

        {!loading && !error && (
          <div className="placer__nav">
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
            >
              ← Prev
            </button>
            <span className="placer__page">
              Page {pageIndex + 1} of {numPages}
            </span>
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              onClick={() => setPageIndex((p) => Math.min(numPages - 1, p + 1))}
              disabled={pageIndex >= numPages - 1}
            >
              Next →
            </button>
          </div>
        )}

        {loading && <p className="sig-modal__hint">Loading the document…</p>}
        {error && <p className="ce-msg ce-msg--error">{error}</p>}

        <div className="placer__stage" ref={stageRef} style={{ display: error ? "none" : "block" }}>
          <canvas ref={canvasRef} className="placer__canvas" />
          {!loading && !error && box.width > 0 && (
            <div
              ref={boxRef}
              className="placer__sig"
              style={{ left: box.left, top: box.top, width: box.width, height: boxHeight }}
              onPointerDown={onBoxPointerDown}
              onPointerMove={onBoxPointerMove}
              onPointerUp={endInteraction}
              onPointerCancel={endInteraction}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={signatureUrl} alt="Signature" draggable={false} />
              <span className="placer__handle" data-handle="1" aria-hidden="true" />
            </div>
          )}
        </div>

        {!loading && !error && (
          <p className="sig-modal__hint">
            Drag the signature to the right spot, and drag the bottom-right corner to resize it.
          </p>
        )}

        <div className="sig-modal__actions">
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={confirm} disabled={loading || !!error}>
            Use this position
          </button>
        </div>
      </div>
    </div>
  );
}
