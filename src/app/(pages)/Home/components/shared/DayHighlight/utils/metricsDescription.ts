import { TFunction } from "i18next";

export function getAirDescription(aqi: number, t: TFunction): string {
  if (aqi <= 50) return t("day_highlight.descriptions.air_quality.good");
  if (aqi <= 100) return t("day_highlight.descriptions.air_quality.moderate");
  if (aqi <= 150)
    return t("day_highlight.descriptions.air_quality.unhealthy_sensitive");
  if (aqi <= 200) return t("day_highlight.descriptions.air_quality.unhealthy");
  if (aqi <= 300)
    return t("day_highlight.descriptions.air_quality.very_unhealthy");
  return t("day_highlight.descriptions.air_quality.hazardous");
}

export function getCloudCoverDescription(
  cloudCover: number,
  t: TFunction,
): string {
  if (cloudCover <= 25)
    return t("day_highlight.descriptions.cloud_cover.clear");
  if (cloudCover <= 40)
    return t("day_highlight.descriptions.cloud_cover.partly_cloudy");
  if (cloudCover <= 60)
    return t("day_highlight.descriptions.cloud_cover.mostly_cloudy");
  if (cloudCover <= 75)
    return t("day_highlight.descriptions.cloud_cover.overcast");
  return t("day_highlight.descriptions.cloud_cover.fully_cloudy");
}

export function getHumidityDescription(humidity: number, t: TFunction): string {
  if (humidity <= 30) return t("day_highlight.descriptions.humidity.dry");
  if (humidity <= 50) return t("day_highlight.descriptions.humidity.moderate");
  if (humidity <= 70)
    return t("day_highlight.descriptions.humidity.noticeable");
  if (humidity <= 85) return t("day_highlight.descriptions.humidity.high");
  return t("day_highlight.descriptions.humidity.very_high");
}

export function getUvIndexDescription(uv: number, t: TFunction): string {
  if (uv <= 2) return t("day_highlight.descriptions.uv_index.safe");
  if (uv <= 5)
    return t("day_highlight.descriptions.uv_index.protection_desirable");
  if (uv <= 7)
    return t("day_highlight.descriptions.uv_index.protection_required");
  if (uv <= 10) return t("day_highlight.descriptions.uv_index.avoid_sun");
  return t("day_highlight.descriptions.uv_index.extreme");
}
