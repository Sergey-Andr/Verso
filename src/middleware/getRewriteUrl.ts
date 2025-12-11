import { NextRequest } from "next/server";

export function getRewriteUrl(req: NextRequest): URL | null {
  const decodedPath = decodeURIComponent(req.nextUrl.pathname);

  if (decodedPath.startsWith("/погода/")) {
    const parts = decodedPath.split("/");
    const city = parts[2];
    const country = parts[3];
    const lat = parts[4];
    const lon = parts[5];

    if (city && country && lat && lon) {
      const url = req.nextUrl.clone();
      url.pathname = `/weather/${city}/${country}/${lat}/${lon}`;
      return url;
    }
  }

  return null;
}
