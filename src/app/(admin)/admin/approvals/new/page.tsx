import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSection } from "@/lib/admin-auth";
import { companyBySlug, isApprovalSection } from "@/lib/approvals-meta";
import RequestForm from "./RequestForm";

export const dynamic = "force-dynamic";

export default async function NewRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string; section?: string }>;
}) {
  const me = await requireSection("approvals");
  // Filing is the secretaries' side of the workflow (enforced in the action too).
  if (me.isCeo) redirect("/admin/approvals");
  const sp = await searchParams;
  const defaultCompany = companyBySlug(sp.company ?? "")?.slug;
  const defaultSection = isApprovalSection(sp.section ?? "") ? sp.section : undefined;

  return (
    <div className="admin-page">
      <div className="crumbs">
        <Link href={defaultCompany ? `/admin/approvals/${defaultCompany}` : "/admin/approvals"}>
          ← Approvals
        </Link>
      </div>
      <div className="admin-head">
        <h1>New approval request</h1>
        <p className="muted">
          Attach the document the CEO has to approve. Active requests show at the top of the
          Approvals page until he decides.
        </p>
      </div>
      <RequestForm defaultCompany={defaultCompany} defaultSection={defaultSection} />
    </div>
  );
}
