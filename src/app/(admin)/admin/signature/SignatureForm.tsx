"use client";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { saveSignatureAction, type SignatureActionState } from "./signature-actions";

const PEN_COLOR = "#1f2937";

/** toDataURL is synchronous, so converting here avoids any race with form submit. */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(header)?.[1] ?? "image/png";
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

export default function SignatureForm({ hasSignature }: { hasSignature: boolean }) {
  const [state, formAction, pending] = useActionState<SignatureActionState, FormData>(
    saveSignatureAction,
    { ok: false, message: "" },
  );
  const [mode, setMode] = useState<"upload" | "draw">("upload");
  const [drawOpen, setDrawOpen] = useState(false);
  const [drawnPreview, setDrawnPreview] = useState<string | null>(null);
  const [hasDrawing, setHasDrawing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  // The drawn PNG and the chosen upload share one <input name="signature">,
  // so the server action reads from the same field either way.
  const setFile = useCallback((file: File | null) => {
    const input = fileRef.current;
    if (!input) return;
    const dt = new DataTransfer();
    if (file) dt.items.add(file);
    input.files = dt.files;
  }, []);

  // Configure the pen each time the pad (re)mounts; lock background scroll.
  useEffect(() => {
    if (!drawOpen) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = PEN_COLOR;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [drawOpen]);

  // Close the pad on Escape.
  useEffect(() => {
    if (!drawOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawOpen]);

  function switchMode(next: "upload" | "draw") {
    setMode(next);
    // Drop whatever the other mode had staged so we never submit stale input.
    setFile(null);
    setDrawnPreview(null);
    setHasDrawing(false);
    if (next === "draw") setDrawOpen(true);
  }

  function openPad() {
    setHasDrawing(false);
    setDrawOpen(true);
  }

  function pointFromEvent(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function onPointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = pointFromEvent(e);
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !last.current) return;
    const p = pointFromEvent(e);
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
    if (!hasDrawing) setHasDrawing(true);
  }

  function endStroke() {
    drawing.current = false;
    last.current = null;
  }

  function clearPad() {
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }

  function useDrawing() {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawing) return;
    const url = canvas.toDataURL("image/png");
    setFile(dataUrlToFile(url, "ceo-signature.png"));
    setDrawnPreview(url);
    setDrawOpen(false);
  }

  const drawEmpty = mode === "draw" && !drawnPreview;

  return (
    <>
      <form action={formAction} className="form">
        <div className="sig-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "upload"}
            className={`sig-tab${mode === "upload" ? " is-active" : ""}`}
            onClick={() => switchMode("upload")}
          >
            Upload image
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "draw"}
            className={`sig-tab${mode === "draw" ? " is-active" : ""}`}
            onClick={() => switchMode("draw")}
          >
            Draw signature
          </button>
        </div>

        <div className="field" style={{ display: mode === "upload" ? "block" : "none" }}>
          <label htmlFor="signature">Signature image</label>
          <input
            ref={fileRef}
            id="signature"
            name="signature"
            type="file"
            accept="image/png,image/jpeg"
            required={mode === "upload"}
          />
          <span className="field__hint">
            PNG or JPG up to 2 MB. A PNG with a transparent background looks best on documents.
          </span>
        </div>

        {mode === "draw" && (
          <div className="field">
            <label>Drawn signature</label>
            {drawnPreview ? (
              <div className="sig-drawn">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="sig-drawn__thumb" src={drawnPreview} alt="Drawn signature preview" />
                <button type="button" className="btn btn--ghost btn--sm" onClick={openPad}>
                  Draw again
                </button>
              </div>
            ) : (
              <button type="button" className="btn btn--ghost" onClick={openPad}>
                Open drawing pad
              </button>
            )}
            <span className="field__hint">
              Opens a pad where you sign with a mouse, trackpad or finger. Saved as a transparent PNG.
            </span>
          </div>
        )}

        <div className="ce-bar">
          <button className="btn btn--primary" type="submit" disabled={pending || drawEmpty}>
            {pending ? "Saving…" : hasSignature ? "Replace signature" : "Save signature"}
          </button>
          {state.message && (
            <span className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</span>
          )}
        </div>
      </form>

      {drawOpen && (
        <div
          className="sig-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Draw signature"
          onClick={() => setDrawOpen(false)}
        >
          <div className="sig-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Draw the signature</h3>
            <canvas
              ref={canvasRef}
              className="sig-pad"
              width={640}
              height={220}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={endStroke}
              onPointerLeave={endStroke}
              onPointerCancel={endStroke}
            />
            <p className="sig-modal__hint">Sign inside the box with a mouse, trackpad or finger.</p>
            <div className="sig-modal__actions">
              <button type="button" className="btn btn--ghost btn--sm" onClick={clearPad}>
                Clear
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setDrawOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn btn--primary" onClick={useDrawing} disabled={!hasDrawing}>
                Use this signature
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
