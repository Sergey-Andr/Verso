import React from "react";
import I18nProvider from "@/providers/I18nextProvider";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { ResourcesOptions } from "@/types/i18n";
import { PWAInstallProvider } from "@/providers/PWAInstallProvider";
import ScrollProvider from "@/providers/ScrollProvider";

type ProviderProps = {
  children: React.ReactNode;
  locale: string;
  resources: ResourcesOptions;
  deviceType: string;
};

const Provider = ({
  children,
  locale,
  resources,
  deviceType,
}: ProviderProps) => {
  let pageContent = children;

  if (deviceType !== "mobile") {
    pageContent = <ScrollProvider>{pageContent}</ScrollProvider>;
  }

  return (
    <I18nProvider locale={locale} resources={resources}>
      <PWAInstallProvider>{pageContent}</PWAInstallProvider>
    </I18nProvider>
  );
};

export default Provider;
