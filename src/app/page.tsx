"use client";
import { FIRST_CITY, LATEST_CITY, USER_AGENT } from "@/constants";
import { getCookie, safeJsonParse, setCookie } from "@/utils/store";
import { useEffect, useState } from "react";
import { WeatherForecastData } from "@/types/forecast";
import { useTranslation } from "react-i18next";
import { fetchForecast } from "@/services/forecast";
import WeatherPageMobile from "@/app/(pages)/Home/page.mobile";
import WeatherPage from "@/app/(pages)/Home/page.desktop";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";
import { translateSingle } from "@/services/aiTranslate";
import { needsLLM } from "@/utils/needsLLM";
import "moment/locale/uk";
import "moment/locale/ru";
import moment from "moment/moment";
import dynamic from "next/dynamic";

type Geo = {
  lat: number;
  lon: number;
  cityEn: string;
  cityLabel?: string;
  country: string;
};

const CitiesHeap = dynamic(
  () => import("@/app/(pages)/Home/components/desktop/CitiesHeap"),
  { ssr: false },
);

export default function page() {
  const [weather, setWeather] = useState<WeatherForecastData>();
  const [isFirstEnter, setFirstEnter] = useState(false);
  const [deviceType, setDeviceType] = useState("");
  const [geo, setGeo] = useState<Geo | null>(null);

  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (moment.locale() !== i18n.language) moment.locale(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    const latest = safeJsonParse<Geo | null>(getCookie(LATEST_CITY));
    const first = safeJsonParse<Geo | null>(getCookie(FIRST_CITY));
    const ua = getCookie(USER_AGENT);

    setGeo(latest ?? first ?? null);
    if (ua === "mobile" || ua === "desktop") setDeviceType(ua);
    setFirstEnter(!latest);
  }, []);

  useEffect(() => {
    if (!geo?.lat || !geo?.lon) return;
    const ac = new AbortController();

    (async () => {
      try {
        const data = await fetchForecast(
          { lat: geo.lat, lon: geo.lon },
          { signal: ac.signal },
        );
        if (!ac.signal.aborted) setWeather(data);
      } catch (e: any) {
        if (e?.name !== "AbortError") console.error("forecast failed:", e);
      }
    })();

    return () => ac.abort();
  }, [geo?.lat, geo?.lon]);

  useEffect(() => {
    if (!geo?.cityEn) return;
    const ac = new AbortController();

    (async () => {
      if (geo.cityLabel) return;

      try {
        if (!needsLLM(geo.cityEn, i18n.language)) {
          const next = { ...geo, cityLabel: geo.cityEn };
          setCookie(LATEST_CITY, JSON.stringify(next));
        } else {
          const tr = await translateSingle(geo.cityEn, i18n.language, {
            signal: ac.signal,
          });

          if (!ac.signal.aborted) {
            const next = { ...geo, cityLabel: (tr ?? "").trim() };
            setGeo(next);
            setCookie(LATEST_CITY, JSON.stringify(next));
          }
        }
      } catch (e: any) {
        if (e?.name !== "AbortError")
          console.error("translate city failed:", e);
      }
    })();

    return () => ac.abort();
  }, [geo?.cityEn, i18n.language]);

  const cityForUi = geo?.cityLabel || geo?.cityEn || "";

  if ((deviceType === "mobile" && !weather) || !geo?.lat || !deviceType) {
    return <></>;
  }

  if (deviceType === "mobile" && weather) {
    return (
      <WeatherPageMobile
        weather={weather}
        lat={geo.lat}
        lon={geo.lon}
        city={cityForUi}
        isFirstEnter={isFirstEnter}
      />
    );
  }

  return (
    <>
      {weather ? (
        <WeatherPage
          weather={weather}
          lat={geo.lat}
          lon={geo.lon}
          city={cityForUi}
          country={geo.country}
          isFirstEnter={isFirstEnter}
        />
      ) : (
        <div className="loader h-16 w-16" />
      )}
      <footer className="mt-16">
        <div className="mb-12 h-fit w-full">
          <div className="relative mx-auto h-fit w-fit px-4 py-1 text-2xl">
            <h3 className="relative z-50">— {t("footer.label")} —</h3>
            <MainBackgroundLayer borderWidth={2} />
          </div>
        </div>
        <CitiesHeap />
      </footer>
    </>
  );
}
