"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import cx from "clsx";
import { MOMENT_FORMAT } from "@/constants";
import moment from "moment/moment";
import { WeatherPageProps } from "@/app/(pages)/Home/types";
import { useWeatherPanelAnimation } from "@/app/(pages)/Home/hooks/useWeatherPanelAnimation";
import MainWeatherDisplay from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay";
import PanelBackground from "@/app/(pages)/Home/components/mobile/PanelBackground";
import {
  HandleCitySearchBtn,
  HandleSettingsBtn,
} from "@/app/(pages)/Home/types/handlers";
import { useSubscription } from "@/providers/WebSocketProvider";
import { useTranslation } from "react-i18next";
import { ACTIVE_DAY } from "@/app/(pages)/Home/constants/shared";
import { PULL_UP_LIMIT } from "@/app/(pages)/Home/constants/mobile";
import { buildWeatherPageModel } from "@/app/(pages)/Home/utils/buildWeatherPageModel";
import dynamic from "next/dynamic";

const DayHighchartsMetrics = dynamic(
  () => import("@/app/(pages)/Home/components/shared/Highcharts"),
  { ssr: false },
);
const DayHighlight = dynamic(
  () => import("@/app/(pages)/Home/components/shared/DayHighlight"),
  { ssr: false },
);

const SearchCityMobile = dynamic(
  () => import("@/app/(pages)/Home/components/mobile/SearchCity"),
  { ssr: false },
);

const SettingsMobile = dynamic(() => import("@/app/(components)/Settings"), {
  ssr: false,
});

const WeeklyForecastPanel = dynamic(
  () => import("@/app/(pages)/Home/components/mobile/WeeklyForecastPanel"),
  {
    ssr: false,
  },
);

/* Проблема в том что mix-blend-mode ломает backdrop-blur, оба блока находятся в одном родителе на одном уровне, но на разных слоях, z-index у backdrop ниже чем у второго.
По задумке все блоки должны брать у друг-друга цвета и смешивая в одну цельную картину. Но mix-blend-mode ломает backdrop и у него появляется прозрачный ореол только на ПК через девтулза имитируя мобилку, на реальных мобильках такого нет.
Если изолировать только блок с backdrop - ничего не произойдёт потому что isolate работает только на дочерние элементы которых нет у блока который просто растягивается по всему родителю.
Если обернуть весь контент в блок с backdrop-blur - блюр пропадёт по неизвестной мне причине. Главная проблема является в том что mix-blend-mode и backdrop-blur находятся в одном контексте наложения, но они должны быть в одном контексте по дизайну.
Что можно ещё сделать?, в разные контексты нельзя.
 */

const WeatherPageMobile = ({
  weather,
  lon,
  lat,
  city,
}: Omit<WeatherPageProps, "country">) => {
  const [isCitySearchOpen, setIsCitySearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(moment().format(MOMENT_FORMAT));
  const currentHour = moment().hour();
  const { t, i18n } = useTranslation();
  const {
    stationaryContentY,
    backgroundOverlayOpacity,
    mainWeatherOpacity,
    mainWeatherDisplay,
    panelHeaderOpacity,
    panelHeaderDisplay,
    panelLagY,
    isInitialized,
    isHorizontal,
    isPanelReady,
    panelOpen,
    togglePanel,
    panelY,
    controls,
    panelRef,
    scrollRef,
    dragStartRef,
    initialY,
    handleDragEnd,
    startDrag,
    overflowY,
    borderRadius,
    height,
    y,
  } = useWeatherPanelAnimation();

  useEffect(() => {
    moment().locale(i18n.language);
  }, [i18n.language]);

  const jsonLd = useMemo(
    () =>
      buildWeatherPageModel({
        weather,
        city,
        lat,
        lon,
        t,
        language: i18n.language,
      }).jsonLd,
    [weather, city, lat, lon, t, i18n.language],
  );

  useSubscription(ACTIVE_DAY, (value) => {
    setActiveDay(value);
  });

  const handleCitySearchBtn: HandleCitySearchBtn = (state: boolean) => {
    setIsCitySearchOpen(state);
  };

  const handleSettingsBtn: HandleSettingsBtn = (state: boolean) => {
    setIsSettingsOpen(state);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="relative flex h-screen w-screen flex-col items-center">
        <MainWeatherDisplay
          mainWeatherOpacity={mainWeatherOpacity}
          mainWeatherDisplay={mainWeatherDisplay}
          panelHeaderOpacity={panelHeaderOpacity}
          panelHeaderDisplay={panelHeaderDisplay}
          backgroundOverlayOpacity={backgroundOverlayOpacity}
          city={city}
          weather={weather}
          activeDay={activeDay}
          currentHour={currentHour}
          t={t}
        />
        {isPanelReady ? (
          <motion.section
            className={cx(
              "absolute z-2 flex h-[calc(100dvh-108px)] min-h-0 w-[100svw] flex-col overflow-hidden will-change-[transform]",
            )}
            drag={isHorizontal ? false : "y"}
            dragListener={false}
            dragControls={controls}
            dragConstraints={{
              top: PULL_UP_LIMIT,
              bottom: initialY,
            }}
            onDragEnd={handleDragEnd}
            onDragStart={() => {
              dragStartRef.current = panelY.get();
            }}
            dragMomentum={false}
            ref={panelRef}
            style={{
              y: panelY,
              borderRadius,
            }}
          >
            <motion.div
              ref={scrollRef}
              className={cx(
                "wsm:overflow-y-scroll isolate overflow-x-hidden px-4 pt-2",
              )}
              style={{
                overflowY,
                paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
              }}
            >
              <PanelBackground
                mainWeatherOpacity={mainWeatherOpacity}
                stationaryContentY={stationaryContentY}
                backgroundOverlayOpacity={backgroundOverlayOpacity}
                borderRadius={borderRadius}
              />
              <button
                type="button"
                className="sr-only"
                aria-controls="weather-panel"
                aria-expanded={panelOpen}
                onClick={togglePanel}
              >
                {panelOpen ? t("panel.collapse") : t("panel.expand")}
              </button>
              <motion.button
                className={cx("absolute inset-0 z-100 h-6 w-full touch-none")}
                role="presentation"
                aria-hidden="true"
                onPointerDown={startDrag}
                style={{
                  height,
                }}
              />
              <motion.div
                className={cx(
                  "bg-violet/30 wsm:bg-violet/10 wsm:w-full absolute -right-0 z-50 h-40 w-64 rounded-3xl blur-3xl brightness-150 will-change-[transform]",
                )}
                style={{
                  y,
                }}
              />
              <WeeklyForecastPanel
                mainWeatherOpacity={mainWeatherOpacity}
                mainWeatherDisplay={mainWeatherDisplay}
                weather={weather}
                panelLagY={panelLagY}
                activeDay={activeDay}
                panelRef={panelRef}
              />
              <motion.div
                style={{
                  opacity: mainWeatherOpacity,
                  display: mainWeatherDisplay,
                }}
                className="relative z-50 mb-1 w-full -translate-y-4 flex-col will-change-[opacity]"
              >
                <Image
                  src="/shared/steep_line.mobile.svg"
                  alt=""
                  aria-hidden
                  width={430}
                  height={48}
                  className="h-[7.5vmin] w-full object-fill"
                />
                <div className="flex h-fit w-full items-center justify-between">
                  <button
                    aria-label={t("header.settings.open_settings")}
                    onClick={() => {
                      handleSettingsBtn(true);
                    }}
                  >
                    <Image
                      src="/shared/settings.mobile.png"
                      alt=""
                      aria-hidden
                      width="32"
                      height="32"
                    />
                  </button>
                  <button
                    aria-label={t("city.open_city_search")}
                    onClick={() => {
                      handleCitySearchBtn(true);
                    }}
                  >
                    <Image
                      src="/shared/point.svg"
                      alt=""
                      aria-hidden
                      width="32"
                      height="32"
                    />
                  </button>
                </div>
              </motion.div>
              <DayHighchartsMetrics
                forecast={weather}
                city={city}
                currentDay={activeDay}
                isMobile={true}
                isInitialized={isInitialized}
              />
              <DayHighlight
                forecast={weather}
                currentDay={activeDay}
                isMobile={true}
              />
            </motion.div>
          </motion.section>
        ) : null}

        <SearchCityMobile
          handleCitySearchBtn={handleCitySearchBtn}
          isCitySearchOpen={isCitySearchOpen}
        />
        <SettingsMobile
          handleSettingsBtn={handleSettingsBtn}
          isSettingsOpen={isSettingsOpen}
          isMobile={true}
        />
      </main>
    </div>
  );
};

export default WeatherPageMobile;
