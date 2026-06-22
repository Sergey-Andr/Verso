"use client";
import { LazyMotion } from "framer-motion";

// Грузим набор фич domMax (включает drag/layout/жесты — всё, что используется в проекте)
// асинхронно, отдельным чанком, чтобы он не сидел в стартовом бандле.
const loadFeatures = () =>
  import("framer-motion").then((mod) => mod.domMax);

export default function MotionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LazyMotion features={loadFeatures}>{children}</LazyMotion>;
}
