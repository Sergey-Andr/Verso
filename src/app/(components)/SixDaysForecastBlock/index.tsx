import React from "react";
import ForecastDayCard from "@/app/(components)/SixDaysForecastBlock/components/ForecastDayCard";

const SixDaysForecastBlock = () => {
  return (
    <>
      <h3 className="text-label relative z-50 mb-3 flex">6 Days Forecast</h3>
      <ul className="flex h-full w-full flex-nowrap items-center justify-between">
        <ForecastDayCard
          label="Today"
          temp="28 °C"
          iconName="shower_rain.png"
          isSelected={true}
        />
        <ForecastDayCard label="Tue" temp="31 °C" iconName="few_clouds.png" />
        <ForecastDayCard label="Wed" temp="27 °C" iconName="shower_rain.png" />
        <ForecastDayCard label="Thu" temp="29 °C" iconName="thunderstorm.png" />
        <ForecastDayCard label="Fri" temp="32 °C" iconName="few_clouds.png" />
        <ForecastDayCard label="Sat" temp="34 °C" iconName="clear_sky.png" />
      </ul>
      <div className="bg-violet/50 absolute top-1/2 left-[1.25vw] -z-1 h-[13vw] w-[13vw] -translate-y-1/2 rounded-3xl blur-2xl" />
      <div className="bg-violet/50 absolute top-1/2 left-[50%] -z-1 h-[13vw] w-[13vw] -translate-x-[50%] -translate-y-1/2 rounded-3xl blur-2xl" />
      <div className="bg-violet/50 absolute top-1/2 left-[calc(100%-1.25vw)] -z-1 h-[13vw] w-[13vw] -translate-x-full -translate-y-1/2 rounded-3xl blur-2xl" />
    </>
  );
};

export default SixDaysForecastBlock;
