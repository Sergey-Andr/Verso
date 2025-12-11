import { NextRequest, NextResponse } from "next/server";
import fetchUserGeolocation from "@/middleware/fetchUserGeolocation";
import { getRewriteUrl } from "@/middleware/getRewriteUrl";
import { applyUserAgentHeaders } from "@/middleware/applyUserAgent";

export async function middleware(req: NextRequest) {
  await applyUserAgentHeaders(req);
  await fetchUserGeolocation(req);
  const rewriteUrl = getRewriteUrl(req);

  if (rewriteUrl) return NextResponse.rewrite(rewriteUrl);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
