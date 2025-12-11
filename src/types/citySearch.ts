export type PreparedCities = {
  lat: number;
  lon: number;
  city: string;
  country: string;
  admin: string;
  needTranslate?: boolean;
}[];
