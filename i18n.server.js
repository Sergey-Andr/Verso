import { createInstance } from "i18next";
import { cookies } from "next/headers";
import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";
import resourcesToBackend from "i18next-resources-to-backend";
import { getOptions } from "./i18n.setting";

const initI18next = async (lng) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(
      resourcesToBackend((lng) => import(`@/locales/${lng}/translation.json`)),
    )
    .init(getOptions(lng));
  return i18nInstance;
};

export async function useTranslation(options = {}) {
  const lng =
    (await cookies()).get(DEFAULT_LANG_STORE_NAME)?.value ||
    getOptions().fallbackLng;
  const i18nInstance = await initI18next(lng);
  return {
    t: i18nInstance.getFixedT(lng, undefined, options?.keyPrefix),
    i18n: i18nInstance,
  };
}
