export const WEATHER_ICON_MAP: Record<number, number> = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  45: 45,
  48: 45,
  51: 61,
  53: 61,
  55: 65,
  56: 66,
  57: 67,
  61: 61,
  63: 63,
  65: 65,
  66: 66,
  67: 67,
  71: 71,
  73: 73,
  75: 75,
  77: 77,
  80: 80,
  81: 81,
  82: 82,
  85: 85,
  86: 86,
  95: 95,
  96: 96,
  99: 99,
} as const;

export const getWeatherIcon = (code: number) => {
  return WEATHER_ICON_MAP[code];
};
