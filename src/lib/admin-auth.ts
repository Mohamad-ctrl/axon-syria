import { cookies } from "next/headers";
import crypto from "crypto";
import { redirect } from "next/navigation";
import {
  getUserById,
  getLoginRecord,
  verifyPassword,
  type AdminUser,
  type Permission,
} from "@/lib/users";
import { logAction } from "@/lib/audit";

const COOKIE = "axon_admin";
export const SESSION_COOKIE = COOKIE;

/** Every section the dashboard guards. `users` and `log` are admin-only. */
export type Section = Permission | "users" | "log";

/** The built-in bootstrap superadmin id (env credentials, no DB row). */
const ENV_ID = "env";

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "dev-insecure-secret-change-me";
}

function sign(value: string): string {
  const mac = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  return `${value}.${mac}`;
}

/** Verify the HMAC and return the signed value, or null if tampered/missing. */
function unsign(token: string | undefined): string | null {
  if (!token) return null;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return null;
  const value = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = crypto.createHmac("sha256", secret()).update(value).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  return crypto.timingSafeEqual(a, b) ? value : null;
}

// The single SuperAdmin's credentials live in env (set on Vercel), never in the
// DB. SUPERADMIN_* is preferred; the older ADMIN_* names still work as a fallback.
function envUsername(): string {
  return process.env.SUPERADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
}
function checkEnvCredentials(username: string, password: string): boolean {
  const u = process.env.SUPERADMIN_USERNAME || process.env.ADMIN_USERNAME || "admin";
  const p = process.env.SUPERADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "admin";
  return username === u && password === p;
}

/**
 * The session cookie is `userId:passwordStamp`. The stamp is the user's
 * `password_changed_at` (ms) captured at login; comparing it to the DB value on
 * each request invalidates a session after the password changes, with no
 * dependence on clock sync between the app and the database.
 */
export function makeSessionToken(userId: string, passwordStamp: number): string {
  return sign(`${userId}:${passwordStamp}`);
}

/**
 * Verify credentials. DB users take precedence; the env credentials are a
 * bootstrap superadmin fallback so the dashboard can never be locked out.
 * Returns the session token + the landing path for the user's role.
 */
export async function authenticate(
  username: string,
  password: string,
): Promise<{ token: string; redirectTo: string } | null> {
  const uname = username.trim();

  const rec = await getLoginRecord(uname);
  if (rec && verifyPassword(password, rec.passwordHash)) {
    const user = await getUserById(rec.id);
    await logAction(
      { id: rec.id, username: user?.username ?? uname },
      { action: "auth.login", summary: `${user?.username ?? uname} signed in` },
    );
    return {
      token: makeSessionToken(rec.id, user?.passwordChangedAt ?? 0),
      redirectTo: user ? landingPath(user) : "/admin",
    };
  }

  if (checkEnvCredentials(uname, password)) {
    const envUser: AdminUser = { id: ENV_ID, username: envUsername(), isAdmin: true, isSuperAdmin: true, permissions: [] };
    await logAction(
      { id: ENV_ID, username: envUsername() },
      { action: "auth.login", summary: `${envUsername()} signed in (built-in admin)` },
    );
    return { token: makeSessionToken(ENV_ID, 0), redirectTo: landingPath(envUser) };
  }

  return null;
}

/** The current admin user from the signed session cookie, or null. */
export async function getCurrentUser(): Promise<AdminUser | null> {
  const store = await cookies();
  const value = unsign(store.get(COOKIE)?.value);
  if (!value) return null;

  const sep = value.lastIndexOf(":");
  if (sep < 0) return null;
  const userId = value.slice(0, sep);
  const stamp = Number(value.slice(sep + 1));
  if (!userId || !Number.isFinite(stamp)) return null;

  if (userId === ENV_ID) {
    return { id: ENV_ID, username: envUsername(), isAdmin: true, isSuperAdmin: true, permissions: [] };
  }

  const user = await getUserById(userId);
  if (!user) return null;
  // The password changed since this session was issued → force re-login.
  if (stamp !== user.passwordChangedAt) return null;
  return { id: user.id, username: user.username, isAdmin: user.isAdmin, permissions: user.permissions };
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

/** Whether a user may access a section. Admins can access everything. */
export function can(user: AdminUser | null, section: Section): boolean {
  if (!user) return false;
  if (user.isAdmin) return true;
  if (section === "users" || section === "log") return false;
  return user.permissions.includes(section);
}

/** Only the SuperAdmin (env credentials) may create, edit, delete, or
 *  promote/demote admin accounts. Normal admins manage non-admin users only. */
export function canManageAdmins(user: AdminUser | null): boolean {
  return !!user?.isSuperAdmin;
}

/** The first section a user can access, for post-login / fallback redirects. */
export function landingPath(user: AdminUser): string {
  if (can(user, "applications")) return "/admin";
  if (can(user, "jobs")) return "/admin/jobs";
  if (can(user, "content")) return "/admin/content";
  if (can(user, "users")) return "/admin/users";
  return "/admin/no-access";
}

/** Page guard: returns the user if allowed; otherwise redirects (login or their
 *  own landing area). */
export async function requireSection(section: Section): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!can(user, section)) redirect(landingPath(user));
  return user;
}

/** Server-action guard: throws if the current user lacks `section`. */
export async function requireSectionAction(section: Section): Promise<AdminUser> {
  const user = await getCurrentUser();
  if (!user || !can(user, section)) throw new Error("Unauthorized");
  return user;
}
