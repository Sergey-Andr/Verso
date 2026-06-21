"use client";
import React, { memo, useMemo, useState } from "react";
import Image from "next/image";
import dayjs from "@/utils/dayjs";
import cx from "clsx";
import { useTranslation } from "react-i18next";
import { useSubscription } from "@/providers/WebSocketProvider";
import { MOMENT_FORMAT } from "@/constants";
import { WeatherForecastData } from "@/types/forecast";
import { ACTIVE_DAY, PEAK_TIME } from "@/app/(pages)/Home/constants/shared";
import {
  getAirDescription,
  getCloudCoverDescription,
  getHumidityDescription,
  getUvIndexDescription,
} from "@/app/(pages)/Home/components/shared/DayHighlight/utils/metricsDescription";

type Props = {
  forecast: WeatherForecastData;
  currentDay: string;
  isMobile?: boolean;
};

const clamp = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, n));
const toInt = (n: number | string | undefined | null) =>
  Number.isFinite(n as number) ? Math.floor(n as number) : 0;

function dayStr(date: string) {
  return dayjs(date, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
}
function isSameDay(a: string, b: string) {
  return dayStr(a) === dayStr(b);
}

function MetricCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <li
      className={cx(
        "relative z-50 flex h-[159px] w-full flex-col p-4",
        className,
      )}
    >
      {children}
      <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
    </li>
  );
}

const DayHighlight = ({ forecast, currentDay, isMobile = false }: Props) => {
  const { t, i18n } = useTranslation();
  const [activeDay, setActiveDay] = useState(currentDay);

  const day = forecast[activeDay] ?? forecast[currentDay];
  if (!day) return null;

  const now = dayjs();
  const currentHour = now.hour();
  const isToday = isSameDay(day.date, now.format(MOMENT_FORMAT));

  useSubscription(ACTIVE_DAY, (value) => setActiveDay(value));

  const data = useMemo(() => {
    const idx = isToday ? currentHour : PEAK_TIME;

    const airQuality = toInt(day.airQuality[idx]);
    const cloudsCover = toInt(day.cloudCover[idx]);
    const humidity = toInt(day.humidity[idx]);
    const uvIndex = toInt(day.uvIndex[idx]);
    const windSpeed = toInt(day.windSpeed[idx]);
    const windDirection = toInt(day.windDirection[idx]);

    const airDesc = getAirDescription(airQuality, t);
    const cloudsDesc = getCloudCoverDescription(cloudsCover, t);
    const humidityDesc = getHumidityDescription(humidity, t);
    const uvDesc = getUvIndexDescription(uvIndex, t);

    const airScaleText = t("day_highlight.sr_only.air_quality_scale", {
      value: airQuality,
      description: airDesc,
    });
    const uvScaleText = t("day_highlight.sr_only.uv_index_scale", {
      value: uvIndex,
      description: uvDesc,
    });

    const airLeftPct = clamp((airQuality / 500) * 100, 0, 100);
    const uvLeftPct = clamp((uvIndex / 12) * 100, 0, 100);

    return {
      airQuality,
      airDesc,
      airScaleText,
      airLeftPct,
      cloudsCover,
      cloudsDesc,
      humidity,
      humidityDesc,
      uvIndex,
      uvDesc,
      uvScaleText,
      uvLeftPct,
      windSpeed,
      windDirection,
      precipitation: toInt(day.precipitation),
      precipitationSum: toInt(day.precipitationSum),
      precipitationHours: toInt(day.precipitationHours),
    };
  }, [day, isToday, currentHour, t, i18n.language]);

  return (
    <>
      {!isMobile && (
        <h3 className="relative z-50 mb-6 flex text-3xl">
          {t("day_highlight.label")}
        </h3>
      )}

      <ul
        className={cx(
          "relative z-50 grid w-full",
          isMobile
            ? "h-fit grid-cols-[repeat(2,calc(50%-0.5rem))] grid-rows-[repeat(3,164px)] gap-4"
            : "h-[calc(100%-3rem)] grid-cols-[208px_208px_288px] grid-rows-2 gap-6",
        )}
        style={{ contentVisibility: "auto" }}
      >
        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/wind.png"
              alt={`${t("day_highlight.icon_alts.wind")}: ${data.windSpeed}`}
              width={24}
              height={24}
              loading="lazy"
            />
            <h4 className="text-lg">{t("metrics.wind")}</h4>
          </div>

          <dl className="relative mx-auto flex h-full w-full flex-col items-center justify-center">
            <Image
              src="/shared/wind_direction.png"
              alt={`${t("day_highlight.icon_alts.wind_direction")}: ${data.windDirection}`}
              width={106}
              height={106}
              loading="lazy"
              className="absolute left-1/2 -translate-x-1/2"
            />
            <dt className="sr-only">
              {t("day_highlight.sr_only.wind_speed")}:
            </dt>
            <dd className="mt-2 mb-1 text-center text-2xl leading-3 font-semibold">
              {data.windSpeed}
              <br />
              <span className="text-base leading-3 font-normal">
                {t("measures.km")}
              </span>
            </dd>
            <dt className="sr-only">
              {t("day_highlight.sr_only.wind_direction")}:
            </dt>
            <dd className="text-base leading-3 font-normal text-white/60">
              {data.windDirection}&nbsp;Н.
            </dd>

            <div
              style={{ rotate: `${data.windDirection}deg` }}
              className="absolute top-0 left-1/2 h-1/2 w-1 origin-bottom duration-300"
              aria-hidden
            >
              <span className="absolute top-1 -left-1/2 h-1.5 w-1.5 rounded-full outline-3 outline-white" />
            </div>
          </dl>
        </MetricCard>

        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/humidity.png"
              alt={`${t("day_highlight.icon_alts.humidity")}: ${data.humidity}%`}
              width={24}
              height={24}
              loading="lazy"
            />
            <h4 className="text-lg">{t("metrics.humidity")}</h4>
          </div>
          <dl className="flex h-full flex-col justify-between">
            <dt className="sr-only">
              {t("day_highlight.sr_only.humidity_level")}:
            </dt>
            <dd className="text-4xl leading-9">{data.humidity}%</dd>
            <dt className="sr-only">
              {t("day_highlight.sr_only.humidity_description")}:
            </dt>
            <dd className={cx("text-lg", isMobile && "leading-5")}>
              {data.humidityDesc}
            </dd>
          </dl>
        </MetricCard>

        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/cloud_cover.png"
              alt={`${t("day_highlight.icon_alts.clouds")}: ${data.cloudsCover}%`}
              width={24}
              height={24}
              loading="lazy"
            />
            <h4 className="text-lg">{t("metrics.cloudiness")}</h4>
          </div>
          <dl className="flex h-full flex-col justify-between">
            <dt className="sr-only">
              {t("day_highlight.sr_only.clouds_level")}:
            </dt>
            <dd className="text-4xl leading-9">{data.cloudsCover}%</dd>
            <dt className="sr-only">
              {t("day_highlight.sr_only.clouds_description")}:
            </dt>
            <dd className="text-lg">{data.cloudsDesc}</dd>
          </dl>
        </MetricCard>

        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/air_quality.png"
              alt={`${t("day_highlight.icon_alts.air_quality")}: ${data.airQuality}, ${data.airDesc}`}
              width={24}
              height={24}
              loading="lazy"
            />
            <h4 className={cx("text-lg text-nowrap", isMobile && "truncate")}>
              {t("metrics.air_quality")}
            </h4>
          </div>
          <dl className="flex h-full w-full flex-col justify-between">
            <dt className="sr-only">
              {t("day_highlight.sr_only.air_quality_level")}:
            </dt>
            <dd className="mb-3 text-4xl leading-9">
              {data.airQuality || "…"}
            </dd>
            <dt className="sr-only">
              {t("day_highlight.sr_only.air_quality_description")}:
            </dt>
            <dd className="mb-2 text-lg">{data.airDesc}</dd>

            <div
              className="bg-pink-violet relative h-1.5 w-full rounded-full"
              role="progressbar"
              aria-valuenow={data.airQuality}
              aria-valuemin={0}
              aria-valuemax={500}
              aria-valuetext={data.airScaleText}
            >
              <span
                style={{ left: `${data.airLeftPct}%` }}
                className="absolute -top-1/3 left-0 z-50 h-2.5 w-2.5 rounded-full bg-white duration-300"
              />
            </div>
          </dl>
        </MetricCard>

        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/uv_index.png"
              alt={`${t("day_highlight.icon_alts.uv_index")}: ${data.uvIndex}, ${data.uvDesc}`}
              width={24}
              height={24}
              loading="lazy"
            />
            <h4 className="text-lg text-nowrap">{t("metrics.uv_index")}</h4>
          </div>
          <dl>
            <dt className="sr-only">
              {t("day_highlight.sr_only.uv_index_level")}:
            </dt>
            <dd className="wsm:leading-9 mb-3 text-4xl leading-6">
              {data.uvIndex}
            </dd>
            <dt className="sr-only">
              {t("day_highlight.sr_only.uv_index_description")}:
            </dt>
            <dd className={cx("mb-3 text-base", isMobile && "leading-5")}>
              {data.uvDesc}
            </dd>

            <div
              className="bg-pink-violet relative h-1.5 w-full rounded-full"
              role="progressbar"
              aria-valuenow={data.uvIndex}
              aria-valuemin={0}
              aria-valuemax={12}
              aria-valuetext={data.uvScaleText}
            >
              <span
                style={{ left: `${data.uvLeftPct}%` }}
                className="absolute -top-1/3 z-50 h-2.5 w-2.5 rounded-full bg-white duration-300"
              />
            </div>
          </dl>
        </MetricCard>

        <MetricCard>
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/shared/precipitation.png"
              alt={t("day_highlight.icon_alts.precipitation", {
                precipitation: data.precipitation,
              })}
              width={24}
              height={24}
              loading="lazy"
              className="h-[24px] w-[24px]"
            />
            <h4 className="text-lg">{t("metrics.precipitation")}</h4>
          </div>
          <dl className="text-nowrap">
            <dt className="sr-only">
              {t("day_highlight.sr_only.precipitation")}:
            </dt>
            <dd className="inline text-4xl">{data.precipitation}%&nbsp;</dd>
            <br />
            <div className="mb-2" />
            <dt className="sr-only">
              {t("day_highlight.sr_only.precipitation_sum")}:
            </dt>
            <dd className="inline text-nowrap text-white/80">
              <Image
                src="/shared/drop-of-liquid.png"
                alt={t("day_highlight.icon_alts.precipitation_sum", {
                  precipitationSum: data.precipitationSum,
                })}
                width={16}
                height={16}
                loading="lazy"
                className="mr-2 inline"
              />
              <span className="wsm:hidden inline">
                {t("metrics.precipitation_sum_short")}:
              </span>
              <span className="wsm:inline-block hidden">
                {t("metrics.precipitation_sum")}:
              </span>
              &nbsp;
              <span className="font-semibold text-white">
                {data.precipitationSum}&nbsp;мм
              </span>
            </dd>
            <br />
            <dt className="sr-only">
              {t("day_highlight.sr_only.precipitation_hours")}:
            </dt>
            <dd className="flex items-center text-nowrap text-white/80">
              <Image
                src="/shared/cloud-clock.png"
                alt={t("day_highlight.icon_alts.precipitation_hours", {
                  precipitationHours: data.precipitationHours,
                })}
                width={16}
                height={16}
                loading="lazy"
                className="mr-2 inline"
              />
              <span className="wsm:hidden inline">
                {t("metrics.precipitation_hours_short")}:
              </span>
              <span className="wsm:inline-block hidden">
                {t("metrics.precipitation_hours")}:
              </span>
              &nbsp;
              <span className="shrink-0 font-semibold text-white">
                {data.precipitationHours}&nbsp;
                {t("metrics.precipitation_hours_metric")}.
              </span>
            </dd>
          </dl>
        </MetricCard>
      </ul>
      <div
        className={cx(
          "bg-violet/60 absolute rounded-3xl blur-2xl brightness-125",
          isMobile
            ? "h-40 w-40 translate-x-9/12 -translate-y-32/12"
            : "top-1/2 left-0 -z-1 h-48 w-48 translate-x-10/12 -translate-y-4/12",
        )}
      />
      <div
        className={cx(
          "bg-violet/60 absolute rounded-3xl blur-2xl brightness-125",
          isMobile
            ? "z-1 h-40 w-40 translate-x-9/12 -translate-y-18/12"
            : "top-1/2 right-0 -z-1 h-48 w-64 -translate-x-6/12 -translate-y-4/12",
        )}
      />
    </>
  );
};

export default memo(DayHighlight);
