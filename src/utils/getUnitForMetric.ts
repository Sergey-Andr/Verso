export const getUnitForMetric = (chosenMetric: string) => {
  switch (chosenMetric) {
    case "temperature":
    case "feelsLike": {
      return "°C";
    }

    case "windSpeed": {
      return `км/г`;
    }

    case "humidity":
    case "cloudCover": {
      return `%`;
    }

    case "uvIndex": {
      return null;
    }
  }
};
