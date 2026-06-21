import React, { memo, useRef } from "react";
import { motion, MotionValue } from "framer-motion";
import Image from "next/image";
import { WeatherForecastData } from "@/types/forecast";
import { TFunction } from "i18next";
import { PULL_UP_LIMIT } from "@/app/(pages)/Home/constants/mobile";
import "@/app/globals.css";
import { getPrecipitation } from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/features/getPrecipitation";
import { getWeatherIcon } from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/features/getWeatherIcon";
import AllowGeolocationPanel from "@/app/(pages)/Home/components/desktop/MainInfo/components/AllowGeolocationPanel";
import cx from "clsx";
import WeatherPrecipitation from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/components/WeatherPrecipitation";

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
  isFirstEnter: boolean;
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
  isFirstEnter,
}: MainWeatherDisplayProps) => {
  const weatherCode = 99;
  const precip = getPrecipitation(weatherCode);
  const weatherIcon = getWeatherIcon(weatherCode);

  const cloudRef = useRef<HTMLImageElement>(null);
  const cityRef = useRef<HTMLHeadingElement>(null);

  return (
    <>
      <motion.section
        ref={cityRef}
        style={{
          opacity: mainWeatherOpacity,
          display: mainWeatherDisplay,
        }}
        className="hsm:dmt wsm:hidden relative w-full flex-col items-center justify-around font-[inter] will-change-[opacity]"
      >
        <AllowGeolocationPanel
          isFirstEnter={isFirstEnter}
          isMobile={true}
          ref={cityRef}
        />
        <h2 className="vp:location w-fit">{city}</h2>
        <h1 className="vp:temperature-main w-fit font-thin">
          {Math.floor(weather[activeDay].temperature[currentHour])}°
        </h1>
        <sub className="vp:description-main inline-grid grid-cols-2 gap-x-2 font-semibold text-shadow-[1px_2px_5px_black]">
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
        style={{
          opacity: panelHeaderOpacity,
          display: panelHeaderDisplay,
        }}
        className="wsm:block wsm:opacity-100 wsm:top-2 absolute top-8 flex-col items-center font-[inter] will-change-[opacity]"
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
      <div className="hsm:inline-flex vp:visual-scale vp:visual-bottom absolute hidden">
        <Image
          src="/shared/house.mobile.png"
          alt=""
          fill
          priority
          aria-hidden
          className="relative -z-2"
        />
        <WeatherPrecipitation
          precip={precip}
          emitterRef={cloudRef}
          className="-z-2"
        />
        <Image
          ref={cloudRef}
          src={`/weather/${weatherIcon}.png`}
          alt={t(`weather.${weatherCode}.description`)}
          width="160"
          height="140"
          loading="lazy"
          className={cx(
            "test absolute -top-1/4 right-0 -z-1 h-auto",
            weatherCode === 0 ? "icon-sun w-36" : "w-44 translate-y-full",
          )}
        />
        {weatherCode === 3 && (
          <Image
            src={`/weather/${weatherIcon}.png`}
            alt=""
            aria-hidden
            width="160"
            height="140"
            loading="lazy"
            className="cloud-back absolute -top-4/12 right-0 -z-2 h-auto w-40 blur-[2px] brightness-80"
          />
        )}
        <motion.div
          style={{ opacity: mainWeatherOpacity }}
          className="absolute bottom-0 left-1/2 h-4 w-8/12 -translate-x-1/2 bg-white/40 blur-lg will-change-[opacity]"
        />
      </div>
      <motion.div
        style={{ opacity: backgroundOverlayOpacity }}
        className="from-deep-indigo to-charcoal-indigo absolute inset-0 -z-1 h-screen w-screen bg-linear-145 will-change-[opacity]"
      />
      <motion.div
        className="bg-soft-purple -translate-panelY-1/2 absolute left-1/2 z-5 h-1 w-8/12 -translate-x-1/2 rounded-full blur-lg brightness-115 will-change-[opacity]"
        style={{
          top: PULL_UP_LIMIT,
          opacity: backgroundOverlayOpacity,
        }}
      />
    </>
  );
};

export default memo(MainWeatherDisplay);
