"use client";

import React, { useRef, useState } from "react";
import HighchartsReact from "highcharts-react-official";
import moment from "moment/moment";
import cx from "clsx";
import { useTranslation } from "react-i18next";
import { HighchartsOptionsProps, options } from "./options";
import {
  DayHighchartsMetricsProps,
  HC,
  MetricKey,
} from "@/app/(pages)/Home/components/shared/Highcharts/types";
import {
  METRICS,
  TIMESTAMP_24H,
} from "@/app/(pages)/Home/components/shared/Highcharts/constants";
import { useHighchartsModel } from "@/app/(pages)/Home/components/shared/Highcharts/hooks/useHighchartsModel";

const DayHighchartsMetrics = ({
  forecast,
  currentDay,
  city,
  isMobile = false,
  isInitialized = true,
}: DayHighchartsMetricsProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const listButtonRef = useRef<HTMLButtonElement>(null);
  const { t } = useTranslation();

  const [HighchartsInst, setHighchartsInst] = useState<HC | null>(null);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [isOpen, setIsOpen] = useState(false);
  const [chosenMetric, setChosenMetric] = useState<MetricKey>("temperature");
  const [timestamp, setTimestamp] = useState<number>(TIMESTAMP_24H);
  const [currentTime, setCurrentTime] = useState<number | string>(
    moment().hour(),
  );

  const { highchartsMetrics, jsonld, hours, seriesData } = useHighchartsModel({
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
  });

  const chartKey = `${selectedDay}-${chosenMetric}-${timestamp}-${isMobile}`;

  return (
    <div className="relative isolate z-60">
      <div
        className="items-top flex h-fit w-full justify-between"
        ref={containerRef}
      >
        {!isMobile && (
          <h3 className="relative z-50 mb-6 flex text-3xl">
            {t("highcharts.label")}
          </h3>
        )}
        <div
          className={cx(
            "relative h-11",
            isMobile ? "mt-4 ml-auto w-44" : "w-64",
          )}
        >
          <button
            ref={listButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((s) => !s);
            }}
            className="relative z-50 flex h-full w-full cursor-pointer items-center rounded-full p-4"
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls="metrics-list"
            type="button"
          >
            <p className={cx("relative z-50", isMobile && "text-sm")}>
              {highchartsMetrics[chosenMetric].label}
            </p>
            <div className="absolute top-1/2 right-5 -translate-y-1/2">
              <span
                className={cx(
                  "absolute -top-1 right-0 block h-2.5 w-0.5 rotate-45 rounded-full bg-white duration-300",
                  isOpen ? "rotate-[145deg]" : "rotate-45",
                )}
              />
              <span
                className={cx(
                  "absolute -top-1 -left-2 block h-2.5 w-0.5 -rotate-45 rounded-full bg-white duration-300",
                  isOpen ? "-rotate-[145deg]" : "-rotate-45",
                )}
              />
            </div>
            <div className="bg-violet/20 absolute inset-0 z-20 rounded-full border border-white/40 brightness-125 contrast-175" />
          </button>

          <ul
            className={cx(
              "absolute top-[calc(100%+1rem)] z-[100] w-full origin-top rounded-xl transition-all duration-250",
              isOpen
                ? "pointer-events-auto scale-y-100 opacity-100"
                : "pointer-events-none scale-y-25 opacity-0",
            )}
            id="metrics-list"
            role="listbox"
          >
            {METRICS.map((metric) => (
              <li
                key={metric}
                onClick={(e) => {
                  e.stopPropagation();
                  setChosenMetric(metric);
                  setIsOpen(false);
                }}
                className="hover:bg-violet cursor-pointer p-2 duration-100 first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4"
                role="option"
                aria-selected={chosenMetric === metric}
              >
                {highchartsMetrics[metric].label}
              </li>
            ))}
          </ul>
          <div
            style={{
              clipPath: isOpen
                ? "inset(0% 0% 0% 0% round 12px)"
                : "inset(10% 90% 90% 15% round 12px)",
            }}
            className="bg-fake-blend-mode/40 absolute top-[calc(100%+1rem)] left-0 z-90 h-64 w-full overflow-hidden rounded-2xl border border-white/50 backdrop-blur-md duration-300"
          />
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />

      <div className="relative z-50 h-fit w-full">
        {isInitialized && HighchartsInst && (
          <HighchartsReact
            key={chartKey}
            highcharts={HighchartsInst}
            options={options({
              Highcharts: HighchartsInst,
              customCategories: hours,
              seriesData,
              tickInterval: highchartsMetrics[chosenMetric].tickInterval,
              chosenMetric,
              currentTime,
              isMobile,
            } as HighchartsOptionsProps)}
          />
        )}

        <table
          className="sr-only"
          aria-label={`Дані графіка: ${highchartsMetrics[chosenMetric].label} за ${selectedDay}`}
        >
          <caption>
            {t("highcharts.table_detailed_data", {
              chosenMetric: highchartsMetrics[chosenMetric].label,
              selectedDay,
            })}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("highcharts.table_hour")}</th>
              <th scope="col">{highchartsMetrics[chosenMetric].label}</th>
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, index) => (
              <tr key={`${hour}-${index}`}>
                <td>{hour}</td>
                <td>
                  {forecast[selectedDay]?.[chosenMetric]?.[index] ?? "—"}{" "}
                  {chosenMetric === "temperature" ||
                  chosenMetric === "feelsLike"
                    ? "°C"
                    : chosenMetric === "windSpeed"
                      ? t("measures.km")
                      : chosenMetric === "humidity" ||
                          chosenMetric === "cloudCover"
                        ? "%"
                        : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div
          className={cx(
            "bg-violet/40 absolute top-5/12 left-16 -z-[1] h-48 w-64 -translate-y-1/2 rounded-full blur-2xl brightness-125",
            isMobile && "hidden",
          )}
        />
        <div
          className={cx(
            "bg-violet/40 absolute top-5/12 left-[51.5%] -z-[1] h-48 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl brightness-125",
            isMobile && "hidden",
          )}
        />
        <div
          className={cx(
            "absolute rounded-full blur-2xl brightness-125",
            isMobile
              ? "bg-violet/15 inset-0 -z-[1] h-full w-full"
              : "bg-violet/40 top-5/12 right-8 -z-[1] h-48 w-64 -translate-y-1/2",
          )}
        />
      </div>
    </div>
  );
};

export default DayHighchartsMetrics;
