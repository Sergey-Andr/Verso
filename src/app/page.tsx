import { cookies, headers } from "next/headers";
import { FIRST_CITY, LATEST_CITY, USER_AGENT } from "@/constants";
import { CITIES } from "@/constants/apiRequests";
import { fetchForecast } from "@/services/forecast";
import { WeatherForecastData } from "@/types/forecast";
import WeatherPageMobile from "@/app/(pages)/Home/page.mobile";
import WeatherPage from "@/app/(pages)/Home/page.desktop";
import HomeDesktopFooter from "@/app/(components)/HomeDesktopFooter";
import CityLabelSync from "@/app/(components)/CityLabelSync";

type Geo = {
  lat: number;
  lon: number;
  cityEn: string;
  cityLabel?: string;
  country: string;
};

const parseGeo = (raw?: string): Geo | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Geo;
  } catch {
    return null;
  }
};

export default async function Page() {
  const c = await cookies();

  const deviceType = (await cookies()).get(USER_AGENT)?.value;

  const latest = parseGeo(c.get(LATEST_CITY)?.value);
  const first = parseGeo(c.get(FIRST_CITY)?.value);

  const geo: Geo = latest ??
    first ?? {
      lat: CITIES[0].lat,
      lon: CITIES[0].lon,
      cityEn: CITIES[0].id,
      country: CITIES[0].iso2,
    };

  const isFirstEnter = !latest;
  const city = geo.cityLabel || geo.cityEn || "";

  let weather: WeatherForecastData | null = null;
  try {
    weather = await fetchForecast({ lat: geo.lat, lon: geo.lon });
  } catch (e) {
    console.error("forecast failed (server):", e);
  }

  if (!weather) return null;

  if (deviceType === "mobile") {
    return (
      <>
        <CityLabelSync geo={geo} hasLatest={!!latest} />
        <WeatherPageMobile
          weather={weather}
          lat={geo.lat}
          lon={geo.lon}
          city={city}
          isFirstEnter={isFirstEnter}
        />
      </>
    );
  }

  return (
    <>
      <CityLabelSync geo={geo} hasLatest={!!latest} />
      <WeatherPage
        weather={weather}
        lat={geo.lat}
        lon={geo.lon}
        city={city}
        country={geo.country}
        isFirstEnter={isFirstEnter}
      />
      <HomeDesktopFooter />
    </>
  );
}
