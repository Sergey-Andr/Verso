import { NextRequest, NextResponse } from "next/server";
import { countryName } from "@/constants/countries";

const route = "/api/reverse-geocode";
const TIMEOUT_MS = 3000;

const getTrace = (req: NextRequest) =>
  (req.headers.get("x-cloud-trace-context") || "").split("/")[0];

const logErr = (trace: string, payload: Record<string, any>) =>
  console.error(
    JSON.stringify({ severity: "ERROR", trace, route, ...payload }),
  );

const logWarn = (trace: string, payload: Record<string, any>) =>
  console.warn(
    JSON.stringify({ severity: "WARNING", trace, route, ...payload }),
  );

export async function GET(req: NextRequest) {
  const trace = getTrace(req);

  const lat = req.nextUrl.searchParams.get("lat");
  const lon = req.nextUrl.searchParams.get("lon");
  const lang = (req.nextUrl.searchParams.get("lang") || "").toLowerCase();

  if (!lat || !lon || !lang) {
    logWarn(trace, { type: "BadQuery", lat, lon, lang });
    return new Response("Bad Request", { status: 400 });
  }

  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (
    !Number.isFinite(latNum) ||
    latNum < -90 ||
    latNum > 90 ||
    !Number.isFinite(lonNum) ||
    lonNum < -180 ||
    lonNum > 180
  ) {
    logWarn(trace, { type: "BadCoords", lat, lon });
    return new Response("Bad Request: invalid coords", { status: 400 });
  }

  const key = process.env.API_KEY;
  if (!key) {
    logErr(trace, { type: "ConfigError", message: "API_KEY missing" });
    return new Response("Server misconfig: API_KEY", { status: 500 });
  }

  const url = new URL("https://api.openweathermap.org/geo/1.0/reverse");
  url.searchParams.set("lat", String(latNum));
  url.searchParams.set("lon", String(lonNum));
  url.searchParams.set("limit", "1");
  url.searchParams.set("appid", key);

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), TIMEOUT_MS);
  const started = Date.now();

  try {
    const r = await fetch(url, { signal: ac.signal });
    const latencyMs = Date.now() - started;

    if (!r.ok) {
      logErr(trace, {
        type: "UpstreamHTTP",
        status: r.status,
        url: String(url),
        latencyMs,
      });
      return new Response("Upstream error", { status: r.status });
    }

    let data: any;
    try {
      data = await r.json();
    } catch (e: any) {
      logErr(trace, {
        type: "UpstreamBadJSON",
        message: String(e),
        url: String(url),
        latencyMs,
      });
      return new Response("Internal Error", { status: 500 });
    }

    if (!Array.isArray(data) || data.length === 0) {
      logWarn(trace, { type: "NotFound", url: String(url), latencyMs });
      return new Response("Not Found", { status: 404 });
    }

    const place = data[0] ?? {};
    const localNames = place.local_names || {};
    const city = localNames[lang] ?? place.name ?? localNames.en ?? "";
    const country = await countryName(place.country, lang);

    return NextResponse.json({ name: city, country });
  } catch (e: any) {
    const latencyMs = Date.now() - started;
    const isAbort = e?.name === "AbortError" || String(e).includes("timeout");
    logErr(trace, {
      type: isAbort ? "Timeout" : "FetchError",
      message: String(e?.message || e),
      url: String(url),
      latencyMs,
    });
    return new Response("Internal Error", { status: 500 });
  } finally {
    clearTimeout(t);
  }
}
