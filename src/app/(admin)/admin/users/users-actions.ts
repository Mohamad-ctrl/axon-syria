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
  ceoExists,
} from "@/lib/users";
import { PERMISSIONS, type Permission } from "@/lib/permissions";
import { logAction } from "@/lib/audit";

export type UserActionState = { ok: boolean; message: string };

type Role = "user" | "admin" | "ceo";

function roleText(role: Role, permissions: Permission[]): string {
  if (role === "admin") return "administrator";
  if (role === "ceo") return "CEO";
  return permissions.join(", ") || "no access";
}

function parseRole(formData: FormData): Role {
  const role = String(formData.get("role") ?? "");
  if (role === "admin" || role === "ceo" || role === "user") return role;
  // Older form posts carried only the is_admin checkbox.
  return formData.get("is_admin") === "on" ? "admin" : "user";
}

function parsePermissions(formData: FormData): Permission[] {
  return PERMISSIONS.filter((p) => formData.get(`perm_${p}`) === "on");
}

export async function createUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireSectionAction("users");
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData);
  const permissions = parsePermissions(formData);

  if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
  if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
  if (role === "user" && permissions.length === 0)
    return { ok: false, message: "Pick at least one section, or give the user a role." };
  if (role !== "user" && !canManageAdmins(actor))
    return { ok: false, message: "Only the SuperAdmin can assign this role." };
  if (role === "ceo" && (await ceoExists()))
    return { ok: false, message: "A CEO account already exists. There can only be one." };
  if (await usernameTaken(username)) return { ok: false, message: "That username is already taken." };

  try {
    await createUser({ username, password, isAdmin: role === "admin", isCeo: role === "ceo", permissions });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not create the user." };
  }
  await logAction(actor, {
    action: "user.created",
    summary: `Created user "${username}" (${roleText(role, permissions)})`,
    details: { username, role, permissions },
  });
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(_prev: UserActionState, formData: FormData): Promise<UserActionState> {
  const actor = await requireSectionAction("users");
  const id = String(formData.get("id") ?? "");
  const username = String(formData.get("username") ?? "").trim();
  const role = parseRole(formData);
  const permissions = parsePermissions(formData);

  if (!id) return { ok: false, message: "Missing user id." };
  if (username.length < 3) return { ok: false, message: "Username must be at least 3 characters." };
  if (role === "user" && permissions.length === 0)
    return { ok: false, message: "Pick at least one section, or give the user a role." };
  if (await usernameTaken(username, id)) return { ok: false, message: "That username is already taken." };

  const target = await getUserPublicById(id);
  // Only the SuperAdmin may touch an admin or CEO account, or grant either role.
  if (!canManageAdmins(actor) && (target?.isAdmin || target?.isCeo || role !== "user"))
    return { ok: false, message: "Only the SuperAdmin can manage admin or CEO accounts." };
  if (role === "ceo" && (await ceoExists(id)))
    return { ok: false, message: "A CEO account already exists. There can only be one." };

  try {
    await updateUser(id, { username, isAdmin: role === "admin", isCeo: role === "ceo", permissions });
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Could not update the user." };
  }
  await logAction(actor, {
    action: "user.updated",
    summary: `Updated user "${username}" (${roleText(role, permissions)})`,
    details: { id, username, role, permissions },
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
  if ((target?.isAdmin || target?.isCeo) && !canManageAdmins(actor))
    return { ok: false, message: "Only the SuperAdmin can reset this account's password." };
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
  if ((target?.isAdmin || target?.isCeo) && !canManageAdmins(actor))
    throw new Error("Only the SuperAdmin can remove admin or CEO accounts.");

  await deleteUser(id);
  await logAction(actor, {
    action: "user.deleted",
    summary: `Deleted user "${target?.username ?? id}"`,
    details: { id, username: target?.username },
  });
  revalidatePath("/admin/users");
}
