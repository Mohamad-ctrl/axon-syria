import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { createJob } from "../../actions";
import JobForm from "../JobForm";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  await requireSection("jobs");

  return (
    <div className="admin-page">
      <div className="crumbs"><Link href="/admin/jobs">← Job openings</Link></div>
      <div className="admin-head">
        <h1>Post a new job</h1>
        <p className="muted">
          Write the posting in English — the Arabic version shown on the website is generated
          automatically. For lists, put one item per line.
        </p>
      </div>

      <div className="admin-card" style={{ maxWidth: 680 }}>
        <JobForm action={createJob} submitLabel="Publish job" />
      </div>
    </div>
  );
}
