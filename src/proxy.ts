import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Next.js 16: "Proxy" is the renamed Middleware. Redirects non-localized
// paths (e.g. /careers) to a locale-prefixed path (e.g. /en/careers).
function getLocale(request: NextRequest): string {
  const accept = (request.headers.get("accept-language") || "").toLowerCase();
  // Pick whichever supported language appears earliest in Accept-Language.
  const at = (code: string) => {
    const i = accept.indexOf(code);
    return i === -1 ? Infinity : i;
  };
  const best = (["ar", "tr", "en"] as const)
    .map((code) => [code, at(code)] as const)
    .sort((a, b) => a[1] - b[1])[0];
  return best[1] === Infinity ? defaultLocale : best[0];
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
