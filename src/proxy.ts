import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Next.js 16: "Proxy" is the renamed Middleware. Redirects non-localized
// paths (e.g. /careers) to a locale-prefixed path (e.g. /en/careers).
function getLocale(request: NextRequest): string {
  const accept = (request.headers.get("accept-language") || "").toLowerCase();
  const arIdx = accept.indexOf("ar");
  const enIdx = accept.indexOf("en");
  if (arIdx !== -1 && (enIdx === -1 || arIdx < enIdx)) return "ar";
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip API, Next internals, the images folder, and any file with an extension.
  matcher: ["/((?!api|admin|_next|images|.*\\.).*)"],
};
