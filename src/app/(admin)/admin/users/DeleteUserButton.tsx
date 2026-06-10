"use client";

import { deleteUserAction } from "./users-actions";

export default function DeleteUserButton({ userId, username }: { userId: string; username: string }) {
  return (
    <form
      action={deleteUserAction}
      onSubmit={(e) => {
        if (!window.confirm(`Delete the user "${username}"? This can't be undone.`)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={userId} />
      <button className="btn btn--ghost btn--sm" type="submit">
        Delete
      </button>
    </form>
  );
}
