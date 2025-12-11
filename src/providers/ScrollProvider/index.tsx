"use client";
import React, {
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Header from "@/app/(Header)";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";
import { usePathname } from "next/navigation";
import cx from "clsx";
import { onElementReady } from "@/providers/ScrollProvider/utils/onElementReady";
import { ASYNC_PANEL, ASYNC_PANEL_FETCHED } from "@/constants";

const EPS = 1;
const DECELERATION_RATE = 0.12;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(v, max));

function readScaleY(el: HTMLElement | null): number {
  if (!el) return 1;
  const tr = getComputedStyle(el).transform;
  if (!tr || tr === "none") return 1;

  const m2d = tr.match(/matrix\(([-\d.,\s]+)\)/);
  if (m2d) {
    const parts = m2d[1].split(",").map((x) => parseFloat(x.trim()));
    const d = parts[3];
    return Number.isFinite(d) && d > 0 ? d : 1;
  }
  const m3d = tr.match(/matrix3d\(([-\d.,\s]+)\)/);
  if (m3d) {
    const parts = m3d[1].split(",").map((x) => parseFloat(x.trim()));

    const sy = parts[5];
    return Number.isFinite(sy) && sy > 0 ? sy : 1;
  }
  return 1;
}

function roundToDevicePx(
  scaleYRef: RefObject<number>,
  layoutPx: number,
  stepDevicePx = 1,
) {
  const s = scaleYRef.current || 1;
  return Math.round((layoutPx * s) / stepDevicePx) * (stepDevicePx / s);
}

type Props = { children: React.ReactNode };

export default function ScrollProvider({ children }: Props) {
  const pathname = usePathname();
  const isCustomRoute = pathname === "/" || pathname.startsWith("/privacy");

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [hasScroll, setHasScroll] = useState(false);

  const animating = useRef(false);
  const rafId = useRef<number | null>(null);

  const scheduledMeas = useRef(null);
  const contentV = useRef(0);
  const maxScrollV = useRef(0);
  const scaleYRef = useRef(1);

  const trackH = useRef(0);
  const trackAvail = useRef(0);
  const thumbH = useRef(0);

  const currentScrollV = useRef(0);
  const targetScrollV = useRef(0);

  const dragging = useRef(false);
  const startClientY = useRef(0);
  const startThumb = useRef(0);
  const thumbOffV = useRef(0);
  const overlayRef = useRef(null);

  const paintReq = useRef<number | null>(null);
  const pendingTop = useRef<number | null>(null);
  const pendingThumb = useRef<number | null>(null);
  const lastTop = useRef<number>(null);
  const lastThumb = useRef<number>(null);

  const contentVFromThumb = (thumbPx: number) => {
    const percent = trackAvail.current === 0 ? 0 : thumbPx / trackAvail.current;
    return -percent * maxScrollV.current;
  };
  const thumbFromContentV = (scrollV: number) => {
    if (maxScrollV.current === 0) return 0;
    const percent = -scrollV / maxScrollV.current;
    return percent * trackAvail.current;
  };

  function schedulePaint(topPx: number, thumbPx: number) {
    pendingTop.current = topPx;
    pendingThumb.current = thumbPx;

    if (paintReq.current != null) return;

    paintReq.current = requestAnimationFrame(() => {
      paintReq.current = null;

      const wrap = wrapperRef.current;
      const thumb = thumbRef.current;
      if (!wrap || !thumb) return;

      const nextTop = roundToDevicePx(scaleYRef, pendingTop.current!, EPS);
      const nextThumb = roundToDevicePx(scaleYRef, pendingThumb.current!, EPS);

      if (Math.abs((lastTop.current ?? Infinity) - nextTop) > EPS) {
        wrap.style.top = `${nextTop}px`;
        lastTop.current = nextTop;
      }
      if (Math.abs((lastThumb.current ?? Infinity) - nextThumb) > EPS) {
        thumb.style.top = `${nextThumb}px`;
        lastThumb.current = nextThumb;
      }
    });
  }

  const updateUI = (thumbPxV: number, scrollV: number) => {
    const s = scaleYRef.current;
    const topLayout = scrollV / s;
    schedulePaint(topLayout, thumbPxV);
  };

  const measure = () => {
    scheduledMeas.current = null;

    const wrapper = wrapperRef.current;
    const track = trackRef.current;
    const root = document.getElementById("main-wrapper");
    if (!wrapper || !track || !root) return;

    const scaleY = readScaleY(root);
    scaleYRef.current = scaleY;

    const cs = getComputedStyle(root);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;

    const viewportVisual = root.getBoundingClientRect().height;

    const visibleViewportV = Math.max(
      0,
      viewportVisual - (padTop + padBottom) * scaleY,
    );
    const contentLogical = wrapper.scrollHeight;
    contentV.current = contentLogical * scaleY;

    maxScrollV.current = Math.max(0, contentV.current - visibleViewportV);

    const trackLocalH = visibleViewportV / scaleY + padTop + padBottom;
    trackH.current = trackLocalH;
    track.style.height = `${trackLocalH}px`;

    const MIN_THUMB = 32;
    thumbH.current =
      maxScrollV.current === 0
        ? trackH.current
        : Math.max(
            MIN_THUMB,
            (visibleViewportV / contentV.current) * trackH.current,
          );

    trackAvail.current = Math.max(0, trackH.current - thumbH.current);
    if (thumbRef.current) thumbRef.current.style.height = `${thumbH.current}px`;

    targetScrollV.current = clamp(
      targetScrollV.current,
      -maxScrollV.current,
      0,
    );
    currentScrollV.current = clamp(
      currentScrollV.current,
      -maxScrollV.current,
      0,
    );

    updateUI(thumbFromContentV(currentScrollV.current), currentScrollV.current);
    setHasScroll(maxScrollV.current > 1);
  };

  const scheduleMeasure = () => {
    if (scheduledMeas.current != null) return;
    const outer = requestAnimationFrame(() => {
      scheduledMeas.current = requestAnimationFrame(measure);
    });
    scheduledMeas.current = outer;
  };

  const tick = () => {
    const prev = currentScrollV.current;
    currentScrollV.current = lerp(
      currentScrollV.current,
      targetScrollV.current,
      DECELERATION_RATE,
    );

    const yV = currentScrollV.current;
    const thV = thumbFromContentV(yV);
    updateUI(thV, yV);

    if (Math.abs(targetScrollV.current - prev) > 0.5) {
      rafId.current = requestAnimationFrame(tick);
    } else {
      currentScrollV.current = targetScrollV.current;
      thumbOffV.current = thumbFromContentV(currentScrollV.current);
      animating.current = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const startAnimate = () => {
    if (animating.current) return;
    animating.current = true;
    tick();
  };

  useEffect(() => {
    if (!isCustomRoute) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetScrollV.current = clamp(
        targetScrollV.current - e.deltaY,
        -maxScrollV.current,
        0,
      );
      if (!animating.current) startAnimate();
    };
    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [isCustomRoute]);

  useEffect(() => {
    if (!isCustomRoute) return;

    const onPointerDown = (e: PointerEvent) => {
      dragging.current = true;
      startClientY.current = e.clientY;
      startThumb.current = thumbOffV.current;
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
      overlayRef.current!.style.display = "block";

      document.body.style.userSelect = "none";
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;
      const delta = e.clientY - startClientY.current;
      const newThumb = clamp(startThumb.current + delta, 0, trackAvail.current);
      targetScrollV.current = contentVFromThumb(newThumb);

      if (!animating.current) startAnimate();
    };

    const onPointerUp = (e: PointerEvent) => {
      dragging.current = false;
      (e.currentTarget as Element | undefined)?.releasePointerCapture?.(
        e.pointerId,
      );
      overlayRef.current!.style.display = "none";

      document.body.style.userSelect = "auto";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    const thumb = thumbRef.current;
    thumb?.addEventListener("pointerdown", onPointerDown);
    return () => {
      thumb?.removeEventListener("pointerdown", onPointerDown);
      document.body.style.userSelect = "auto";
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [isCustomRoute]);

  useEffect(() => {
    if (isCustomRoute) return;

    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    animating.current = false;

    currentScrollV.current = 0;
    targetScrollV.current = 0;
    thumbOffV.current = 0;

    const wrap = wrapperRef.current;
    const thumb = thumbRef.current;
    if (wrap) wrap.style.top = "0px";
    if (thumb) thumb.style.top = "0px";

    setHasScroll(false);
  }, [isCustomRoute, pathname]);

  useLayoutEffect(() => {
    if (!isCustomRoute) return;
    const raf = requestAnimationFrame(() => {
      measure();
      const y = currentScrollV.current;
      const th = thumbFromContentV(y);
      updateUI(th, y);
    });

    const wrap = wrapperRef.current;
    if (!wrap) return;

    const roWrap = new ResizeObserver(() => scheduleMeasure());
    roWrap.observe(wrap);

    const off = onElementReady(ASYNC_PANEL, {
      attr: "data-state",
      value: ASYNC_PANEL_FETCHED,
      onReady: () => scheduleMeasure(),
      once: true,
    });

    return () => {
      roWrap.disconnect();
      off();
      cancelAnimationFrame(raf);
    };
  }, [isCustomRoute, pathname]);

  useEffect(() => {
    return () => {
      if (paintReq.current) cancelAnimationFrame(paintReq.current);
      paintReq.current = null;
    };
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        className="relative top-0 w-full overscroll-contain will-change-[top]"
        style={{ minHeight: "1080px" }}
      >
        <Header />
        {children}
      </div>

      {isCustomRoute && (
        <div
          ref={trackRef}
          className={cx(
            "fixed top-0 right-4 w-2 overflow-hidden rounded-full",
            !hasScroll && "hidden",
          )}
          style={{ contain: "layout paint" }}
          aria-hidden
        >
          <div
            ref={thumbRef}
            className="bg-fake-blend-mode absolute -right-2 z-10 mx-2 w-2 overscroll-contain will-change-[top] hover:brightness-125"
            style={{ height: 0 }}
          >
            <MainBackgroundLayer borderWidth={1} />
          </div>
          <MainBackgroundLayer borderWidth={0} />
        </div>
      )}
      <div
        ref={overlayRef}
        style={{ display: "none" }}
        className="pointer-events-auto fixed inset-0 z-999 cursor-grabbing"
      />
    </>
  );
}
