"use client";

import { useActionState, useState } from "react";
import dynamic from "next/dynamic";
import { STATUS_LABEL, type ApprovalStatus } from "@/lib/approvals-meta";
import { decideRequestAction, type ApprovalActionState } from "../../approvals-actions";
import type { Placement } from "./SignaturePlacer";

// pdf.js is heavy and browser-only — load the editor on demand.
const SignaturePlacer = dynamic(() => import("./SignaturePlacer"), { ssr: false });

/**
 * The CEO's decision panel: one form, three submit buttons that carry the
 * decision in their value, plus an optional note (the rejection reason the
 * secretary relays back to the other company). For approvals he can either let
 * the signature auto-place, or open the editor to place it himself.
 */
export default function DecisionPanel({
  requestId,
  status,
  pdfUrl,
  signatureUrl,
}: {
  requestId: string;
  status: ApprovalStatus;
  pdfUrl: string | null;
  signatureUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState<ApprovalActionState, FormData>(
    decideRequestAction,
    { ok: false, message: "" },
  );
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [placerOpen, setPlacerOpen] = useState(false);

  const canPlace = !!pdfUrl && !!signatureUrl;

  return (
    <form action={formAction} className="form decision-panel">
      <h2>Decision</h2>
      <p className="muted">
        Current status: <b>{STATUS_LABEL[status]}</b>
      </p>
      <input type="hidden" name="id" value={requestId} />
      {placement && (
        <>
          <input type="hidden" name="manual_page" value={placement.pageIndex} />
          <input type="hidden" name="manual_nx" value={placement.nx} />
          <input type="hidden" name="manual_ny" value={placement.ny} />
          <input type="hidden" name="manual_nw" value={placement.nw} />
          <input type="hidden" name="manual_nh" value={placement.nh} />
        </>
      )}

      <div className="field">
        <label htmlFor="note">Note (optional)</label>
        <textarea
          id="note"
          name="note"
          rows={3}
          placeholder="Why it was rejected or put on hold, special conditions, ..."
        />
        <span className="field__hint">
          The note is shown on the request so the secretary can relay it.
        </span>
      </div>

      {status !== "approved" && (
        <div className="field decision-place">
          <label>Signature position</label>
          {placement ? (
            <div className="decision-place__set">
              <span>
                Placed by hand on <b>page {placement.pageIndex + 1}</b>.
              </span>
              <div className="decision-place__links">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlacerOpen(true)}>
                  Edit
                </button>
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPlacement(null)}>
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="decision-place__set">
              <span className="muted">Automatic (the signature line is detected for you).</span>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setPlacerOpen(true)}
                disabled={!canPlace}
                title={canPlace ? undefined : "Upload a signature first to place it by hand."}
              >
                Place manually
              </button>
            </div>
          )}
        </div>
      )}

      <div className="admin-actions">
        {status !== "approved" && (
          <button
            className="btn btn--primary btn--block"
            type="submit"
            name="decision"
            value="approved"
            disabled={pending}
          >
            {pending ? "Working…" : placement ? "Approve with this signature" : "Approve and sign"}
          </button>
        )}
        {status !== "hold" && (
          <button
            className="btn btn--ghost btn--block"
            type="submit"
            name="decision"
            value="hold"
            disabled={pending}
          >
            Put on hold
          </button>
        )}
        {status !== "rejected" && (
          <button
            className="btn btn--ghost btn--block decision-panel__reject"
            type="submit"
            name="decision"
            value="rejected"
            disabled={pending}
          >
            Reject
          </button>
        )}
      </div>

      {state.message && (
        <p className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</p>
      )}

      {placerOpen && canPlace && (
        <SignaturePlacer
          pdfUrl={pdfUrl!}
          signatureUrl={signatureUrl!}
          initialPageIndex={placement?.pageIndex}
          onConfirm={(p) => {
            setPlacement(p);
            setPlacerOpen(false);
          }}
          onCancel={() => setPlacerOpen(false)}
        />
      )}
    </form>
  );
}
