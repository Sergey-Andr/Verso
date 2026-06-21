"use client";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { translateSingle } from "@/services/aiTranslate";
import { needsLLM } from "@/utils/needsLLM";
import { setCookie } from "@/utils/store";
import { subscription } from "@/services/subscription";
import { FIRST_CITY, LATEST_CITY } from "@/constants";
import { CITY_LABEL } from "@/app/(pages)/Home/constants/shared";

type Geo = {
  lat: number;
  lon: number;
  cityEn: string;
  cityLabel?: string;
  country: string;
};

export default function CityLabelSync({
  geo,
  hasLatest,
}: {
  geo: Geo;
  hasLatest: boolean;
}) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const city = geo?.cityEn || geo?.cityLabel;
    if (!city) return;
    const key = hasLatest ? LATEST_CITY : FIRST_CITY;
    const ac = new AbortController();

    const apply = (label: string) => {
      setCookie(key, JSON.stringify({ ...geo, cityLabel: label }));
      subscription({ key: CITY_LABEL, value: label });
    };

    (async () => {
      try {
        if (!needsLLM(city, i18n.language)) {
          apply(city);
          return;
        }

        const tr = (
          await translateSingle(city, i18n.language, { signal: ac.signal })
        )?.trim();
        if (!ac.signal.aborted && tr) apply(tr);
      } catch (e: any) {
        if (e?.name !== "AbortError")
          console.error("translate city failed:", e);
      }
    })();

    return () => ac.abort();
  }, [geo?.cityEn, geo?.cityLabel, i18n.language, hasLatest]);

  return null;
}
