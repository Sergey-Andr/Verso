export const getWeatherIcon = (code: number): number => {
  if (code === 0 || code === 3 || code === 1) return code;
  if ([80, 81, 82, 85, 86].includes(code)) return 1;
  return 2;
};
