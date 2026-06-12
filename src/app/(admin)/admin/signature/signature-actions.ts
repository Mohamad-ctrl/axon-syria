"use server";

/**
 * Server action for the CEO signature manager. Only the SuperAdmin and the
 * CEO can reach it (section "signature" in can()). The image lives in the
 * private approvals bucket under a timestamped name; the single
 * approval_signature row points at the current one.
 */
import { revalidatePath } from "next/cache";
import { requireSectionAction } from "@/lib/admin-auth";
import { supabaseAdmin, APPROVALS_BUCKET } from "@/lib/supabase";
import { getSignature } from "@/lib/approvals";
import { logAction } from "@/lib/audit";

export type SignatureActionState = { ok: boolean; message: string };

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg" };

export async function saveSignatureAction(
  _prev: SignatureActionState,
  formData: FormData,
): Promise<SignatureActionState> {
  const actor = await requireSectionAction("signature");

  const file = formData.get("signature");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, message: "Choose a signature image first." };
  if (file.size > MAX_BYTES) return { ok: false, message: "The image must be 2 MB or smaller." };
  const ext = ALLOWED[file.type];
  if (!ext) return { ok: false, message: "Use a PNG or JPG image (PNG with a transparent background works best)." };

  // Client MIME is spoofable; check the actual magic bytes.
  const bytes = Buffer.from(await file.arrayBuffer());
  const isPng =
    bytes.length >= 8 &&
    bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isJpeg = bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (!(file.type === "image/png" ? isPng : isJpeg))
    return { ok: false, message: "The file does not look like a valid PNG or JPG image." };

  const supabase = supabaseAdmin();
  const previous = await getSignature();
  // Timestamped name so a replacement is never served stale from a cached URL.
  const path = `signature/ceo-${Date.now()}.${ext}`;
  const upload = await supabase.storage
    .from(APPROVALS_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false });
  if (upload.error)
    return { ok: false, message: `Could not upload the image: ${upload.error.message}` };

  const { error } = await supabase.from("approval_signature").upsert({
    id: "ceo",
    path,
    content_type: file.type,
    updated_at: new Date().toISOString(),
    updated_by_id: actor.id,
    updated_by_username: actor.username,
  });
  if (error) {
    await supabase.storage.from(APPROVALS_BUCKET).remove([path]);
    return { ok: false, message: error.message };
  }

  // Old signature images are deliberately KEPT: approved requests snapshot
  // the signature path they were approved with (approval_requests
  // .signature_path), so deleting the old file would blank historical
  // approval records. The files are tiny.

  await logAction(actor, {
    action: "approval.signature_updated",
    summary: previous ? "Replaced the CEO signature" : "Uploaded the CEO signature",
    details: { contentType: file.type, sizeBytes: file.size },
  });

  revalidatePath("/admin/signature");
  return { ok: true, message: previous ? "Signature replaced." : "Signature saved." };
}
