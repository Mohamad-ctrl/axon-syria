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
  const [isAdmin, setIsAdmin] = useState(allowAdmin ? (user?.isAdmin ?? false) : false);

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
          <label className="ce-check">
            <input
              type="checkbox"
              name="is_admin"
              checked={isAdmin}
              onChange={(e) => setIsAdmin(e.target.checked)}
            />
            Administrator (full access to every section)
          </label>
          <span className="field__hint">Only the SuperAdmin can create or change admins.</span>
        </div>
      )}

      {!isAdmin && (
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
