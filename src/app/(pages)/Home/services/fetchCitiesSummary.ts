import { CitiesSummary } from "@/app/(pages)/Home/types/citiesSummary";
import { CITIES } from "@/constants/apiRequests";

export async function fetchCitiesSummary(
  language: string,
): Promise<CitiesSummary> {
  const res = await fetch("/api/cities/summary", {
    method: "POST",
    body: JSON.stringify({ cities: CITIES, language }),
  });
  const { body } = await res.json();
  return body;
}
