import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { hasSupabaseEnv } from "@/lib/jobs";
import { listRequests } from "@/lib/approvals";
import { APPROVAL_COMPANIES, companyBySlug, SECTION_LABEL } from "@/lib/approvals-meta";
import ApprovalsBoard, { type BoardRow } from "./ApprovalsBoard";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const me = await requireSection("approvals");

  if (!hasSupabaseEnv()) {
    return (
      <div className="admin-page">
        <div className="admin-head">
          <h1>Approval Requests</h1>
        </div>
        <div className="alert alert--error">
          The database isn&apos;t connected yet, so approval requests can&apos;t be loaded. Set{" "}
          <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> first.
        </div>
      </div>
    );
  }

  const requests = await listRequests();
  const activeBySlug = new Map<string, number>();
  for (const r of requests) {
    if (r.status === "active")
      activeBySlug.set(r.companySlug, (activeBySlug.get(r.companySlug) ?? 0) + 1);
  }

  const rows: BoardRow[] = requests.map((r) => {
    const company = companyBySlug(r.companySlug);
    return {
      id: r.id,
      title: r.title,
      refNo: r.refNo,
      type: r.type,
      status: r.status,
      sectionLabel: SECTION_LABEL[r.section],
      companyName: company?.name ?? r.companySlug,
      country: company?.country ?? "",
      created: new Date(r.createdAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
  });

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--row">
        <div>
          <h1>Approval Requests</h1>
          <p className="muted">
            {requests.length} request{requests.length === 1 ? "" : "s"} across{" "}
            {APPROVAL_COMPANIES.length} companies
          </p>
        </div>
        {!me.isCeo && (
          <Link className="btn btn--primary" href="/admin/approvals/new">
            New request
          </Link>
        )}
      </div>

      <ApprovalsBoard rows={rows} />

      <h2 className="approvals-subhead">Companies</h2>
      <div className="company-grid">
        {APPROVAL_COMPANIES.map((c) => {
          const n = activeBySlug.get(c.slug) ?? 0;
          return (
            <Link key={c.slug} className="company-card" href={`/admin/approvals/${c.slug}`}>
              <span className="company-card__name">{c.name}</span>
              <span className="company-card__country">{c.country}</span>
              <span className={`company-card__count${n ? " is-pending" : ""}`}>
                {n ? `${n} active request${n === 1 ? "" : "s"}` : "No active requests"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
