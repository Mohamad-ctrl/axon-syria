"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSectionAction, getCurrentUser, canManageAdmins } from "@/lib/admin-auth";
import {
  createUser,
  updateUser,
  setUserPassword,
  deleteUser,
  usernameTaken,
  getUserPublicById,
} from "@/lib/users";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { logAction } from "@/lib/audit";

export type UserActionState = { ok: boolean; message: string };

function roleText(isAdmin: boolean, permissions: Permission[]): string {
  return isAdmin ? "administrator" : permissions.join(", ") || "no access";
}

function parsePermissions(formData: FormData): Permission[] {
  return PERMISSIONS.filter((p) => formData.get(`perm_${p}`) === "on");
}

export async function createUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireSectionAction("users");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const isAdmin = formData.get("is_admin") === "on";
  const permissions = parsePermissions(formData);

  if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
  if (!isAdmin && permissions.length === 0)
    return { ok: false, message: "Pick at least one section, or make the user an administrator." };
  if (isAdmin && !canManageAdmins(actor))
    return { ok: false, message: "Only the SuperAdmin can create admin accounts." };
  if (await usernameTaken(username)) return { ok: false, message: "That username is already taken." };

  await createUser({ username, password, isAdmin, permissions });
  await logAction(actor, {
    action: "user.created",
    summary: `Created user "${username}" (${roleText(isAdmin, permissions)})`,
    details: { username, isAdmin, permissions },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireSectionAction("users");
  const id = String(formData.get("id") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const isAdmin = formData.get("is_admin") === "on";
  const permissions = parsePermissions(formData);

  if (!id) return { ok: false, message: "Missing user id." };
  if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
  if (!isAdmin && permissions.length === 0)
    return { ok: false, message: "Pick at least one section, or make the user an administrator." };
  if (await usernameTaken(username, id)) return { ok: false, message: "That username is already taken." };

  const target = await getUserPublicById(id);
  // Only the SuperAdmin may edit an admin account or grant the admin role.
  if (!canManageAdmins(actor) && (target?.isAdmin || isAdmin))
    return { ok: false, message: "Only the SuperAdmin can manage admin accounts." };

  await updateUser(id, { username, isAdmin, permissions });
  await logAction(actor, {
    action: "user.updated",
    summary: `Updated user "${username}" (${roleText(isAdmin, permissions)})`,
    details: { id, username, isAdmin, permissions },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function setPasswordAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireSectionAction("users");
  const id = String(formData.get("id") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!id) return { ok: false, message: "Missing user id." };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };

  const target = await getUserPublicById(id);
  if (target?.isAdmin && !canManageAdmins(actor))
    return { ok: false, message: "Only the SuperAdmin can reset an admin's password." };
  await setUserPassword(id, password);
  await logAction(actor, {
    action: "user.password_reset",
    summary: `Reset the password for "${target?.username ?? id}"`,
    details: { id, username: target?.username },
  });
  revalidatePath("/admin/users");
  return { ok: true, message: "Password updated." };
}

export async function deleteUserAction(formData: FormData) {
  const actor = await requireSectionAction("users");
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing user id.");

  const me = await getCurrentUser();
  if (me?.id === id) throw new Error("You can't delete your own account.");

  const target = await getUserPublicById(id);
  if (target?.isAdmin && !canManageAdmins(actor))
    throw new Error("Only the SuperAdmin can remove admin accounts.");

  await deleteUser(id);
  await logAction(actor, {
    action: "user.deleted",
    summary: `Deleted user "${target?.username ?? id}"`,
    details: { id, username: target?.username },
  });
  revalidatePath("/admin/users");
}
