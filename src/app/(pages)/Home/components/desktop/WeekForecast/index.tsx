"use client";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ForecastDayCard from "@/app/(pages)/Home/components/desktop/WeekForecast/components/ForecastDayCard";
import { WeatherForecastData } from "@/types/forecast";
import { useSubscription } from "@/providers/WebSocketProvider";
import { ACTIVE_DAY } from "@/app/(pages)/Home/constants/shared";

const WeekForecast = ({
  forecast,
  currentDay,
}: {
  forecast: WeatherForecastData;
  currentDay: string;
}) => {
  const { t, i18n } = useTranslation();
  const [selectedDay, setIsSelected] = useState(currentDay);

  useSubscription(ACTIVE_DAY, (value) => {
    setIsSelected(value);
  });
  return (
    <>
      <h3 className="relative z-50 mb-3 flex text-3xl">
        {t("week_forecast.label")}
      </h3>
      <ul className="flex h-full w-full flex-nowrap items-center justify-between">
        {Object.values(forecast).map((day) => (
          <ForecastDayCard
            key={day.date}
            day={day}
            selectedDay={selectedDay}
            t={t}
            i18n={i18n}
          />
        ))}
      </ul>
      <div className="bg-violet/60 absolute top-1/2 left-6 -z-1 h-40 w-40 -translate-y-1/3 rounded-3xl blur-2xl brightness-125" />
      <div className="bg-violet/60 absolute top-1/2 left-1/4 -z-1 h-40 w-40 -translate-x-1/4 -translate-y-1/3 rounded-3xl blur-2xl brightness-125" />
      <div className="bg-violet/60 absolute top-1/2 left-1/2 -z-1 h-40 w-40 -translate-x-1/2 -translate-y-1/3 rounded-3xl blur-2xl brightness-125" />
      <div className="bg-violet/60 absolute top-1/2 left-8/12 -z-1 h-40 w-40 -translate-x-8/12 -translate-y-1/3 rounded-3xl blur-2xl brightness-125" />
      <div className="bg-violet/60 absolute top-1/2 left-11/12 -z-1 h-40 w-40 -translate-x-full -translate-y-1/3 rounded-3xl blur-2xl brightness-125" />
    </>
  );
};

export default WeekForecast;
