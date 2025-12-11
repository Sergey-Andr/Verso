import { toH24 } from "@/app/(pages)/Home/components/shared/Highcharts/utils/toH24";

export const pickNearestIndex = (categories: string[], nowH24: number) => {
  const ranked = categories.map((cat, i) => {
    const catH24 = toH24(cat);
    return { i, diff: Math.abs(catH24 - nowH24), h: catH24 };
  });
  ranked.sort((a, b) => a.diff - b.diff || b.h - a.h);
  return ranked[0]?.i ?? 0;
};
