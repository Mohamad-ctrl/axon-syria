import { NextResponse } from "next/server";
import { supabaseAdmin, CV_BUCKET } from "@/lib/supabase";

/**
 * Receives a job application (multipart form incl. the CV file), uploads the CV
 * to the private `cvs` bucket, and inserts a row into `applications`.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();

    const firstName = String(form.get("firstName") ?? "").trim();
    const lastName = String(form.get("lastName") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const coverLetter = String(form.get("coverLetter") ?? "").trim();
    const jobTitle = String(form.get("jobTitle") ?? "").trim();
    const jobSlug = String(form.get("jobSlug") ?? "").trim();
    const cv = form.get("cv");

    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json({ ok: false, error: "Please fill in all required fields." }, { status: 400 });
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!(cv instanceof File) || cv.size === 0) {
      return NextResponse.json({ ok: false, error: "Please attach your CV." }, { status: 400 });
    }
    if (cv.size > 5 * 1024 * 1024) {
      return NextResponse.json({ ok: false, error: "Your CV exceeds the 5 MB limit." }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const ext = cv.name.includes(".") ? cv.name.slice(cv.name.lastIndexOf(".")) : "";
    const rand = Math.random().toString(36).slice(2, 10);
    const path = `${jobSlug || "application"}/${Date.now()}-${rand}${ext}`;
    const bytes = Buffer.from(await cv.arrayBuffer());

    const upload = await supabase.storage.from(CV_BUCKET).upload(path, bytes, {
      contentType: cv.type || "application/octet-stream",
      upsert: false,
    });
    if (upload.error) throw new Error(`CV upload failed: ${upload.error.message}`);

    const { error } = await supabase.from("applications").insert({
      job_slug: jobSlug,
      job_title: jobTitle,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      cover_letter: coverLetter || null,
      cv_path: path,
      cv_filename: cv.name,
      stage: "submitted",
    });
    if (error) {
      // Clean up the orphaned CV if the row insert failed.
      await supabase.storage.from(CV_BUCKET).remove([path]);
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[applications] error", err);
    return NextResponse.json({ ok: false, error: "Server error. Please try again later." }, { status: 500 });
  }
}
