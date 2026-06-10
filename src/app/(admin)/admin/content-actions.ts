"use server";

import { updateTag } from "next/cache";
import { getCurrentUser, can } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabaseEnv } from "@/lib/jobs";
import { CONTENT_TAG, deepMerge, type ContentKey } from "@/lib/content";
import { logAction } from "@/lib/audit";
import {
  getSection,
  dictOverrideFromLogical,
  profileFromLogical,
  projectsFromLogical,
  certsFromLogical,
  type Section,
} from "@/lib/content-schema";

export type ActionState = { ok: boolean; message: string };

function docKeyFor(section: Section): ContentKey {
  switch (section.store.kind) {
    case "dict":
      return "dictionary";
    case "profile":
      return "companyProfiles";
    case "projects":
      return "projects";
    case "certs":
      return "certificates";
  }
}

type Doc = Record<string, unknown>;

async function readDoc(key: ContentKey): Promise<Doc> {
  const { data } = await supabaseAdmin().from("content").select("data").eq("key", key).maybeSingle();
  const d = (data as { data?: unknown } | null)?.data;
  return d && typeof d === "object" && !Array.isArray(d) ? (d as Doc) : {};
}

async function writeDoc(key: ContentKey, data: Doc): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("content")
    .upsert({ key, data, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}

/** Save one section's edits. The submitted value is the editor's *logical* JSON
 *  (trilingual leaves are `{ en, ar, tr }`); we transform it to the store shape,
 *  merge it into the content document and revalidate so edits publish at once. */
export async function saveContentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!can(actor, "content")) return { ok: false, message: "You don't have permission to edit content." };
  if (!hasSupabaseEnv()) return { ok: false, message: "The database isn't connected yet." };

  const id = String(formData.get("sectionId") ?? "");
  const section = getSection(id);
  if (!section) return { ok: false, message: "Unknown section." };

  let logical: unknown;
  try {
    logical = JSON.parse(String(formData.get("value") ?? "null"));
  } catch {
    return { ok: false, message: "Could not read the submitted content." };
  }

  try {
    const key = docKeyFor(section);
    const doc = await readDoc(key);
    let next: Doc;

    if (section.store.kind === "dict") {
      const rootKey = section.store.rootKey;
      const ov = dictOverrideFromLogical(section.shape, logical);
      next = deepMerge(doc, {
        en: { [rootKey]: ov.en },
        ar: { [rootKey]: ov.ar },
        tr: { [rootKey]: ov.tr },
      });
    } else if (section.store.kind === "profile") {
      next = deepMerge(doc, { [section.store.slug]: profileFromLogical(logical) });
    } else if (section.store.kind === "projects") {
      next = { ...doc, featured: projectsFromLogical(logical) };
    } else {
      next = { ...doc, [section.store.slug]: certsFromLogical(logical) };
    }

    await writeDoc(key, next);
    // Server-Action read-your-own-writes: the next request waits for fresh data
    // instead of serving one stale render (revalidateTag's stale-while-revalidate).
    updateTag(CONTENT_TAG);
    await logAction(actor, {
      action: "content.saved",
      summary: `Edited content: ${section.label}`,
      details: { section: section.label, sectionId: section.id },
    });
    return { ok: true, message: "Saved. Your changes are live." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Save failed. Please try again." };
  }
}

/** Remove a section's override so it reverts to the built-in default content. */
export async function resetContentSection(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const actor = await getCurrentUser();
  if (!can(actor, "content")) return { ok: false, message: "You don't have permission to edit content." };
  if (!hasSupabaseEnv()) return { ok: false, message: "The database isn't connected yet." };

  const id = String(formData.get("sectionId") ?? "");
  const section = getSection(id);
  if (!section) return { ok: false, message: "Unknown section." };

  try {
    const key = docKeyFor(section);
    const doc = await readDoc(key);

    if (section.store.kind === "dict") {
      const rootKey = section.store.rootKey;
      for (const loc of ["en", "ar", "tr"] as const) {
        const sub = doc[loc];
        if (sub && typeof sub === "object") delete (sub as Record<string, unknown>)[rootKey];
      }
    } else if (section.store.kind === "profile" || section.store.kind === "certs") {
      delete doc[section.store.slug];
    } else if (section.store.kind === "projects") {
      delete doc.featured;
    }

    await writeDoc(key, doc);
    // Server-Action read-your-own-writes: the next request waits for fresh data
    // instead of serving one stale render (revalidateTag's stale-while-revalidate).
    updateTag(CONTENT_TAG);
    await logAction(actor, {
      action: "content.reset",
      summary: `Reset content to default: ${section.label}`,
      details: { section: section.label, sectionId: section.id },
    });
    return { ok: true, message: "Reverted to the default content." };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Reset failed. Please try again." };
  }
}
