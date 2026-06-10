import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { hasSupabaseEnv } from "@/lib/jobs";
import { SECTIONS, SECTION_GROUPS } from "@/lib/content-schema";

export const dynamic = "force-dynamic";

export default async function ContentIndex() {
  await requireSection("content");

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Site content</h1>
        <p className="muted">
          Edit the text and images of every section in all three languages. Saved changes go live straight away.
        </p>
      </div>

      {!hasSupabaseEnv() && (
        <div className="alert alert--error">
          The database isn&apos;t connected yet, so edits can&apos;t be saved. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> first.
        </div>
      )}

      {SECTION_GROUPS.map((group) => {
        const items = SECTIONS.filter((s) => s.group === group);
        if (items.length === 0) return null;
        return (
          <section key={group} className="content-group">
            <h2 className="content-group__title">{group}</h2>
            <div className="content-grid">
              {items.map((s) => (
                <Link key={s.id} className="content-tile" href={`/admin/content/${s.id}`}>
                  <span className="content-tile__name">{s.label}</span>
                  <span className="content-tile__desc">{s.description}</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
