import React, { memo, useEffect, useRef, useState } from "react";
import Image from "next/image";
import cx from "clsx";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";
import { fetchCitiesSummary } from "@/app/(pages)/Home/services/fetchCitiesSummary";
import {
  ASYNC_PANEL,
  ASYNC_PANEL_FETCHED,
  ASYNC_PANEL_PENDING,
} from "@/constants";

const CitiesHeap = () => {
  const [cities, setCities] = useState([]);
  const hostRef = useRef<HTMLUListElement>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    (async () => {
      const res = await fetchCitiesSummary(i18n.language);
      setCities(res);
      hostRef.current?.setAttribute("data-state", ASYNC_PANEL_FETCHED);
    })();
  }, [i18n.language]);

  return (
    <ul
      id={ASYNC_PANEL}
      ref={hostRef}
      data-state={ASYNC_PANEL_PENDING}
      className="flex h-full flex-wrap justify-between gap-y-4"
    >
      {cities.map((city) => (
        <li
          key={`${city.city}-${city.country}-${city?.admin}`}
          className="group relative h-full w-[200px] cursor-pointer transition-[width,margin] duration-200 hover:-mx-[2.5px] hover:w-[205px] hover:px-[2.5px]"
        >
          <Link
            href={`/погода/${encodeURIComponent(city.city)}/${city.lat}/${city.lon}`}
            className="h-fit"
          >
            <div className="relative z-50 flex h-full w-full flex-col p-4 text-white">
              <h5 className="mb-4 text-3xl">{city.city}</h5>
              <div className="mb-2 flex items-center gap-4">
                <Image
                  src={`/weather/${city.weatherCode}.png`}
                  alt={t(`weather.${city.weatherCode}.description`)}
                  width={32}
                  height={32}
                />
                <p
                  className={cx(
                    "text-center font-medium text-white/60",
                    t(`weather.${city.weatherCode}.description`).length > 20
                      ? "leading-[120%] tracking-tight"
                      : "text-lg",
                  )}
                >
                  <span className="duration-200 group-hover:text-white">
                    {t(`weather.${city.weatherCode}.description`)}
                  </span>
                </p>
              </div>
              <p className="mb-4 flex items-center justify-between text-4xl">
                {Math.floor(city.tempMax)}°
                <span className="text-xl text-white/60 duration-200 group-hover:text-white">
                  &nbsp;/{Math.floor(city.tempMin)}
                </span>
              </p>
              <div className="flex items-center gap-2 text-white/60 duration-200 group-hover:text-white">
                <div className="flex items-center gap-2">
                  <Image
                    src={`/shared/precipitation.png`}
                    alt={t(`weather.${city.weatherCode}.description`)}
                    width={16}
                    height={16}
                  />
                  <p>{Math.floor(city.precipitation)}%</p>
                </div>
                ·
                <div className="flex items-center gap-2">
                  <Image
                    src={`/shared/wind.png`}
                    alt={t(`weather.${city.weatherCode}.description`)}
                    width={16}
                    height={16}
                  />
                  <p>
                    {Math.floor(city.windSpeed)} {t("measures.km")}
                  </p>
                </div>
              </div>
            </div>
            <MainBackgroundLayer borderWidth={3} />
            <div className="absolute inset-1 h-6/12 w-6/12 translate-5/12 blur-2xl group-hover:bg-[#2a2658c7]" />
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default memo(CitiesHeap);
