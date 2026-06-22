import { NextRequest, NextResponse } from "next/server";
import fetchUserGeolocation from "@/middleware/fetchUserGeolocation";
import { getRewriteUrl } from "@/middleware/getRewriteUrl";
import { applyUserAgentHeaders } from "@/middleware/applyUserAgent";
import { FIRST_CITY } from "@/constants";

export async function proxy(req: NextRequest) {
  await fetchUserGeolocation(req);

  const rewriteUrl = getRewriteUrl(req);
  const res = rewriteUrl
    ? NextResponse.rewrite(rewriteUrl, { request: { headers: req.headers } })
    : NextResponse.next({ request: { headers: req.headers } });

  applyUserAgentHeaders(req, res);

  // Зеркалим FIRST_CITY в ответ, чтобы браузер сохранил куку для следующих запросов.
  const fc = req.cookies.get(FIRST_CITY)?.value;
  if (fc)
    res.cookies.set(FIRST_CITY, fc, {
      maxAge: 365 * 24 * 60 * 60,
      path: "/",
    });

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|\\.well-known|manifest|sitemap|robots).*)",
  ],
};
