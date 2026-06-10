import Link from "next/link";
import { requireSection } from "@/lib/admin-auth";
import UserForm from "../UserForm";
import { createUserAction } from "../users-actions";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  const me = await requireSection("users");

  return (
    <div className="admin-page">
      <div className="crumbs">
        <Link href="/admin/users">← Users</Link>
      </div>
      <div className="admin-head">
        <h1>New user</h1>
        <p className="muted">Create a login and choose what this person can access.</p>
      </div>
      <UserForm action={createUserAction} submitLabel="Create user" withPassword allowAdmin={me.isSuperAdmin} />
    </div>
  );
}
