import Image from "next/image";
import React, { ReactNode } from "react";
import ScreenScalar from "@/app/(pages)/Home/components/desktop/ScreenScalar";
import "./globals.css";
import { cookies, headers } from "next/headers";
import { useTranslation } from "@/../i18n.server";
import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";
import { Metadata, Viewport } from "next";
import uk from "@/locales/uk/translation.json";
import ru from "@/locales/ru/translation.json";
import Provider from "@/provider";
import { ResourcesOptions } from "@/types/i18n";
import cx from "clsx";
import Script from "next/script";
import { userAgent } from "next/server";
import localFont from "next/font/local";

const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter-thin.woff2",
      weight: "100",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-semiBold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  preload: true,
  variable: "--font-inter",
  fallback: ["system-ui", "Arial"],
});

export const generateViewport = (): Viewport => {
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  };
};

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await useTranslation();
  return {
    title: "Verso",
    description: t("root.description"),
    icons: {
      icon: [{ url: "/logo.png" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
    verification: { google: "xabuFThnzUvomzslN4oDvdyvBKzWhRyUs0_GyVzKK1g" },
  };
}

const resources: ResourcesOptions = {
  uk: {
    translation: uk,
  },
  ru: {
    translation: ru,
  },
};

function detectDeviceType(h: Headers) {
  const ch = h.get("sec-ch-ua-mobile");
  const ua = userAgent({ headers: h });
  const chMobile =
    ch && (ch.includes("?1") || ch === "1")
      ? true
      : ch && (ch.includes("?0") || ch === "0")
        ? false
        : undefined;
  const uaMobile =
    ua.device.type === "mobile" ||
    ua.device.type === "tablet" ||
    /Mobile|Android|iPhone|iPad|iPod/i.test(ua.ua);
  return (chMobile ?? uaMobile) ? "mobile" : "desktop";
}

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const lng = (await cookies()).get(DEFAULT_LANG_STORE_NAME)?.value || "uk";
  await useTranslation();
  const h = await headers();
  const deviceType = detectDeviceType(h);

  return (
    <html
      lang={lng}
      dir="ltr"
      className={cx("main-content h-full w-full", inter.variable)}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
    >
      {deviceType === "desktop" ? (
        <>
          <body>
            <div
              id="main-wrapper"
              className={cx(
                `fixed isolate flex h-[1080px] w-[1920px] flex-col overflow-hidden p-16 font-[inter] antialiased`,
              )}
            >
              <Image
                className="bg-soft-purple absolute top-0 left-0 -z-2 h-[115.75rem] w-[267.875rem] max-w-none -translate-x-2/12 -translate-y-1/3 opacity-10"
                src="/background/bg-filter.svg"
                alt=""
                width={4286}
                height={1852}
                priority
              />
              <Image
                className="absolute top-0 left-0 -z-3 h-full w-full object-cover contrast-115"
                src="/background/v1.jpg"
                alt=""
                fill
                priority
                placeholder="blur"
                blurDataURL="/background/blurred-night-sky.jpg"
              />
              <Provider
                locale={lng}
                resources={resources}
                deviceType={deviceType}
              >
                {children}
              </Provider>
            </div>
            <ScreenScalar />
            <Script id="force-manifest" strategy="beforeInteractive">
              {`
              (function(){
                var h = document.head, b = document.body;
                var inHead = h.querySelector('link[rel="manifest"]');
                var inBody = b.querySelector('link[rel="manifest"]');
                if (!inHead && inBody) h.appendChild(inBody);
                if (!inHead && !inBody) {
                  var l = document.createElement('link');
                  l.rel = 'manifest';
                  l.href = '/manifest.webmanifest';
                  h.appendChild(l);
                }
                b.querySelectorAll('link[rel="manifest"]').forEach(function(n){
                  if (n.parentElement === b) n.remove();
                });
              })();
            `}
            </Script>
          </body>
        </>
      ) : (
        <body className="h-full w-full">
          <Image
            className="absolute top-0 left-0 -z-3 h-full w-full object-cover"
            src="/background/bg-night-sky.mobile.jpg"
            alt=""
            fill
            priority
            placeholder="blur"
            blurDataURL="/background/blurred-night-sky.mobile.jpg"
          />
          <Provider locale={lng} resources={resources} deviceType={deviceType}>
            {children}
          </Provider>
          <Script id="force-manifest" strategy="beforeInteractive">
            {`
            (function(){
              var h = document.head, b = document.body;
              var inHead = h.querySelector('link[rel="manifest"]');
              var inBody = b.querySelector('link[rel="manifest"]');
              if (!inHead && inBody) h.appendChild(inBody);
              if (!inHead && !inBody) {
                var l = document.createElement('link');
                l.rel = 'manifest';
                l.href = '/manifest.webmanifest';
                h.appendChild(l);
              }
              b.querySelectorAll('link[rel="manifest"]').forEach(function(n){
                if (n.parentElement === b) n.remove();
              });
            })();
          `}
          </Script>
        </body>
      )}
    </html>
  );
}
