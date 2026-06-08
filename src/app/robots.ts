import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Allow crawling of the public site, keep the admin dashboard out of the index,
 * and point crawlers at the sitemap.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
