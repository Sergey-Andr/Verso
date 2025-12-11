import moment from "moment/moment";
import { MOMENT_FORMAT } from "@/constants";
import { ForecastProps, WeatherForecastData } from "@/types/forecast";

const weatherFnGeneral = ({ lon, lat }: ForecastProps, init?: RequestInit) => {
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily:
      "weather_code,uv_index_max,wind_direction_10m_dominant,wind_speed_10m_max,temperature_2m_mean,relative_humidity_2m_mean,precipitation_probability_mean,precipitation_sum,precipitation_hours",
    hourly:
      "shortwave_radiation,diffuse_radiation,direct_radiation,temperature_2m,cloud_cover_low,cloud_cover_mid,cloud_cover_high,direct_normal_irradiance_instant,apparent_temperature,dew_point_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,wind_direction_10m,uv_index,cloud_cover",
    timezone: "auto",
  });
  return fetch(`https://api.open-meteo.com/v1/forecast?${p.toString()}`, {
    method: "GET",
    ...init,
  });
};

const weatherFnAir = ({ lon, lat }: ForecastProps, init?: RequestInit) => {
  const p = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    hourly: "european_aqi",
    timezone: "auto",
    forecast_days: "7",
  });
  return fetch(
    `https://air-quality-api.open-meteo.com/v1/air-quality?${p.toString()}`,
    { method: "GET", ...init },
  );
};

export const fetchForecast = async (
  { lat, lon }: ForecastProps,
  { signal }: { signal?: AbortSignal } = {},
): Promise<WeatherForecastData> => {
  const [data, airData] = await Promise.all([
    weatherFnGeneral({ lat, lon }, { signal }),
    weatherFnAir({ lat, lon }, { signal }),
  ]);

  if (!data.ok || !airData.ok) {
    console.error("API request failed:", {
      status: data.status,
      airStatus: airData.status,
    });
    throw new Error("Failed to fetch weather data from API");
  }

  const forecastData = await data.json();
  const forecastAirData = await airData.json();

  if (!forecastData?.hourly || !forecastAirData?.hourly) {
    console.error("Invalid data structure received from API:", {
      forecastData,
      forecastAirData,
    });
    throw new Error("Invalid data structure from weather API");
  }

  const weatherForecast: WeatherForecastData = {};
  let hourlyIndex = 0;

  try {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const temperature: number[] = [];
      const feelsLike: number[] = [];
      const windSpeed: number[] = [];
      const windDirection: number[] = [];
      const humidity: number[] = [];
      const cloudCover: string[] = [];
      const uvIndex: number[] = [];
      const airQuality: number[] = [];

      for (let hour = 0; hour < 24; hour++, hourlyIndex++) {
        temperature.push(forecastData.hourly.temperature_2m[hourlyIndex]);
        feelsLike.push(forecastData.hourly.apparent_temperature[hourlyIndex]);
        windSpeed.push(forecastData.hourly.wind_speed_10m[hourlyIndex]);
        windDirection.push(forecastData.hourly.wind_direction_10m[hourlyIndex]);
        humidity.push(forecastData.hourly.relative_humidity_2m[hourlyIndex]);
        cloudCover.push(forecastData.hourly.cloud_cover[hourlyIndex]);
        uvIndex.push(forecastData.hourly.uv_index[hourlyIndex]);
        airQuality.push(forecastAirData.hourly.european_aqi[hourlyIndex]);
      }

      const currentDay = moment(forecastData.daily.time[dayIndex])
        .locale("uk")
        .format(MOMENT_FORMAT);

      weatherForecast[currentDay] = {
        date: currentDay,
        temperature,
        feelsLike,
        windSpeed,
        windDirection,
        humidity,
        cloudCover,
        uvIndex,
        airQuality,
        weatherCode: forecastData.daily.weather_code[dayIndex],
        precipitation:
          forecastData.daily.precipitation_probability_mean[dayIndex],
        precipitationSum: forecastData.daily.precipitation_sum[dayIndex],
        precipitationHours: forecastData.daily.precipitation_hours[dayIndex],
        maxTemperature: Math.max(...temperature),
        minTemperature: Math.min(...temperature),
      };
    }
  } catch (e) {
    console.error("forecast error: ", e, " hourlyIndex: ", hourlyIndex);
  }

  return weatherForecast;
};

export const fetchDetailedSummary = async ({ lat, lon, city }) => {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    hourly:
      "temperature_2m,cloud_cover_low,shortwave_radiation,diffuse_radiation,cloud_cover_mid,cloud_cover_high,direct_normal_irradiance_instant,cloud_cover",
    timezone: "auto",
    forecast_days: "1",
  });
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    { cache: "force-cache" },
  );

  if (!response.ok) throw new Error(`Failed to fetch for ${city}`);
  const forecastData = await response.json();
  const currentHour = moment().hour();
  return {
    city,
    lon: forecastData.longitude,
    lat: forecastData.latitude,
    weatherCode: forecastData.daily.weather_code,
    tempMin: forecastData.daily.temperature_2m_min[0],
    tempMax: forecastData.daily.temperature_2m_max[0],
    temperature: forecastData.hourly.temperature_2m[currentHour],
  };
};
