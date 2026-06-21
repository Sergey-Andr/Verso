import React from "react";
import Image from "next/image";
import dayjs from "@/utils/dayjs";
import { MOMENT_FORMAT } from "@/constants";
import { subscription } from "@/services/subscription";
import { DailyWeatherForecastData } from "@/types/forecast";
import { ACTIVE_DAY } from "@/app/(pages)/Home/constants/shared";
import { getWeatherIcon } from "@/utils/getWeatherIcon";

type ForecastDayCardProps = {
  day: DailyWeatherForecastData;
  selectedDay: string;
  t: any;
  i18n: any;
};

const ForecastDayCard = ({
  day,
  selectedDay,
  t,
  i18n,
}: ForecastDayCardProps) => {
  const handleClick = () => {
    subscription({
      key: ACTIVE_DAY,
      value: day.date,
    });
  };

  const dayWeek = dayjs(day.date).locale(i18n.language).format("dd");
  const dateTime = dayjs(day.date, MOMENT_FORMAT).toISOString();
  const formattedDayWeek =
    dayWeek === dayjs().locale(i18n.language).format("dd")
      ? t("week_forecast.today")
      : dayWeek.slice(0, 1).toUpperCase() + dayWeek.slice(1);

  return (
    <li className="relative flex h-full w-24 rounded-full px-2.5 py-6 pb-12">
      <div className="relative z-60 flex h-full w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col items-center">
          <h4 className="mb-3 text-lg leading-6">
            <time dateTime={dateTime}>{formattedDayWeek}</time>
          </h4>
          <div className="mb-11 h-0.5 w-[calc(100%+1.25rem)] bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
          <Image
            src={`/weather/${getWeatherIcon(day.weatherCode)}.png`}
            alt={t(`weather.${day.weatherCode}.description`)}
            width={80}
            height={80}
            className="h-fit w-full"
          />
        </div>
        <span className="text-2xl">
          {Math.floor(day.maxTemperature)}
          °C
        </span>
      </div>
      <div className="absolute top-0 left-0 z-50 h-full w-full rounded-full shadow-[4px_4px_10px_rgba(0,0,0,0.25)]" />
      <button
        onClick={handleClick}
        className="absolute z-100 h-full w-full cursor-pointer"
      />
      <div
        className={`absolute top-0 left-0 isolate z-50 h-full w-full rounded-full border-1 border-white bg-[#43298e]/20 mix-blend-overlay backdrop-blur-2xl duration-300 ${selectedDay === day.date && "brightness-155 contrast-95"}`}
      />
    </li>
  );
};

export default ForecastDayCard;
