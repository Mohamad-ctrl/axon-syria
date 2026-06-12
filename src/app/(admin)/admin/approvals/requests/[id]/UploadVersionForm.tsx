"use client";

import { useActionState } from "react";
import { uploadVersionAction, type ApprovalActionState } from "../../approvals-actions";

export default function UploadVersionForm({
  requestId,
  nextVersion,
}: {
  requestId: string;
  nextVersion: number;
}) {
  const [state, formAction, pending] = useActionState<ApprovalActionState, FormData>(
    uploadVersionAction,
    { ok: false, message: "" },
  );

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="id" value={requestId} />
      <div className="field">
        <label htmlFor="document">Updated document (v{nextVersion})</label>
        <input id="document" name="document" type="file" accept="application/pdf" required />
        <span className="field__hint">
          PDF up to 4 MB. Uploading a new version sets the request back to Active.
        </span>
      </div>
      <div className="ce-bar">
        <button className="btn btn--primary" type="submit" disabled={pending}>
          {pending ? "Uploading…" : "Upload version"}
        </button>
        {state.message && (
          <span className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
