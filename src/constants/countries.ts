type RuUk = { ru: string; uk: string };
type CountryMap = Record<string, RuUk>;
const CIS_ISO2 = new Set(["RU", "BY", "AM", "AZ", "KZ", "KG", "TJ", "UZ"]);
let cache: CountryMap | null = null;
async function getIso2List(): Promise<string[]> {
  const intlAny = Intl as any;
  try {
    if (
      typeof intlAny.supportedValuesOf === "function" &&
      intlAny.supportedValuesOf("region")
    ) {
      return intlAny
        .supportedValuesOf("region")
        .filter((r: string) => /^[A-Z]{2}$/.test(r));
    }
  } catch {}
  return (await import("@/locales/iso2Fallback.json")).default;
}
export async function getCountryNames(): Promise<CountryMap> {
  if (cache) return cache;
  const regions = (await getIso2List()).filter((c) => !CIS_ISO2.has(c));
  const dnRu = new Intl.DisplayNames(["ru"], { type: "region" });
  const dnUk = new Intl.DisplayNames(["uk"], { type: "region" });
  cache = Object.fromEntries(
    regions.map((code) => [code, { ru: dnRu.of(code)!, uk: dnUk.of(code)! }]),
  ) as CountryMap;
  return cache;
}
export async function countryName(
  code: string,
  lang: "ru" | "uk" | string,
): Promise<string> {
  const map = await getCountryNames();
  return map[code]?.[lang] ?? code.toUpperCase();
}
