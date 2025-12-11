import { CITIES } from "@/constants/apiRequests";
import { FIRST_CITY } from "@/constants";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { useTranslation } from "@/../i18n.server";
import { countryName } from "@/constants/countries";

const fetchUserGeolocation = async (req: NextRequest) => {
  const cookie = await cookies();
  const existingCookie = cookie.get(FIRST_CITY)?.value;
  if (existingCookie) return;

  const headers = new Headers();
  if (process.env.NODE_ENV !== "production")
    headers.set("x-forwarded-for", "91.215.68.156");

  try {
    const response = await fetch(new URL("/api/geolocation", req.url), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    if (data.status !== "success")
      throw new Error(`API error: ${data.message || "status is not success"}`);

    const { i18n } = await useTranslation();
    setGeolocation({
      data: {
        ...data,
        country: await countryName(data.country, i18n.language),
      },
      cookie,
    });
  } catch (error) {
    console.error("Geolocation fetch failed, using fallback:", error);
    setGeolocation({
      data: {
        lat: CITIES[0].lat,
        lon: CITIES[0].lon,
        cityEn: CITIES[0].id,
        country: CITIES[0].iso2,
      },
      cookie,
    });
  }
};

export default fetchUserGeolocation;

async function setGeolocation({ data, cookie }) {
  const { lat, lon, cityEn, country } = data;
  cookie.set(FIRST_CITY, JSON.stringify({ lat, lon, cityEn, country }), {
    maxAge: 365 * 24 * 60 * 60,
  });
}
