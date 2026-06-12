"use client";

import { useActionState } from "react";
import {
  APPROVAL_COMPANIES,
  APPROVAL_SECTIONS,
  SECTION_LABEL,
} from "@/lib/approvals-meta";
import { createRequestAction, type ApprovalActionState } from "../approvals-actions";

export default function RequestForm({
  defaultCompany,
  defaultSection,
}: {
  defaultCompany?: string;
  defaultSection?: string;
}) {
  const [state, formAction, pending] = useActionState<ApprovalActionState, FormData>(
    createRequestAction,
    { ok: false, message: "" },
  );

  const uae = APPROVAL_COMPANIES.filter((c) => c.country === "UAE");
  const syria = APPROVAL_COMPANIES.filter((c) => c.country === "Syria");

  return (
    <form action={formAction} className="form">
      <div className="field">
        <label htmlFor="company">Company</label>
        <select id="company" name="company" defaultValue={defaultCompany ?? ""} required>
          <option value="" disabled>
            Choose a company…
          </option>
          <optgroup label="UAE">
            {uae.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="Syria">
            {syria.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      <div className="field">
        <label htmlFor="section">Section</label>
        <select id="section" name="section" defaultValue={defaultSection ?? ""} required>
          <option value="" disabled>
            Choose a section…
          </option>
          {APPROVAL_SECTIONS.map((s) => (
            <option key={s} value={s}>
              {SECTION_LABEL[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor="title">Subject title</label>
        <input id="title" name="title" required autoComplete="off" placeholder="e.g. Landscaping works for Villa 12" />
      </div>

      <div className="field">
        <label htmlFor="type">Type</label>
        <input id="type" name="type" autoComplete="off" placeholder="e.g. agreement, landscaping, contracting" />
        <span className="field__hint">Free text describing what kind of document this is.</span>
      </div>

      <div className="field">
        <label htmlFor="ref_no">Reference number</label>
        <input id="ref_no" name="ref_no" required autoComplete="off" placeholder="e.g. QTN-2026-014" />
      </div>

      <div className="field">
        <label htmlFor="document">Document</label>
        <input id="document" name="document" type="file" accept="application/pdf" required />
        <span className="field__hint">PDF up to 4 MB. New versions can be uploaded later if it gets rejected.</span>
      </div>

      <div className="ce-bar">
        <button className="btn btn--primary btn--lg" type="submit" disabled={pending}>
          {pending ? "Creating…" : "Create request"}
        </button>
        {state.message && (
          <span className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
