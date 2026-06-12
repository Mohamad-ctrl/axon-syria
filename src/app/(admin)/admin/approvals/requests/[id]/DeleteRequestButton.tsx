"use client";

import { deleteRequestAction } from "../../approvals-actions";

export default function DeleteRequestButton({
  requestId,
  title,
}: {
  requestId: string;
  title: string;
}) {
  return (
    <form
      action={deleteRequestAction}
      onSubmit={(e) => {
        if (
          !window.confirm(
            `Delete the request "${title}" with all its documents and history? This can't be undone.`,
          )
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={requestId} />
      <button className="btn btn--ghost btn--sm" type="submit">
        Delete request (SuperAdmin)
      </button>
    </form>
  );
}
