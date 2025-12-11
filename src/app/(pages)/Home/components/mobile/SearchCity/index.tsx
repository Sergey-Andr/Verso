"use client";

import React, { memo, useEffect, useId, useRef, useState } from "react";
import { useSubscription } from "@/providers/WebSocketProvider";
import cx from "clsx";
import { fetchCitiesSummary } from "@/app/(pages)/Home/services/fetchCitiesSummary";
import { CitiesSummary } from "@/app/(pages)/Home/types/citiesSummary";
import { useTranslation } from "react-i18next";
import CityCard from "@/app/(pages)/Home/components/mobile/SearchCity/components/CityCard";
import { HandleCitySearchBtn } from "@/app/(pages)/Home/types/handlers";
import SearchCity from "@/app/(components)/SearchCity";
import { getStoredData } from "@/utils/store";
import { REQUESTED_CITIES } from "@/constants";
import { SearchingCityStates } from "@/types/subscriptions";
import { PreparedCities } from "@/types/citySearch";
import Image from "next/image";

type SearchCityProps = {
  handleCitySearchBtn: HandleCitySearchBtn;
  isCitySearchOpen: boolean;
};

export type SearchedCities = Omit<
  CitiesSummary[number],
  keyof PreparedCities[number]
> &
  PreparedCities[number];

const SearchCityMobile = ({
  handleCitySearchBtn,
  isCitySearchOpen,
}: SearchCityProps) => {
  const headingId = useId();
  const { t, i18n } = useTranslation();
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  const [searchedCity, setSearchedCity] = useState<SearchedCities[]>([]);
  const [cities, setCities] = useState<CitiesSummary>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (isCitySearchOpen) {
      prevFocusRef.current = document.activeElement as HTMLElement | null;
      closeBtnRef.current?.focus();
    } else {
      prevFocusRef.current?.focus?.();
    }
  }, [isCitySearchOpen]);

  useSubscription(REQUESTED_CITIES, (value: SearchingCityStates) => {
    if (value.status === "pending") {
      setSearchedCity([]);
      setIsLoading(true);
      setIsError(false);
    } else if (value.status === "error") {
      setIsError(true);
      setIsLoading(false);
    } else {
      setSearchedCity(getStoredData(REQUESTED_CITIES));
      setIsLoading(false);
      setIsError(false);
    }
  });

  useEffect(() => {
    let canceled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetchCitiesSummary(i18n.language);
        if (!canceled) setCities(res);
      } finally {
        if (!canceled) setIsLoading(false);
      }
    })();
    return () => {
      canceled = true;
    };
  }, [i18n.language]);

  useEffect(() => {
    if (!isCitySearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCitySearchBtn(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isCitySearchOpen, handleCitySearchBtn]);

  return (
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      className={cx(
        "absolute inset-0 z-50 flex h-screen w-screen flex-col p-6 pb-0 duration-200 will-change-[opacity,scale]",
        isCitySearchOpen
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0",
      )}
      style={{ contentVisibility: "auto" }}
    >
      <button
        ref={closeBtnRef}
        aria-label={t("header.settings.close")}
        onClick={() => handleCitySearchBtn(false)}
        className="relative z-50 mb-10 flex h-fit w-fit items-center"
      >
        <Image
          src="/shared/chevron.mobile.svg"
          alt=""
          aria-hidden
          width={40}
          height={40}
          className="rotate-90 opacity-40"
        />
        <p id={headingId} className="h-fit w-fit text-2xl">
          Verso
        </p>
      </button>

      <div className="relative z-60 mb-8 min-h-11 w-full">
        <SearchCity isMobile />
      </div>

      {isError ? (
        <div className="relative z-50 flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 opacity-80">
              {t("header.search_city.city_not_found")}
            </p>
          </div>
        </div>
      ) : isLoading ? (
        <div className="absolute inset-0 z-50 flex h-full w-full items-center justify-center">
          <div className="loader" aria-label={t("a11y.loading")} />
        </div>
      ) : (
        <ul className="relative z-50 overflow-auto">
          {searchedCity.length > 0
            ? searchedCity.map((city, i) => (
                <CityCard
                  key={`${city.city}_${city.lat}_${city.lon}_${city?.country}`}
                  city={city}
                  t={t}
                  i={i}
                  handleCitySearchBtn={handleCitySearchBtn}
                />
              ))
            : cities?.length > 0
              ? cities.map((city, i) => (
                  <CityCard
                    key={`${city.city}_${city.lat}_${city.lon}_${city?.country}`}
                    city={city}
                    t={t}
                    i={i}
                    handleCitySearchBtn={handleCitySearchBtn}
                  />
                ))
              : null}
        </ul>
      )}

      <div
        className="from-deep-indigo to-charcoal-indigo absolute inset-0 h-full w-full bg-linear-145"
        aria-hidden
        style={{ contentVisibility: "auto", contain: "paint" }}
      />
      <div
        className="bg-soft-purple/10 absolute inset-0 z-1 h-full w-full blur-3xl"
        aria-hidden
        style={{ contentVisibility: "auto", contain: "paint" }}
      />
      <div
        className="to-soft-purple/20 fixed inset-0 z-1 h-full w-full bg-gradient-to-b from-transparent from-50%"
        aria-hidden
        style={{ contentVisibility: "auto", contain: "paint" }}
      />
      <div className="fixed inset-0 z-1 h-full w-full" aria-hidden>
        <div
          className="bg-violet/20 absolute top-4/12 left-1/2 -z-1 h-72 w-72 -translate-x-1/2 -translate-y-4/12 rounded-full blur-3xl brightness-125"
          style={{ contentVisibility: "auto", contain: "paint" }}
        />
        <div
          className="bg-violet/20 absolute bottom-4/12 left-1/2 -z-1 h-72 w-72 -translate-x-1/2 translate-y-4/12 rounded-full blur-3xl brightness-125"
          style={{ contentVisibility: "auto", contain: "paint" }}
        />
        <div
          className="bg-violet/20 absolute bottom-0/12 left-1/2 -z-1 h-72 w-72 -translate-x-1/2 -translate-y-0/12 rounded-full blur-3xl brightness-125"
          style={{ contentVisibility: "auto", contain: "paint" }}
        />
      </div>
    </section>
  );
};

export default memo(SearchCityMobile);
