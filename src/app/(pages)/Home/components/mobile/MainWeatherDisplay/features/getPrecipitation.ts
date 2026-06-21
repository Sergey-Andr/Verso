import { Precip } from "@/app/(pages)/Home/components/mobile/MainWeatherDisplay/components/wetherPrecipitation";

export function getPrecipitation(code: number): Precip {
  if (code === 45 || code === 48) return { fog: 0.7 };

  const p: Precip = {};

  if ([51, 53, 55].includes(code)) p.rain = 0.25;
  else if ([61, 63, 80].includes(code)) p.rain = 0.45;
  else if ([65, 81, 82].includes(code)) p.rain = 0.75;

  if ([56, 66].includes(code)) {
    p.rain = 0.25;
    p.snow = 0.35;
  } else if ([57, 67].includes(code)) {
    p.rain = 0.35;
    p.snow = 0.5;
  }

  if (code === 77) p.snow = 0.3;
  else if ([71, 73, 85].includes(code)) p.snow = 0.55;
  else if ([75, 86].includes(code)) p.snow = 0.9;

  if (code === 95) {
    p.rain = Math.max(p.rain ?? 0, 0.5);
    p.lightning = 0.6;
  } else if (code === 96 || code === 99) {
    p.rain = Math.max(p.rain ?? 0, 0.7);
    p.hail = 0.6;
    p.lightning = 0.85;
  }

  return p;
}
