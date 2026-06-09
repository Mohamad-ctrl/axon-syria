/**
 * Content overrides layer.
 *
 * Every piece of user-facing content has a vetted default in TypeScript (the
 * dictionaries + the per-company data files). The admin panel stores *partial*
 * overrides in the Supabase `content` table; here we read them (cached) and
 * deep-merge them over the defaults at render time.
 *
 * Design rules:
 * - Defaults are the source of truth for shape and the fallback for content, so
 *   the site renders identically when there are no overrides AND when Supabase
 *   env vars are missing (graceful degradation, same as `lib/jobs.ts`).
 * - The read is wrapped in `unstable_cache` tagged `content`; the admin save
 *   action calls `revalidateTag(CONTENT_TAG)` so edits publish instantly while
 *   the public home/company pages stay statically prerendered. (Next 16's
 *   `'use cache'` directive is the future migration but needs the global
 *   `cacheComponents` switch, which would force every route dynamic.)
 */
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import { hasSupabaseEnv } from "@/lib/jobs";
import type { Locale } from "@/i18n/config";
import en, { type Dictionary } from "@/dictionaries/en";
import ar from "@/dictionaries/ar";
import tr from "@/dictionaries/tr";
import {
  companyProfiles as defaultProfiles,
  type CompanyProfile,
  type CompanyNav,
} from "@/data/company-profiles";
import { featuredProjects as defaultFeatured, type Project } from "@/data/projects";
import {
  companyCertificates as defaultCertificates,
  type CompanyCert,
} from "@/data/certificates";

const STATIC_DICTS: Record<Locale, Dictionary> = { en, ar, tr };

/** Cache tag for every content read; `revalidateTag(CONTENT_TAG)` on save. */
export const CONTENT_TAG = "content";

/** The documents stored in the `content` table, keyed by `key`. */
export type ContentKey = "dictionary" | "companyProfiles" | "projects" | "certificates";

type JsonObject = Record<string, unknown>;

function isPlainObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Deep-merge `override` onto `base`. Plain objects merge key-by-key; arrays and
 * scalars from the override REPLACE the base wholesale (so editing a list, e.g.
 * `stats` or a company's `services`, swaps the whole list). `base` is never
 * mutated. `undefined`/`null` overrides leave the base untouched.
 */
export function deepMerge<T>(base: T, override: unknown): T {
  if (override === undefined || override === null) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override as T;
  }
  const out: JsonObject = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (value === undefined) continue;
    out[key] = deepMerge((base as JsonObject)[key], value);
  }
  return out as T;
}

/**
 * Read every content document in one query, cached until `revalidateTag`.
 * Returns `{}` when env vars are missing or anything goes wrong, so a render
 * (including a static prerender during `npm run build`) never throws.
 */
const loadAllContent = unstable_cache(
  async (): Promise<Partial<Record<ContentKey, JsonObject>>> => {
    if (!hasSupabaseEnv()) return {};
    try {
      const { data, error } = await supabaseAdmin().from("content").select("key,data");
      if (error || !data) return {};
      const out: Partial<Record<ContentKey, JsonObject>> = {};
      for (const row of data as { key: string; data: unknown }[]) {
        if (isPlainObject(row.data)) out[row.key as ContentKey] = row.data;
      }
      return out;
    } catch {
      return {};
    }
  },
  ["site-content-all"],
  { tags: [CONTENT_TAG], revalidate: false },
);

/** A single content document's raw override object (`{}` when absent). */
export async function getContentDoc(key: ContentKey): Promise<JsonObject> {
  const all = await loadAllContent();
  return all[key] ?? {};
}

/** The effective dictionary for a locale: defaults with overrides merged in. */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const doc = await getContentDoc("dictionary");
  return deepMerge(STATIC_DICTS[locale], doc[locale]);
}

/** Effective per-company profiles, keyed by slug (defaults + overrides). */
export async function getCompanyProfiles(): Promise<Record<string, CompanyProfile>> {
  const doc = await getContentDoc("companyProfiles");
  const out: Record<string, CompanyProfile> = {};
  for (const [slug, profile] of Object.entries(defaultProfiles)) {
    out[slug] = deepMerge(profile, doc[slug]);
  }
  return out;
}

export async function getCompanyProfile(slug: string): Promise<CompanyProfile | undefined> {
  const profiles = await getCompanyProfiles();
  return profiles[slug];
}

/** Slim, serializable per-company data for the (client) header + the footer. */
export async function getCompanyNav(): Promise<Record<string, CompanyNav>> {
  const profiles = await getCompanyProfiles();
  const out: Record<string, CompanyNav> = {};
  for (const [slug, p] of Object.entries(profiles)) {
    out[slug] = {
      accent: p.accent,
      name: p.name,
      logo: p.logo,
      logoW: p.logoW,
      logoH: p.logoH,
      logoOnDark: p.logoOnDark,
    };
  }
  return out;
}

/** Effective home-page featured projects (override replaces the whole list). */
export async function getFeaturedProjects(): Promise<Project[]> {
  const doc = await getContentDoc("projects");
  const featured = (doc as { featured?: unknown }).featured;
  return Array.isArray(featured) ? (featured as Project[]) : defaultFeatured;
}

/** Effective certificates for one company (override replaces the whole list). */
export async function getCompanyCertificates(slug: string): Promise<CompanyCert[]> {
  const doc = await getContentDoc("certificates");
  const list = doc[slug];
  return Array.isArray(list) ? (list as CompanyCert[]) : (defaultCertificates[slug] ?? []);
}

export type { Dictionary };
