"use client";

import React, {
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "clsx";
import { Trans, useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { fetchCityByCords } from "@/services/geolocation";
import { getCookie, setCookie } from "@/utils/store";
import { LATEST_CITY } from "@/constants";

type AllowGeolocationPanelProps = {
  isFirstEnter: boolean;
  isMobile?: boolean;
  ref: RefObject<HTMLHeadingElement>;
};

const getSteps = ({ userAgent, t }) => {
  const platform = userAgent?.isPC ? "desktop" : "mobile";
  const os = userAgent?.isPC
    ? userAgent?.isWindows
      ? "windows"
      : userAgent?.isMac
        ? "mac"
        : "linux"
    : userAgent?.isIOS
      ? "ios"
      : "android";
  const mode = userAgent?.isStandalone ? "standalone" : "browser";
  const key = `missedCity.groups.${platform}.${os}.${mode}.steps`;

  return {
    steps: t(key, { returnObjects: true }) as string[],
    stepsKey: key,
  };
};

const GEO_TIMEOUT = 10_000;

export default function AllowGeolocationPanel({
  isFirstEnter,
  isMobile = false,
  ref,
}: AllowGeolocationPanelProps) {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const [isPanelOpen, setPanelOpen] = useState(
    isFirstEnter && !getCookie("isRejected"),
  );
  const [isRejected, setIsRejected] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);

  const geoSupported =
    typeof window !== "undefined" && "geolocation" in navigator;
  const isSecure = typeof window !== "undefined" && window.isSecureContext;

  const getFocusable = () => {
    const dlg = dialogRef.current;
    if (!dlg) return [];
    return Array.from(
      dlg.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.closest("[inert]"));
  };

  const handleDialogKeyDown = (e: React.KeyboardEvent<HTMLDialogElement>) => {
    if (e.key !== "Tab") return;
    const focusable = getFocusable();
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      if (dlg.open) dlg.close();
      openerRef.current?.focus();
    };
    dlg.addEventListener("cancel", onCancel);

    if (!ref || !ref.current) return;

    const ro = new ResizeObserver(([entry]) => {
      document.documentElement.style.setProperty(
        "--panel-height",
        `${entry.contentRect.height}px`,
      );
    });
    ro.observe(ref.current);

    return () => {
      dlg.removeEventListener("cancel", onCancel);
      ro.disconnect();
    };
  }, []);

  const { steps, stepsKey } = useMemo(() => {
    const ua = navigator.userAgent;

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && (navigator as any).standalone === true);

    const isIPadOS =
      /Macintosh/i.test(ua) &&
      navigator.maxTouchPoints &&
      navigator.maxTouchPoints > 1;

    const isIOS = /iPad|iPhone|iPod/i.test(ua) || isIPadOS;
    const isAndroid = /Android/i.test(ua);

    const platformData = (navigator as any).userAgentData?.platform;
    const isWindows = platformData === "Windows" || /Windows/i.test(ua);
    const isMac =
      (platformData === "macOS" || /Macintosh|Mac OS X/i.test(ua)) && !isIPadOS;

    const isPC = !isAndroid && !isIOS;

    return getSteps({
      userAgent: { isPC, isWindows, isMac, isIOS, isStandalone },
      t,
    });
  }, [i18n.language]);

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
      if (ref.current) ref.current.dataset.isRejected = "true";
      return;
    }

    setIsLocating(true);

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
        setIsLocating(false);
        setIsRejected(true);
      }
    };

    const onError = (error: GeolocationPositionError) => {
      console.error("geolocation error", error);
      setIsLocating(false);
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
      setIsLocating(false);
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

  const handleDismiss = () => {
    dialogRef.current?.close();
    openerRef.current?.focus();
    setPanelOpen(false);
    setCookie("isRejected", "true");
  };

  return (
    <>
      <div
        role="region"
        aria-label={t("missedCity.panelLabel")}
        aria-live="polite"
        className={cx(
          "panel-enter relative flex h-fit w-fit flex-col items-center rounded-3xl bg-white/3 px-4 py-2 text-white outline-2 outline-white/10 duration-500",
          "after:absolute after:h-0 after:w-0 after:border-white/20 after:border-r-transparent after:border-l-transparent",
          isPanelOpen ? "block" : "hidden",
          isMobile
            ? "mb-4 after:-bottom-[15px] after:border-t-[15px] after:border-r-[7.5px] after:border-l-[7.5px]"
            : "z-10 mt-4 after:-top-[15px] after:border-r-[7.5px] after:border-b-[15px] after:border-l-[7.5px]",
        )}
      >
        <p role="heading" aria-level={3} className="relative z-1 h-fit">
          <Trans
            i18nKey="missedCity.title"
            components={[
              <button
                key="geo-now"
                type="button"
                aria-label={t("missedCity.geoButtonLabel")}
                onClick={requestGeolocation}
                className="relative z-50 cursor-pointer font-bold"
              />,
            ]}
          />
        </p>

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
      </div>

      <dialog
        ref={dialogRef}
        aria-modal="true"
        aria-labelledby="geo-title"
        aria-describedby="geo-desc"
        onKeyDown={handleDialogKeyDown}
      >
        <div className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black/40 text-white backdrop-blur-xs duration-300">
          <div
            className={cx(
              "relative flex h-fit w-fit flex-col gap-4 rounded-3xl bg-gradient-to-b from-[#1e1a40] to-[#161230] p-6 shadow-[0_0_80px_oklch(0.4436_0.1852_296.43_/_40%)]",
              isMobile ? "m-4 w-full" : "w-[420px]",
            )}
          >
            <div className="flex items-start gap-3">
              {/* aria-hidden: декоративный эмодзи, AT не должен его читать */}
              <span
                aria-hidden="true"
                className="mt-0.5 text-base leading-none"
              >
                📍
              </span>
              <div className="flex flex-col gap-1">
                <p
                  id="geo-title"
                  className="text-base font-semibold text-white"
                >
                  {t("missedCity.titlePlain")}
                </p>
                <p id="geo-desc" className="text-sm text-white/50">
                  {t("missedCity.deniedDesc")}
                </p>
              </div>
            </div>

            <ol className="flex list-none flex-col gap-2 rounded-xl bg-white/5 p-3">
              {steps?.map((_, i) => (
                <li
                  key={i}
                  className="flex flex-wrap items-center gap-1.5 text-sm text-white/80"
                >
                  {/*
                    aria-hidden: визуальный разделитель ↓ между шагами.
                    AT уже понимает порядок через ol — символ избыточен.
                  */}
                  {i > 0 && (
                    <span aria-hidden="true" className="text-white/30">
                      ↓
                    </span>
                  )}
                  <Trans
                    i18nKey={`${stepsKey}.${i}`}
                    components={[
                      <span
                        key={`${stepsKey}.${i}`}
                        className="rounded-sm bg-white/10 px-1 text-white/70"
                      />,
                    ]}
                  />
                </li>
              ))}
            </ol>

            <div className="flex gap-2">
              <button
                type="button"
                aria-label={t("missedCity.okButtonLabel")}
                aria-describedby="geo-desc"
                aria-busy={isLocating}
                disabled={isLocating}
                data-autofocus
                onClick={handleOkClick}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white duration-200 hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60"
              >
                {isLocating ? t("missedCity.locating") : "OK"}
              </button>
              <button
                type="button"
                aria-label={t("missedCity.hideButtonLabel")}
                onClick={handleDismiss}
                className="flex flex-1 cursor-pointer items-center justify-center rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white/70 duration-200 hover:bg-white/5"
              >
                {t("missedCity.hide")}
              </button>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
