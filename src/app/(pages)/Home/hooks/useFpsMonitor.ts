import { useEffect, useRef, useState } from "react";
import { getStoredData } from "@/utils/store";
import { USER_ACCELERATION_ENABLED } from "@/app/(pages)/Home/constants/desktop";

type UseFpsMonitorOptions = {
  threshold?: number;
  windowMs?: number;
  historySize?: number;
  lowRatioToFlag?: number;
  minConsecutiveLowsToFlag?: number;
  delayMs?: number;
  pauseWhenHidden?: boolean;
};

type FpsStats = {
  measuring: boolean;
  lowFps: boolean;
  getFps: () => number | null;
  lowRatio: number;
};

function isAccelEnabledSafe() {
  try {
    const local = getStoredData(USER_ACCELERATION_ENABLED, "locale");
    const session = getStoredData(USER_ACCELERATION_ENABLED, "session");
    return Boolean(local || session);
  } catch {
    return false;
  }
}

export function useFpsMonitor(options?: UseFpsMonitorOptions): FpsStats {
  const {
    threshold = 40,
    windowMs = 1000,
    historySize = 12,
    lowRatioToFlag = 0.4,
    minConsecutiveLowsToFlag = 3,
    delayMs = 0,
    pauseWhenHidden = true,
  } = options || {};

  const [lowFps, setLowFps] = useState(false);
  const [measuring, setMeasuring] = useState(false);

  const fpsRef = useRef<number | null>(null);
  const lowWindowsRef = useRef(0);
  const totalWindowsRef = useRef(0);
  const lowFpsRef = useRef(false);

  const rafId = useRef<number | null>(null);
  const startTsRef = useRef(0);
  const framesRef = useRef(0);
  const historyRef = useRef<number[]>([]);
  const cancelled = useRef(false);

  const pushWindow = (value: number) => {
    const history = historyRef.current;
    history.push(value);
    if (history.length > historySize) history.shift();

    const lows = history.filter((v) => v < threshold).length;
    const ratio = history.length ? lows / history.length : 0;

    let consec = 0;
    let maxConsec = 0;
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i] < threshold) {
        consec++;
        if (consec > maxConsec) maxConsec = consec;
      } else {
        consec = 0;
      }
    }

    lowWindowsRef.current = lows;
    totalWindowsRef.current = history.length;

    const nextLow =
      ratio >= lowRatioToFlag || maxConsec >= minConsecutiveLowsToFlag;
    if (nextLow !== lowFpsRef.current) {
      lowFpsRef.current = nextLow;
      setLowFps(nextLow);
    }
  };

  useEffect(() => {
    cancelled.current = false;

    if (isAccelEnabledSafe()) {
      setMeasuring(false);
      setLowFps(false);
      lowFpsRef.current = false;
      return;
    }

    let started = false;
    const loop = (t: number) => {
      if (cancelled.current) return;

      if (isAccelEnabledSafe()) {
        if (rafId.current != null) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        setMeasuring(false);
        return;
      }

      if (!started) {
        started = true;
        setMeasuring(true);
        startTsRef.current = t;
        framesRef.current = 0;
      }

      framesRef.current++;
      const elapsed = t - startTsRef.current;

      if (elapsed >= windowMs) {
        const fpsNow = (framesRef.current * 1000) / elapsed;
        fpsRef.current = fpsNow;
        pushWindow(fpsNow);
        startTsRef.current = t;
        framesRef.current = 0;
      }

      rafId.current = window.requestAnimationFrame(loop);
    };

    const start = async () => {
      if (delayMs > 0) {
        await new Promise((r) => setTimeout(r, delayMs));
        if (cancelled.current) return;
      }
      if (pauseWhenHidden && document.visibilityState !== "visible") {
        await new Promise<void>((resolve) => {
          const onVis = () => {
            if (document.visibilityState === "visible") {
              document.removeEventListener("visibilitychange", onVis);
              resolve();
            }
          };
          document.addEventListener("visibilitychange", onVis);
        });
        if (cancelled.current) return;
      }
      rafId.current = window.requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      if (!pauseWhenHidden) return;
      const id = rafId.current;
      if (document.visibilityState === "hidden") {
        if (id != null) {
          cancelAnimationFrame(id);
          rafId.current = null;
        }
        setMeasuring(false);
      } else if (!rafId.current) {
        if (isAccelEnabledSafe()) return;
        setMeasuring(true);
        startTsRef.current = performance.now();
        framesRef.current = 0;
        rafId.current = window.requestAnimationFrame(loop);
      }
    };

    const onStorage = (e: StorageEvent) => {
      if (e.key !== USER_ACCELERATION_ENABLED) return;
      if (isAccelEnabledSafe()) {
        if (rafId.current != null) cancelAnimationFrame(rafId.current);
        rafId.current = null;
        setMeasuring(false);
      }
    };

    start();
    if (pauseWhenHidden)
      document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);

    return () => {
      cancelled.current = true;
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
      if (pauseWhenHidden)
        document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
      setMeasuring(false);
    };
  }, [
    threshold,
    windowMs,
    historySize,
    lowRatioToFlag,
    minConsecutiveLowsToFlag,
    delayMs,
    pauseWhenHidden,
  ]);

  const lowRatio =
    totalWindowsRef.current > 0
      ? Math.min(
          1,
          Math.max(0, lowWindowsRef.current / totalWindowsRef.current),
        )
      : 0;

  return {
    measuring,
    lowFps,
    getFps: () => fpsRef.current,
    lowRatio,
  };
}
