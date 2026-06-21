import React from "react";
import Image from "next/image";
import Link from "next/link";
import { TFunction } from "i18next";
import { HandleCitySearchBtn } from "@/app/(pages)/Home/types/handlers";
import { getWeatherIcon } from "@/utils/getWeatherIcon";
import { SearchedCities } from "@/app/(pages)/Home/components/mobile/SearchCity";
import { CitiesSummary } from "@/app/(pages)/Home/types/citiesSummary";
import cx from "clsx";
import { setCookie } from "@/utils/store";
import { LATEST_CITY } from "@/constants";

type CityCardProps = {
  city: SearchedCities | CitiesSummary[number];
  t: TFunction<"translation", undefined>;
  i: number;
  handleCitySearchBtn: HandleCitySearchBtn;
};

const CityCard = ({ city, t, i, handleCitySearchBtn }: CityCardProps) => {
  return (
    <li className="relative mb-4 flex h-52 w-full flex-col overflow-hidden p-4">
      <div className="items-top flex h-full w-full px-4">
        <div className="mt-8 flex h-full w-full flex-col items-start">
          <h3 className="mb-2 text-6xl">{Math.floor(city.temperature)}°</h3>
          <h4 className="mb-2 text-xl text-nowrap text-white/60">
            В:{Math.floor(city.tempMax)}° Н:{Math.floor(city.tempMin)}°
          </h4>
        </div>
        <Image
          src={`/weather/${getWeatherIcon(city.weatherCode)}.png`}
          alt={`${t(`weather.${city.weatherCode}.description`)}`}
          width={160}
          height={160}
          className="relative -top-4 left-4 h-fit"
        />
      </div>
      <div className="absolute bottom-8 z-50 flex w-full items-center justify-between gap-2 px-4 pr-12">
        <h5 className="relative min-w-0 flex-1 text-xl">
          <span
            className={cx(
              "block w-full overflow-hidden text-ellipsis whitespace-nowrap",
              city.needTranslate ? "text-white/60" : "text-white",
            )}
          >
            {city.city}
            {city.country ? `, ${city.country}` : ""}
            {"admin" in city && city.admin ? `, ${city.admin}` : ""}
          </span>

          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute inset-0 block w-full",
              "overflow-hidden text-ellipsis whitespace-nowrap text-white",
              "[mask-image:linear-gradient(75deg,transparent_35%,white_50%,transparent_65%)]",
              "[mask-size:300%_100%]",
              "[mask-repeat:no-repeat]",
              "animate-[shine_3s_linear_infinite]",
              city.needTranslate ? "" : "opacity-0",
            ].join(" ")}
          >
            {city.city}
            {city.country ? `, ${city.country}` : ""}
            {"admin" in city && city.admin ? `, ${city.admin}` : ""}
          </span>
        </h5>

        <h5 className="shrink-0 pl-3 text-right text-xl whitespace-nowrap">
          {t(`weather.${city.weatherCode}.description`)}
        </h5>
      </div>
      <Image
        src={i === 0 ? `/shared/card-bg-to-b.svg` : "/shared/card-bg-to-l.svg"}
        alt="card"
        width={390}
        height={185}
        className="absolute inset-0 -z-1 h-fit w-full"
      />
      <Link
        onClick={() => {
          setCookie(
            LATEST_CITY,
            JSON.stringify({
              cityLabel: city.city,
              country: city.country,
              lat: city.lat,
              lon: city.lon,
            }),
          );
          handleCitySearchBtn(false);
        }}
        href={`/${encodeURIComponent("погода")}/${city.city}/${city.lat}/${city.lon}`}
        className="absolute inset-0 z-50 h-full w-full"
      />
    </li>
  );
};

export default CityCard;
