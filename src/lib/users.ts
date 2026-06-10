/**
 * Admin accounts + per-user permissions, stored in the `admin_users` table.
 * Server-only (uses the service-role Supabase client). Passwords are hashed
 * with scrypt; the plaintext is never stored or returned.
 */
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabaseEnv } from "@/lib/jobs";
import { PERMISSIONS, type Permission, type AdminUser } from "@/lib/permissions";

export { PERMISSIONS, PERMISSION_LABELS } from "@/lib/permissions";
export type { Permission, AdminUser } from "@/lib/permissions";

type Row = {
  id: string;
  username: string;
  is_admin: boolean;
  permissions: string[] | null;
  password_changed_at: string;
};

function toUser(row: Row): AdminUser {
  const perms = (row.permissions ?? []).filter((p): p is Permission =>
    (PERMISSIONS as string[]).includes(p),
  );
  return { id: row.id, username: row.username, isAdmin: row.is_admin, permissions: perms };
}

export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}

/* ----------------------------------------------------------- password hashing */

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== "scrypt") return false;
  const [, salt, hash] = parts;
  let derived: Buffer;
  try {
    derived = crypto.scryptSync(password, salt, 64);
  } catch {
    return false;
  }
  const expected = Buffer.from(hash, "hex");
  return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
}

/* ------------------------------------------------------------------------ CRUD */

const SELECT = "id,username,is_admin,permissions,password_changed_at";

export async function listUsers(): Promise<AdminUser[]> {
  if (!hasSupabaseEnv()) return [];
  const { data, error } = await supabaseAdmin()
    .from("admin_users")
    .select(SELECT)
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return ((data as Row[] | null) ?? []).map(toUser);
}

/** Auth lookup by id; includes `passwordChangedAt` (ms) for session validation. */
export async function getUserById(
  id: string,
): Promise<(AdminUser & { passwordChangedAt: number }) | null> {
  if (!hasSupabaseEnv()) return null;
  const { data } = await supabaseAdmin().from("admin_users").select(SELECT).eq("id", id).maybeSingle();
  if (!data) return null;
  const row = data as Row;
  return { ...toUser(row), passwordChangedAt: Date.parse(row.password_changed_at) || 0 };
}

export async function getUserPublicById(id: string): Promise<AdminUser | null> {
  const u = await getUserById(id);
  return u ? { id: u.id, username: u.username, isAdmin: u.isAdmin, permissions: u.permissions } : null;
}

/** Login lookup: returns the id + stored hash for a username, or null. */
export async function getLoginRecord(
  username: string,
): Promise<{ id: string; passwordHash: string } | null> {
  if (!hasSupabaseEnv()) return null;
  const { data } = await supabaseAdmin()
    .from("admin_users")
    .select("id,password_hash")
    .eq("username", normalizeUsername(username))
    .maybeSingle();
  if (!data) return null;
  const row = data as { id: string; password_hash: string };
  return { id: row.id, passwordHash: row.password_hash };
}

export async function usernameTaken(username: string, exceptId?: string): Promise<boolean> {
  if (!hasSupabaseEnv()) return false;
  const { data } = await supabaseAdmin()
    .from("admin_users")
    .select("id")
    .eq("username", normalizeUsername(username));
  return ((data as { id: string }[] | null) ?? []).some((r) => r.id !== exceptId);
}

export async function createUser(input: {
  username: string;
  password: string;
  isAdmin: boolean;
  permissions: Permission[];
}): Promise<void> {
  const { error } = await supabaseAdmin().from("admin_users").insert({
    username: normalizeUsername(input.username),
    password_hash: hashPassword(input.password),
    is_admin: input.isAdmin,
    permissions: input.isAdmin ? [] : input.permissions,
  });
  if (error) throw new Error(error.message);
}

export async function updateUser(
  id: string,
  input: { username: string; isAdmin: boolean; permissions: Permission[] },
): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("admin_users")
    .update({
      username: normalizeUsername(input.username),
      is_admin: input.isAdmin,
      permissions: input.isAdmin ? [] : input.permissions,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function setUserPassword(id: string, password: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("admin_users")
    .update({ password_hash: hashPassword(password), password_changed_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("admin_users").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
