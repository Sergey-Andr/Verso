import React, { memo, RefObject, Suspense, useRef, useState } from "react";
import { motion, MotionValue } from "framer-motion";
import { WeatherForecastData } from "@/types/forecast";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import { useBuildForecastPanelModel } from "@/app/(pages)/Home/components/mobile/WeeklyForecastPanel/hooks/useBuildForecastPanelModel";
import WeeklySlider from "@/app/(pages)/Home/components/mobile/WeeklyForecastPanel/components/WeeklySlider";
import WeeklyForecastStatic from "@/app/(pages)/Home/components/mobile/WeeklyForecastPanel/components/WeeklyForecastStatic";

type WeeklyForecastPanelProps = {
  weather: WeatherForecastData;
  mainWeatherOpacity: MotionValue<number>;
  mainWeatherDisplay: MotionValue<string>;
  panelLagY: MotionValue<number>;
  activeDay: string;
  panelRef: RefObject<HTMLDivElement>;
};

const WeeklyForecastPanel = ({
  mainWeatherOpacity,
  mainWeatherDisplay,
  weather,
  panelLagY,
  activeDay,
  panelRef,
}: WeeklyForecastPanelProps) => {
  const [contentWidth, setContentWidth] = useState(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const {
    windSpeedDescription,
    precipitationDescription,
    windDirection,
    marginBottom,
    currentHour,
    days,
    useSwiper,
  } = useBuildForecastPanelModel({
    mainWeatherOpacity,
    panelRef,
    t,
    setContentWidth,
    contentWidth,
    weather,
  });

  return (
    <div className="grid grid-rows-1 duration-300 ease-in-out">
      <motion.div
        className="relative h-fit min-h-0 w-full overflow-hidden"
        style={{
          marginBottom,
        }}
      >
        <div
          aria-hidden
          role="presentation"
          className="bg-fake-blend-mode relative z-50 mx-auto mb-3 block h-2 w-14 rounded-sm opacity-60 contrast-115"
        />
        <motion.div
          ref={wrapRef}
          style={{
            opacity: mainWeatherOpacity,
            display: mainWeatherDisplay,
          }}
          className="wsm:px-2 relative z-50 mb-2 flex h-fit w-full items-center justify-between will-change-[opacity]"
        >
          <p className="flex items-center text-white/50">
            <span className="shrink-0">{t("metrics.wind")}:</span>&nbsp;
            {windSpeedDescription(weather[activeDay].windSpeed[currentHour])}
            &nbsp;
            <Image
              src="/shared/up-arrow.png"
              alt=""
              aria-hidden
              width={12}
              height={12}
              style={{
                transform: `rotate(${weather[activeDay].windDirection[currentHour]}deg)`,
              }}
              className={`wsm:block hidden opacity-50 duration-300`}
            />
            &nbsp;
            <span className="wsm:block hidden">
              {windDirection(weather[activeDay].windDirection[currentHour])}
            </span>
          </p>
          <p className="text-white/50">
            <span className="shrink-0">
              {t("metrics.precipitation_fallout")}:
            </span>
            &nbsp;
            {precipitationDescription(weather[activeDay].precipitationSum)}
            &nbsp;{weather[activeDay].precipitationSum}мм
          </p>
        </motion.div>
        <motion.hr
          style={{
            opacity: mainWeatherOpacity,
          }}
          className="relative z-50 block h-0.5 w-full scale-x-150 bg-white/10 text-white/60 will-change-[opacity]"
        />
      </motion.div>
      <div className="wsm:h-fit wsm:overflow-visible relative z-50 h-44 w-full -translate-y-4 overflow-hidden">
        {useSwiper ? (
          <Suspense
            fallback={
              <WeeklyForecastStatic
                days={days}
                activeDay={activeDay}
                panelLagY={panelLagY}
                currentHour={currentHour}
                mainWeatherOpacity={mainWeatherOpacity}
              />
            }
          >
            <WeeklySlider
              days={days}
              activeDay={activeDay}
              panelLagY={panelLagY}
              currentHour={currentHour}
              mainWeatherOpacity={mainWeatherOpacity}
            />
          </Suspense>
        ) : (
          <WeeklyForecastStatic
            days={days}
            activeDay={activeDay}
            panelLagY={panelLagY}
            currentHour={currentHour}
            mainWeatherOpacity={mainWeatherOpacity}
          />
        )}
      </div>
    </div>
  );
};

export default memo(WeeklyForecastPanel);
