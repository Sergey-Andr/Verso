"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import MainInfo from "@/app/(pages)/Home/components/desktop/MainInfo";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";
import WeekForecast from "@/app/(pages)/Home/components/desktop/WeekForecast";
import { WeatherPageProps } from "@/app/(pages)/Home/types";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/providers/WebSocketProvider";
import { CITY_LABEL } from "@/app/(pages)/Home/constants/shared";
import { buildWeatherPageModel } from "@/app/(pages)/Home/utils/buildWeatherPageModel";
import dynamic from "next/dynamic";
import Image from "next/image";
import { setStoredData } from "@/utils/store";

const DayHighchartsMetrics = dynamic(
  () => import("@/app/(pages)/Home/components/shared/Highcharts"),
  {
    ssr: false,
    loading: () => (
      <div className="loader top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    ),
  },
);
const DayHighlight = dynamic(
  () => import("@/app/(pages)/Home/components/shared/DayHighlight"),
  {
    ssr: false,
  },
);

function WeatherPage({
  weather,
  lon,
  lat,
  city,
  country,
  isFirstEnter = false,
}: WeatherPageProps) {
  const [liveCity, setLiveCity] = useState(city);
  const { t, i18n } = useTranslation();

  useSubscription(CITY_LABEL, (v) => setLiveCity(v));

  const { jsonLd, currentDay } = useMemo(
    () =>
      buildWeatherPageModel({
        weather,
        city,
        lat,
        lon,
        t,
        language: i18n.language,
      }),
    [weather, city, lat, lon, t, i18n.language],
  );

  return (
    <div className="flex h-fit w-full flex-col text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="flex h-[55.1875rem] w-full flex-col items-center gap-11 sm:items-start">
        <div className="flex h-[28.3125rem] w-full gap-11">
          <section className="relative w-[59rem] overflow-hidden rounded-3xl p-6">
            <MainInfo
              forecast={weather}
              city={liveCity}
              country={country}
              currentDay={currentDay}
              isFirstEnter={isFirstEnter}
            />
            <MainBackgroundLayer />
          </section>
          <section className="relative flex h-full w-[50.25rem] flex-col overflow-hidden rounded-3xl p-6">
            <DayHighlight forecast={weather} currentDay={currentDay} />
            <MainBackgroundLayer />
          </section>
        </div>
        <div className="flex h-[24.125rem] w-full gap-11">
          <section className="relative flex h-full w-[50.25rem] flex-col overflow-hidden rounded-3xl p-6">
            <WeekForecast forecast={weather} currentDay={currentDay} />
            <MainBackgroundLayer />
          </section>
          <section className="relative flex h-full w-[59rem] flex-col overflow-hidden rounded-3xl p-6">
            <DayHighchartsMetrics
              forecast={weather}
              city={liveCity}
              currentDay={currentDay}
            />
            <MainBackgroundLayer />
          </section>
        </div>
      </main>
    </div>
  );
}

export default WeatherPage;
