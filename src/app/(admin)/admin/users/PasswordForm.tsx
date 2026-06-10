"use client";

import { useActionState } from "react";
import { setPasswordAction, type UserActionState } from "./users-actions";

export default function PasswordForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<UserActionState, FormData>(setPasswordAction, {
    ok: false,
    message: "",
  });

  return (
    <form action={formAction} className="form">
      <input type="hidden" name="id" value={userId} />
      <div className="field">
        <label htmlFor="newpw">New password</label>
        <input id="newpw" name="password" type="password" required autoComplete="new-password" />
        <span className="field__hint">At least 6 characters. The user is signed out of old sessions.</span>
      </div>
      <div className="ce-bar">
        <button className="btn btn--ghost" type="submit" disabled={pending}>
          {pending ? "Updating…" : "Set password"}
        </button>
        {state.message && (
          <span className={`ce-msg ${state.ok ? "ce-msg--ok" : "ce-msg--error"}`}>{state.message}</span>
        )}
      </div>
    </form>
  );
}
