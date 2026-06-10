"use client";

import { clearLog } from "./log-actions";

export default function ClearLogButton() {
  return (
    <form
      action={clearLog}
      onSubmit={(e) => {
        if (!window.confirm("Delete ALL log entries? This can't be undone.")) e.preventDefault();
      }}
    >
      <button className="btn btn--ghost btn--sm" type="submit">
        Clear all
      </button>
    </form>
  );
}
