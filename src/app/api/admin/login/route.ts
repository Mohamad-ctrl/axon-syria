import { NextResponse } from "next/server";
import { authenticate, SESSION_COOKIE } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body?.username ?? "");
  const password = String(body?.password ?? "");

  const result = await authenticate(username, password);
  if (!result) {
    return NextResponse.json({ ok: false, error: "Invalid username or password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, redirectTo: result.redirectTo });
  res.cookies.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
