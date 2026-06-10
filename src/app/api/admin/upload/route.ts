import { NextResponse } from "next/server";
import { getCurrentUser, can } from "@/lib/admin-auth";
import { supabaseAdmin, MEDIA_BUCKET } from "@/lib/supabase";

/**
 * Admin-only image upload for the content editor. Verifies the admin session,
 * validates the file, uploads it to the public `site-media` bucket and returns
 * the public URL (stored as an image-field value in a content override).
 * Mirrors the CV-upload validation in `api/applications/route.ts`.
 */
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];

export async function POST(request: Request) {
  if (!can(await getCurrentUser(), "content")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ ok: false, error: "No file provided." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { ok: false, error: "Unsupported file type. Use PNG, JPG, WebP, GIF or AVIF." },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ ok: false, error: "Image exceeds the 5 MB limit." }, { status: 400 });
    }

    // Group uploads into a folder (e.g. "projects", "companies/imdad"); sanitise.
    const folder =
      String(form.get("folder") ?? "uploads").replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "") ||
      "uploads";
    const ext = file.name.includes(".") ? file.name.slice(file.name.lastIndexOf(".")).toLowerCase() : "";
    const rand = Math.random().toString(36).slice(2, 10);
    const path = `${folder}/${Date.now()}-${rand}${ext}`;
    const bytes = Buffer.from(await file.arrayBuffer());

    const supabase = supabaseAdmin();
    const upload = await supabase.storage.from(MEDIA_BUCKET).upload(path, bytes, {
      contentType: file.type,
      upsert: false,
    });
    if (upload.error) throw new Error(upload.error.message);

    const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
    return NextResponse.json({ ok: true, url: data.publicUrl });
  } catch (err) {
    console.error("[admin/upload] error", err);
    return NextResponse.json({ ok: false, error: "Upload failed. Please try again." }, { status: 500 });
  }
}
