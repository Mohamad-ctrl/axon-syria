"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: fd.get("username"), password: fd.get("password") }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        router.replace(typeof json.redirectTo === "string" ? json.redirectTo : "/admin");
        router.refresh();
      } else {
        setError(json.error || "Login failed.");
        setBusy(false);
      }
    } catch {
      setError("Login failed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card form-card">
        <h1 style={{ fontSize: "1.5rem" }}>Admin sign in</h1>
        <p className="muted" style={{ marginBottom: "1.25rem" }}>Axon Syria careers dashboard.</p>
        <form className="form" onSubmit={onSubmit}>
          {error && <div className="alert alert--error">{error}</div>}
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" autoComplete="username" required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          <button className="btn btn--primary btn--lg btn--block" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
