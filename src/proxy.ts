import { NextRequest, NextResponse } from "next/server";
import fetchUserGeolocation from "@/middleware/fetchUserGeolocation";
import { getRewriteUrl } from "@/middleware/getRewriteUrl";
import { resolveUserAgentCookie } from "@/middleware/resolveUserAgentCookie";
import { FIRST_CITY } from "@/constants";

export async function proxy(req: NextRequest) {
  await fetchUserGeolocation(req);

  const requestHeaders = new Headers(req.headers);
  const uaCookie = resolveUserAgentCookie(req);

  if (uaCookie) {
    const existing = requestHeaders.get("cookie") ?? "";
    requestHeaders.set(
      "cookie",
      `${existing}${existing ? "; " : ""}${uaCookie.name}=${uaCookie.value}`,
    );
  }

  const rewriteUrl = getRewriteUrl(req);
  const res = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } })
    : NextResponse.next({ request: { headers: requestHeaders } });

  if (uaCookie) {
    res.cookies.set(uaCookie.name, uaCookie.value, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }

  const fc = req.cookies.get(FIRST_CITY)?.value;
  if (fc) {
    res.cookies.set(FIRST_CITY, fc, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|\\.well-known|manifest|sitemap|robots).*)",
  ],
};
