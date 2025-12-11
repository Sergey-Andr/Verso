export const TEMPERATURE = "temperature" as const;
export const TIMESTAMP_24H = 24 as const;
export const TIMESTAMP_12H = 12 as const;
export const TIME_STEP = 2 as const;

export const METRICS = [
  "temperature",
  "feelsLike",
  "windSpeed",
  "humidity",
  "uvIndex",
  "cloudCover",
] as const;
