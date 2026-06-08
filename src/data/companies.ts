/**
 * Stable, non-translatable metadata for the company cards.
 * Display text (tag / name / desc / alt) lives in the dictionaries
 * (`dict.companies.cards`), in the SAME order as this array.
 *
 * - `slug` powers the per-company detail page at /[lang]/companies/[slug].
 * - `website` (optional) is the company's own external site; when present it
 *   renders a "Visit website" link on both the card and the detail page.
 *
 * The Syrian companies are new and have no photography yet, so the homepage
 * cards render each company's logo (from `companyProfiles[slug].logo`) on an
 * accent-tinted plate instead of a photo.
 */
export type CompanyMeta = { slug: string; website?: string };

export const companyMeta: CompanyMeta[] = [
  { slug: "axon-contracting" },
  { slug: "axon-industry-trade" },
  { slug: "axon-integrated-facilities" },
  { slug: "axon-landscape" },
  { slug: "imdad", website: "https://imdadgroup.com/" },
];
