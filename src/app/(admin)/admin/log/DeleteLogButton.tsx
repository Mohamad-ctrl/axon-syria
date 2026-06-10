"use client";

import { deleteLogEntry } from "./log-actions";

export default function DeleteLogButton({ id }: { id: string }) {
  return (
    <form
      action={deleteLogEntry}
      onSubmit={(e) => {
        if (!window.confirm("Delete this log entry?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button className="log-del" type="submit" aria-label="Delete this log entry" title="Delete">
        ✕
      </button>
    </form>
  );
}
