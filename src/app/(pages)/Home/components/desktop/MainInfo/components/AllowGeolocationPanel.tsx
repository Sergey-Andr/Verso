"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import cx from "clsx";
import { Trans, useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { fetchCityByCords } from "@/services/geolocation";
import { setCookie } from "@/utils/store";
import { LATEST_CITY } from "@/constants";

type AllowGeolocationPanelProps = {
  isFirstEnter: boolean;
};

const GEO_TIMEOUT = 10_000;

export default function AllowGeolocationPanel({
  isFirstEnter,
}: AllowGeolocationPanelProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isPanelOpen, setPanelOpen] = useState(isFirstEnter);
  const [isRejected, setIsRejected] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const geoSupported =
    typeof window !== "undefined" && "geolocation" in navigator;
  const isSecure = typeof window !== "undefined" && window.isSecureContext;

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (dlg.open) dlg.close();
      openerRef.current?.focus();
    };
    dlg.addEventListener("cancel", onCancel);

    return () => dlg.removeEventListener("cancel", onCancel);
  }, []);

  const getGeoPermission = useCallback(async () => {
    try {
      const st = await navigator.permissions?.query?.({ name: "geolocation" });
      return (st?.state ?? "unknown") as
        | "granted"
        | "denied"
        | "prompt"
        | "unknown";
    } catch {
      return "unknown";
    }
  }, []);

  const requestGeolocation = useCallback(async () => {
    if (!isSecure || !geoSupported) {
      console.warn("Geolocation unsupported or insecure context");
      setIsRejected(true);
      return;
    }

    const perm = await getGeoPermission();
    if (perm === "denied") {
      setIsRejected(true);
      return;
    }

    const onSuccess = async (position: GeolocationPosition) => {
      try {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        const resp = await fetchCityByCords({ lat, lon, lang: i18n.language });
        if (!resp.ok) throw new Error(`reverse-geocode ${resp.status}`);
        const { name, country } = await resp.json();

        setCookie(
          LATEST_CITY,
          JSON.stringify({ lat, lon, cityLabel: name, country }),
        );

        router.push(`/погода/${name}/${country}/${lat}/${lon}`);
      } catch (err) {
        console.error("Failed to resolve city by coordinates", err);
        setIsRejected(true);
      }
    };

    const onError = (error: GeolocationPositionError) => {
      console.error("geolocation error", error);
      setIsRejected(true);
    };

    try {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        maximumAge: 60_000,
        timeout: GEO_TIMEOUT,
        enableHighAccuracy: false,
      });
    } catch (e) {
      console.error("Geolocation call failed", e);
      setIsRejected(true);
    }
  }, [geoSupported, isSecure, getGeoPermission, i18n.language, router]);

  const handleDialogOpen = (e: React.MouseEvent<HTMLButtonElement>) => {
    openerRef.current = e.currentTarget;
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (!dlg.open) {
      dlg.showModal();
      requestAnimationFrame(() => {
        dlg.querySelector<HTMLButtonElement>("[data-autofocus]")?.focus();
      });
    }
  };

  const handleOkClick = () => {
    requestGeolocation();
    setTimeout(() => {
      const dlg = dialogRef.current;
      if (dlg?.open) dlg.close();
      openerRef.current?.focus();
    }, 0);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className={cx(
          "absolute -bottom-0 left-0 flex w-[115%] -translate-x-[7%] flex-col items-center py-2 duration-500",
          isPanelOpen ? "block" : "hidden",
          isRejected
            ? "h-24 translate-y-[120%] justify-center"
            : "h-11 translate-y-[135%]",
        )}
      >
        <h2 className="h-fit leading-1">
          <Trans
            i18nKey="missedCity.title"
            components={[
              <button
                key="geo-now"
                type="button"
                onClick={requestGeolocation}
                className="relative z-50 cursor-pointer py-4 font-bold"
              />,
            ]}
          />
        </h2>

        <div
          className={cx(
            "relative z-50 mt-2 flex w-full items-center justify-center gap-4 transition-opacity duration-500",
            isRejected ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            onClick={handleDialogOpen}
            className="flex w-5/12 cursor-pointer items-center justify-center rounded-xl border border-white/40 bg-white/5 p-2 px-4 duration-300 hover:bg-white/10"
          >
            {t("missedCity.retry")}
          </button>
          <button
            type="button"
            onClick={() => setPanelOpen(false)}
            className="flex w-5/12 cursor-pointer items-center justify-center rounded-xl border border-white/40 bg-white/5 p-2 px-4 duration-300 hover:bg-white/10"
          >
            {t("missedCity.hide")}
          </button>
        </div>

        <div className="border-deep-indigo/20 absolute top-0 z-10 h-0 w-0 -translate-y-full border-r-[10px] border-b-[20px] border-l-[10px] border-r-transparent border-l-transparent mix-blend-soft-light contrast-200" />
        <div className="bg-deep-indigo/20 absolute top-0 z-10 flex h-full min-h-8 w-full items-center justify-center rounded-3xl mix-blend-soft-light contrast-200" />
      </motion.div>

      <dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="geo-title"
        aria-describedby="geo-desc"
      >
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center backdrop-blur-xs duration-300">
          <div className="relative flex h-fit w-[564px] flex-col items-center overflow-hidden rounded-3xl">
            <Image
              src="/shared/allow-location.jpg"
              alt=""
              width={564}
              height={349}
              className="relative overflow-hidden shadow-[0_0_120px_oklch(0.4436_0.1852_296.43_/_60%)]"
              priority={false}
            />
            <div className="relative grid h-fit w-full grid-rows-[auto_auto] rounded-2xl rounded-t-none bg-gradient-to-r from-[#272E68] to-[#444C8D]/60 p-4 px-12">
              <h2 id="geo-title" className="sr-only">
                {t("missedCity.titlePlain")}
              </h2>
              <p id="geo-desc" className="mb-4 text-center text-lg text-white">
                {t("missedCity.description")}
              </p>
              <button
                type="button"
                data-autofocus
                onClick={handleOkClick}
                className="relative flex h-fit w-full cursor-pointer justify-center self-start rounded-xl border border-white/40 bg-white/10 p-2 px-4 text-white duration-300 hover:bg-white/20"
              >
                <span className="relative z-10">OK</span>
                <div className="bg-violet absolute inset-0 z-1 h-8/12 w-14/12 -translate-x-1/12 rounded-full blur-2xl brightness-150" />
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
