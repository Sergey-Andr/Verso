export const runtime = "edge";

const route = "/api/geolocation";
const TIMEOUT_MS = 2500;

const getTrace = (req: Request) =>
  (req.headers.get("x-cloud-trace-context") || "").split("/")[0];

const logErr = (trace: string, payload: Record<string, any>) =>
  console.error(
    JSON.stringify({ severity: "ERROR", trace, route, ...payload }),
  );

const logWarn = (trace: string, payload: Record<string, any>) =>
  console.warn(
    JSON.stringify({ severity: "WARNING", trace, route, ...payload }),
  );

function parseClientIp(xff: string | null) {
  if (!xff) return null;
  const first = xff.split(",")[0]?.trim();
  if (!first || first === "::1") return null;
  const looksLikeIp = /^[0-9.]+$/.test(first) || first.includes(":");
  return looksLikeIp ? first : null;
}

export async function GET(req: Request) {
  const trace = getTrace(req);
  const ip = parseClientIp(req.headers.get("x-forwarded-for"));
  if (!ip) {
    logWarn(trace, {
      type: "GeoBadIP",
      message: "Missing/invalid x-forwarded-for",
    });
    return new Response("IP address is required", { status: 400 });
  }

  const ac = new AbortController();
  const t = setTimeout(() => ac.abort("timeout"), TIMEOUT_MS);
  const started = Date.now();

  try {
    const url = `http://ip-api.com/json/${ip}?fields=status,city,lat,lon,countryCode`;
    const r = await fetch(url, { method: "GET", signal: ac.signal });
    const latencyMs = Date.now() - started;

    if (!r.ok) {
      logErr(trace, {
        type: "GeoUpstreamHTTP",
        status: r.status,
        ip,
        url,
        latencyMs,
      });
      return new Response("Upstream error", { status: r.status });
    }

    let data: any;
    try {
      data = await r.json();
    } catch (e: any) {
      logErr(trace, {
        type: "GeoBadJSON",
        message: String(e),
        ip,
        url,
        latencyMs,
      });
      return new Response("Geo provider returned bad JSON", { status: 502 });
    }

    if (!data || data.status !== "success") {
      logErr(trace, {
        type: "GeoNonSuccess",
        providerStatus: data?.status,
        ip,
        url,
        latencyMs,
      });
      return new Response("Geo provider returned non-success", { status: 502 });
    }

    return Response.json({
      status: "success",
      cityEn: data.city,
      country: data.countryCode,
      lat: data.lat,
      lon: data.lon,
    });
  } catch (err: any) {
    const latencyMs = Date.now() - started;
    const isAbort =
      err?.name === "AbortError" || String(err).includes("timeout");
    logErr(trace, {
      type: isAbort ? "GeoTimeout" : "GeoFetchError",
      message: String(err?.message || err),
      ip,
      latencyMs,
    });
    return new Response("Failed to fetch geolocation from external API", {
      status: 502,
    });
  } finally {
    clearTimeout(t);
  }
}
