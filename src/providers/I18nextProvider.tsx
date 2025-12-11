"use client";
import React, { useRef } from "react";
import { createInstance, i18n as I18nType } from "i18next";
import { I18nextProvider } from "react-i18next";
import resourcesToBackend from "i18next-resources-to-backend";

const I18nProvider = ({ children, locale, resources }) => {
  const i18nRef = useRef<I18nType>(null);

  if (!i18nRef.current) {
    const inst = createInstance();
    inst
      .use(
        resourcesToBackend(
          (lng) => import(`@/locales/${lng}/translation.json`),
        ),
      )
      .init({
        lng: locale,
        resources,
        fallbackLng: "uk",
        react: {
          useSuspense: false,
        },
      });

    i18nRef.current = inst;
  } else if (i18nRef.current.language !== locale) {
    i18nRef.current.changeLanguage(locale);
  }

  return <I18nextProvider i18n={i18nRef.current!}>{children}</I18nextProvider>;
};

export default I18nProvider;
