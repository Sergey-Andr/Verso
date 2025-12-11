import { LocationResult } from "@/types/geolocation";
import { shouldTranslate } from "@/app/(components)/SearchCity";

function detectQueryLang(q: string): "uk" | "ru" | "en" | null {
  const s = q.toLowerCase();
  if (/[a-z]/.test(s)) return "en";
  if (/[ґєії]/.test(s)) return "uk";
  if (/[ёыэъ]/.test(s)) return "ru";
  if (/[а-я]/.test(s)) return "ru";
  return null;
}

async function normalizeNameToLang(
  name: string,
  lang: string,
  signal?: AbortSignal,
): Promise<string> {
  const detected = detectQueryLang(name);
  if (!detected || detected === lang) return name;

  const r = await fetch(
    `/api/normalize-city?name=${encodeURIComponent(name)}&lang=${lang}`,
    { method: "GET", cache: "no-store", signal },
  );
  if (!r.ok) return name;
  const { name: norm } = await r.json();
  return norm || name;
}

const weatherFn = async (
  name: string,
  lang: string,
  init?: RequestInit,
): Promise<Response> => {
  return fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      name,
    )}&count=10&language=${lang}&format=json`,
    {
      method: "GET",
      cache: "no-cache",
      ...init,
    },
  );
};

const EXCLUDED_COUNTRIES = ["RU", "BY", "AM", "KZ", "TJ", "UZ", "KG"];

export const findCitiesByName = async (
  name: string,
  lang: string,
  { signal }: { signal?: AbortSignal } = {},
): Promise<LocationResult[]> => {
  const q = await normalizeNameToLang(name, lang, signal);
  const resp = await weatherFn(q, lang, { signal });
  const data = resp.ok ? await resp.json() : { results: [] };
  return (data?.results ?? [])
    .filter(
      (city: LocationResult) => !EXCLUDED_COUNTRIES.includes(city.country_code),
    )
    .map((city: LocationResult) => {
      const needTranslate =
        shouldTranslate(city.name, lang) ||
        shouldTranslate(city.admin1, lang) ||
        shouldTranslate(city.admin2, lang) ||
        shouldTranslate(city.country, lang);
      return { ...city, needTranslate };
    });
};

export const fetchCityByCords = async ({
  lat,
  lon,
  lang,
}: {
  lat: number;
  lon: number;
  lang: string;
}) => {
  return await fetch(
    `/api/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}&lang=${lang}`,
    { method: "GET", cache: "no-store" },
  );
};
