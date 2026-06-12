import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { hasSupabaseEnv } from "@/lib/jobs";
import { getAuditLog } from "@/lib/audit";
import DeleteLogButton from "./DeleteLogButton";
import ClearLogButton from "./ClearLogButton";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { key: "", label: "All" },
  { key: "application", label: "Applications" },
  { key: "job", label: "Jobs" },
  { key: "content", label: "Content" },
  { key: "approval", label: "Approvals" },
  { key: "user", label: "Users" },
  { key: "auth", label: "Sign-ins" },
];

const CAT_LABEL: Record<string, string> = {
  application: "Application",
  job: "Jobs",
  content: "Content",
  approval: "Approvals",
  user: "Users",
  auth: "Auth",
};

function labelize(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

export default async function LogPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  await requireSection("log");

  if (!hasSupabaseEnv()) {
    return (
      <div className="admin-page">
        <div className="admin-head">
          <h1>Activity log</h1>
        </div>
        <div className="alert alert--error">
          The database isn&apos;t connected yet, so there&apos;s no activity to show.
        </div>
      </div>
    );
  }

  const { cat } = await searchParams;
  const category = cat && CATEGORIES.some((c) => c.key === cat) ? cat : "";
  const entries = await getAuditLog(category || undefined);

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--row">
        <div>
          <h1>Activity log</h1>
          <p className="muted">
            Everything that happens in the admin panel. Showing the {entries.length} most recent
            {category ? ` ${CAT_LABEL[category]?.toLowerCase() ?? category} ` : " "}action{entries.length === 1 ? "" : "s"}.
          </p>
        </div>
        {entries.length > 0 && <ClearLogButton />}
      </div>

      <div className="admin-filters">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key || "all"}
            className={`filter-btn${category === c.key ? " is-active" : ""}`}
            href={c.key ? `/admin/log?cat=${c.key}` : "/admin/log"}
          >
            {c.label}
          </Link>
        ))}
      </div>

      <div className="log-list">
        {entries.length === 0 && <p className="muted">No activity recorded yet.</p>}
        {entries.map((e) => {
          const catKey = e.action.split(".")[0];
          const pairs = Object.entries(e.details)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .map(([k, v]) => [labelize(k), typeof v === "object" ? JSON.stringify(v) : String(v)] as [string, string]);
          return (
            <div className="log-item" key={e.id}>
              <div className="log-item__top">
                <span className={`log-cat log-cat--${catKey}`}>{CAT_LABEL[catKey] ?? catKey}</span>
                <span className="log-item__summary">{e.summary}</span>
                <DeleteLogButton id={e.id} />
              </div>
              <div className="log-item__meta">
                <span className="log-item__who">{e.actor_username}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={e.created_at}>
                  {new Date(e.created_at).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </time>
              </div>
              {pairs.length > 0 && (
                <dl className="log-item__details">
                  {pairs.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
