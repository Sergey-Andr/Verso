import { WeatherForecastData } from "@/types/forecast";

export type WeatherPageProps = {
  weather: WeatherForecastData;
  city: string;
  country: string;
  lat: number;
  lon: number;
  isFirstEnter?: boolean;
};
