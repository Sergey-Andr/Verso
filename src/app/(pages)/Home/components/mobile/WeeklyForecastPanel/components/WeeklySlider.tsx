import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import WeeklyCard from "@/app/(pages)/Home/components/mobile/WeeklyForecastPanel/components/WeeklyCard";

const WeeklySlider = ({
  days,
  panelLagY,
  currentHour,
  activeDay,
  mainWeatherOpacity,
}) => {
  return (
    <Swiper
      wrapperTag="ul"
      spaceBetween={16}
      slidesPerView="auto"
      className="!wsm:justify-between flex !h-36 w-full items-center !overflow-visible !p-0.5 !pt-4"
    >
      {days.map((day) => (
        <SwiperSlide
          tag="li"
          key={day.date}
          className="relative !h-36 !w-14 rounded-full"
        >
          <WeeklyCard
            day={day}
            panelLagY={panelLagY}
            currentHour={currentHour}
            activeDay={activeDay}
            mainWeatherOpacity={mainWeatherOpacity}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default WeeklySlider;
