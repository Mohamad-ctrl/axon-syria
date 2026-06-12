/**
 * Pure, client-safe permission constants + types (no server imports), so both
 * server code (`lib/users.ts`, `lib/admin-auth.ts`) and client components
 * (the user form) can import them without bundling the Supabase client.
 */
export type Permission = "applications" | "jobs" | "content" | "approvals";

export const PERMISSIONS: Permission[] = ["applications", "jobs", "content", "approvals"];

export const PERMISSION_LABELS: Record<Permission, string> = {
  applications: "Applications",
  jobs: "Jobs",
  content: "Content",
  approvals: "Approvals",
};

export type AdminUser = {
  id: string;
  username: string;
  isAdmin: boolean;
  /** The single SuperAdmin (env credentials). Only they can add/remove admins.
   *  DB accounts are never SuperAdmin. */
  isSuperAdmin?: boolean;
  /** The single CEO account: decides approval requests and owns the signature.
   *  Only the SuperAdmin can create or manage it; mutually exclusive with
   *  isAdmin and with the permissions subset. */
  isCeo?: boolean;
  permissions: Permission[];
};
