"use client";

import { useMemo, useState } from "react";
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
  /** ISO timestamp, for date filtering. */
  createdAt: string;
  /** Pre-formatted date, for display. */
  created: string;
};

type DatePreset = "today" | "yesterday" | "last30" | "custom";

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last30", label: "Last 30 days" },
  { key: "custom", label: "Custom" },
];

/** Local midnight of the given date (defaults to now), as an epoch ms. */
function startOfDay(d = new Date()): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Parse a yyyy-mm-dd input value as a LOCAL date (not UTC). */
function parseLocalDate(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime();
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The requests panel on the main approvals page: a search box plus a "by date"
 * filter (today / yesterday / last 30 days / custom range). With no search and
 * no date filter it shows the "Active requests" the CEO still has to decide;
 * otherwise it lists every matching request. Client-side, like ApplicationsTable.
 */
export default function ApprovalsBoard({ rows }: { rows: BoardRow[] }) {
  const [q, setQ] = useState("");
  const [preset, setPreset] = useState<DatePreset | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const query = q.trim().toLowerCase();

  // The [start, end) epoch window for the active date preset, or null for "all".
  const range = useMemo<{ start: number; end: number } | null>(() => {
    const todayStart = startOfDay();
    if (preset === "today") return { start: todayStart, end: todayStart + DAY_MS };
    if (preset === "yesterday") return { start: todayStart - DAY_MS, end: todayStart };
    if (preset === "last30") return { start: todayStart - 29 * DAY_MS, end: Date.now() + DAY_MS };
    if (preset === "custom") {
      const f = parseLocalDate(from);
      const t = parseLocalDate(to);
      if (f === null && t === null) return null;
      return {
        start: f ?? 0,
        // `to` is inclusive of that whole day.
        end: t !== null ? t + DAY_MS : Date.now() + DAY_MS,
      };
    }
    return null;
  }, [preset, from, to]);

  const hasFilter = query !== "" || range !== null;

  const matches = useMemo(() => {
    if (!hasFilter) return rows.filter((r) => r.status === "active");
    return rows.filter((r) => {
      if (query && ![r.title, r.refNo, r.type, r.companyName].some((v) => v.toLowerCase().includes(query)))
        return false;
      if (range) {
        const t = new Date(r.createdAt).getTime();
        if (!(t >= range.start && t < range.end)) return false;
      }
      return true;
    });
  }, [rows, query, range, hasFilter]);

  let heading = "Active requests";
  if (query && range) heading = "Search results in range";
  else if (query) heading = "Search results";
  else if (preset) heading = DATE_PRESETS.find((p) => p.key === preset)?.label ?? "Requests";

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

      <div className="admin-filters approvals-dates">
        <span className="approvals-dates__label">By date:</span>
        {DATE_PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`filter-btn${preset === p.key ? " is-active" : ""}`}
            onClick={() => setPreset((cur) => (cur === p.key ? null : p.key))}
          >
            {p.label}
          </button>
        ))}
        {preset && (
          <button type="button" className="filter-btn approvals-dates__clear" onClick={() => setPreset(null)}>
            Clear
          </button>
        )}
      </div>

      {preset === "custom" && (
        <div className="approvals-range">
          <label>
            From
            <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To
            <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
      )}

      <h2 className="approvals-subhead">
        {heading}
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
              {hasFilter ? "No requests match these filters." : "No active requests right now."}
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
