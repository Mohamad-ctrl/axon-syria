import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/admin-auth";
import { getAllJobs } from "@/lib/jobs";
import { setJobActive } from "../actions";
import DeleteJobButton from "./DeleteJobButton";

export const dynamic = "force-dynamic";

export default async function AdminJobs() {
  if (!(await isAuthenticated())) redirect("/admin/login");
  const jobs = await getAllJobs();
  const activeCount = jobs.filter((j) => j.active).length;

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--row">
        <div>
          <h1>Job openings</h1>
          <p className="muted">{activeCount} active · {jobs.length} total</p>
        </div>
        <Link className="btn btn--primary" href="/admin/jobs/new">+ Post a new job</Link>
      </div>

      {jobs.length === 0 ? (
        <p className="jobs__empty">No jobs yet. Click “Post a new job” to create one.</p>
      ) : (
        <div className="admin-table admin-table--jobs">
          <div className="admin-table__head">
            <span>Title</span><span>Type</span><span>Status</span><span></span>
          </div>
          {jobs.map((j) => (
            <div className="admin-table__row" key={j.slug}>
              <span><b>{j.title.en}</b><br /><span className="muted">{j.company.en}</span></span>
              <span>{j.type.en}</span>
              <span>
                <span className={`stage-badge ${j.active ? "stage-badge--hired" : "stage-badge--rejected"}`}>
                  {j.active ? "Active" : "Closed"}
                </span>
              </span>
              <span style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <Link className="btn btn--ghost" style={{ padding: ".4rem .9rem" }} href={`/admin/jobs/${j.slug}/edit`}>
                  Edit
                </Link>
                <form action={setJobActive}>
                  <input type="hidden" name="slug" value={j.slug} />
                  <input type="hidden" name="active" value={j.active ? "false" : "true"} />
                  <button className="btn btn--ghost" style={{ padding: ".4rem .9rem" }} type="submit">
                    {j.active ? "Close" : "Reopen"}
                  </button>
                </form>
                <DeleteJobButton slug={j.slug} title={j.title.en} />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
