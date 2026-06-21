export type WeatherForecastData = {
  [key: string]: {
    date: string;
    temperature: number[];
    feelsLike: number[];
    windSpeed: number[];
    windDirection: number[];
    humidity: number[];
    uvIndex: number[];
    cloudCover: string[];
    airQuality: number[];
    weatherCode: number;
    precipitation: number;
    precipitationSum: number;
    precipitationHours: number;
    maxTemperature: number;
    minTemperature: number;
  };
};

export type DailyWeatherForecastData = WeatherForecastData[string];

export type ForecastProps = {
  lat: number;
  lon: number;
};
