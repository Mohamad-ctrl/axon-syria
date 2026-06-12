/**
 * Server-only data layer for the approval-requests pilot. Reads the
 * approval_requests / approval_documents / approval_events / approval_signature
 * tables (RLS on, no policies: the service-role key is the only access path)
 * and signs URLs for the private `approvals` bucket. Never import this into a
 * Client Component. Readers degrade gracefully when Supabase env is missing,
 * like lib/jobs.ts.
 */
import { supabaseAdmin, APPROVALS_BUCKET } from "@/lib/supabase";
import { hasSupabaseEnv } from "@/lib/jobs";
import type { ApprovalEventKind, ApprovalSection, ApprovalStatus } from "@/lib/approvals-meta";

export type ApprovalRequest = {
  id: string;
  createdAt: string;
  updatedAt: string;
  companySlug: string;
  section: ApprovalSection;
  title: string;
  type: string;
  refNo: string;
  status: ApprovalStatus;
  currentVersion: number;
  decisionNote: string | null;
  decidedAt: string | null;
  decidedByUsername: string | null;
  signedPath: string | null;
  /** Snapshot of the signature image used for the current approval. */
  signaturePath: string | null;
  createdByUsername: string;
};

export type ApprovalDocument = {
  id: string;
  version: number;
  path: string;
  filename: string;
  sizeBytes: number | null;
  uploadedAt: string;
  uploadedByUsername: string;
};

export type ApprovalEvent = {
  id: string;
  createdAt: string;
  actorUsername: string;
  kind: ApprovalEventKind;
  note: string | null;
  version: number | null;
  signedPath: string | null;
};

export type CeoSignature = {
  path: string;
  contentType: string;
  updatedAt: string;
  updatedByUsername: string;
};

type RequestRow = {
  id: string;
  created_at: string;
  updated_at: string;
  company_slug: string;
  section: string;
  title: string;
  type: string;
  ref_no: string;
  status: string;
  current_version: number;
  decision_note: string | null;
  decided_at: string | null;
  decided_by_username: string | null;
  signed_path: string | null;
  signature_path: string | null;
  created_by_username: string;
};

const REQUEST_SELECT =
  "id,created_at,updated_at,company_slug,section,title,type,ref_no,status,current_version," +
  "decision_note,decided_at,decided_by_username,signed_path,signature_path,created_by_username";

function toRequest(row: RequestRow): ApprovalRequest {
  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    companySlug: row.company_slug,
    section: row.section as ApprovalSection,
    title: row.title,
    type: row.type,
    refNo: row.ref_no,
    status: row.status as ApprovalStatus,
    currentVersion: row.current_version,
    decisionNote: row.decision_note,
    decidedAt: row.decided_at,
    decidedByUsername: row.decided_by_username,
    signedPath: row.signed_path,
    signaturePath: row.signature_path,
    createdByUsername: row.created_by_username,
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listRequests(): Promise<ApprovalRequest[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("approval_requests")
    .select(REQUEST_SELECT)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  // supabase-js can't parse the concatenated select string at the type level.
  return ((data as unknown as RequestRow[] | null) ?? []).map(toRequest);
}

export async function getRequest(id: string): Promise<ApprovalRequest | null> {
  if (!hasSupabaseEnv() || !UUID_RE.test(id)) return null;
  const { data } = await supabaseAdmin()
    .from("approval_requests")
    .select(REQUEST_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? toRequest(data as unknown as RequestRow) : null;
}

export async function getDocuments(requestId: string): Promise<ApprovalDocument[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("approval_documents")
    .select("id,version,path,filename,size_bytes,uploaded_at,uploaded_by_username")
    .eq("request_id", requestId)
    .order("version", { ascending: false });
  if (error) throw new Error(error.message);
  type Row = {
    id: string;
    version: number;
    path: string;
    filename: string;
    size_bytes: number | null;
    uploaded_at: string;
    uploaded_by_username: string;
  };
  return ((data as Row[] | null) ?? []).map((r) => ({
    id: r.id,
    version: r.version,
    path: r.path,
    filename: r.filename,
    sizeBytes: r.size_bytes,
    uploadedAt: r.uploaded_at,
    uploadedByUsername: r.uploaded_by_username,
  }));
}

export async function getEvents(requestId: string): Promise<ApprovalEvent[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("approval_events")
    .select("id,created_at,actor_username,kind,note,version,signed_path")
    .eq("request_id", requestId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  type Row = {
    id: string;
    created_at: string;
    actor_username: string;
    kind: string;
    note: string | null;
    version: number | null;
    signed_path: string | null;
  };
  return ((data as Row[] | null) ?? []).map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    actorUsername: r.actor_username,
    kind: r.kind as ApprovalEventKind,
    note: r.note,
    version: r.version,
    signedPath: r.signed_path,
  }));
}

export async function getSignature(): Promise<CeoSignature | null> {
  if (!hasSupabaseEnv()) return null;
  const { data } = await supabaseAdmin()
    .from("approval_signature")
    .select("path,content_type,updated_at,updated_by_username")
    .eq("id", "ceo")
    .maybeSingle();
  if (!data) return null;
  const row = data as {
    path: string;
    content_type: string;
    updated_at: string;
    updated_by_username: string;
  };
  return {
    path: row.path,
    contentType: row.content_type,
    updatedAt: row.updated_at,
    updatedByUsername: row.updated_by_username,
  };
}

/** One-hour signed URL into the private approvals bucket; `download` forces a
 *  Content-Disposition with the given filename (the CV pattern). */
export async function approvalsSignedUrl(
  path: string,
  opts?: { download?: string | boolean },
): Promise<string | null> {
  if (!hasSupabaseEnv()) return null;
  const { data } = await supabaseAdmin()
    .storage.from(APPROVALS_BUCKET)
    .createSignedUrl(path, 3600, opts?.download ? { download: opts.download } : undefined);
  return data?.signedUrl ?? null;
}
