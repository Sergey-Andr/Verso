"use client";
import { useTranslation } from "react-i18next";
import "moment/locale/uk";
import "moment/locale/ru";

export function MomentLocaleBridge(lang: "ru" | "uk") {
  const { i18n } = useTranslation();

  return null;
}
