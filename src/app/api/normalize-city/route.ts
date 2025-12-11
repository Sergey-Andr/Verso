import { NextRequest } from "next/server";

const route = "/api/geo/normalize-city";
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

  const name = (req.nextUrl.searchParams.get("name") || "").trim();
  if (!name) {
    logWarn(trace, { type: "BadQuery", name });
    return Response.json({ name: "" }, { status: 400 });
  }

  const key = process.env.API_KEY;
  if (!key) {
    logErr(trace, { type: "ConfigError", message: "API_KEY missing" });
    return new Response("Server misconfig: API_KEY", { status: 500 });
  }

  const url =
    "https://api.openweathermap.org/geo/1.0/direct?q=" +
    encodeURIComponent(name) +
    "&limit=1&appid=" +
    key;

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), TIMEOUT_MS);
  const started = Date.now();

  try {
    const r = await fetch(url, { cache: "no-store", signal: ac.signal });
    const latencyMs = Date.now() - started;

    if (!r.ok) {
      logErr(trace, {
        type: "UpstreamHTTP",
        status: r.status,
        url,
        name,
        latencyMs,
      });
      return new Response("Upstream error", { status: r.status });
    }

    let arr: any[];
    try {
      arr = await r.json();
    } catch (e: any) {
      logErr(trace, {
        type: "UpstreamBadJSON",
        message: String(e),
        url,
        name,
        latencyMs,
      });
      return new Response("Internal Error", { status: 500 });
    }

    const place = arr?.[0];
    if (!place) {
      logWarn(trace, { type: "NotFound", url, name, latencyMs });
      return Response.json({ found: false, name: "" }, { status: 200 });
    }

    const ln = place.local_names || {};
    const normalized = ln.en ?? place.name ?? name;

    return Response.json({ name: normalized });
  } catch (e: any) {
    const latencyMs = Date.now() - started;
    const isAbort = e?.name === "AbortError" || String(e).includes("timeout");
    logErr(trace, {
      type: isAbort ? "Timeout" : "FetchError",
      message: String(e?.message || e),
      url,
      name,
      latencyMs,
    });
    return new Response("Internal Error", { status: 500 });
  } finally {
    clearTimeout(t);
  }
}
