"use client";
import { useTranslation } from "react-i18next";
import "dayjs/locale/uk";
import "dayjs/locale/ru";

export function MomentLocaleBridge(lang: "ru" | "uk") {
  const { i18n } = useTranslation();

  return null;
}
