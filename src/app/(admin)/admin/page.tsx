import { redirect } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { ALL_STAGES, STAGE_LABEL, type Stage } from "@/lib/stages";
import ApplicationsTable from "./ApplicationsTable";

export const dynamic = "force-dynamic";

type Row = {
  id: string;
  created_at: string;
  job_title: string;
  first_name: string;
  last_name: string;
  email: string;
  stage: Stage;
};

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  if (!(await isAuthenticated())) redirect("/admin/login");

  // Friendly setup notice instead of a crash while Supabase env vars are unset.
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return (
      <div className="admin-page">
        <div className="admin-head">
          <h1>Applications</h1>
        </div>
        <div className="alert alert--error">
          The database isn&apos;t connected yet. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code> (see the
          comments in that file for where to copy the key from), then restart the server.
        </div>
      </div>
    );
  }

  const { stage } = await searchParams;
  const { data, error } = await supabaseAdmin()
    .from("applications")
    .select("id,created_at,job_title,first_name,last_name,email,stage")
    .order("created_at", { ascending: false });

  const rows: Row[] = (data as Row[] | null) ?? [];
  const counts: Record<string, number> = {};
  rows.forEach((r) => { counts[r.stage] = (counts[r.stage] || 0) + 1; });
  const filtered = stage && stage !== "all" ? rows.filter((r) => r.stage === stage) : rows;
  const list = filtered.map((r) => ({
    id: r.id,
    name: `${r.first_name} ${r.last_name}`,
    email: r.email,
    role: r.job_title,
    stage: r.stage,
    applied: new Date(r.created_at).toLocaleDateString("en-GB"),
  }));
  const emptyMessage = `No applications${stage && stage !== "all" ? " in this stage" : " yet"}.`;

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Applications</h1>
        <p className="muted">{rows.length} total</p>
      </div>

      {error && <div className="alert alert--error">Could not load applications: {error.message}</div>}

      <div className="admin-filters">
        <Link className={`filter-btn${!stage || stage === "all" ? " is-active" : ""}`} href="/admin">
          All ({rows.length})
        </Link>
        {ALL_STAGES.map((s) => (
          <Link key={s} className={`filter-btn${stage === s ? " is-active" : ""}`} href={`/admin?stage=${s}`}>
            {STAGE_LABEL[s]} ({counts[s] || 0})
          </Link>
        ))}
      </div>

      <ApplicationsTable rows={list} emptyMessage={emptyMessage} />
    </div>
  );
}
