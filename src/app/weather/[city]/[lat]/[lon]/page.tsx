"use server";
import dayjs from "@/utils/dayjs";
import { MOMENT_FORMAT, USER_AGENT } from "@/constants";
import { Metadata } from "next";
import React from "react";
import { fetchForecast } from "@/services/forecast";
import { useTranslation } from "../../../../../../i18n.server";
import WeatherPage from "@/app/(pages)/Home/page.desktop";
import WeatherPageMobile from "@/app/(pages)/Home/page.mobile";
import { cookies, headers } from "next/headers";

export async function generateMetadata({ params }): Promise<Metadata> {
  const { city, lat, lon } = await params;
  const cityName = decodeURIComponent(city);

  const weather = await fetchForecast({
    lat: +lat,
    lon: +lon,
  });

  const currentDay = dayjs().format(MOMENT_FORMAT);
  const currentHour = dayjs().hour();

  const { t } = await useTranslation();

  return {
    title: t("city.title", { cityName }),
    description: t("city.description", {
      maxTemperature: weather[currentDay].maxTemperature,
      minTemperature: weather[currentDay].minTemperature,
      feelsLike: weather[currentDay].feelsLike[currentHour],
      windSpeed: weather[currentDay].windSpeed[currentHour],
    }),
    robots: "index, follow",
    openGraph: {
      title: t("city.title", { cityName }),
      description: t("city.description", {
        maxTemperature: weather[currentDay].maxTemperature,
        minTemperature: weather[currentDay].minTemperature,
        feelsLike: weather[currentDay].feelsLike[currentHour],
        windSpeed: weather[currentDay].windSpeed[currentHour],
      }),
      images: "https://i.imgur.com/2EjC9xO.png",
      url: `https://weatherspotthree.vercel.app/${cityName}/${lat}/${lon}`,
    },
  };
}

export default async function WeatherContent({ params }) {
  const { city, country, lat, lon } = await params;
  const deviceType = (await cookies()).get(USER_AGENT)?.value;
  const weather = await fetchForecast({
    lat: +lat,
    lon: +lon,
  });

  if (deviceType === "mobile" && !weather) {
    return <></>;
  }

  if (deviceType === "mobile" && weather) {
    return (
      <WeatherPageMobile
        weather={weather}
        lat={lat}
        lon={lon}
        city={decodeURIComponent(city)}
        isFirstEnter={false}
      />
    );
  }

  return (
    <WeatherPage
      weather={weather}
      country={decodeURIComponent(country)}
      city={decodeURIComponent(city)}
      lat={lat}
      lon={lon}
    />
  );
}
