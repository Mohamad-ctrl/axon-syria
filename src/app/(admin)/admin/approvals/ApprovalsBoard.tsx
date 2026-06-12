"use client";

import { useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, type ApprovalStatus } from "@/lib/approvals-meta";

export type BoardRow = {
  id: string;
  title: string;
  refNo: string;
  type: string;
  status: ApprovalStatus;
  sectionLabel: string;
  companyName: string;
  country: string;
  created: string;
};

/**
 * The search bar plus the request list on the main approvals page. With no
 * query it shows the "Active requests" sub-section (what the CEO still has to
 * decide); typing searches every request by subject, ref number, type or
 * company. Same client-side filter approach as ApplicationsTable.
 */
export default function ApprovalsBoard({ rows }: { rows: BoardRow[] }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();

  const matches = query
    ? rows.filter((r) =>
        [r.title, r.refNo, r.type, r.companyName].some((v) => v.toLowerCase().includes(query)),
      )
    : rows.filter((r) => r.status === "active");

  return (
    <section className="approvals-board">
      <div className="admin-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          className="admin-search__input"
          type="search"
          placeholder="Search by subject, ref number, type or company…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search approval requests"
        />
      </div>

      <h2 className="approvals-subhead">
        {query ? `Search results` : "Active requests"}
        <span className="admin-search__count">
          {matches.length} request{matches.length === 1 ? "" : "s"}
        </span>
      </h2>

      <div className="admin-table admin-table--approvals">
        <div className="admin-table__head">
          <span>Request</span>
          <span>Company</span>
          <span>Section</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>
        {matches.length === 0 && (
          <div className="admin-table__row">
            <span className="muted">
              {query ? "Nothing matches this search." : "No active requests right now."}
            </span>
          </div>
        )}
        {matches.map((r) => (
          <div className="admin-table__row" key={r.id}>
            <span className="approval-title">
              <b>{r.title}</b>
              <small className="muted">
                Ref {r.refNo}
                {r.type ? ` · ${r.type}` : ""}
              </small>
            </span>
            <span>
              {r.companyName}
              <small className="muted approval-country"> {r.country}</small>
            </span>
            <span>{r.sectionLabel}</span>
            <span>
              <span className={`stage-badge stage-badge--${r.status}`}>{STATUS_LABEL[r.status]}</span>
            </span>
            <span>{r.created}</span>
            <span>
              <Link className="btn btn--ghost btn--sm" href={`/admin/approvals/requests/${r.id}`}>
                View
              </Link>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
