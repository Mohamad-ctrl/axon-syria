"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }
  return (
    <button className="btn btn--ghost" onClick={logout} style={{ padding: ".5rem 1.1rem" }}>
      Log out
    </button>
  );
}
