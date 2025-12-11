import React, { memo, useEffect, useRef, useState } from "react";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import Image from "next/image";
import cx from "clsx";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import "swiper/css";
import "swiper/css/navigation";
import { getWeatherIcon } from "@/utils/getWeatherIcon";
import { fetchCitiesSummary } from "@/app/(pages)/Home/services/fetchCitiesSummary";
import {
  ASYNC_PANEL,
  ASYNC_PANEL_FETCHED,
  ASYNC_PANEL_PENDING,
} from "@/constants";

const CitiesHeap = () => {
  const [cities, setCities] = useState([]);
  const [isTouched, setIsTouched] = useState(false);
  const swiperRef = useRef<SwiperRef>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    if (swiperRef.current && isTouched) {
      swiperRef.current.style.animation = "none";
    }
  }, [isTouched]);

  useEffect(() => {
    (async () => {
      const res = await fetchCitiesSummary(i18n.language);
      setCities(res);
      hostRef.current?.setAttribute("data-state", ASYNC_PANEL_FETCHED);
    })();
  }, [i18n.language]);

  return (
    <div id={ASYNC_PANEL} ref={hostRef} data-state={ASYNC_PANEL_PENDING}>
      <Swiper
        tag="ul"
        ref={swiperRef}
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView="auto"
        className={`${isTouched ? "" : "swiper-hint-animation"}`}
        onTouchStart={() => {
          setIsTouched(true);
        }}
      >
        {cities.map((city) => (
          <SwiperSlide
            tag="li"
            key={`${city.city}-${city.country}-${city?.admin}`}
            className="group relative max-h-[268px] min-h-[268px] max-w-[230px] min-w-[230px] cursor-pointer"
          >
            <Link
              href={`/погода/${encodeURIComponent(city.city)}/${encodeURIComponent(city.country)}/${city.lat}/${city.lon}`}
            >
              <div className="relative z-50 flex h-full w-full flex-col items-center justify-center p-4 text-white">
                <h5 className="mb-4 text-4xl">{city.city}</h5>
                <div className="h-24">
                  <Image
                    src={`/weather/${getWeatherIcon(city.weatherCode)}.png`}
                    alt={t(`weather.${city.weatherCode}.description`)}
                    width={80}
                    height={80}
                    className="h-[80px] w-fit"
                  />
                </div>
                <span className="text-medium mb-2 text-2xl">
                  {Math.floor(city.tempMax)}
                  <span className="text-xl text-white/60">
                    &nbsp;/{Math.floor(city.tempMin)}
                  </span>
                </span>
                <p
                  className={cx(
                    "text-center font-medium text-white/60",
                    t(`weather.${city.weatherCode}.description`).length > 20
                      ? "leading-[120%] tracking-tight"
                      : "text-lg",
                  )}
                >
                  {t(`weather.${city.weatherCode}.description`)}
                </p>
              </div>
              <div className="bg-fake-blend-mode/85 ease absolute top-0 left-0 h-full w-full blur-lg duration-150 group-hover:brightness-125" />
              <MainBackgroundLayer borderWidth={2} />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default memo(CitiesHeap);
