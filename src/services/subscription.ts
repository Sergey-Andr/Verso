"use client";
import { SubscriptionKeys } from "@/types/subscriptions";

function makeApiUrl(path = "/api/notify", overrideBase?: string) {
  const DEBUG =
    (typeof process !== "undefined" && process.env.NODE_ENV !== "production") ||
    (typeof window !== "undefined" &&
      window.localStorage?.getItem("DEBUG_HTTP") === "1");

  const warn = (...a: any[]) => DEBUG && console.warn("[HTTP]", ...a);

  const addPath = (u: URL) => {
    const basePath = u.pathname.replace(/\/$/, "");
    u.pathname = basePath + (path.startsWith("/") ? path : `/${path}`);
    return u.toString();
  };

  const envBase =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_BASE) ||
    "";

  const base = overrideBase || envBase;

  if (base) {
    try {
      const u = new URL(
        base.startsWith("http") || base.startsWith("ws")
          ? base
          : `https://${base}`,
      );
      const was = u.protocol;
      if (u.protocol === "ws:" || u.protocol === "wss:") {
        u.protocol = u.protocol === "wss:" ? "https:" : "http:";
      }
      const url = addPath(u);
      return url;
    } catch (e) {
      warn("invalid base, fallback to window.origin", {
        base,
        error: String(e),
      });
    }
  }

  if (typeof window !== "undefined") {
    const u = new URL(window.location.origin);
    const url = addPath(u);
    return url;
  }

  warn("no base and no window; returning path only", { path });
  return path;
}

export async function subscription({
  key,
  value,
  fetchUrl,
}: {
  key: SubscriptionKeys;
  value: any;
  fetchUrl?: string;
}) {
  const url = makeApiUrl("/api/notify", fetchUrl);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
      credentials: "omit",
      cache: "no-store",
    });
    return true;
  } catch (e: any) {
    if (
      typeof window !== "undefined" &&
      window.localStorage?.getItem("DEBUG_HTTP") === "1"
    ) {
      console.warn("[HTTP] notify failed", url, e?.message || e);
    }
    return false;
  }
}
