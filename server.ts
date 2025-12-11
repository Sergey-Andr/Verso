import express from "express";
import { createServer } from "http";
import next from "next";
import { WebSocket, WebSocketServer } from "ws";

async function loadEnvUniversal() {
  try {
    const { loadEnvConfig } = require("@next/env");
    return (dir: string, dev: boolean) => loadEnvConfig(dir, dev);
  } catch {
    const mod: any = await import("@next/env");
    const fn = mod.loadEnvConfig ?? mod.default?.loadEnvConfig;
    if (!fn) throw new Error("@next/env: loadEnvConfig not found");
    return (dir: string, dev: boolean) => fn(dir, dev);
  }
}

const subscriptions = new Map<string, Set<WebSocket>>();

const ts = () => new Date().toISOString();
const log = (...a: any[]) => console.log(ts(), ...a);
const err = (...a: any[]) => console.error(ts(), ...a);

async function start() {
  const dev = process.env.NODE_ENV !== "production";
  await (
    await loadEnvUniversal()
  )(process.cwd(), dev);

  const port = Number(process.env.PORT || 8080);
  const hostname = "0.0.0.0";
  const WS_PATH = "/ws";
  const ALLOW = new Set(
    (process.env.CORS_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  );

  const nextApp = dev ? null : next({ dev: false, hostname, port });
  const handle = nextApp ? nextApp.getRequestHandler() : null;
  if (nextApp) await nextApp.prepare();

  const app = express();
  app.set("trust proxy", dev ? 0 : 1);

  app.use((req, res, nextFn) => {
    if (ALLOW.size) {
      const origin = req.headers.origin || "";
      if (ALLOW.has(origin as string)) {
        res.setHeader("Access-Control-Allow-Origin", origin as string);
        res.setHeader("Vary", "Origin");
      }
    }
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    if (req.method === "OPTIONS") return res.status(200).end();
    nextFn();
  });

  app.get("/_health", (_req, res) => res.status(200).send("ok"));
  app.get("/healthz", (_req, res) => res.status(200).send("ok"));

  app.post("/api/notify", express.json(), (req, res) => {
    const { key, value } = req.body || {};
    if (!key)
      return res
        .status(400)
        .json({ success: false, delivered: 0, error: "key_required" });

    const subs = subscriptions.get(String(key));
    if (!subs?.size) return res.json({ success: true, delivered: 0 });

    let delivered = 0;
    for (const ws of subs) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(JSON.stringify({ key, value }));
          delivered++;
        } catch (e) {
          err("[WS][SEND][ERR]", e);
        }
      }
    }
    res.status(204).end();
  });

  if (!dev && handle) {
    app.use((req, res) => handle(req, res));
  } else {
    app.get("/", (_req, res) =>
      res
        .status(200)
        .send(
          `Dev WS server is up; Next dev runs on ${process.env.NEXT_PUBLIC_APP_PORT || 5174}`,
        ),
    );
  }

  const server = createServer(app);
  const wss = new WebSocketServer({ noServer: true });

  server.on("upgrade", (req, socket, head) => {
    const url = req.url || "";
    const origin = req.headers.origin || "";
    log("[UPGRADE]", { url, origin });

    if (url.startsWith(WS_PATH)) {
      if (ALLOW.size && !ALLOW.has(origin)) {
        socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
        socket.destroy();
        return;
      }
      wss.handleUpgrade(req, socket as any, head, (ws) => {
        log("[WS] connection");
        wss.emit("connection", ws, req);
      });
      return;
    }

    socket.destroy();
  });

  wss.on("connection", (ws) => {
    ws.on("message", (raw) => {
      let msg: any;
      try {
        msg = JSON.parse(String(raw));
      } catch {
        return;
      }

      if (msg?.type === "ping") {
        try {
          ws.send(JSON.stringify({ type: "pong" }));
        } catch {}
        return;
      }

      if (msg?.type === "subscribe" && msg?.key) {
        const key = String(msg.key);
        (
          subscriptions.get(key) ?? subscriptions.set(key, new Set()).get(key)!
        ).add(ws);
        return;
      }

      if (msg?.type === "unsubscribe" && msg?.key) {
        const key = String(msg.key);
        const set = subscriptions.get(key);
        if (set) {
          set.delete(ws);
          if (set.size === 0) subscriptions.delete(key);
        }
        return;
      }
    });

    ws.on("close", () => {
      for (const [key, set] of subscriptions) {
        if (set.delete(ws) && set.size === 0) subscriptions.delete(key);
      }
    });

    ws.on("error", (e) => err("[WS][ERROR]", e));
  });

  server.on("error", (e: any) => {
    if (e.code === "EADDRINUSE") {
      err(`Port ${port} is already in use`);
    } else {
      err("[SERVER][ERROR]", e);
    }
  });

  server.listen(port, hostname, () => {
    log(`HTTP+WS listening on :${port} (${dev ? "dev" : "prod"})`);
  });
}

process.on("unhandledRejection", (e) => err("[unhandledRejection]", e));
process.on("uncaughtException", (e) => err("[uncaughtException]", e));

start().catch((e) => {
  err("[FATAL] start failed", e);
  process.exit(1);
});
