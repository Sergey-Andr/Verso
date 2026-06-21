import { Dispatch, RefObject, SetStateAction, useEffect, useMemo } from "react";
import { MotionValue, useTransform } from "framer-motion";
import type { TFunction } from "i18next";
import dayjs from "@/utils/dayjs";
import { WeatherForecastData } from "@/types/forecast";

type useBuildForecastPanelModelParams = {
  setContentWidth: Dispatch<SetStateAction<number | null>>;
  panelRef: RefObject<HTMLElement>;
  t: TFunction;
  mainWeatherOpacity: MotionValue<number>;
  weather: WeatherForecastData;
  contentWidth: number;
};

export const useBuildForecastPanelModel = ({
  setContentWidth,
  panelRef,
  t,
  mainWeatherOpacity,
  weather,
  contentWidth,
}: useBuildForecastPanelModelParams) => {
  useEffect(() => {
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setContentWidth(rect.width);
    } else {
      setContentWidth(window.innerWidth);
    }

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      setContentWidth(typeof w === "number" ? w : null);
    });
    if (panelRef.current) ro.observe(panelRef.current);

    const onResize = () => setContentWidth(window.innerWidth);
    window.addEventListener("resize", onResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [panelRef, setContentWidth]);

  function precipitationDescription(precipitationSum: number): string {
    if (precipitationSum === 0) return t("panel.precipitation.none");
    if (precipitationSum <= 0.5) return t("panel.precipitation.drizzle");
    if (precipitationSum <= 2) return t("panel.precipitation.light");
    if (precipitationSum <= 6) return t("panel.precipitation.moderate");
    return t("panel.precipitation.downpour");
  }

  function windSpeedDescription(windSpeed: number): string {
    if (windSpeed <= 1) return t("panel.wind_speed.calm");
    if (windSpeed <= 5) return t("panel.wind_speed.light");
    if (windSpeed <= 10) return t("panel.wind_speed.moderate");
    if (windSpeed <= 17) return t("panel.wind_speed.strong");
    return t("panel.wind_speed.storm");
  }

  function windDirection(windDeg: number): string {
    if (windDeg >= 337.5 || windDeg < 22.5)
      return t("panel.wind_direction.north");
    if (windDeg < 67.5) return t("panel.wind_direction.north_east");
    if (windDeg < 112.5) return t("panel.wind_direction.east");
    if (windDeg < 157.5) return t("panel.wind_direction.south_east");
    if (windDeg < 202.5) return t("panel.wind_direction.south");
    if (windDeg < 247.5) return t("panel.wind_direction.south_west");
    if (windDeg < 292.5) return t("panel.wind_direction.west");
    return t("panel.wind_direction.north_west");
  }

  const marginBottom = useTransform(mainWeatherOpacity, (latest: number) =>
    latest * 100 < 5 ? 0 : 16,
  );

  const currentHour = dayjs().hour();
  const days = useMemo(() => Object.values(weather), [weather]);
  const useSwiper = contentWidth !== null && contentWidth < 504;

  return {
    precipitationDescription,
    windSpeedDescription,
    windDirection,
    marginBottom,
    currentHour,
    days,
    useSwiper,
  };
};
