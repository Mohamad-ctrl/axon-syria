"use client";

import { deleteJob } from "../actions";

/**
 * Delete a job permanently, with a confirm() guard. Permanent removal — unlike
 * "Close", which just hides it from the site. Existing applications keep their
 * own snapshot of the job title, so they're unaffected.
 */
export default function DeleteJobButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deleteJob}
      onSubmit={(e) => {
        if (
          !confirm(
            `Delete "${title}"?\n\nThis permanently removes the job posting and cannot be undone. ` +
              `To hide it from the site instead, use "Close".`
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button className="btn btn--danger" style={{ padding: ".4rem .9rem" }} type="submit">
        Delete
      </button>
    </form>
  );
}
