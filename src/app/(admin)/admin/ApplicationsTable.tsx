"use client";

import { useState } from "react";
import Link from "next/link";
import { STAGE_LABEL, type Stage } from "@/lib/stages";
import { Search } from "@/components/icons";

export type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  stage: Stage;
  applied: string;
};

export default function ApplicationsTable({
  rows,
  emptyMessage,
}: {
  rows: ApplicationRow[];
  emptyMessage: string;
}) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const shown = query
    ? rows.filter(
        (r) =>
          r.name.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          r.role.toLowerCase().includes(query)
      )
    : rows;

  if (rows.length === 0) {
    return <p className="jobs__empty">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="admin-search">
        <Search />
        <input
          type="search"
          className="admin-search__input"
          placeholder="Search by name, email or role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search candidates"
        />
      </div>

      {query && (
        <p className="admin-search__count">
          {shown.length} {shown.length === 1 ? "match" : "matches"}
        </p>
      )}

      {shown.length === 0 ? (
        <p className="jobs__empty">No candidates match “{q}”.</p>
      ) : (
        <div className="admin-table">
          <div className="admin-table__head">
            <span>Applicant</span>
            <span>Role</span>
            <span>Stage</span>
            <span>Applied</span>
            <span></span>
          </div>
          {shown.map((r) => (
            <div className="admin-table__row" key={r.id}>
              <span><b>{r.name}</b><br /><span className="muted">{r.email}</span></span>
              <span>{r.role}</span>
              <span><span className={`stage-badge stage-badge--${r.stage}`}>{STAGE_LABEL[r.stage]}</span></span>
              <span className="muted">{r.applied}</span>
              <span style={{ textAlign: "right" }}><Link className="btn btn--ghost" href={`/admin/${r.id}`} style={{ padding: ".4rem .9rem" }}>View</Link></span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
