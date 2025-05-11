import React from "react";
import Image from "next/image";

const ForecastDayCard = ({ label, temp, iconName, isSelected = false }) => {
  return (
    <li className="relative flex h-full w-[5.15vw] rounded-full px-[0.625vw] py-[1.25vw] pb-[4.62vh]">
      <div className="relative z-60 flex h-full w-full flex-col items-center justify-between">
        <div className="flex w-full flex-col items-center">
          <h3 className="text-forecast-label leading-forecast-label mb-3">
            {label}
          </h3>
          <div className="mb-[4.07vh] h-0.5 w-[calc(100%+1.25rem)] bg-gradient-to-r from-white/0 via-white/40 to-white/0" />
          <Image
            src={`/${iconName}`}
            alt="clear sky"
            width={80}
            height={80}
            className="h-fit w-[4.16vw]"
          />
        </div>
        <h5 className="text-forecast-temperature">{temp}</h5>
      </div>
      <div className="absolute top-0 left-0 z-50 h-full w-full rounded-full shadow-[4px_4px_10px_rgba(0,0,0,0.25)]" />
      <div
        className={`absolute top-0 left-0 z-50 h-full w-full rounded-full border-1 border-white bg-[#43298e]/20 mix-blend-overlay backdrop-blur-2xl ${isSelected && "brightness-175 contrast-95"}`}
      />
    </li>
  );
};

export default ForecastDayCard;
