"use client";

import React, {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  isMobile?: boolean;
  ref: RefObject<HTMLHeadingElement>;
};

const GEO_TIMEOUT = 10_000;

export default function AllowGeolocationPanel({
  isFirstEnter,
  isMobile = false,
  ref,
}: AllowGeolocationPanelProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isPanelOpen, setPanelOpen] = useState(isFirstEnter);
  const [isRejected, setIsRejected] = useState(false);

  const [position, setPosition] = useState(0);

  const [userAgent, setUserAgent] = useState(null);

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

    if (ref && ref.current) {
      document.documentElement.style.setProperty(
        "--panel-height",
        `${ref.current.getBoundingClientRect().height}px`,
      );
    }

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    setUserAgent({ isStandalone, isIOS, isAndroid });

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

        router.push(`/погода/${name}/${lat}/${lon}`);
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
          "relative mb-4 flex h-fit w-fit flex-col items-center rounded-3xl bg-white/3 text-white outline-2 outline-white/10 duration-500",
          "after:absolute after:-bottom-[15px] after:h-0 after:w-0 after:border-t-[15px] after:border-r-[7.5px] after:border-l-[7.5px] after:border-white/20 after:border-r-transparent after:border-l-transparent",
          isPanelOpen ? "block" : "hidden",
          isMobile
            ? `h-fit px-4 py-2`
            : "left-0 w-[115%] -translate-x-[7%] py-2",
        )}
      >
        <h2 className={cx("relative z-1 h-fit", !isMobile && "leading-1")}>
          <Trans
            i18nKey="missedCity.title"
            components={[
              <button
                key="geo-now"
                type="button"
                onClick={requestGeolocation}
                className="relative z-50 cursor-pointer font-bold"
              />,
            ]}
          />
        </h2>

        <div
          className={cx(
            "z-50 mt-2 flex w-full items-center justify-center gap-4 transition-opacity duration-500",
            isRejected
              ? "relative opacity-100"
              : "pointer-events-none absolute opacity-0",
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

        {!isMobile && (
          <>
            <div className="border-deep-indigo/20 absolute top-0 z-10 h-0 w-0 -translate-y-full border-r-[10px] border-b-[20px] border-l-[10px] border-r-transparent border-l-transparent mix-blend-soft-light contrast-200" />
            <div className="bg-deep-indigo/20 absolute top-0 z-10 flex h-full min-h-8 w-full items-center justify-center rounded-3xl mix-blend-soft-light contrast-200" />
          </>
        )}
      </motion.div>

      <dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="geo-title"
        aria-describedby="geo-desc"
      >
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black/40 text-white backdrop-blur-xs duration-300">
          <div
            className={cx(
              "relative flex h-fit flex-col items-center overflow-hidden rounded-3xl",
              isMobile ? "m-4 w-full p-4" : "w-[564px]",
            )}
          >
            <Image
              src="/shared/allow-location.jpg"
              alt=""
              width={564}
              height={349}
              className={cx(
                "relative overflow-hidden shadow-[0_0_120px_oklch(0.4436_0.1852_296.43_/_60%)]",
                isMobile && "hidden",
              )}
              priority={false}
            />
            <div
              className={cx(
                "relative grid h-fit w-full grid-rows-[auto_auto] rounded-2xl bg-gradient-to-r from-[#272E68] to-[#444C8D]/60 p-4 px-12",
                !isMobile && "rounded-t-none",
              )}
            >
              <h2 id="geo-title" className="sr-only">
                {t("missedCity.titlePlain")}
              </h2>
              <p id="geo-desc" className="mb-4 text-center text-lg">
                {userAgent?.isStandalone && t("missedCity.standalone")}
                {userAgent?.isIOS && t("missedCity.ios")}
                {userAgent?.isAndroid && t("missedCity.android")}
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
