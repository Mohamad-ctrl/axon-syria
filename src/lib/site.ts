import type { Locale } from "@/i18n/config";

/**
 * Canonical production origin, used by every SEO surface: `metadataBase`
 * (canonical + hreflang), the sitemap, robots.txt, OpenGraph URLs and the
 * Organization JSON-LD.
 *
 * Override per environment with `NEXT_PUBLIC_SITE_URL` (set it in Vercel once
 * the production domain is confirmed); defaults to the live domain. Any
 * trailing slash is stripped so URLs compose cleanly.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://axon-sy.com").replace(/\/+$/, "");

const OG_LOCALES: Record<Locale, string> = { en: "en_GB", ar: "ar_SY", tr: "tr_TR" };

/** OpenGraph locale tag for a given site locale. */
export function ogLocale(loc: Locale): string {
  return OG_LOCALES[loc];
}

/** The other locales' OpenGraph tags (for openGraph.alternateLocale). */
export function ogAlternateLocales(loc: Locale): string[] {
  return (Object.keys(OG_LOCALES) as Locale[]).filter((l) => l !== loc).map((l) => OG_LOCALES[l]);
}

/** hreflang alternates (relative paths) for a path without locale prefix, e.g. "/careers". */
export function langAlternates(path = ""): Record<string, string> {
  return {
    en: `/en${path}`,
    ar: `/ar${path}`,
    tr: `/tr${path}`,
    "x-default": `/en${path}`,
  };
}
