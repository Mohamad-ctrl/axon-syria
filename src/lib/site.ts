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
