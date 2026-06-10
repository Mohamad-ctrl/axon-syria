"use server";

import { revalidatePath } from "next/cache";
import { requireSectionAction } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isStage, STAGE_LABEL, type Stage } from "@/lib/stages";
import { translateJobToArabic } from "@/lib/translate";
import { getJobBySlug, type Job } from "@/lib/jobs";
import { logAction } from "@/lib/audit";
import { redirect } from "next/navigation";

export async function setStage(formData: FormData) {
  const actor = await requireSectionAction("applications");

  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "");
  if (!id || !isStage(stage)) throw new Error("Invalid request");

  // Snapshot the candidate + previous stage before the update, for the log.
  const { data: appRow } = await supabaseAdmin()
    .from("applications")
    .select("first_name,last_name,job_title,email,stage")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabaseAdmin().from("applications").update({ stage }).eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);

  const row = appRow as
    | { first_name: string; last_name: string; job_title: string; email: string; stage: Stage }
    | null;
  const candidate = row ? `${row.first_name} ${row.last_name}`.trim() : "an applicant";
  const role = row?.job_title ?? "";
  const toLabel = STAGE_LABEL[stage];
  const summary =
    stage === "rejected"
      ? `Rejected ${candidate}${role ? ` (${role})` : ""}`
      : `Moved ${candidate}${role ? ` (${role})` : ""} to ${toLabel}`;
  await logAction(actor, {
    action: "application.stage_changed",
    summary,
    details: {
      candidate,
      role,
      email: row?.email,
      from: row ? STAGE_LABEL[row.stage] ?? row.stage : undefined,
      to: toLabel,
      applicationId: id,
    },
  });
}

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

// Employment type is a fixed dropdown, so its Arabic is mapped directly.
const TYPE_AR: Record<string, string> = {
  "Full-time": "دوام كامل",
  "Part-time": "دوام جزئي",
};

// Arabic fallback chain: fresh translation → existing Arabic (on edit) → English.
function arText(translated: string | undefined, existing: string | undefined, en: string): string {
  return translated || existing || en;
}
function arList(translated: string[] | undefined, existing: string[] | undefined, en: string[]): string[] {
  if (translated && translated.length) return translated;
  if (existing && existing.length) return existing;
  return en;
}

/**
 * Build the bilingual `data` payload from the English-only job form. The admin
 * writes English; the Arabic side is generated automatically. If translation is
 * unavailable (no ANTHROPIC_API_KEY or an API error), it keeps the existing
 * Arabic when editing, and otherwise falls back to the English text — so a job
 * is never blocked and good translations are never clobbered.
 * Shared by createJob and updateJob.
 */
async function jobDataFromForm(formData: FormData, existing?: Job) {
  const g = (k: string) => String(formData.get(k) ?? "").trim();
  const lines = (k: string) => g(k).split("\n").map((s) => s.trim()).filter(Boolean);

  const title = g("title");
  if (!title) throw new Error("A job title is required.");
  const company = g("company");
  const location = g("location");
  const type = g("type") === "Part-time" ? "Part-time" : "Full-time";
  const description = lines("description");
  const requirements = lines("requirements");

  const ar = await translateJobToArabic({ title, company, location, description, requirements });

  return {
    title: { en: title, ar: arText(ar?.title, existing?.title.ar, title) },
    company: { en: company, ar: arText(ar?.company, existing?.company.ar, company) },
    location: { en: location, ar: arText(ar?.location, existing?.location.ar, location) },
    type: { en: type, ar: TYPE_AR[type] ?? type },
    description: { en: description, ar: arList(ar?.description, existing?.description.ar, description) },
    requirements: { en: requirements, ar: arList(ar?.requirements, existing?.requirements.ar, requirements) },
  };
}

export async function createJob(formData: FormData) {
  const actor = await requireSectionAction("jobs");

  const data = await jobDataFromForm(formData);
  const slug = slugify(data.title.en);
  if (!slug) throw new Error("Could not generate a URL slug from the title.");

  const today = new Date().toISOString().slice(0, 10);
  const { error } = await supabaseAdmin().from("jobs").insert({ slug, active: true, posted: today, data });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/jobs");
  revalidatePath("/en/careers");
  revalidatePath("/ar/careers");
  await logAction(actor, {
    action: "job.created",
    summary: `Created job "${data.title.en}"`,
    details: { slug, title: data.title.en, company: data.company.en, type: data.type.en },
  });
  redirect("/admin/jobs");
}

export async function updateJob(formData: FormData) {
  const actor = await requireSectionAction("jobs");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing job identifier.");

  const existing = await getJobBySlug(slug);
  if (!existing) throw new Error("Job not found.");

  // The slug (the public URL, and the key applications reference) stays fixed
  // even if the title changes — only the content is updated. Existing Arabic is
  // preserved when auto-translation is unavailable.
  const data = await jobDataFromForm(formData, existing);
  const { error } = await supabaseAdmin().from("jobs").update({ data }).eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/jobs");
  revalidatePath(`/admin/jobs/${slug}/edit`);
  revalidatePath("/en/careers");
  revalidatePath("/ar/careers");
  revalidatePath(`/en/careers/${slug}`);
  revalidatePath(`/ar/careers/${slug}`);
  await logAction(actor, {
    action: "job.updated",
    summary: `Edited job "${data.title.en}"`,
    details: { slug, title: data.title.en },
  });
  redirect("/admin/jobs");
}

export async function deleteJob(formData: FormData) {
  const actor = await requireSectionAction("jobs");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) throw new Error("Missing slug");

  const existing = await getJobBySlug(slug);
  const { error } = await supabaseAdmin().from("jobs").delete().eq("slug", slug);
  if (error) throw new Error(error.message);

  // Applications keep their own snapshot of job_title, so they're unaffected.
  revalidatePath("/admin/jobs");
  revalidatePath("/en/careers");
  revalidatePath("/ar/careers");
  await logAction(actor, {
    action: "job.deleted",
    summary: `Deleted job "${existing?.title.en ?? slug}"`,
    details: { slug, title: existing?.title.en ?? slug },
  });
}

export async function setJobActive(formData: FormData) {
  const actor = await requireSectionAction("jobs");
  const slug = String(formData.get("slug") ?? "");
  const active = String(formData.get("active") ?? "") === "true";
  if (!slug) throw new Error("Missing slug");

  const existing = await getJobBySlug(slug);
  const { error } = await supabaseAdmin().from("jobs").update({ active }).eq("slug", slug);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/jobs");
  revalidatePath("/en/careers");
  revalidatePath("/ar/careers");
  await logAction(actor, {
    action: active ? "job.activated" : "job.deactivated",
    summary: `${active ? "Published" : "Unpublished"} job "${existing?.title.en ?? slug}"`,
    details: { slug, title: existing?.title.en ?? slug, active },
  });
}
