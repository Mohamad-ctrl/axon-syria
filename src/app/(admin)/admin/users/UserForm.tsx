"use client";

import { useActionState, useState } from "react";
import { PERMISSIONS, PERMISSION_LABELS, type AdminUser } from "@/lib/permissions";
import type { UserActionState } from "./users-actions";

export default function UserForm({
  action,
  user,
  submitLabel,
  withPassword,
  allowAdmin,
}: {
  action: (prev: UserActionState, formData: FormData) => Promise<UserActionState>;
  user?: AdminUser;
  submitLabel: string;
  withPassword?: boolean;
  /** Only the SuperAdmin may grant the admin role. */
  allowAdmin?: boolean;
}) {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(action, {
    ok: false,
    message: "",
  });
  const [role, setRole] = useState<"user" | "admin" | "ceo">(
    allowAdmin ? (user?.isCeo ? "ceo" : user?.isAdmin ? "admin" : "user") : "user",
  );

  return (
    <form action={formAction} className="form">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div className="field">
        <label htmlFor="username">Username</label>
        <input id="username" name="username" defaultValue={user?.username ?? ""} required autoComplete="off" />
      </div>

      {withPassword && (
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="new-password" />
          <span className="field__hint">At least 6 characters.</span>
        </div>
      )}

      {allowAdmin && (
        <div className="field">
          <label>Role</label>
          <div className="ce-checks">
            <label className="ce-check">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === "user"}
                onChange={() => setRole("user")}
              />
              Standard user (access only to the sections picked below)
            </label>
            <label className="ce-check">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === "admin"}
                onChange={() => setRole("admin")}
              />
              Administrator (full access to every section)
            </label>
            <label className="ce-check">
              <input
                type="radio"
                name="role"
                value="ceo"
                checked={role === "ceo"}
                onChange={() => setRole("ceo")}
              />
              CEO (decides approval requests and owns the signature)
            </label>
          </div>
          <span className="field__hint">
            Only the SuperAdmin can assign roles, and there can be only one CEO account.
          </span>
        </div>
      )}

      {role === "user" && (
        <div className="field">
          <label>Section access</label>
          <div className="ce-checks">
            {PERMISSIONS.map((p) => (
              <label className="ce-check" key={p}>
                <input
                  type="checkbox"
                  name={`perm_${p}`}
                  defaultChecked={user?.permissions.includes(p) ?? false}
                />
                {PERMISSION_LABELS[p]}
              </label>
            ))}
          </div>
          <span className="field__hint">Choose which sections this user can open.</span>
        </div>
      )}

      <div className="ce-bar">
        <button className="btn btn--primary btn--lg" type="submit" disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state.message && (
          <span className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
