import Image from "next/image";
import type { WeatherForecastData } from "@/types/forecast";
import type { TFunction } from "i18next";

// Статичный «мёртвый» каркас надсгибового контента. Отдаётся в начальном HTML на сервере,
// без framer-motion и без гейта isPanelReady — поэтому LCP-элемент (фон + дом) красится на FCP.
// После гидрации WeatherPageMobile подменяет это на интерактивную версию.
// Позиции покоя классами зеркалят MainWeatherDisplay/PanelBackground — подгони по месту,
// если при подмене будет прыжок.
export default function StaticMobile({
  weather,
  city,
  activeDay,
  currentHour,
  t,
}: {
  weather: WeatherForecastData;
  city: string;
  activeDay: string;
  currentHour: number;
  t: TFunction<"translation", undefined>;
}) {
  const day = weather[activeDay];
  if (!day) return null;

  return (
    <>
      <Image
        src="/background/bg-night-sky.mobile.webp"
        alt=""
        aria-hidden
        fill
        priority
        fetchPriority="high"
        sizes="100vw"
        className="absolute bottom-0 -z-[2] h-screen w-screen object-cover"
      />
      <Image
        src="/shared/house.mobile.webp"
        alt=""
        aria-hidden
        fill
        priority
        fetchPriority="high"
        sizes="(max-width: 480px) 100vw, 480px"
        className="!fixed !inset-y-16 -z-[1]"
      />
      <section className="hsm:dmt relative flex w-full flex-col items-center justify-around font-[inter]">
        <h2 className="vp:location w-fit">{city}</h2>
        <h1 className="vp:temperature-main w-fit font-thin">
          {Math.floor(day.temperature[currentHour])}°
        </h1>
        <sub className="vp:description-main inline-grid grid-cols-2 gap-x-2 font-semibold text-shadow-[1px_2px_5px_black]">
          <p className="col-span-2 w-full text-center text-white/60">
            {t(`weather.${day.weatherCode}.description`)}
          </p>
          <span className="text-right">
            В:&nbsp;{Math.floor(day.maxTemperature)}°
          </span>
          <span>Н:&nbsp;{Math.floor(day.minTemperature)}°</span>
        </sub>
      </section>
    </>
  );
}
