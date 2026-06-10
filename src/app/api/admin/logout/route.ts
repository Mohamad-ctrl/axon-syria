import { NextResponse } from "next/server";
import { SESSION_COOKIE, getCurrentUser } from "@/lib/admin-auth";
import { logAction } from "@/lib/audit";

export async function POST() {
  const user = await getCurrentUser();
  if (user) {
    await logAction(
      { id: user.id, username: user.username },
      { action: "auth.logout", summary: `${user.username} signed out` },
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
