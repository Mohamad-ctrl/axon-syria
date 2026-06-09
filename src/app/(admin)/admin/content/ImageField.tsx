"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * Image picker for the content editor: previews the current image, uploads a
 * replacement to the `site-media` bucket via the admin upload route, and stores
 * the returned public URL. A URL can also be pasted directly.
 */
export default function ImageField({
  value,
  folder,
  onChange,
}: {
  value: string;
  folder?: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (folder) fd.append("folder", folder);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = (await res.json()) as { ok?: boolean; url?: string; error?: string };
      if (!res.ok || !json.ok || !json.url) throw new Error(json.error || "Upload failed.");
      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="ce-img">
      <div className="ce-img__row">
        {value ? (
          <span className="ce-img__preview">
            <Image src={value} alt="" width={120} height={84} unoptimized />
          </span>
        ) : (
          <span className="ce-img__preview ce-img__preview--empty">No image</span>
        )}
        <div className="ce-img__controls">
          <label className="btn btn--ghost btn--sm">
            {busy ? "Uploading…" : value ? "Replace" : "Upload"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
              hidden
              disabled={busy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f);
                e.target.value = "";
              }}
            />
          </label>
          {value && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => onChange("")}>
              Remove
            </button>
          )}
        </div>
      </div>
      <input
        type="text"
        className="ce-img__url"
        value={value}
        placeholder="…or paste an image URL / path"
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <span className="ce-msg ce-msg--error">{error}</span>}
    </div>
  );
}
