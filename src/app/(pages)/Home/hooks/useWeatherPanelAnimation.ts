"use client";
import {
  animate,
  MotionValue,
  useDragControls,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
} from "framer-motion";
import { useLayoutEffect, useRef, useState } from "react";
import { clamp } from "@/utils/clamp";
import {
  HEIGHT_LIMIT,
  PULL_UP_LIMIT,
  VISIBLE_PANEL_HEIGHT,
  VISIBLE_PANEL_HEIGHT_SHORT,
} from "@/app/(pages)/Home/constants/mobile";

const animationInitialization = ({
  panelY,
  initialY,
  isInitialized,
  isHorizontal,
}: {
  panelY: MotionValue<number>;
  initialY: number;
  isInitialized: boolean;
  isHorizontal: boolean;
}) => {
  const stationaryContentY = useTransform(panelY, (latestY) =>
    isInitialized ? -latestY : 0,
  );

  const backgroundOverlayOpacity = useTransform(
    panelY,
    [PULL_UP_LIMIT, initialY],
    isInitialized ? [1, 0] : [0, 0],
  );

  const mainWeatherOpacity = useTransform(
    panelY,
    [initialY, initialY * 0.65],
    isInitialized && !isHorizontal ? [1, 0] : [1, 1],
  );

  const mainWeatherDisplay = useTransform(
    mainWeatherOpacity,
    [1, 0],
    ["inline-flex", "none"],
  );
  const panelHeaderOpacity = useTransform(mainWeatherOpacity, [1, 0], [0, 1]);
  const panelHeaderDisplay = useTransform(
    mainWeatherOpacity,
    [1, 0],
    ["none", "flex"],
  );

  const followerY = useSpring(panelY, {
    stiffness: 260,
    damping: 22,
    mass: 0.8,
  });

  const rawLag = useTransform(
    [followerY, panelY],
    ([f, p]: [number, number]) => f - p,
  );

  const panelLagY = useTransform(rawLag, (v) =>
    isInitialized ? clamp(v, -10, 10) : 0,
  );

  const overflowY = useTransform(mainWeatherOpacity, (latestState) =>
    latestState * 100 < 5 ? "scroll" : "hidden",
  );
  const borderRadius = useTransform(mainWeatherOpacity, (latestState) =>
    latestState * 100 < 5 ? "0px" : isHorizontal ? "0px" : "32px",
  );
  const height = useTransform(mainWeatherOpacity, (latestState) =>
    latestState * 100 < 5 ? "48px" : "24px",
  );
  const y = useTransform(mainWeatherOpacity, (latestState) =>
    latestState * 100 < 5 ? "16px" : "64px",
  );

  return {
    stationaryContentY,
    backgroundOverlayOpacity,
    mainWeatherOpacity,
    mainWeatherDisplay,
    panelHeaderOpacity,
    panelHeaderDisplay,
    panelLagY,
    overflowY,
    borderRadius,
    height,
    y,
  };
};

export const useWeatherPanelAnimation = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialY, setInitialY] = useState<number | null>(null);
  const [isHorizontal, setIsHorizontal] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const controls = useDragControls();
  const dragStartRef = useRef<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelY = useMotionValue(0);
  const openRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const animationValues = animationInitialization({
    panelY,
    initialY,
    isInitialized,
    isHorizontal,
  });

  useLayoutEffect(() => {
    const check = () => {
      const innerHeight = window.visualViewport?.height ?? window.innerHeight;
      const horizontal = innerHeight < HEIGHT_LIMIT;
      setIsHorizontal(horizontal);

      const calcInitialY = horizontal
        ? innerHeight - VISIBLE_PANEL_HEIGHT_SHORT
        : innerHeight - VISIBLE_PANEL_HEIGHT;

      if (!horizontal && scrollRef.current) scrollRef.current.scrollTop = 0;
      setInitialY(calcInitialY);
      panelY.set(horizontal ? PULL_UP_LIMIT : calcInitialY);
      setPanelOpen(
        !horizontal &&
          PULL_UP_LIMIT < calcInitialY &&
          panelY.get() <= (PULL_UP_LIMIT + calcInitialY) / 2,
      );
    };

    check();
    const onResize = () => requestAnimationFrame(check);
    window.visualViewport?.addEventListener("resize", onResize, {
      passive: true,
    });

    const ro = new ResizeObserver(() => requestAnimationFrame(check));
    if (panelRef.current) ro.observe(panelRef.current);

    const idle = (cb: () => void) =>
      (window.requestIdleCallback || ((fn: any) => setTimeout(fn, 0)))(cb);
    const idleId = idle(() => setIsInitialized(true));

    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      (window.cancelIdleCallback || clearTimeout)(idleId as number);
    };
  }, []);

  useMotionValueEvent(panelY, "change", (y) => {
    if (initialY == null) return;
    const midpoint = PULL_UP_LIMIT + (initialY - PULL_UP_LIMIT) / 2;
    const nextOpen = y < midpoint;
    if (nextOpen !== openRef.current) {
      openRef.current = nextOpen;
      setPanelOpen(nextOpen);
    }
  });

  const handleDragEnd = () => {
    if (initialY == null) return;
    const threshold =
      (dragStartRef.current ?? initialY) < PULL_UP_LIMIT + 10
        ? initialY * 0.15
        : initialY * 0.85;

    animate(panelY, panelY.get() < threshold ? PULL_UP_LIMIT : initialY, {
      type: "spring",
      bounce: 0.2,
      duration: 0.4,
    });
  };

  const togglePanel = () => {
    if (initialY == null) return;
    const target = panelOpen ? initialY : PULL_UP_LIMIT;
    animate(panelY, target, { type: "spring", bounce: 0.2, duration: 0.4 });
  };

  const startDrag = (e) => {
    if (isHorizontal) return;
    controls.start(e);
  };

  return {
    isInitialized,
    isHorizontal,
    isPanelReady: initialY !== null,
    panelOpen,
    togglePanel,
    initialY,
    panelY,
    controls,
    panelRef,
    dragStartRef,
    handleDragEnd,
    startDrag,
    scrollRef,
    ...animationValues,
  };
};
