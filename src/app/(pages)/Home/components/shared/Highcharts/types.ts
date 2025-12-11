import { WeatherForecastData } from "@/types/forecast";
import { METRICS } from "@/app/(pages)/Home/components/shared/Highcharts/constants";

export type DayHighchartsMetricsProps = {
  forecast: WeatherForecastData;
  city: string | number;
  currentDay: string;
  isMobile?: boolean;
  isInitialized?: boolean;
};

export type HC = typeof import("highcharts");
export type MetricKey = (typeof METRICS)[number];
export type DayForecastLike = Record<MetricKey, number[]> & Record<string, any>;
export type Point =
  | number
  | { y: number; borderWidth?: number; borderColor?: string };
