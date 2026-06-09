import type { MetadataRoute } from "next";
import { companyMeta } from "@/data/companies";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap for the public, indexable pages in both locales (EN + AR), each with
 * hreflang alternates so search engines pair the language versions. The admin
 * dashboard is excluded (noindex + disallowed in robots). Job-detail pages are
 * dynamic/DB-driven and omitted here — add them once roles are published.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "", // homepage
    ...companyMeta.map((m) => `/companies/${m.slug}`),
    "/careers",
  ];

  return paths.flatMap((path) => {
    const languages = {
      en: `${SITE_URL}/en${path}`,
      ar: `${SITE_URL}/ar${path}`,
      tr: `${SITE_URL}/tr${path}`,
      "x-default": `${SITE_URL}/en${path}`,
    };
    const priority = path === "" ? 1 : path.startsWith("/companies") ? 0.9 : 0.7;
    return (["en", "ar", "tr"] as const).map((loc) => ({
      url: `${SITE_URL}/${loc}${path}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority,
      alternates: { languages },
    }));
  });
}
