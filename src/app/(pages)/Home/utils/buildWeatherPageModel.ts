"use client";
import moment from "moment/moment";
import { MOMENT_FORMAT } from "@/constants";
import { WeatherPageProps } from "@/app/(pages)/Home/types";
import { TFunction } from "i18next";

export function buildWeatherPageModel({
  city,
  weather,
  lat,
  lon,
  t,
  language,
}: Omit<WeatherPageProps, "isFirstEnter" | "country"> & {
  t: TFunction<"translation", undefined>;
  language: string;
}) {
  const currentDay = moment().format(MOMENT_FORMAT);
  const currentHour = moment().hour();

  const days = Object.values(weather)
    .map((d) => d.date)
    .sort((a, b) => (a < b ? -1 : 1));

  const startISO = days[0].slice(0, 10);
  const endISO = days[days.length - 1].slice(0, 10);

  const safe = weather[currentDay] ?? weather[days[0]];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: t(`jsonld.name`, { city }),
    description: safe
      ? t("jsonld.description.full", {
          city,
          daysCount: days.length - 1,
          minTemp: safe.minTemperature,
          maxTemp: safe.maxTemperature,
          feelsLike: safe.feelsLike[currentHour],
          windSpeed: safe.windSpeed[currentHour],
        })
      : t("jsonld.description.fallback", { city }),
    temporalCoverage: `${startISO}/${endISO}`,
    spatialCoverage: {
      "@type": "Place",
      name: city,
      geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lon },
    },
    keywords: t("jsonld.keywords", { city }),
    variableMeasured: t("jsonld.variableMeasured"),
    publisher: {
      "@type": "Organization",
      name: "Verso",
      url: "https://verso.app",
    },
    inLanguage: language,
  };

  return { jsonLd, currentDay, currentHour };
}
