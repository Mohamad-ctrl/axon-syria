import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import { hasSupabaseEnv } from "@/lib/jobs";
import { listUsers } from "@/lib/users";
import { PERMISSION_LABELS } from "@/lib/permissions";
import DeleteUserButton from "./DeleteUserButton";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const me = await requireSection("users");

  if (!hasSupabaseEnv()) {
    return (
      <div className="admin-page">
        <div className="admin-head">
          <h1>Users</h1>
        </div>
        <div className="alert alert--error">
          The database isn&apos;t connected yet, so admin accounts can&apos;t be managed. Set{" "}
          <code>SUPABASE_URL</code> and <code>SUPABASE_SERVICE_ROLE_KEY</code> first.
        </div>
      </div>
    );
  }

  const users = await listUsers();

  return (
    <div className="admin-page">
      <div className="admin-head admin-head--row">
        <div>
          <h1>Users</h1>
          <p className="muted">{users.length} account{users.length === 1 ? "" : "s"}</p>
        </div>
        <Link className="btn btn--primary" href="/admin/users/new">
          New user
        </Link>
      </div>

      <div className="alert alert--info">
        {me.isSuperAdmin ? (
          <>
            You&apos;re signed in as the <strong>SuperAdmin</strong> ({me.username}). Only the SuperAdmin can add or
            remove <strong>admins</strong>; its login lives in the Vercel settings and isn&apos;t listed here.
          </>
        ) : (
          <>
            You can manage non-admin users here. <strong>Admin accounts are managed by the SuperAdmin only.</strong>
          </>
        )}
      </div>

      <div className="admin-table admin-table--users">
        <div className="admin-table__head">
          <span>Username</span>
          <span>Access</span>
          <span>Actions</span>
        </div>
        {users.length === 0 && <div className="admin-table__row">No accounts yet.</div>}
        {users.map((u) => (
          <div className="admin-table__row" key={u.id}>
            <span>{u.username}</span>
            <span className="user-access">
              {u.isCeo
                ? "CEO"
                : u.isAdmin
                  ? "Administrator"
                  : u.permissions.length
                    ? u.permissions.map((p) => PERMISSION_LABELS[p]).join(", ")
                    : "No access"}
            </span>
            <span className="user-actions">
              {me.isSuperAdmin || (!u.isAdmin && !u.isCeo) ? (
                <>
                  <Link className="btn btn--ghost btn--sm" href={`/admin/users/${u.id}/edit`}>
                    Edit
                  </Link>
                  {u.id !== me.id && <DeleteUserButton userId={u.id} username={u.username} />}
                </>
              ) : (
                <span className="muted user-actions__locked">SuperAdmin only</span>
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
