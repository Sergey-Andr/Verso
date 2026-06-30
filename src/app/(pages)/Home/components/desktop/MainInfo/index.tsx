"use client";
import React, { useMemo, useRef, useState } from "react";
import Image from "next/image";
import dayjs from "@/utils/dayjs";
import { MOMENT_FORMAT } from "@/constants";
import { useSubscription } from "@/providers/WebSocketProvider";
import { useTranslation } from "react-i18next";
import { WeatherForecastData } from "@/types/forecast";
import { ACTIVE_DAY, PEAK_TIME } from "@/app/(pages)/Home/constants/shared";
import { getWeatherIcon } from "@/utils/getWeatherIcon";
import customParseFormat from "dayjs/plugin/customParseFormat";
import AllowGeolocationPanel from "@/app/(components)/AllowGeolocationPanel";
import WeatherPrecipitation from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/components/WeatherPrecipitation";
import cx from "clsx";
import { getPrecipitation } from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/features/getPrecipitation";

type MainInfoProps = {
  forecast: WeatherForecastData;
  city: string;
  country: string;
  currentDay: string;
  isFirstEnter: boolean;
};

dayjs.extend(customParseFormat);

const MainInfo = ({
  forecast,
  city,
  country,
  currentDay,
  isFirstEnter,
}: MainInfoProps) => {
  const [activeDay, setActiveDay] = useState(currentDay);
  const weatherCode = forecast[activeDay].weatherCode;
  const precip = getPrecipitation(weatherCode);
  const weatherIcon = getWeatherIcon(weatherCode);
  const { t, i18n } = useTranslation();

  const cityPanelRef = useRef(null);
  const cloudRef = useRef<HTMLImageElement>(null);

  const { formattedDate, dayOfWeek, dateTime, isCurrentDay } = useMemo(() => {
    const formattedDate = dayjs(forecast[activeDay].date, `YYYY-MM-DD`)
      .locale(i18n.language)
      .format("DD MMMM");

    const dateTime = dayjs(
      forecast[activeDay].date,
      MOMENT_FORMAT,
    ).toISOString();

    const dayOfWeek = dayjs(forecast[activeDay].date, MOMENT_FORMAT)
      .locale(i18n.language)
      .format("dddd");

    const dayStr = dayjs(forecast[activeDay].date, MOMENT_FORMAT).format(
      MOMENT_FORMAT,
    );
    const isCurrentDay = dayStr === dayjs().format(MOMENT_FORMAT);

    return { formattedDate, dateTime, dayOfWeek, isCurrentDay };
  }, [activeDay, forecast, i18n.language]);

  useSubscription(ACTIVE_DAY, (value) => {
    setActiveDay(value);
  });

  const currentHour = dayjs().hour();
  return (
    <>
      <div className="relative mb-20 h-11 w-full">
        <div
          ref={cityPanelRef}
          className="relative z-10 flex h-full w-64 items-center justify-center gap-2 rounded-full px-4"
        >
          <Image src="/shared/point.svg" alt="" width={24} height={24} />
          <h1 className="flex overflow-hidden text-xl text-nowrap">
            <p className="h-fit w-fit truncate">{city}</p>,&nbsp;
            <p className="h-fit w-fit truncate">{country}</p>
          </h1>
          <div className="bg-deep-indigo/20 absolute z-10 flex h-full min-h-8 w-full items-center justify-center rounded-full mix-blend-soft-light contrast-200" />
        </div>
        <div className="bg-violet/60 absolute top-0 left-0 -z-1 h-12 w-72 rounded-3xl blur-2xl brightness-125" />
        <AllowGeolocationPanel isFirstEnter={isFirstEnter} ref={cityPanelRef} />
      </div>

      <div className="relative z-1 h-fit w-fit duration-300 first-letter:uppercase">
        <h2 className="text-4.5xl">{dayOfWeek}</h2>
        <time dateTime={dateTime} className="text-xl">
          {formattedDate}
        </time>
        <div className="bg-violet absolute top-0 left-0 -z-1 h-full w-full rounded-3xl blur-3xl brightness-125" />
      </div>
      <Image
        src="/shared/house.webp"
        alt=""
        width={400}
        height={210}
        className="absolute bottom-0 left-32 z-50 duration-300"
        loading="lazy"
      />
      <div className="bg-violet/40 absolute bottom-0 left-1/4 -z-1 h-64 w-64 rounded-3xl blur-3xl brightness-125" />
      <WeatherPrecipitation
        precip={precip}
        emitterRef={cloudRef}
        className="z-50"
      />
      <Image
        ref={cloudRef}
        src={`/weather/${getWeatherIcon(weatherCode)}.png`}
        alt={t(`weather.${weatherCode}.description`)}
        width={184}
        height={184}
        className={cx(
          "cloud-drift absolute top-9 left-[432px] z-50 h-auto",
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
      <div className="bg-violet/40 absolute top-0 left-[45%] -z-1 h-64 w-64 rounded-3xl blur-3xl brightness-125" />
      <div className="absolute top-1/4 right-7 z-50 flex h-fit w-fit flex-col text-right">
        <div className="relative mb-[25.5%] ml-auto w-fit">
          <span className="mb-2 text-6xl">
            {Math.floor(forecast[activeDay].maxTemperature)}°C
          </span>
          <br />
          <span className="text-4xl text-white/60">
            /{Math.floor(forecast[activeDay].minTemperature)}°C
          </span>
          <div className="bg-violet/60 absolute top-0 -z-1 h-full w-full rounded-3xl blur-2xl brightness-125" />
        </div>
        <div className="relative ml-auto w-fit">
          <p className="mb-4 text-3xl">
            {t(`weather.${weatherCode}.description`)}
          </p>
          <dl className="inline">
            <dt className="inline text-xl leading-3">
              {t("metrics.feels_like")}&nbsp;
            </dt>
            <dd className="inline text-2xl leading-0">
              {Math.floor(
                isCurrentDay
                  ? forecast[activeDay].feelsLike[currentHour]
                  : forecast[activeDay].feelsLike[PEAK_TIME],
              )}
              °C
            </dd>
          </dl>
          <div className="bg-violet/60 absolute top-0 -z-1 h-full w-full rounded-3xl blur-2xl brightness-125" />
        </div>
      </div>
    </>
  );
};

export default MainInfo;
