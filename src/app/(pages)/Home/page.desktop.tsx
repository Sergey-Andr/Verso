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
import { useFpsMonitor } from "@/app/(pages)/Home/hooks/useFpsMonitor";
import Image from "next/image";
import { getStoredData, setStoredData } from "@/utils/store";
import { USER_ACCELERATION_ENABLED } from "@/app/(pages)/Home/constants/desktop";

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
  const [visible, setVisible] = useState(false);
  const [liveCity, setLiveCity] = useState(city);
  useSubscription(CITY_LABEL, (v) => setLiveCity(v));
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t, i18n } = useTranslation();
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

  const { lowFps } = useFpsMonitor();

  useEffect(() => {
    if (!dialogRef.current) return;
    if (!lowFps) return;

    const local = getStoredData(USER_ACCELERATION_ENABLED, "locale");
    const session = getStoredData(USER_ACCELERATION_ENABLED, "session");
    if (local || session) return;
    setVisible(true);
  }, [lowFps]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (visible) {
      if (!dlg.open) dlg.showModal();
    } else {
      if (dlg.open) dlg.close();
    }
  }, [visible]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      setStoredData(USER_ACCELERATION_ENABLED, true, "session");
      setVisible(false);
    };
    const onBackdropClick = (e: MouseEvent) => {
      if (e.target === dlg) {
        setStoredData(USER_ACCELERATION_ENABLED, true, "session");
        setVisible(false);
      }
    };
    dlg.addEventListener("cancel", onCancel);
    dlg.addEventListener("click", onBackdropClick);
    return () => {
      dlg.removeEventListener("cancel", onCancel);
      dlg.removeEventListener("click", onBackdropClick);
    };
  }, []);

  const onOk = () => {
    setStoredData(USER_ACCELERATION_ENABLED, true, "session");
    setVisible(false);
  };
  const onAlreadyEnabled = () => {
    setStoredData(USER_ACCELERATION_ENABLED, true, "locale");
    setVisible(false);
  };

  return (
    <div className="flex h-fit w-full flex-col">
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
        <dialog
          open={visible}
          role="dialog"
          aria-modal="true"
          ref={dialogRef}
          className="fixed inset-0 z-500 h-full w-full bg-black/20 backdrop-blur-xs"
        >
          <div className="absolute top-1/2 left-1/2 h-fit w-fit -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl">
            <Image
              src="/shared/acceleration.png"
              alt=""
              width={640}
              height={500}
              aria-hidden
              loading="lazy"
              className="h-auto w-full"
            />
            <div className="relative p-4 text-white">
              <p className="mb-2 text-xl font-bold">{t("lagging.title")}</p>
              <ol className="mb-6 list-decimal space-y-2 pl-5">
                <li>{t("lagging.steps.s1")}</li>
                <li>{t("lagging.steps.s2")}</li>
                <li>{t("lagging.steps.s3")}</li>
              </ol>
              <p className="mb-4">
                <strong>{t("lagging.quickPath.label")}</strong>{" "}
                {t("lagging.quickPath.omnibox")}&nbsp;
                <span className="rounded bg-white/10 px-1 py-0.5">
                  {t("lagging.quickPath.url")}
                </span>
                &nbsp;{t("lagging.quickPath.toggleHint")}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  data-autofocus
                  onClick={onOk}
                  aria-label={t("lagging.aria.closeHint")}
                  className="relative flex h-fit w-full cursor-pointer justify-center self-start rounded-xl border border-white/40 bg-white/10 p-2 px-4 text-white duration-300 hover:bg-white/20"
                >
                  <span className="relative z-10">
                    {t("lagging.buttons.ok")}
                  </span>
                  <div className="bg-violet absolute inset-0 z-1 h-4/12 w-14/12 -translate-x-1/12 rounded-full blur-2xl" />
                </button>
                <button
                  type="button"
                  onClick={onAlreadyEnabled}
                  className="relative flex h-fit w-full cursor-pointer justify-center self-start rounded-xl border border-white/40 bg-white/10 p-2 px-4 text-white duration-300 hover:bg-white/20"
                >
                  <span className="relative z-10">
                    {t("lagging.buttons.alreadyEnabled")}
                  </span>
                  <div className="bg-violet absolute inset-0 z-1 h-4/12 w-14/12 -translate-x-1/12 rounded-full blur-2xl" />
                </button>
              </div>
              <div className="absolute inset-0 -z-1 bg-gradient-to-r from-[#272E68] to-[#444C8D]/90" />
            </div>
          </div>
        </dialog>
      </main>
    </div>
  );
}

export default WeatherPage;
