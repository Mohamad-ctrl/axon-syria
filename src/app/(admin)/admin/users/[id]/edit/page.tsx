import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSection } from "@/lib/admin-auth";
import { getUserPublicById } from "@/lib/users";
import UserForm from "../../UserForm";
import PasswordForm from "../../PasswordForm";
import { updateUserAction } from "../../users-actions";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const me = await requireSection("users");
  const { id } = await params;
  const user = await getUserPublicById(id);
  if (!user) notFound();
  // Only the SuperAdmin may open an admin account.
  if (user.isAdmin && !me.isSuperAdmin) redirect("/admin/users");

  return (
    <div className="admin-page">
      <div className="crumbs">
        <Link href="/admin/users">← Users</Link>
      </div>
      <div className="admin-head">
        <h1>Edit {user.username}</h1>
        <p className="muted">Change the username or what this person can access.</p>
      </div>

      <UserForm action={updateUserAction} user={user} submitLabel="Save changes" allowAdmin={me.isSuperAdmin} />

      <section className="ce-reset">
        <h2 style={{ fontSize: "1.1rem", marginBottom: ".8rem" }}>Reset password</h2>
        <PasswordForm userId={user.id} />
      </section>
    </div>
  );
}
