import React from "react";
import { WeatherForecastData } from "@/types/forecast";
import Image from "next/image";
import moment from "moment/moment";
import {
  motion,
  MotionValue,
  useMotionTemplate,
  useTransform,
} from "framer-motion";
import { subscription } from "@/services/subscription";
import { ACTIVE_DAY } from "@/app/(pages)/Home/constants/shared";
import { getWeatherIcon } from "@/utils/getWeatherIcon";
import cx from "clsx";
import { useTranslation } from "react-i18next";

type WeekForecastCardProps = {
  day: WeatherForecastData[number];
  panelLagY: MotionValue<number>;
  currentHour: number;
  activeDay: string;
  mainWeatherOpacity: MotionValue<number>;
};

const WeeklyCard = ({
  day,
  panelLagY,
  currentHour,
  activeDay,
  mainWeatherOpacity,
}: WeekForecastCardProps) => {
  const { t, i18n } = useTranslation();
  const handleClick = () => {
    subscription({
      key: ACTIVE_DAY,
      value: day.date,
    });
  };

  const brightnessMv = useTransform(mainWeatherOpacity, (v) =>
    v * 100 < 5 ? "125%" : "135%",
  );
  const filterMv = useMotionTemplate`brightness(${brightnessMv}) contrast(115%)`;
  return (
    <motion.div
      className="flex h-full w-full flex-col items-center px-2 py-4"
      style={{
        y: panelLagY,
      }}
    >
      <h3 className="z-50 mb-3 text-base font-bold uppercase">
        {moment(day.date).locale(i18n.language).format("ddd")}
      </h3>
      <Image
        src={`/weather/${getWeatherIcon(day.weatherCode)}.png`}
        alt={t(`weather.${day.weatherCode}.description`)}
        width="32"
        height="32"
        loading="lazy"
        className="relative z-50"
      />
      {day.precipitation > 0 && (
        <span className="text-deep-blue text-md absolute top-1/2 z-50 font-bold">
          {Math.floor(day.precipitation)}%
        </span>
      )}
      <span className="absolute bottom-4 z-50 text-xl">
        {Math.floor(day.temperature[currentHour])}
      </span>
      <button
        onClick={handleClick}
        className="absolute inset-0 z-100 h-full w-full"
      />
      <motion.div
        style={{
          filter:
            activeDay === day.date
              ? filterMv
              : "brightness(100%) contrast(110%)",
        }}
        className={cx(
          "bg-violet/25 mix-border-mask absolute top-0 left-0 isolate z-30 h-full w-full rounded-full backdrop-blur-lg",
          activeDay === day.date ? "shadow-[0_0_15px_2px_#000]/25" : "",
        )}
      />
    </motion.div>
  );
};

export default WeeklyCard;
