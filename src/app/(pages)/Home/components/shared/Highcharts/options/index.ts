import { toH24 } from "@/app/(pages)/Home/components/shared/Highcharts/utils/toH24";
import { pickNearestIndex } from "@/app/(pages)/Home/components/shared/Highcharts/utils/pickNearestIndex";

export type HighchartsOptionsProps = {
  Highcharts: typeof import("highcharts");
  customCategories: string[];
  seriesData: Array<
    number | { y: number; borderWidth?: number; borderColor?: string }
  >;
  tickInterval: number;
  chosenMetric: string;
  currentTime: number | string;
  isMobile: boolean;
};

export const options = ({
  Highcharts,
  customCategories,
  seriesData,
  tickInterval,
  chosenMetric,
  currentTime,
  isMobile,
}: HighchartsOptionsProps) => {
  const valuesOnly = seriesData.map((p: any) =>
    typeof p === "number" ? p : (p?.y ?? 0),
  );
  return {
    chart: {
      height: isMobile ? 228 : 285,
      type: "column",
      backgroundColor: "transparent",
    },
    accessibility: {
      enabled: true,
      point: {
        valueDescriptionFormat: "{xDescription}, значення: {value}{unit}",
      },
      series: {
        descriptionFormat: isMobile
          ? "Цей графік показує {name} за 12 годин"
          : "Цей графік показує {name} за 24 години",
      },
    },
    plotOptions: {
      column: {
        borderWidth: 0,
        pointRange: 8,
      },
      series: {
        borderRadius: "50%",
      },
      vector: {
        borderRadius: "50%",
      },
    },
    credits: { enabled: false },
    title: { text: "" },
    xAxis: {
      categories: customCategories,
      labels: {
        style: {
          fontSize: isMobile ? 14 : 16,
          letterSpacing: "0.5px",
          color: "#FFFFFF7F",
        },
        autoRotate: [-45],
        rotation: isMobile ? undefined : -45,
        allowOverlap: false,
      },
    },
    yAxis: {
      visible: true,
      gridLineWidth: 1,
      gridLineColor: "#FFFFFF7F",
      tickInterval,
      max: Math.max(0, ...valuesOnly),
      labels: {
        style: { fontSize: 14, color: "#FFFFFF7F" },
      },
      title: "",
    },
    legend: { enabled: false },
    tooltip: {
      backgroundColor: "oklch(0.6512 0.350 280.29 / 80%)",
      borderColor: "oklch(0.742 0.1459 295.25)",
      borderWidth: 1,
      borderRadius: 8,
      style: {
        fontSize: isMobile ? 14 : 16,
        padding: "8px 12px",
        color: "#fff",
      },
      formatter: function (this: any) {
        let valueString = "";
        switch (chosenMetric) {
          case "temperature":
          case "feelsLike":
            valueString =
              this.y > 0 ? `+${Math.floor(this.y)}°` : `${Math.floor(this.y)}°`;
            break;
          case "windSpeed":
            valueString = `${Math.floor(this.y)} км/ч`;
            break;
          case "humidity":
          case "cloudCover":
            valueString = `${Math.floor(this.y)}%`;
            break;
          case "uvIndex":
            valueString = `${Math.floor(this.y)}`;
            break;
        }
        return `${
          isMobile ? `${parseInt(this.category, 10).toString()}: ` : ""
        }<b>${valueString}</b>`;
      },
    },
    series: [
      {
        name: chosenMetric,
        pointWidth: isMobile ? 12 : 18,
        color: {
          linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
          stops: [
            [0.05, "#A83F9CFF"],
            [0.35, "#A242A7FF"],
            [0.8, "#2D478EFF"],
          ],
        },
        data: seriesData,
      },
    ],
  };
};
