import React from "react";
import { motion, MotionValue } from "framer-motion";
import Image from "next/image";
import { WeatherForecastData } from "@/types/forecast";
import { TFunction } from "i18next";
import { PULL_UP_LIMIT } from "@/app/(pages)/Home/constants/mobile";

type MainWeatherDisplayProps = {
  mainWeatherOpacity: MotionValue<number>;
  mainWeatherDisplay: MotionValue<string>;
  panelHeaderOpacity: MotionValue<number>;
  panelHeaderDisplay: MotionValue<string>;
  backgroundOverlayOpacity: MotionValue<number>;
  city: string;
  weather: WeatherForecastData;
  activeDay: string;
  currentHour: number;
  t: TFunction<"translation", undefined>;
};

const MainWeatherDisplay = ({
  mainWeatherOpacity,
  mainWeatherDisplay,
  panelHeaderOpacity,
  panelHeaderDisplay,
  backgroundOverlayOpacity,
  city,
  weather,
  activeDay,
  currentHour,
  t,
}: MainWeatherDisplayProps) => {
  return (
    <>
      <motion.section
        style={{ opacity: mainWeatherOpacity, display: mainWeatherDisplay }}
        className="hsm:dmt wsm:hidden relative z-50 mt-4 w-full flex-col items-center justify-around font-[inter] will-change-[opacity]"
      >
        <h2 className="vp:location w-fit">{city}</h2>
        <h1 className="vp:temperature-main w-fit font-thin">
          {Math.floor(weather[activeDay].temperature[currentHour])}°
        </h1>
        <sub className="vp:description-main inline-grid grid-cols-2 gap-x-2 font-semibold">
          <p className="col-span-2 w-full text-center text-white/60">
            {t(`weather.${weather[activeDay].weatherCode}.description`)}
          </p>
          <span className="text-right">
            В:&nbsp;{Math.floor(weather[activeDay].maxTemperature)}°
          </span>
          <span>Н:&nbsp;{Math.floor(weather[activeDay].minTemperature)}°</span>
        </sub>
      </motion.section>
      <motion.section
        style={{ opacity: panelHeaderOpacity, display: panelHeaderDisplay }}
        className="wsm:block wsm:opacity-100 wsm:top-2 absolute top-8 z-1 flex-col items-center font-[inter] will-change-[opacity]"
      >
        <h2 className="flex flex-col items-center">
          <p className="text-3xl">{city}</p>
          <span className="text-base">
            {Math.floor(weather[activeDay].temperature[currentHour])}
            °&nbsp;|&nbsp;
            {t(`weather.${weather[activeDay].weatherCode}.description`)}
          </span>
        </h2>
      </motion.section>
      <div className="hsm:inline-flex vp:visual-scale fixed bottom-[20.875rem] left-1/2 z-1 hidden -translate-x-1/2 translate-y-[42.31%]">
        <Image
          src="/shared/house.mobile.png"
          alt=""
          aria-hidden
          fill
          priority
        />
        <motion.div
          style={{ opacity: mainWeatherOpacity }}
          className="absolute bottom-0 left-1/2 h-4 w-8/12 -translate-x-1/2 bg-white/40 blur-lg will-change-[opacity]"
        />
      </div>
      <motion.div
        style={{ opacity: backgroundOverlayOpacity }}
        className="from-deep-indigo to-charcoal-indigo absolute inset-0 h-screen w-screen bg-linear-145 will-change-[opacity]"
      />
      <motion.div
        className="bg-soft-purple -translate-panelY-1/2 absolute left-1/2 z-50 h-1 w-8/12 -translate-x-1/2 rounded-full blur-lg brightness-115 will-change-[opacity]"
        style={{
          top: PULL_UP_LIMIT,
          opacity: backgroundOverlayOpacity,
        }}
      />
    </>
  );
};

export default MainWeatherDisplay;
