import React, { ReactNode } from "react";
import { Metadata } from "next";
import { useTranslation } from "../../../i18n.server";
import {
  CONTACT_EMAIL,
  DATA_CONTROLLER_NAME,
  GEOCODING_PROVIDER,
  HOSTING_PROVIDER,
  LOGS_RETENTION_DAYS,
  PRIVACY_LAST_UPDATED,
  SERVICE_NAME,
  WEATHER_DATA_PROVIDER,
} from "@/app/privacy/constants";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { PREV_PATH } from "@/constants";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await useTranslation();

  return {
    title: t("privacy.meta.title", { service_name: SERVICE_NAME }),
    description: t("privacy.meta.description", { service_name: SERVICE_NAME }),
    icons: {
      icon: [{ url: "/logo.png" }],
      apple: [{ url: "/web-app-manifest-192x192.png" }],
    },
    manifest: "/manifest.webmanifest",
    verification: { google: "xabuFThnzUvomzslN4oDvdyvBKzWhRyUs0_GyVzKK1g" },
  };
}

export default async function PrivacyLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { t } = await useTranslation();
  const header = await headers();
  const cookie = await cookies();
  const deviceType = /Mobile|Android|iPhone|iPad|iPod/i.test(
    header.get("user-agent") ?? "",
  )
    ? "mobile"
    : "desktop";

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SERVICE_NAME,
    email: SERVICE_NAME,
  };

  const referer = header.get("referer");
  const refererPath = referer ? new URL(referer).pathname : null;

  const prevPath = cookie.get(PREV_PATH)?.value;
  const redirectTo =
    refererPath === "/privacy"
      ? (prevPath ?? "/")
      : (refererPath ?? prevPath ?? "/");

  return (
    <main className="h-fit w-full">
      <div className="relative mx-auto max-w-3xl">
        <div
          className="from-deep-indigo to-charcoal-indigo absolute inset-0 isolate -z-1 h-full w-full scale-x-105 rounded-xl bg-linear-145"
          aria-hidden
        />
        <div
          className="bg-soft-purple/10 will-change-filter absolute inset-0 isolate -z-1 h-full w-full scale-x-105 rounded-xl blur-3xl"
          aria-hidden
        />
        <div
          className="to-soft-purple/20 absolute inset-0 isolate -z-1 h-full w-full scale-x-105 rounded-xl bg-gradient-to-b from-transparent from-50%"
          aria-hidden
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />

        <div className="h-screen w-full overflow-y-auto px-4 py-8 text-white">
          <header className="mb-8">
            {deviceType === "mobile" ? (
              <div className="relative z-50 mb-10 flex h-fit w-fit">
                <Link
                  href={redirectTo}
                  aria-label={t("header.settings.close")}
                  className="mr-4 flex cursor-pointer items-center"
                >
                  <Image
                    src="/shared/chevron.mobile.svg"
                    alt=""
                    aria-hidden
                    width={40}
                    height={40}
                    className="rotate-90 opacity-40"
                  />
                  <p className="h-fit w-fit text-2xl">Verso</p>
                </Link>
              </div>
            ) : null}
            <h1 id="privacy-title" className="mb-3 text-3xl font-semibold">
              {t("privacy.meta.title", { service_name: SERVICE_NAME })}
            </h1>
            <p className="text-white/70">
              {t("privacy.updated", { date: PRIVACY_LAST_UPDATED })}
            </p>
          </header>

          <section className="mb-10" aria-labelledby="who-we-are">
            <h2 id="who-we-are" className="mb-3 text-2xl font-semibold">
              {t("privacy.who_we_are.title")}
            </h2>
            <p className="mb-2">
              {t("privacy.who_we_are.intro", {
                service_name: SERVICE_NAME,
                owner: DATA_CONTROLLER_NAME,
              })}
            </p>
            <p className="mb-1">
              {t("privacy.who_we_are.contact", {
                contact_email: CONTACT_EMAIL,
              })}
            </p>
            <p>{t("privacy.who_we_are.minimal")}</p>
          </section>

          <section className="mb-10" aria-labelledby="data_we_process">
            <h2 id="data_we_process" className="mb-3 text-2xl font-semibold">
              {t("privacy.data_we_process.title")}
            </h2>
            <ul className="mb-2 space-y-3">
              <li>
                <strong>{t("privacy.data_we_process.ip")}</strong>
              </li>
              <li>
                <strong>{t("privacy.data_we_process.geolocation")}</strong>
              </li>
              <li>
                <strong>{t("privacy.data_we_process.device")}</strong>
              </li>
            </ul>
            <p>{t("privacy.data_we_process.no_marketing")}</p>
          </section>

          <section className="mb-10" aria-labelledby="purposes">
            <h2 id="purposes" className="mb-3 text-2xl font-semibold">
              {t("privacy.purposes.title")}
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>{t("privacy.purposes.p1")}</li>
              <li>{t("privacy.purposes.p2")}</li>
              <li>{t("privacy.purposes.p3")}</li>
            </ul>
          </section>

          <section className="mb-10" aria-labelledby="cookies">
            <h2 id="cookies" className="mb-3 text-2xl font-semibold">
              {t("privacy.legal_basis.title")}
            </h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>{t("privacy.legal_basis.consent")}</li>
              <li>{t("privacy.legal_basis.legitimate_interest")}</li>
              <li>{t("privacy.legal_basis.note")}</li>
            </ul>
          </section>

          <section className="mb-10" aria-labelledby="">
            <h2 id="" className="mb-3 text-2xl font-semibold">
              {t("privacy.cookies.title")}
            </h2>
            <ul className="space-y-2">
              <li>
                <strong>{t("privacy.cookies.functional_only")}</strong>
              </li>
              <li>
                <strong>{t("privacy.cookies.examples")}</strong>
              </li>
              <li>
                <strong>{t("privacy.cookies.local")}</strong>
              </li>
              <li>
                <strong>{t("privacy.cookies.no_marketing")}</strong>
              </li>
            </ul>
          </section>

          <section className="mb-10" aria-labelledby="sharing">
            <h2 id="sharing" className="mb-3 text-2xl font-semibold">
              {t("privacy.sharing.title")}
            </h2>
            <ul className="mb-2 list-disc space-y-2 pl-6">
              <li>
                <strong>{t("privacy.sharing.hosting_label")}:</strong>&nbsp;
                {t("privacy.sharing.hosting_text", {
                  hosting_provider: HOSTING_PROVIDER,
                })}
              </li>
              <li>
                <strong>
                  {t("privacy.sharing.providers_label", {
                    weather_provider: WEATHER_DATA_PROVIDER,
                    geocoding_provider: GEOCODING_PROVIDER,
                  })}
                </strong>
              </li>
            </ul>
            <p className="mb-2">{t("privacy.sharing.scope_note")}</p>
            <p>{t("privacy.sharing.no_sale")}</p>
          </section>

          <section className="mb-10" aria-labelledby="intl_transfers">
            <h2 id="intl_transfers" className="mb-3 text-2xl font-semibold">
              {t("privacy.intl_transfers.title")}
            </h2>
            <p>{t("privacy.intl_transfers.text")}</p>
          </section>

          <section className="mb-10" aria-labelledby="retention">
            <h2 id="retention" className="mb-3 text-2xl font-semibold">
              {t("privacy.retention.title")}
            </h2>
            <ul className="mb-2 list-disc space-y-2 pl-6">
              <li>
                {t("privacy.retention.ip", {
                  logs_retention_days: LOGS_RETENTION_DAYS,
                })}
              </li>
              <li>{t("privacy.retention.geo")}</li>
              <li>{t("privacy.retention.device")}</li>
            </ul>
          </section>

          <section className="mb-10" aria-labelledby="rights">
            <h2 id="rights" className="mb-3 text-2xl font-semibold">
              {t("privacy.rights.title")}
            </h2>
            <p className="mb-2">{t("privacy.rights.intro")}</p>
            <ul className="list-disc space-y-2 pl-6">
              <li>{t("privacy.rights.r1")}</li>
              <li>{t("privacy.rights.r2")}</li>
              <li>{t("privacy.rights.r3")}</li>
              <li>{t("privacy.rights.r4")}</li>
              <li>{t("privacy.rights.r5")}</li>
            </ul>
            <p>
              {t("privacy.rights.contact", { contact_email: CONTACT_EMAIL })}
            </p>
          </section>

          <section className="mb-2" aria-labelledby="security">
            <h2 id="security" className="mb-3 text-2xl font-semibold">
              {t("privacy.security.title")}
            </h2>
            <p>{t("privacy.security.text")}</p>
          </section>

          <section className="mb-2" aria-labelledby="changes">
            <h2 id="changes" className="mb-3 text-2xl font-semibold">
              {t("privacy.changes.title")}
            </h2>
            <p>{t("privacy.changes.text")}</p>
          </section>
        </div>
      </div>
    </main>
  );
}
