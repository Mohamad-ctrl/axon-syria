import { notFound } from "next/navigation";
import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { getJobBySlug } from "@/lib/jobs";
import { updateJob } from "../../../actions";
import JobForm from "../../JobForm";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireSection("jobs");

  const { slug } = await params;
  const job = await getJobBySlug(slug);
  if (!job) notFound();

  return (
    <div className="admin-page">
      <div className="crumbs"><Link href="/admin/jobs">← Job openings</Link></div>
      <div className="admin-head">
        <h1>Edit job</h1>
        <p className="muted">
          Editing <b>{job.title.en}</b>. Edit in English — the Arabic version is regenerated
          automatically on save. The job&apos;s URL ({job.slug}) stays the same.
        </p>
      </div>

      <div className="admin-card" style={{ maxWidth: 680 }}>
        <JobForm action={updateJob} job={job} submitLabel="Save changes" />
      </div>
    </div>
  );
}
