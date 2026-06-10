/**
 * Best-effort audit logging of admin-panel actions, written to `audit_log`.
 * Server-only. Never throws: a logging failure must not break the action it
 * records, so everything is wrapped in try/catch.
 */
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabaseEnv } from "@/lib/jobs";

export type Actor = { id: string; username: string } | null;

export type AuditEntry = {
  /** Machine key, e.g. "application.stage_changed", "job.created". */
  action: string;
  /** Human-readable one-liner shown in the log. */
  summary: string;
  /** Structured extra detail (candidate, role, slug, from/to, ...). */
  details?: Record<string, unknown>;
};

export async function logAction(actor: Actor, entry: AuditEntry): Promise<void> {
  if (!hasSupabaseEnv()) return;
  try {
    await supabaseAdmin().from("audit_log").insert({
      actor_id: actor?.id ?? null,
      actor_username: actor?.username ?? "unknown",
      action: entry.action,
      summary: entry.summary,
      details: entry.details ?? {},
    });
  } catch (err) {
    console.error("[audit] failed to record", entry.action, err);
  }
}

export type AuditRow = {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_username: string;
  action: string;
  summary: string;
  details: Record<string, unknown>;
};

/** Delete a single log entry by id. */
export async function deleteAuditEntry(id: string): Promise<void> {
  if (!hasSupabaseEnv()) return;
  const { error } = await supabaseAdmin().from("audit_log").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

/** Delete every log entry. */
export async function clearAuditLog(): Promise<void> {
  if (!hasSupabaseEnv()) return;
  // Supabase requires a filter on delete; this matches every real row
  // (no entry uses the all-zero uuid).
  const { error } = await supabaseAdmin()
    .from("audit_log")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(error.message);
}

/** Recent log entries, newest first. Optional category filter (action prefix). */
export async function getAuditLog(category?: string, limit = 250): Promise<AuditRow[]> {
  if (!hasSupabaseEnv()) return [];
  let query = supabaseAdmin()
    .from("audit_log")
    .select("id,created_at,actor_id,actor_username,action,summary,details")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (category) query = query.like("action", `${category}.%`);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data as AuditRow[] | null) ?? [];
}
