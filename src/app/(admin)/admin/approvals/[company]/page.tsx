import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSection } from "@/lib/admin-auth";
import { listRequests } from "@/lib/approvals";
import {
  APPROVAL_SECTIONS,
  companyBySlug,
  isApprovalSection,
  SECTION_LABEL,
  STATUS_LABEL,
  type ApprovalSection,
} from "@/lib/approvals-meta";

export const dynamic = "force-dynamic";

export default async function CompanyApprovalsPage({
  params,
  searchParams,
}: {
  params: Promise<{ company: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const me = await requireSection("approvals");
  const { company: slug } = await params;
  const company = companyBySlug(slug);
  if (!company) notFound();

  const sp = await searchParams;
  const filter: ApprovalSection | null = isApprovalSection(sp.section ?? "")
    ? (sp.section as ApprovalSection)
    : null;

  const requests = (await listRequests()).filter((r) => r.companySlug === company.slug);
  const counts = Object.fromEntries(
    APPROVAL_SECTIONS.map((s) => [s, requests.filter((r) => r.section === s).length]),
  ) as Record<ApprovalSection, number>;
  const list = filter ? requests.filter((r) => r.section === filter) : requests;

  return (
    <div className="admin-page">
      <div className="crumbs">
        <Link href="/admin/approvals">← All companies</Link>
      </div>
      <div className="admin-head admin-head--row">
        <div>
          <h1>{company.name}</h1>
          <p className="muted">
            {company.country} · {requests.length} request{requests.length === 1 ? "" : "s"}
          </p>
        </div>
        {!me.isCeo && (
          <Link
            className="btn btn--primary"
            href={`/admin/approvals/new?company=${company.slug}${filter ? `&section=${filter}` : ""}`}
          >
            New request
          </Link>
        )}
      </div>

      <div className="admin-filters">
        <Link className={`filter-btn${!filter ? " is-active" : ""}`} href={`/admin/approvals/${company.slug}`}>
          All ({requests.length})
        </Link>
        {APPROVAL_SECTIONS.map((s) => (
          <Link
            key={s}
            className={`filter-btn${filter === s ? " is-active" : ""}`}
            href={`/admin/approvals/${company.slug}?section=${s}`}
          >
            {SECTION_LABEL[s]} ({counts[s]})
          </Link>
        ))}
      </div>

      <div className="admin-table admin-table--company-approvals">
        <div className="admin-table__head">
          <span>Request</span>
          <span>Section</span>
          <span>Status</span>
          <span>Date</span>
          <span />
        </div>
        {list.length === 0 && (
          <div className="admin-table__row">
            <span className="muted">
              No {filter ? SECTION_LABEL[filter].toLowerCase() : "requests"} for {company.name} yet.
            </span>
          </div>
        )}
        {list.map((r) => (
          <div className="admin-table__row" key={r.id}>
            <span className="approval-title">
              <b>{r.title}</b>
              <small className="muted">
                Ref {r.refNo}
                {r.type ? ` · ${r.type}` : ""}
              </small>
            </span>
            <span>{SECTION_LABEL[r.section]}</span>
            <span>
              <span className={`stage-badge stage-badge--${r.status}`}>{STATUS_LABEL[r.status]}</span>
            </span>
            <span>
              {new Date(r.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span>
              <Link className="btn btn--ghost btn--sm" href={`/admin/approvals/requests/${r.id}`}>
                View
              </Link>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
