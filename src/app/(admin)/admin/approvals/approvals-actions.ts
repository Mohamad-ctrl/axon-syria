"use server";

/**
 * Server actions for the approval-requests pilot. Every action re-checks auth
 * (requireSectionAction), records an audit_log entry, and revalidates the
 * affected approval pages. Decisions (approve / hold / reject) are restricted
 * to the CEO and the SuperAdmin via canDecideApprovals; deleting a request is
 * SuperAdmin-only so the trail stays immutable for everyone else.
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSectionAction, canDecideApprovals } from "@/lib/admin-auth";
import { supabaseAdmin, APPROVALS_BUCKET } from "@/lib/supabase";
import { logAction } from "@/lib/audit";
import {
  companyBySlug,
  isApprovalSection,
  SECTION_LABEL,
  STATUS_LABEL,
  type ApprovalStatus,
} from "@/lib/approvals-meta";
import { getRequest, getSignature } from "@/lib/approvals";
import { stampSignature, type ManualPlacement } from "@/lib/sign-pdf";

export type ApprovalActionState = { ok: boolean; message: string };

/** Read + validate the optional placement chosen in the browser editor. Any
 *  out-of-range value falls back to automatic detection (returns null). */
function parseManualPlacement(formData: FormData): ManualPlacement | null {
  const page = formData.get("manual_page");
  if (page === null || String(page) === "") return null;
  const pageIndex = Number(page);
  const nx = Number(formData.get("manual_nx"));
  const ny = Number(formData.get("manual_ny"));
  const nw = Number(formData.get("manual_nw"));
  const nh = Number(formData.get("manual_nh"));
  const inUnit = (v: number) => Number.isFinite(v) && v >= 0 && v <= 1;
  if (!Number.isInteger(pageIndex) || pageIndex < 0) return null;
  if (!inUnit(nx) || !inUnit(ny) || !inUnit(nw) || !inUnit(nh) || nw <= 0 || nh <= 0) return null;
  return { pageIndex, nx, ny, nw, nh };
}

/** Vercel rejects request bodies past ~4.5 MB, so the form caps PDFs at 4 MB. */
const MAX_PDF_BYTES = 4 * 1024 * 1024;

function validatePdf(file: FormDataEntryValue | null): { file: File } | { error: string } {
  if (!(file instanceof File) || file.size === 0) return { error: "Attach a PDF document." };
  if (file.size > MAX_PDF_BYTES) return { error: "The PDF must be 4 MB or smaller." };
  if (file.type !== "application/pdf" && !/\.pdf$/i.test(file.name))
    return { error: "Only PDF documents are supported." };
  return { file };
}

function docPath(requestId: string, version: number, suffix = ""): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `requests/${requestId}/v${version}${suffix}-${Date.now()}-${rand}.pdf`;
}

/** Client MIME/extension are spoofable; the %PDF- header must appear near the
 *  start (the spec tolerates a small preamble). */
function looksLikePdf(bytes: Buffer): boolean {
  return bytes.subarray(0, 1024).includes(Buffer.from("%PDF-"));
}

/** Best-effort event-trail insert: a failure must not undo the action it
 *  records, but it must be visible (console + audit details). */
async function recordEvent(row: {
  request_id: string;
  actor_id: string;
  actor_username: string;
  kind: string;
  note?: string | null;
  version?: number | null;
  signed_path?: string | null;
}): Promise<boolean> {
  const { error } = await supabaseAdmin().from("approval_events").insert(row);
  if (error) console.error("[approvals] approval_events insert failed", row.kind, error.message);
  return !error;
}

function revalidateApproval(companySlug: string, id?: string) {
  revalidatePath("/admin/approvals");
  revalidatePath(`/admin/approvals/${companySlug}`);
  if (id) revalidatePath(`/admin/approvals/requests/${id}`);
}

/* ------------------------------------------------------------ new request */

export async function createRequestAction(
  _prev: ApprovalActionState,
  formData: FormData,
): Promise<ApprovalActionState> {
  const actor = await requireSectionAction("approvals");
  // Filing is the secretaries' side of the workflow (SuperAdmin keeps full access).
  if (actor.isCeo)
    return { ok: false, message: "The CEO account decides requests; ask a secretary to file the document." };

  const companySlug = String(formData.get("company") ?? "");
  const section = String(formData.get("section") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const type = String(formData.get("type") ?? "").trim();
  const refNo = String(formData.get("ref_no") ?? "").trim();

  const company = companyBySlug(companySlug);
  if (!company) return { ok: false, message: "Pick a company." };
  if (!isApprovalSection(section)) return { ok: false, message: "Pick a section." };
  if (title.length < 3) return { ok: false, message: "The subject title is too short." };
  if (!refNo) return { ok: false, message: "Enter the reference number." };
  const pdf = validatePdf(formData.get("document"));
  if ("error" in pdf) return { ok: false, message: pdf.error };

  const supabase = supabaseAdmin();
  const { data: created, error: insertError } = await supabase
    .from("approval_requests")
    .insert({
      company_slug: company.slug,
      section,
      title,
      type,
      ref_no: refNo,
      created_by_id: actor.id,
      created_by_username: actor.username,
    })
    .select("id")
    .single();
  if (insertError || !created)
    return { ok: false, message: insertError?.message ?? "Could not create the request." };
  const id = (created as { id: string }).id;

  const path = docPath(id, 1);
  const bytes = Buffer.from(await pdf.file.arrayBuffer());
  if (!looksLikePdf(bytes)) {
    await supabase.from("approval_requests").delete().eq("id", id);
    return { ok: false, message: "That file is not a valid PDF." };
  }
  const upload = await supabase.storage
    .from(APPROVALS_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (upload.error) {
    await supabase.from("approval_requests").delete().eq("id", id);
    return { ok: false, message: `Could not upload the document: ${upload.error.message}` };
  }

  const { error: docError } = await supabase.from("approval_documents").insert({
    request_id: id,
    version: 1,
    path,
    filename: pdf.file.name,
    size_bytes: pdf.file.size,
    uploaded_by_id: actor.id,
    uploaded_by_username: actor.username,
  });
  if (docError) {
    await supabase.storage.from(APPROVALS_BUCKET).remove([path]);
    await supabase.from("approval_requests").delete().eq("id", id);
    return { ok: false, message: docError.message };
  }

  const eventRecorded = await recordEvent({
    request_id: id,
    actor_id: actor.id,
    actor_username: actor.username,
    kind: "created",
    version: 1,
  });

  await logAction(actor, {
    action: "approval.request_created",
    summary: `Created approval request "${title}" (${company.name}, ${SECTION_LABEL[section]})`,
    details: { id, company: company.slug, section, type, refNo, eventRecorded },
  });

  revalidateApproval(company.slug, id);
  redirect(`/admin/approvals/requests/${id}`);
}

/* -------------------------------------------------------- upload a version */

export async function uploadVersionAction(
  _prev: ApprovalActionState,
  formData: FormData,
): Promise<ApprovalActionState> {
  const actor = await requireSectionAction("approvals");
  if (actor.isCeo)
    return { ok: false, message: "The CEO account decides requests; ask a secretary to upload the update." };

  const id = String(formData.get("id") ?? "");
  const request = await getRequest(id);
  if (!request) return { ok: false, message: "Request not found." };
  const pdf = validatePdf(formData.get("document"));
  if ("error" in pdf) return { ok: false, message: pdf.error };

  const supabase = supabaseAdmin();
  const version = request.currentVersion + 1;
  const path = docPath(id, version);
  const bytes = Buffer.from(await pdf.file.arrayBuffer());
  if (!looksLikePdf(bytes)) return { ok: false, message: "That file is not a valid PDF." };
  const upload = await supabase.storage
    .from(APPROVALS_BUCKET)
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (upload.error)
    return { ok: false, message: `Could not upload the document: ${upload.error.message}` };

  // unique (request_id, version) makes concurrent uploads lose cleanly here.
  const { error: docError } = await supabase.from("approval_documents").insert({
    request_id: id,
    version,
    path,
    filename: pdf.file.name,
    size_bytes: pdf.file.size,
    uploaded_by_id: actor.id,
    uploaded_by_username: actor.username,
  });
  if (docError) {
    await supabase.storage.from(APPROVALS_BUCKET).remove([path]);
    return { ok: false, message: "The request changed while uploading. Refresh and try again." };
  }

  // A new version always reactivates the request and clears the old decision.
  const { data: updated, error: updateError } = await supabase
    .from("approval_requests")
    .update({
      current_version: version,
      status: "active",
      decision_note: null,
      decided_at: null,
      decided_by_id: null,
      decided_by_username: null,
      signed_path: null,
      signature_path: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("current_version", request.currentVersion)
    .select("id");
  if (updateError || !updated?.length) {
    await supabase.from("approval_documents").delete().eq("request_id", id).eq("version", version);
    await supabase.storage.from(APPROVALS_BUCKET).remove([path]);
    return { ok: false, message: "The request changed while uploading. Refresh and try again." };
  }

  const eventRecorded = await recordEvent({
    request_id: id,
    actor_id: actor.id,
    actor_username: actor.username,
    kind: "version_uploaded",
    version,
  });

  await logAction(actor, {
    action: "approval.version_uploaded",
    summary: `Uploaded version ${version} of "${request.title}" (back to Active)`,
    details: { id, version, previousStatus: request.status, eventRecorded },
  });

  revalidateApproval(request.companySlug, id);
  return { ok: true, message: `Version ${version} uploaded. The request is Active again.` };
}

/* ----------------------------------------------------- approve/hold/reject */

export async function decideRequestAction(
  _prev: ApprovalActionState,
  formData: FormData,
): Promise<ApprovalActionState> {
  const actor = await requireSectionAction("approvals");
  if (!canDecideApprovals(actor))
    return { ok: false, message: "Only the CEO can decide requests." };

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (decision !== "approved" && decision !== "rejected" && decision !== "hold")
    return { ok: false, message: "Unknown decision." };

  // Optional: an exact spot the CEO chose in the placement editor (fractions of
  // the page, top-left origin). Absent → the signer auto-detects the position.
  const manual = parseManualPlacement(formData);
  const request = await getRequest(id);
  if (!request) return { ok: false, message: "Request not found." };
  if (request.status === decision)
    return { ok: false, message: `This request is already ${STATUS_LABEL[decision as ApprovalStatus]}.` };

  const supabase = supabaseAdmin();
  const now = new Date();
  let signedPath: string | null = null;
  let signaturePath: string | null = null;
  let stampInfo: { placement: string; page: number } | null = null;

  if (decision === "approved") {
    const signature = await getSignature();
    if (!signature)
      return {
        ok: false,
        message: "No CEO signature on file. Upload it in the Signature section first.",
      };
    // Snapshot which signature image this approval used, so replacing the
    // live signature later never rewrites this record.
    signaturePath = signature.path;

    // Sign the current version BEFORE any status change, so a failure here
    // leaves the request untouched. A stamping failure still approves the
    // request (record-only) - the signature always shows on the record.
    const docRes = await supabase
      .from("approval_documents")
      .select("path")
      .eq("request_id", id)
      .eq("version", request.currentVersion)
      .maybeSingle();
    const currentPath = (docRes.data as { path: string } | null)?.path;
    if (currentPath) {
      const bucket = supabase.storage.from(APPROVALS_BUCKET);
      const [pdfBlob, sigBlob] = await Promise.all([
        bucket.download(currentPath),
        bucket.download(signature.path),
      ]);
      if (pdfBlob.data && sigBlob.data) {
        const stamped = await stampSignature(
          new Uint8Array(await pdfBlob.data.arrayBuffer()),
          new Uint8Array(await sigBlob.data.arrayBuffer()),
          {
            approvedAt: now,
            signatureMime: signature.contentType,
            version: request.currentVersion,
            manual: manual ?? undefined,
          },
        );
        if (stamped) {
          const outPath = docPath(id, request.currentVersion, "-signed");
          const put = await bucket.upload(outPath, Buffer.from(stamped.bytes), {
            contentType: "application/pdf",
            upsert: false,
          });
          if (!put.error) {
            signedPath = outPath;
            stampInfo = { placement: stamped.placement, page: stamped.page };
          }
        }
      }
    }
  }

  const { data: updated, error } = await supabase
    .from("approval_requests")
    .update({
      status: decision,
      decision_note: note || null,
      decided_at: now.toISOString(),
      decided_by_id: actor.id,
      decided_by_username: actor.username,
      signed_path: decision === "approved" ? signedPath : null,
      signature_path: decision === "approved" ? signaturePath : null,
      updated_at: now.toISOString(),
    })
    .eq("id", id)
    .eq("status", request.status)
    .eq("current_version", request.currentVersion)
    .select("id");
  if (error || !updated?.length) {
    if (signedPath) await supabase.storage.from(APPROVALS_BUCKET).remove([signedPath]);
    return { ok: false, message: "The request changed in the meantime. Refresh and try again." };
  }

  const eventRecorded = await recordEvent({
    request_id: id,
    actor_id: actor.id,
    actor_username: actor.username,
    kind: decision,
    note: note || null,
    version: request.currentVersion,
    signed_path: signedPath,
  });

  const verb = decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Put on hold";
  await logAction(actor, {
    action: `approval.${decision === "hold" ? "held" : decision}`,
    summary: `${verb} "${request.title}" (${request.companySlug}, v${request.currentVersion})`,
    details: {
      id,
      version: request.currentVersion,
      note: note || undefined,
      stamped: decision === "approved" ? !!signedPath : undefined,
      signedPath: signedPath ?? undefined,
      eventRecorded,
      ...(stampInfo ?? {}),
    },
  });

  revalidateApproval(request.companySlug, id);
  const suffix =
    decision === "approved" && !signedPath
      ? " The PDF could not be stamped, so the approval is recorded without a signed copy."
      : "";
  return { ok: true, message: `Request ${STATUS_LABEL[decision as ApprovalStatus].toLowerCase()}.${suffix}` };
}

/* ----------------------------------------------------------- delete (SA) */

export async function deleteRequestAction(formData: FormData) {
  const actor = await requireSectionAction("approvals");
  if (!actor.isSuperAdmin) throw new Error("Only the SuperAdmin can delete requests.");

  const id = String(formData.get("id") ?? "");
  const request = await getRequest(id);
  if (!request) throw new Error("Request not found.");

  const supabase = supabaseAdmin();
  const bucket = supabase.storage.from(APPROVALS_BUCKET);
  // Drain the folder page by page, and fail BEFORE deleting the row so a
  // storage hiccup leaves the request retryable instead of orphaning files.
  const prefix = `requests/${id}`;
  for (let i = 0; i < 50; i++) {
    const { data: objects, error: listError } = await bucket.list(prefix, { limit: 100 });
    if (listError) throw new Error(`Could not list the request documents: ${listError.message}`);
    if (!objects?.length) break;
    const { error: removeError } = await bucket.remove(objects.map((o) => `${prefix}/${o.name}`));
    if (removeError) throw new Error(`Could not delete the request documents: ${removeError.message}`);
  }
  const { error } = await supabase.from("approval_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAction(actor, {
    action: "approval.request_deleted",
    summary: `Deleted approval request "${request.title}" (${request.companySlug})`,
    details: { id, company: request.companySlug, refNo: request.refNo },
  });

  revalidateApproval(request.companySlug);
  redirect("/admin/approvals");
}
