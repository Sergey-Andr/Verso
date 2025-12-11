export type CitiesSummary = {
  city: string;
  lat: number;
  lon: number;
  weatherCode: number;
  tempMin: number;
  tempMax: number;
  temperature: number;
  country: string;
  needTranslate: boolean;
}[];
