import { NextRequest } from "next/server";

export function getRewriteUrl(req: NextRequest): URL | null {
  const decodedPath = decodeURIComponent(req.nextUrl.pathname);

  if (decodedPath.startsWith("/погода/")) {
    const parts = decodedPath.split("/");
    const city = parts[2];
    const lat = parts[3];
    const lon = parts[4];

    if (city && lat && lon) {
      const url = req.nextUrl.clone();
      url.pathname = `/weather/${city}/${lat}/${lon}`;
      return url;
    }
  }

  return null;
}
