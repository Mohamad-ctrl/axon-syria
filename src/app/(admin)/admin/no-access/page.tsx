import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function NoAccessPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>No access yet</h1>
      </div>
      <div className="alert alert--error">
        Your account doesn&apos;t have access to any sections. Ask an administrator to grant you permissions, then sign
        in again.
      </div>
    </div>
  );
}
