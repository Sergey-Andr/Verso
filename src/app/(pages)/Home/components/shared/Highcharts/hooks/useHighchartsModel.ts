import { useEffect, useMemo } from "react";
import { getStoredData } from "@/utils/store";
import { ACTIVE_DAY, TIMESTAMP } from "@/app/(pages)/Home/constants/shared";
import { useSubscription } from "@/providers/WebSocketProvider";
import {
  TIME_STEP,
  TIMESTAMP_12H,
  TIMESTAMP_24H,
} from "@/app/(pages)/Home/components/shared/Highcharts/constants";
import {
  MetricKey,
  Point,
} from "@/app/(pages)/Home/components/shared/Highcharts/types";
import { getSeriesSafe } from "@/app/(pages)/Home/components/shared/Highcharts/utils/getSeriesSafe";
import { getUnitForMetric } from "@/utils/getUnitForMetric";
import dayjs from "@/utils/dayjs";
import { pickNearestIndex } from "@/app/(pages)/Home/components/shared/Highcharts/utils/pickNearestIndex";
import { toH24 } from "@/app/(pages)/Home/components/shared/Highcharts/utils/toH24";

export const useHighchartsModel = ({
  setHighchartsInst,
  setTimestamp,
  setSelectedDay,
  setCurrentTime,
  timestamp,
  containerRef,
  setIsOpen,
  isMobile,
  forecast,
  selectedDay,
  chosenMetric,
  t,
  city,
  currentTime,
}) => {
  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const hcMod = await import("highcharts");
        const Highcharts = (hcMod as any).default ?? hcMod;

        const accMod = await import("highcharts/modules/accessibility");
        const initAccessibility = (accMod as any).default ?? accMod;

        if (typeof initAccessibility === "function") {
          initAccessibility(Highcharts);
        } else {
          console.warn(
            "[Highcharts] accessibility module did not export a function; assuming side-effect registration.",
          );
        }

        if (mounted) setHighchartsInst(Highcharts);
      } catch (e) {
        console.error("[Highcharts] init failed:", e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const time = getStoredData(TIMESTAMP) ?? TIMESTAMP_24H;
    setTimestamp(time);
  }, []);

  useSubscription(ACTIVE_DAY, (value) => setSelectedDay(value));
  useSubscription(TIMESTAMP, (value) => setTimestamp(value));

  useEffect(() => {
    setCurrentTime(
      +timestamp === TIMESTAMP_24H
        ? dayjs().hour()
        : dayjs().locale("en").format("h A"),
    );
  }, [timestamp]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const target = e.target as Node;
      if (!containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const hours = useMemo(() => {
    const formatter =
      +timestamp === TIMESTAMP_24H ? "HH:mm" : ("hh:mm A" as const);
    return Array.from(
      { length: isMobile ? TIMESTAMP_12H : TIMESTAMP_24H },
      (_, i) => {
        const hour = isMobile ? i * TIME_STEP + 1 : i;
        return dayjs()
          .hour(hour)
          .minute(0)
          .second(0)
          .millisecond(0)
          .locale("en")
          .format(formatter);
      },
    );
  }, [isMobile, timestamp]);

  const highlightIndex = useMemo(() => {
    const nowH24 =
      typeof currentTime === "number" ? currentTime : toH24(currentTime);
    return pickNearestIndex(hours, nowH24);
  }, [hours, currentTime]);

  const seriesValues: number[] = useMemo(() => {
    const raw = forecast[selectedDay]?.[chosenMetric] ?? [];
    const arr = Array.isArray(raw)
      ? raw.map((v: any) => +v).filter(Number.isFinite)
      : [];
    return isMobile ? arr.filter((_, i) => i % 2 === 1) : arr;
  }, [forecast, selectedDay, chosenMetric, isMobile]);

  const seriesData: Point[] = useMemo(() => {
    return seriesValues.map((y, i) =>
      i === highlightIndex
        ? { y, borderWidth: 1, borderColor: "rgba(255,255,255,.95)" }
        : y,
    );
  }, [seriesValues, highlightIndex]);

  const highchartsMetrics: Record<
    MetricKey,
    { label: string; value: MetricKey; tickInterval: number }
  > = useMemo(
    () => ({
      temperature: {
        label: t("metrics.temperature"),
        value: "temperature",
        tickInterval: 5,
      },
      feelsLike: {
        label: t("metrics.feels_like"),
        value: "feelsLike",
        tickInterval: 5,
      },
      windSpeed: {
        label: t("metrics.wind_speed"),
        value: "windSpeed",
        tickInterval: 1,
      },
      humidity: {
        label: t("metrics.humidity"),
        value: "humidity",
        tickInterval: 10,
      },
      uvIndex: {
        label: t("metrics.uv_index"),
        value: "uvIndex",
        tickInterval: 1,
      },
      cloudCover: {
        label: t("metrics.cloudiness"),
        value: "cloudCover",
        tickInterval: 10,
      },
    }),
    [t],
  );

  const charts = useMemo<number[]>(() => {
    const values = getSeriesSafe(forecast[selectedDay], chosenMetric);
    return isMobile ? values.filter((_, i) => i % 2 === 1) : values.slice();
  }, [isMobile, chosenMetric, forecast, selectedDay]);

  const values = useMemo(
    () => getSeriesSafe(forecast[selectedDay], chosenMetric),
    [forecast, selectedDay, chosenMetric],
  );

  const jsonld = useMemo(() => {
    const label = highchartsMetrics[chosenMetric].label;
    const unit = getUnitForMetric(chosenMetric);
    const start = dayjs(forecast[selectedDay]?.date)
      .startOf("day")
      .toISOString();
    const end = dayjs(forecast[selectedDay]?.date)
      .hour(23)
      .minute(0)
      .second(0)
      .millisecond(0)
      .toISOString();

    return {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: t("highcharts.jsonld.name", {
        chosenMetric: label,
        city,
        selectedDay: dayjs(selectedDay).format("DD MMMM YYYY"),
      }),
      description: t("highcharts.jsonld.description", {
        chosenMetric: label,
        metricUnit: unit,
        city,
        selectedDay: dayjs(selectedDay).format("DD MMMM YYYY"),
      }),
      creator: { "@type": "Organization", name: "Verso" },
      datePublished: new Date().toISOString(),
      temporalCoverage: `${start}/${end}`,
      variableMeasured: label,
      measurementTechnique: t("highcharts.jsonld.measurementTechnique"),
      dataset: {
        about: values.map((value: number, index: number) => {
          const observationMoment = dayjs(forecast[selectedDay].date)
            .hour(index)
            .minute(0)
            .second(0)
            .millisecond(0);
          return {
            "@type": "Observation",
            name: `${label} в ${observationMoment.format("HH:mm")}`,
            value,
            unitText: unit,
            observationDate: observationMoment.toISOString(),
          };
        }),
      },
    };
  }, [chosenMetric, city, selectedDay, highchartsMetrics, forecast, t]);

  return { highchartsMetrics, jsonld, hours, seriesData };
};
