"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import cx from "clsx";
import { subscription } from "@/services/subscription";
import { setCookie, setStoredData } from "@/utils/store";
import { LATEST_CITY, REQUESTED_CITIES } from "@/constants";
import { PreparedCities } from "@/types/citySearch";
import { findCitiesByName } from "@/services/geolocation";
import { translateBatch } from "@/services/aiTranslate";
import { fetchDetailedSummary } from "@/services/forecast";

const test = [
  {
    admin: "Лімбург",
    city: "Heers",
    country: "Бельгія",
    lat: 50.746,
    lon: 5.3069997,
    tempMax: 16.7,
    tempMin: 12.3,
    temperature: 14.4,
    weatherCode: [61],
  },
];

type SearchState =
  | { kind: "idle" }
  | { kind: "pending" }
  | { kind: "error"; message: string }
  | { kind: "ok"; items: PreparedCities };

type PreparedCity = PreparedCities[number];

export const shouldTranslate = (s: string | undefined, target: string) => {
  if (!s) return false;
  const latin = /[A-Za-z]/.test(s);
  const hasUk = /[іїєґ]/i.test(s);
  const hasRuOnly = /[ёъыэ]/i.test(s);
  if (target.startsWith("uk")) return latin || hasRuOnly;
  if (target.startsWith("ru")) return latin || hasUk;
  return latin;
};

const SearchCity = ({ isMobile = false }: { isMobile?: boolean }) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const inputId = useId();
  const listId = useId();

  const [state, setState] = useState<SearchState>({ kind: "idle" });
  const [cityName, setCityName] = useState("");
  const [debounced, setDebounced] = useState("");
  const [highlighted, setHighlighted] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (name: string, delay: number) => {
    setCityName(name);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebounced(name), delay);
  };
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), []);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const q = debounced.trim();

        if (q.length === 0) {
          setState({ kind: "idle" });
          if (isMobile) {
            setStoredData(REQUESTED_CITIES, []);
            subscription({ key: REQUESTED_CITIES, value: { status: "empty" } });
          }
          return;
        }

        if (q.length <= 3) return;

        setState({ kind: "pending" });
        if (isMobile) {
          subscription({ key: REQUESTED_CITIES, value: { status: "pending" } });
        }

        const geoData = await findCitiesByName(q, i18n.language, {
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;

        if (!geoData || geoData.length === 0) {
          setState({
            kind: "error",
            message: t("header.search_city.city_not_found"),
          });
          if (isMobile) {
            subscription({ key: REQUESTED_CITIES, value: { status: "error" } });
          }
          return;
        }

        const base: PreparedCities = geoData.map((g) => ({
          city: g.name ?? "",
          country: g.country ?? "",
          admin: g.admin2 ?? g.admin1 ?? "",
          lat: g.latitude,
          lon: g.longitude,
          needTranslate: g.needTranslate,
        }));

        const withSummary: PreparedCities = [];
        if (isMobile) {
          for (const item of base) {
            const res = await fetchDetailedSummary({
              lat: item.lat,
              lon: item.lon,
              city: item.city,
            });

            withSummary.push({
              ...res,
              country: item.country,
              admin: item.admin,
              needTranslate: item.needTranslate,
            } as PreparedCity);
          }

          setStoredData(REQUESTED_CITIES, withSummary);
          subscription({
            key: REQUESTED_CITIES,
            value: { status: "success" },
          });
        } else {
          setState({ kind: "ok", items: base });
          setHighlighted(0);
        }

        const targets = (isMobile ? withSummary : base).filter(
          (x) => x.needTranslate,
        );
        if (targets.length) {
          const pack = targets.map((x) => `${x.city}|${x.country}|${x.admin}`);

          const map = await translateBatch(pack, i18n.language, {
            signal: ac.signal,
          });
          if (ac.signal.aborted) return;

          const improved: PreparedCities = (isMobile ? withSummary : base).map(
            (x) => {
              if (!x.needTranslate) return x;
              const key = `${x.city}|${x.country}|${x.admin}`;
              const tr = map[key];
              return tr
                ? {
                    ...x,
                    city: tr.city || x.city,
                    country: tr.country || x.country,
                    admin: tr.admin || x.admin,
                    lat: x.lat,
                    lon: x.lon,
                  }
                : x;
            },
          );

          if (isMobile) {
            setStoredData(
              REQUESTED_CITIES,
              improved.map((i) => ({ ...i, needTranslate: false })),
            );
            subscription({
              key: REQUESTED_CITIES,
              value: { status: "success" },
            });
          } else {
            setState({
              kind: "ok",
              items: improved.map((i) => ({ ...i, needTranslate: false })),
            });
          }
        }
      } catch (e) {
        if (isMobile) {
          setStoredData(REQUESTED_CITIES, []);
          subscription({
            key: REQUESTED_CITIES,
            value: { status: "error" },
          });
        } else {
          setState({ kind: "ok", items: [] });
        }
      }
    })();

    return () => ac.abort();
  }, [debounced, isMobile, i18n.language, t]);

  const submitCity = (city: PreparedCity | undefined) => {
    if (!city) return;

    setCookie(
      LATEST_CITY,
      JSON.stringify({
        cityLabel: city.city,
        country: city.country,
        lat: city.lat,
        lon: city.lon,
      }),
    );
    router.push(`/погода/${city.city}/${city.lat}/${city.lon}`);
    router.refresh();
    setDebounced("");
    setCityName("");
    setState({ kind: "idle" });
    setHighlighted(null);
  };

  const options: PreparedCities =
    state.kind === "ok" ? state.items : ([] as PreparedCities);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (state.kind !== "ok" || options.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((p) =>
        p == null ? 0 : Math.min(p + 1, options.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((p) => (p == null ? 0 : Math.max(p - 1, 0)));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const idx = highlighted ?? 0;
      submitCity(options[idx]);
    } else if (e.key === "Escape") {
      setState({ kind: "idle" });
    }
  };

  const expanded = useMemo(
    () => state.kind === "ok" && options.length > 0,
    [state, options.length],
  );

  return (
    <div className="relative inline h-full w-96">
      <label htmlFor={inputId} className="sr-only">
        {t("header.search_city.placeholder")}
      </label>

      <input
        id={inputId}
        ref={inputRef}
        placeholder={t("header.search_city.placeholder")}
        value={cityName}
        onChange={(e) => handleInputChange(e.target.value, 300)}
        onKeyDown={onKeyDown}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-activedescendant={
          expanded && highlighted != null ? `opt-${highlighted}` : undefined
        }
        className="focus-visible:ring-none absolute top-0 left-0 h-full w-full rounded-full p-4 pl-12 placeholder:text-white focus-visible:outline-none"
      />

      <Image
        src="/shared/zoom.svg"
        alt=""
        aria-hidden
        width={24}
        height={24}
        sizes="24px"
        className={cx(
          "absolute top-4 left-4",
          isMobile ? "-translate-y-1/4" : "",
        )}
      />

      {cityName && (
        <button
          onClick={() => {
            setState({ kind: "idle" });
            setDebounced("");
            setCityName("");
            setHighlighted(null);
            inputRef.current?.focus();
          }}
          className="group absolute top-1/2 right-4 z-50 h-4 w-4 -translate-y-1/2 cursor-pointer"
          aria-label={t("header.search_city.actions.clear")}
          type="button"
        >
          <span className="absolute top-1/2 left-1/2 z-10 block h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-full bg-white" />
          <span className="absolute top-1/2 left-1/2 z-10 block h-4 w-0.5 -translate-x-1/2 -translate-y-1/2 -rotate-45 rounded-full bg-white" />
          <div className="bg-violet/60 absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full duration-300 group-hover:scale-100" />
        </button>
      )}

      {!isMobile && state.kind === "ok" && options.length > 0 && (
        <div
          className="absolute top-[calc(100%+1rem)] left-0 h-fit w-full"
          role="listbox"
          id={listId}
          aria-label={t("header.search_city.results")}
        >
          <ul className="h-fit w-full">
            {options.map((city, idx) => (
              <li
                key={`${city.city},${city.country},${city.admin},${city.lat},${city.lon}`}
                id={`opt-${idx}`}
                role="option"
                aria-selected={highlighted === idx}
                onMouseDown={() => submitCity(city)}
                className={cx(
                  "hover:bg-violet/40 relative z-100 cursor-pointer p-2 duration-300 first:rounded-t-xl first:pt-4 last:rounded-b-xl last:pb-4",
                  highlighted === idx ? "bg-violet/30" : "",
                  city.needTranslate ? "text-white/60" : "",
                )}
              >
                {city.city}
                {city.country ? `, ${city.country}` : ""}
                {city.admin ? `, ${city.admin}` : ""}
                <div
                  className={cx(
                    "absolute top-1/2 right-4 z-50 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white/35 border-t-white",
                    city.needTranslate ? "block animate-spin" : "hidden",
                  )}
                />
              </li>
            ))}
          </ul>
          <div className="bg-violet absolute top-0 left-0 z-80 h-full w-full overflow-hidden rounded-2xl border-1 border-white/50 mix-blend-soft-light brightness-105 contrast-90 backdrop-blur-2xl duration-300" />
        </div>
      )}

      {!isMobile && state.kind === "error" && (
        <div className="absolute top-[calc(100%+1rem)] left-0 h-fit w-full px-4 py-2">
          <p className="relative z-20">{state.message}</p>
          <div className="bg-violet absolute top-0 left-0 z-10 h-full w-full overflow-hidden rounded-2xl border-1 border-white/50 mix-blend-soft-light brightness-105 contrast-90 backdrop-blur-2xl duration-300" />
        </div>
      )}

      {!isMobile && state.kind === "pending" && (
        <div className="absolute top-[calc(100%+1rem)] left-0 h-32 w-full px-4 py-2">
          <div
            className="loader top-1/2 left-1/2 z-110 -translate-x-1/2 -translate-y-1/2"
            style={{ ["--loader-size" as any]: "64px" }}
          />
          <div className="bg-violet absolute top-0 left-0 z-100 h-full w-full overflow-hidden rounded-2xl border-1 border-white/50 mix-blend-soft-light brightness-105 contrast-90 backdrop-blur-2xl duration-300" />
        </div>
      )}

      {isMobile ? (
        <>
          <div className="bg-dark-indigo focus-visible:ring-none relative -z-1 h-full w-full rounded-xl p-4 shadow-[inset_3px_5px_5px_#000000]/25" />
        </>
      ) : (
        <>
          <div className="bg-dark-indigo border-soft-purple focus-visible:ring-none relative -z-1 h-full w-full rounded-full border-2 p-4 mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl" />
          <div className="border-soft-purple pointer-events-none absolute top-0 left-0 h-full w-full rounded-full border-2 mix-blend-overlay" />
          <div className="bg-violet/50 absolute top-0 left-0 -z-2 h-full w-full rounded-3xl blur-2xl" />
        </>
      )}
    </div>
  );
};

export default SearchCity;
