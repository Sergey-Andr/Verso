import { fetchDetailedSummary } from "@/services/forecast";
import { countryName } from "@/constants/countries";
import { useTranslation } from "@/../i18n.server";

export async function POST(req) {
  const { t } = await useTranslation();
  let { cities, language } = await req.json();
  const results = [];
  const batchSize = 5;

  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (city) => {
        try {
          const details = await fetchDetailedSummary({
            lat: city.lat,
            lon: city.lon,
            city: city.id,
          });

          const country = await countryName(city.iso2, language);
          return { ...details, country, city: t(`cities.${city.id}`) };
        } catch (error) {
          console.error(error);
          return { city: city.id, error: true };
        }
      }),
    );
    results.push(...batchResults);

    if (i + batchSize < cities.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  return new Response(JSON.stringify({ body: results }), {
    headers: { "Content-Type": "application/json" },
  });
}
