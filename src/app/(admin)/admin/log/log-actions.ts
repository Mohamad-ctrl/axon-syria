"use server";

import { revalidatePath } from "next/cache";
import { requireSectionAction } from "@/lib/admin-auth";
import { deleteAuditEntry, clearAuditLog } from "@/lib/audit";

// These maintenance actions are intentionally NOT audit-logged themselves —
// otherwise "Clear all" would immediately leave a fresh entry behind.

export async function deleteLogEntry(formData: FormData) {
  await requireSectionAction("log");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing log id.");
  await deleteAuditEntry(id);
  revalidatePath("/admin/log");
}

export async function clearLog() {
  await requireSectionAction("log");
  await clearAuditLog();
  revalidatePath("/admin/log");
}
