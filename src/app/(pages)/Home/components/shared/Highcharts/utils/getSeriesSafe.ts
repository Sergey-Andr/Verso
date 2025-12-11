import { MetricKey } from "@/app/(pages)/Home/components/shared/Highcharts/types";

export function getSeriesSafe(day: unknown, key: MetricKey): number[] {
  if (!day || typeof day !== "object") return [];

  const raw = (day as any)?.[key];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter(Number.isFinite);
}
