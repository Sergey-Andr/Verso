export const fallbackLng = "uk";
export const languages = [fallbackLng, "ru"];

export function getOptions(lng = fallbackLng) {
  return {
    supportedLngs: languages,
    fallbackLng,
    lng,
    initImmediate: false,
  };
}
