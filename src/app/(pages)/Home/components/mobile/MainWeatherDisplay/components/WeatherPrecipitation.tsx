"use client";

import type { RefObject } from "react";
import { useEffect, useRef } from "react";

export type Precip = {
  rain?: number;
  snow?: number;
  hail?: number;
  lightning?: number;
  fog?: number;
};

type Props = {
  precip: Precip;
  emitterRef?: RefObject<HTMLElement | null>;
  emitterYFactor?: number;
  emitterInset?: number;
  className?: string;
};

type Kind = "rain" | "snow" | "hail";

type Particle = {
  kind: Kind;
  x: number;
  y: number;
  depth: number;
  speed: number;
  emitX: number;
  fan: number;
  angle: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
  phase: number;
};

const SPRITES = {
  rain: "/weather/sprites/rain.png",
  snow: "/weather/sprites/snow.png",
  hail: "/weather/sprites/hail.png",
  lightning: "/weather/sprites/lightning.png",
};

const CONE_SPREAD = 0.4;
const CONE_LEAN = 0.32;
const CONE_EXP = 2;

type KindCfg = {
  max: number;
  sMin: number;
  sMax: number;
  baseW: number;
  baseH: number;
  scMin: number;
  scMax: number;
  spread: number;
  lean: number;
  sway: number;
  rotSpd: number;
  opMin: number;
  opMax: number;
};

const KIND: Record<Kind, KindCfg> = {
  rain: {
    max: 170,
    sMin: 150,
    sMax: 380,
    baseW: 12,
    baseH: 26,
    scMin: 0.45,
    scMax: 1,
    spread: 1,
    lean: 1,
    sway: 0,
    rotSpd: 0,
    opMin: 0.35,
    opMax: 0.9,
  },

  snow: {
    max: 120,
    sMin: 28,
    sMax: 82,
    baseW: 20,
    baseH: 20,
    scMin: 0.45,
    scMax: 1,
    spread: 0.7,
    lean: 0.4,
    sway: 14,
    rotSpd: 0.8,
    opMin: 0.45,
    opMax: 0.95,
  },

  hail: {
    max: 90,
    sMin: 250,
    sMax: 450,
    baseW: 13,
    baseH: 15,
    scMin: 0.5,
    scMax: 1,
    spread: 0.45,
    lean: 0.4,
    sway: 0,
    rotSpd: 1.6,
    opMin: 0.7,
    opMax: 1,
  },
};

const KINDS: Kind[] = ["rain", "snow", "hail"];

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const loadImg = (src: string) => {
  const im = new Image();
  im.src = src;
  return im;
};
const ready = (im?: HTMLImageElement | null): im is HTMLImageElement =>
  !!im && im.complete && im.naturalWidth > 0;

const WeatherPrecipitation = ({
  precip,
  emitterRef,
  emitterYFactor = 0.62,
  emitterInset = 0.18,
  className = "",
}: Props) => {
  const { rain = 0, snow = 0, hail = 0, lightning = 0, fog = 0 } = precip;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!rain && !snow && !hail && !lightning && !fog) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0;
    let H = 0;
    let seeded = false;
    let running = false;
    let last = 0;
    let raf = 0;
    let particles: Particle[] = [];

    let emitMinX = 0;
    let emitMaxX = 0;
    let emitY = 0;

    let lastMeasure = 0;
    const MEASURE_MS = 1000;

    const inten: Record<Kind, number> = { rain, snow, hail };

    const sprites: Partial<Record<Kind, HTMLImageElement>> = {};
    for (const k of KINDS) if (inten[k] > 0) sprites[k] = loadImg(SPRITES[k]);
    const boltImg = lightning > 0 ? loadImg(SPRITES.lightning) : null;

    const coneX = (
      emitX: number,
      fan: number,
      y: number,
      spreadMul: number,
      leanMul: number,
    ): number => {
      const span = H - emitY;
      const progress = span > 0 ? clamp01((y - emitY) / span) : 0;
      const spread = W * CONE_SPREAD * spreadMul * Math.pow(progress, CONE_EXP);
      const lean = -W * CONE_LEAN * leanMul * progress;
      return emitX + lean + fan * spread;
    };

    const make = (kind: Kind, initial: boolean): Particle => {
      const c = KIND[kind];
      const d = Math.random();
      const speed = lerp(c.sMin, c.sMax, d);
      const emitX = lerp(emitMinX, emitMaxX, Math.random());
      const fan = Math.random() * 2 - 1;
      const y = initial
        ? lerp(emitY, H, Math.random())
        : emitY - Math.random() * 26;
      const x = coneX(emitX, fan, y, c.spread, c.lean);

      return {
        kind,
        x,
        y,
        depth: d,
        speed,
        emitX,
        fan,
        angle: 0,
        rotSpeed: c.rotSpd ? (Math.random() * 2 - 1) * c.rotSpd : 0,
        scale: lerp(c.scMin, c.scMax, d),
        opacity: lerp(c.opMin, c.opMax, d),
        phase: Math.random() * Math.PI * 2,
      };
    };

    const targetCount = (kind: Kind) =>
      Math.round(KIND[kind].max * clamp01(inten[kind]));

    const sync = () => {
      particles = [];
      for (const kind of KINDS) {
        const n = targetCount(kind);
        for (let i = 0; i < n; i++) particles.push(make(kind, true));
      }
    };

    const computeEmitter = () => {
      const el = emitterRef?.current;
      if (el) {
        const cr = el.getBoundingClientRect();
        const kr = canvas.getBoundingClientRect();
        if (cr.width > 0 && cr.height > 0) {
          const left = cr.left - kr.left;
          emitMinX = left + cr.width * emitterInset;
          emitMaxX = left + cr.width * (1 - emitterInset);
          emitY = cr.top - kr.top + cr.height * emitterYFactor;
          return;
        }
      }
      emitMinX = 0;
      emitMaxX = W;
      emitY = -10;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      computeEmitter();
      if (!seeded && W > 0 && H > 0) {
        sync();
        seedFog();
        seeded = true;
      }
    };

    const drawParticle = (p: Particle) => {
      const img = sprites[p.kind];
      if (!ready(img)) return;
      const c = KIND[p.kind];
      const w = c.baseW * p.scale;
      const h = c.baseH * p.scale;
      ctx.globalAlpha = p.opacity;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
      ctx.restore();
      ctx.globalAlpha = 1;
    };

    type Puff = {
      x: number;
      y: number;
      r: number;
      a: number;
      vx: number;
      bob: number;
      pulse: number;
    };
    let puffs: Puff[] = [];

    const seedFog = () => {
      puffs = [];
      for (let i = 0; i < 5; i++) {
        puffs.push({
          x: Math.random() * W,
          y: H * (0.78 + Math.random() * 0.18),
          r: W * (0.35 + Math.random() * 0.35),
          a: 0.7 + Math.random() * 0.1,
          vx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 8),
          bob: Math.random() * Math.PI * 2,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    };

    const drawFog = (now: number, dt: number) => {
      const peak = clamp01(fog);
      for (const p of puffs) {
        p.x += p.vx * dt;
        if (p.x < -p.r) p.x = W + p.r;
        if (p.x > W + p.r) p.x = -p.r;
        const y = p.y + Math.sin(now / 3000 + p.bob) * 12;
        const a = p.a * peak * (0.65 + 0.35 * Math.sin(now / 2600 + p.pulse));
        const g = ctx.createRadialGradient(p.x, y, 0, p.x, y, p.r);
        g.addColorStop(0, `rgba(206,214,228,${a})`);
        g.addColorStop(1, "rgba(206,214,228,0)");
        ctx.fillStyle = g;
        ctx.fillRect(p.x - p.r, y - p.r, p.r * 2, p.r * 2);
      }
    };

    let flashStart = -1;
    let flashDur = 0;
    let nextFlash = 0;
    let boltX = 0;
    let boltY = 0;
    let boltScale = 1;
    let boltFlip = false;

    const scheduleFlash = (now: number) => {
      if (Math.random() < 0.3) {
        nextFlash = now + 90 + Math.random() * 90;
      } else {
        const base = lerp(7000, 1800, clamp01(lightning));
        nextFlash = now + base * (0.6 + Math.random() * 0.8);
      }
    };

    const triggerFlash = (now: number) => {
      flashStart = now;
      flashDur = 130 + Math.random() * 90;
      boltX = lerp(emitMinX, emitMaxX, Math.random());
      boltY = emitY;
      boltScale = 0.8 + Math.random() * 0.5;
      boltFlip = Math.random() < 0.5;
    };

    const flashOverlay = document.createElement("div");
    Object.assign(flashOverlay.style, {
      position: "fixed",
      inset: "0",
      background: "#dfe7ff",
      pointerEvents: "none",
      opacity: "0",
      willChange: "opacity",
    });
    document.body.appendChild(flashOverlay);

    const drawLightning = (now: number) => {
      if (now >= nextFlash) {
        triggerFlash(now);
        scheduleFlash(now);
      }
      if (flashStart < 0) {
        flashOverlay.style.opacity = "0";
        return;
      }
      const t = (now - flashStart) / flashDur;
      if (t >= 1) {
        flashStart = -1;
        flashOverlay.style.opacity = "0";
        return;
      }
      const env = Math.sin(t * Math.PI);
      flashOverlay.style.opacity = String(
        env * 0.15 * (0.6 + clamp01(lightning) * 0.4),
      );

      if (ready(boltImg)) {
        const ratio = boltImg.naturalWidth / boltImg.naturalHeight || 0.5;
        const bh = H * 0.22 * boltScale;
        const bw = bh * ratio;
        ctx.globalAlpha = Math.min(1, env * 1.4);
        ctx.save();
        ctx.translate(boltX, boltY);
        if (boltFlip) ctx.scale(-1, 1);
        ctx.drawImage(boltImg, -bw / 2, 0, bw, bh);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (now - lastMeasure >= MEASURE_MS) {
        computeEmitter();
        lastMeasure = now;
      }
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        const c = KIND[p.kind];
        p.y += p.speed * dt;
        let newX = coneX(p.emitX, p.fan, p.y, c.spread, c.lean);
        if (c.sway) newX += Math.sin(now / 900 + p.phase) * c.sway;
        if (p.kind === "rain") {
          const vx = dt > 0 ? (newX - p.x) / dt : 0;
          p.angle = Math.atan2(-vx, p.speed);
        } else {
          p.angle += p.rotSpeed * dt;
        }
        p.x = newX;
        if (p.y > H + 14) Object.assign(p, make(p.kind, false));
        drawParticle(p);
      }
      if (lightning > 0) drawLightning(now);
      if (fog > 0) drawFog(now, dt);
      if (running) raf = requestAnimationFrame(step);
    };

    const staticFrame = () => {
      ctx.clearRect(0, 0, W, H);
      if (fog > 0) drawFog(0, 0);
      for (const p of particles) drawParticle(p);
    };

    const start = () => {
      if (reduce) {
        staticFrame();
        return;
      }
      if (running) return;
      running = true;
      last = performance.now();
      scheduleFlash(last);
      raf = requestAnimationFrame(step);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    resize();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduce) staticFrame();
    });
    ro.observe(canvas);
    if (emitterRef?.current) ro.observe(emitterRef.current);

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) start();
        else stop();
      },
      { threshold: 0.02 },
    );
    io.observe(canvas);

    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [
    rain,
    snow,
    hail,
    lightning,
    fog,
    emitterRef,
    emitterYFactor,
    emitterInset,
  ]);

  if (!rain && !snow && !hail && !lightning && !fog) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={className}
      style={{
        position: "absolute",
        top: "-150px",
        left: 0,
        width: "100%",
        height: "calc(100% + 150px)",
        pointerEvents: "none",
      }}
    />
  );
};

export default WeatherPrecipitation;
