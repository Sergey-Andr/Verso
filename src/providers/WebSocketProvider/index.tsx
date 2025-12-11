"use client";
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from "react";
import { Callback, Ctx, SubscriptionKeys } from "@/types/subscriptions";
import { makeWsUrl } from "@/providers/WebSocketProvider/utils/makeWsUrl";

export const WebSocketContext = createContext<Ctx | null>(null);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const socketRef = useRef<WebSocket | null>(null);

  const listeners = useRef<Map<SubscriptionKeys, Set<Function>>>(new Map());

  const retryRef = useRef(0);
  const reconnectTimer = useRef<number | null>(null);
  const closedRef = useRef(false);

  const lastActivityAt = useRef<number>(Date.now());
  const heartbeatTimer = useRef<number | null>(null);

  const clearHeartbeat = () => {
    if (heartbeatTimer.current) {
      clearInterval(heartbeatTimer.current);
      heartbeatTimer.current = null;
    }
  };

  const startHeartbeat = () => {
    clearHeartbeat();
    heartbeatTimer.current = window.setInterval(() => {
      const s = socketRef.current;
      const idle = Date.now() - lastActivityAt.current;

      if (s && s.readyState === WebSocket.OPEN) {
        try {
          s.send(JSON.stringify({ type: "ping" }));
        } catch (e) {
          try {
            s.close();
          } catch {}
        }
      }

      if (idle > 45_000) {
        try {
          s?.close();
        } catch {}
      }
    }, 25_000);
  };

  const scheduleReconnect = () => {
    if (closedRef.current) return;
    if (reconnectTimer.current) return;

    const base = Math.min(1000 * 2 ** retryRef.current, 15_000);
    const jitter = Math.floor(Math.random() * 400);
    reconnectTimer.current = window.setTimeout(() => {
      reconnectTimer.current = null;
      connect();
    }, base + jitter) as unknown as number;
    retryRef.current += 1;
  };

  const resubscribeAll = (s: WebSocket) => {
    for (const [key, set] of listeners.current.entries()) {
      if (set.size === 0) continue;
      try {
        s.send(JSON.stringify({ type: "subscribe", key }));
      } catch (e) {}
    }
  };

  const connect = useCallback(() => {
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN)
        return;

      const s = new WebSocket(makeWsUrl());
      socketRef.current = s;

      s.onopen = () => {
        retryRef.current = 0;
        lastActivityAt.current = Date.now();
        resubscribeAll(s);
        startHeartbeat();
      };

      s.onmessage = (event) => {
        lastActivityAt.current = Date.now();
        try {
          const msg = JSON.parse(event.data);
          if (msg?.type === "pong") return;

          const { key, value } = msg as {
            key?: SubscriptionKeys;
            value?: unknown;
          };
          if (!key) return;

          const cbs = listeners.current.get(key);
          if (cbs)
            cbs.forEach((cb) => {
              try {
                (cb as Function)(value);
              } catch (e) {}
            });
        } catch {}
      };

      s.onerror = () => {
        try {
          s.close();
        } catch {}
      };

      s.onclose = () => {
        clearHeartbeat();
        scheduleReconnect();
      };
    } catch {
      scheduleReconnect();
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      closedRef.current = true;
      clearHeartbeat();
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      try {
        socketRef.current?.close(1001, "going away");
      } catch {}
    };
  }, [connect]);

  const subscribe = useCallback(
    <K extends SubscriptionKeys>(key: K, cb: Callback<K>) => {
      let set = listeners.current.get(key);
      if (!set) {
        set = new Set();
        listeners.current.set(key, set);
      }
      set.add(cb as Function);

      const s = socketRef.current;
      if (s && s.readyState === WebSocket.OPEN) {
        try {
          s.send(JSON.stringify({ type: "subscribe", key }));
        } catch {}
      }
    },
    [],
  );

  const unsubscribe = useCallback(
    <K extends SubscriptionKeys>(key: K, cb: Callback<K>) => {
      const set = listeners.current.get(key);
      if (!set) return;

      set.delete(cb as Function);
      if (set.size === 0) {
        listeners.current.delete(key);
        const s = socketRef.current;
        if (s && s.readyState === WebSocket.OPEN) {
          try {
            s.send(JSON.stringify({ type: "unsubscribe", key }));
          } catch {}
        }
      }
    },
    [],
  );

  const send = useCallback((data: unknown) => {
    const s = socketRef.current;
    if (s && s.readyState === WebSocket.OPEN) {
      try {
        s.send(JSON.stringify(data));
        return true;
      } catch {}
    }
    return false;
  }, []);

  const ctx: Ctx = { subscribe, unsubscribe, send };
  return (
    <WebSocketContext.Provider value={ctx}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSubscription = <K extends SubscriptionKeys>(
  key: K,
  cb: Callback<K>,
  deps: React.DependencyList = [],
) => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useSubscription must be used inside WebSocketProvider");

  useEffect(() => {
    ctx.subscribe(key, cb);
    return () => ctx.unsubscribe(key, cb);
  }, [key, cb, ...deps]);

  return ctx;
};
