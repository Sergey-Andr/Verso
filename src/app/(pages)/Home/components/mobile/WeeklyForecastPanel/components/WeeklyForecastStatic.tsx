import React from "react";
import WeeklyCard from "@/app/(pages)/Home/components/mobile/WeeklyForecastPanel/components/WeeklyCard";

const WeeklyForecastStatic = ({
  days,
  panelLagY,
  currentHour,
  activeDay,
  mainWeatherOpacity,
}) => {
  return (
    <ul className="flex h-36 w-full items-center justify-around p-0.5 pt-4">
      {days.map((day) => (
        <li key={day.date} className="relative h-36 w-14 rounded-full">
          <WeeklyCard
            day={day}
            panelLagY={panelLagY}
            currentHour={currentHour}
            activeDay={activeDay}
            mainWeatherOpacity={mainWeatherOpacity}
          />
        </li>
      ))}
    </ul>
  );
};

export default WeeklyForecastStatic;
