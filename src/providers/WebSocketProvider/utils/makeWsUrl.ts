const warn = (...args: any[]) => console.warn("[WS]", ...args);

export function makeWsUrl(path = "/ws") {
  const addPath = (u: URL) => {
    const basePath = u.pathname.replace(/\/$/, "");
    u.pathname = basePath + (path.startsWith("/") ? path : `/${path}`);
    return u.toString();
  };

  const base =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_WS_BASE) || "";

  if (base) {
    try {
      const u = new URL(base);
      if (u.protocol === "http:" || u.protocol === "https:") {
        u.protocol = u.protocol === "https:" ? "wss:" : "ws:";
        return addPath(u);
      }
      if (u.protocol === "ws:" || u.protocol === "wss:") {
        return addPath(u);
      }
      warn("unknown protocol in NEXT_PUBLIC_WS_BASE, fallback", { base });
    } catch (e) {
      warn("invalid NEXT_PUBLIC_WS_BASE, fallback", { base, error: String(e) });
    }
  }

  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    const wsProto = protocol === "https:" ? "wss:" : "ws:";
    const u = new URL(`${wsProto}//${host}`);

    return addPath(u);
  }

  warn("makeWsUrl called without window; returning path only");
  return path;
}
