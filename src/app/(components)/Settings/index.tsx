import React, {
  memo,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import cx from "clsx";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import dayjs from "@/utils/dayjs";
import CloudsTrackAnimation from "@/app/(components)/Settings/components/CloudsTrackAnimation";
import Link from "next/link";
import Select from "@/app/(components)/Select";
import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";
import { TIMESTAMP } from "@/app/(pages)/Home/constants/shared";
import { usePWAInstall } from "@/providers/PWAInstallProvider";
import { setCookie } from "@/utils/store";
import { PREV_PATH } from "@/constants";
import { usePathname } from "next/navigation";

export const SHIFT_ANIMATION_THRESHOLD = 280;
export const HIDE_ANIMATION_THRESHOLD = 200;

type SettingsProps = {
  handleSettingsBtn: (open: boolean) => void;
  isSettingsOpen: boolean;
  isMobile?: boolean;
};

const focusablesSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const Settings = ({
  handleSettingsBtn,
  isSettingsOpen,
  isMobile = false,
}: SettingsProps) => {
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const pathnane = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const [isEnoughSpace, setIsEnoughSpace] = useState(true);
  const [shouldShiftAnimation, setShouldShiftAnimation] = useState(false);

  const [isIOSClicked, setIsIOSClicked] = useState(false);
  const { canInstall, install, isInstalled, isIOS } = usePWAInstall();

  const { language, timestamp } = useMemo(() => {
    return {
      language: [
        { label: "Українська", value: "uk" },
        { label: "Русский", value: "ru" },
      ],
      timestamp: [
        { label: dayjs().format("HH:mm"), value: "24" },
        { label: dayjs().locale("en").format("hh:mm A"), value: "12" },
      ],
    };
  }, [i18n.language]);

  useLayoutEffect(() => {
    const el = blocksRef.current;
    if (!el) return;
    const check = () => {
      const h = el.getBoundingClientRect().height;
      const offset = window.innerHeight - h;
      setShouldShiftAnimation(offset < SHIFT_ANIMATION_THRESHOLD);
      setIsEnoughSpace(offset >= HIDE_ANIMATION_THRESHOLD);
    };
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check, { passive: true });
    check();
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", check);
    };
  }, []);

  useEffect(() => {
    if (!isSettingsOpen) return;
    previouslyFocused.current = (document.activeElement as HTMLElement) ?? null;

    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const first =
      panelRef.current?.querySelector<HTMLElement>(focusablesSelector);
    first?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleSettingsBtn(false);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(focusablesSelector),
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      root.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [isSettingsOpen, handleSettingsBtn]);

  const onBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleSettingsBtn(false);
  };

  const handleLinkClick = () => {
    handleSettingsBtn(false);
  };

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cx(
        "absolute inset-0 isolate z-50 flex min-h-full min-w-full text-white duration-200 will-change-[opacity,scale]",
        isSettingsOpen
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0",
        isMobile ? "overflow-y-auto" : "overflow-hidden",
      )}
      onMouseDown={onBackdrop}
    >
      <div
        ref={panelRef}
        className="relative flex h-full min-h-fit w-full flex-col p-6"
        tabIndex={-1}
      >
        <div
          className="from-deep-indigo to-charcoal-indigo absolute inset-0 h-full w-full bg-linear-145"
          aria-hidden
        />
        <div
          className="bg-soft-purple/10 will-change-filter absolute inset-0 h-full w-full blur-3xl"
          aria-hidden
        />
        <div
          className="to-soft-purple/20 absolute inset-0 h-full w-full bg-gradient-to-b from-transparent from-50%"
          aria-hidden
        />
        <div
          className="bg-violet/35 will-change-filter absolute left-1/2 h-72 w-72 -translate-x-1/2 translate-y-1/6 rounded-full blur-3xl brightness-125"
          aria-hidden
        />
        <div ref={blocksRef}>
          <div className="relative z-50 mb-10 flex h-fit w-fit">
            <button
              type="button"
              aria-label={t("header.settings.close")}
              onClick={() => handleSettingsBtn(false)}
              className="h-8 w-8 before:absolute before:top-2 before:left-0 before:h-1 before:w-4 before:-rotate-45 before:bg-stone-400 after:absolute after:bottom-2.5 after:left-0 after:h-1 after:w-4 after:rotate-45 after:bg-stone-400"
            />
            <p className="ml-3 h-fit w-fit text-2xl">Verso</p>
          </div>

          <h2
            id={titleId}
            className="relative z-50 mb-6 w-full text-center text-sm tracking-[1px] text-white/75 uppercase"
          >
            {t("header.settings.label_settings")}
          </h2>

          <article
            className={cx(
              "relative mb-10 h-fit w-full p-4",
              "[&:has(li:last-child_button[aria-expanded='true'])>div]:rounded-b-none",
            )}
          >
            <div className="absolute inset-0 rounded-2xl border border-white bg-[#48319D]/20 mix-blend-overlay" />
            <ul>
              <Select
                options={language}
                type={DEFAULT_LANG_STORE_NAME}
                i18nPath="language"
                isMobile
              />
              <hr className="relative z-50 my-4 -ml-[0.91rem] block h-0.5 w-[calc(100%+1.8rem)] border-none bg-white/60 mix-blend-overlay" />
              <Select
                options={timestamp}
                type={TIMESTAMP}
                i18nPath="time"
                isMobile
              />
            </ul>
          </article>
          <h2 className="relative mb-6 w-full text-center text-sm tracking-[1px] text-white/75 uppercase">
            {t("header.settings.label_about_us")}
          </h2>

          <article className="relative h-fit w-full p-4">
            <ul>
              <li
                className={cx(
                  "relative z-50 h-fit w-full",
                  isInstalled ? "opacity-60" : "",
                  canInstall ? "" : "touch-none",
                )}
              >
                <button
                  onClick={() => {
                    isIOS ? setIsIOSClicked(true) : install();
                  }}
                  className="flex w-full cursor-pointer items-center"
                >
                  <Image
                    src="/shared/download.png"
                    alt=""
                    aria-hidden
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  <p className="w-full text-start font-bold tracking-wide">
                    {t("header.settings.download_app")}
                  </p>
                  <Image
                    src="/shared/chevron.mobile.svg"
                    alt=""
                    aria-hidden
                    width={24}
                    height={24}
                    className="-rotate-90"
                  />
                </button>
                {isIOS && isIOSClicked && (
                  <dialog
                    open
                    className="fixed top-1/2 left-1/2 m-0 h-fit w-fit -translate-x-1/2 -translate-y-1/2 bg-transparent p-0"
                  >
                    <div
                      role="dialog"
                      aria-modal="true"
                      className="flex h-fit w-fit items-center justify-center"
                      onClick={(e) => {
                        if (e.target === e.currentTarget)
                          setIsIOSClicked(false);
                      }}
                    >
                      <div className="w-[20rem] rounded-xl bg-black/40 p-4 text-white backdrop-blur-md">
                        <h3 className="mb-2 text-lg">
                          {t("header.settings.ios_download.label")}
                        </h3>
                        <ol className="list-decimal space-y-1 pl-5 text-sm">
                          <li>{t("header.settings.ios_download.l1")}</li>
                          <li>{t("header.settings.ios_download.l2")}</li>
                          <li>{t("header.settings.ios_download.l3")}</li>
                        </ol>
                        <button
                          className="mt-4"
                          onClick={() => setIsIOSClicked(false)}
                        >
                          {t("header.settings.ios_download.apply")}
                        </button>
                      </div>
                    </div>
                  </dialog>
                )}
              </li>

              <hr className="relative z-50 my-4 -ml-[0.91rem] block h-0.5 w-[calc(100%+1.8rem)] border-none bg-white/60 mix-blend-overlay" />

              <li className="relative z-50 h-fit w-full">
                <Link
                  onClick={() => {
                    setCookie(PREV_PATH, pathnane);
                    handleLinkClick();
                  }}
                  href="/privacy"
                  className="flex items-center"
                >
                  <Image
                    src="/shared/scroll.mobile.svg"
                    alt=""
                    aria-hidden
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  <p className="w-full text-start font-bold tracking-wide">
                    {t("header.settings.privacy_policy")}
                  </p>
                  <Image
                    src="/shared/chevron.mobile.svg"
                    alt=""
                    aria-hidden
                    width={24}
                    height={24}
                    className="-rotate-90"
                  />
                </Link>
              </li>

              <hr className="relative z-50 my-4 -ml-[0.91rem] block h-0.5 w-[calc(100%+1.8rem)] border-none bg-white/60 mix-blend-overlay" />

              <li className="relative z-50 h-fit w-full">
                <Link
                  onClick={handleLinkClick}
                  href="https://open-meteo.com/"
                  target="_blank"
                  className="flex items-center"
                >
                  <Image
                    src="/shared/server.mobile.svg"
                    alt=""
                    aria-hidden
                    width={16}
                    height={16}
                    className="mr-2"
                  />
                  <p className="w-full font-bold tracking-wide text-white">
                    {t("header.settings.data_source")}:
                  </p>
                  <p className="mr-4 font-bold tracking-wide text-nowrap text-white">
                    Open-Meteo
                  </p>
                  <Image
                    src="/shared/chevron.mobile.svg"
                    alt=""
                    aria-hidden
                    width={24}
                    height={24}
                    className="-rotate-90"
                  />
                </Link>
              </li>
            </ul>

            <div className="absolute inset-0 z-30 rounded-2xl border border-white bg-[#48319D]/20 mix-blend-overlay" />
          </article>
        </div>

        <div className="relative w-full flex-1">
          {isEnoughSpace && (
            <CloudsTrackAnimation
              isSettingsOpen={isSettingsOpen}
              shouldShiftAnimation={shouldShiftAnimation}
            />
          )}
          <p
            className={cx(
              "relative z-60 w-full text-xs font-bold tracking-wide text-white/25",
              shouldShiftAnimation || !isEnoughSpace
                ? "flex h-full items-end justify-center"
                : "h-fit text-center",
              isMobile ? "wsm:mt-4" : "",
            )}
          >
            {t("version")}: 1.0.0
          </p>
        </div>
      </div>
    </section>
  );
};

export default memo(Settings);
