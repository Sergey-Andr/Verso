"use client";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { HUNDRED_YEARS_STORE } from "@/constants";
import { getOptions } from "./i18n.setting";
import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";

i18n
  .use(initReactI18next)
  .use(resourcesToBackend((lng) => import(`@/locales/${lng}/translation.json`)))
  .init({
    ...getOptions(),
    detection: {
      order: ["cookie", "localStorage"],
      caches: ["cookie", "localStorage"],
      lookupCookie: DEFAULT_LANG_STORE_NAME,
      lookupLocalStorage: DEFAULT_LANG_STORE_NAME,
      cookieOptions: {
        path: "/",
        maxAge: HUNDRED_YEARS_STORE,
      },
    },
  });

export default i18n;
