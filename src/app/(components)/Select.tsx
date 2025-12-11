import React, { useEffect, useId, useRef, useState } from "react";
import cx from "clsx";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import { subscription } from "@/services/subscription";
import { getStoredData, setCookie, setStoredData } from "@/utils/store";
import { DEFAULT_LANG_STORE_NAME } from "@/constants/i18n";
import { TIMESTAMP } from "@/app/(pages)/Home/constants/shared";

type Option = { label: string; value: string };
type SelectProps = {
  options: Option[];
  type: typeof DEFAULT_LANG_STORE_NAME | typeof TIMESTAMP;
  i18nPath: string;
  isMobile?: boolean;
};

const Select = ({ options, type, i18nPath, isMobile = false }: SelectProps) => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<Option | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const listId = useId();

  useEffect(() => {
    const fromStore = getStoredData(type);
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === fromStore),
    );
    const initial = options[idx] ?? options[0] ?? null;
    setSelected(initial);
    setActiveIndex(Math.max(0, idx));
  }, [options, type]);

  useEffect(() => {
    if (!isOpen) return;
    const onPD = (e: PointerEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("pointerdown", onPD);
    return () => document.removeEventListener("pointerdown", onPD);
  }, [isOpen]);

  const commit = async (opt: Option) => {
    setSelected(opt);
    setIsOpen(false);
    setStoredData(type, opt.value);
    await subscription({ key: type, value: opt.value });

    if (type === DEFAULT_LANG_STORE_NAME) {
      await i18n.changeLanguage(opt.value);
      setCookie(type, opt.value);
    }
  };

  return (
    <li
      className={cx(
        "relative h-fit w-full",
        isMobile ? "z-50" : "flex w-fit items-center justify-between text-sm",
        isMobile && isOpen ? "z-100" : "",
      )}
    >
      <p
        className={cx(
          "h-fit w-fit text-start text-2xl",
          isMobile ? "hidden" : "",
        )}
      >
        {t(`header.settings.${i18nPath}`)}:
      </p>

      <div ref={wrapRef} className="relative">
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listId}
          onClick={() => setIsOpen((o) => !o)}
          className={cx(
            "flex h-fit cursor-pointer items-center",
            isMobile
              ? "w-full"
              : "relative w-28 justify-between gap-2 rounded-sm px-2 py-0.5 text-lg backdrop-blur-2xl",
          )}
        >
          <Image
            src={`/shared/${i18nPath}.mobile.svg`}
            alt=""
            aria-hidden
            width={16}
            height={16}
            className={cx("mr-2", isMobile ? "" : "hidden")}
          />
          <p
            className={cx(
              "w-full text-start font-bold tracking-wide",
              isMobile ? "" : "hidden",
            )}
          >
            {t(`header.settings.${i18nPath}`)}:
          </p>

          <p
            className={cx(
              "h-fit text-center",
              isMobile
                ? "text-bold mr-4 w-fit tracking-wide text-nowrap"
                : "w-full",
            )}
          >
            {selected?.label}
          </p>

          <span className="relative -top-0.5 ml-2 h-fit w-fit" aria-hidden>
            <span
              className={cx(
                "absolute top-0 right-0 block h-1.5 w-0.5 rotate-45 rounded-full bg-white duration-300",
                isMobile && "!h-2",
                isOpen && "rotate-145",
              )}
            />
            <span
              className={cx(
                "absolute top-0 -left-1.5 block h-1.5 w-0.5 -rotate-45 rounded-full bg-white duration-300",
                isMobile && "!h-2",
                isOpen && "-rotate-145",
              )}
            />
          </span>

          {!isMobile && (
            <div
              className="from-violet/20 to-violet/80 bg-gradient-65 absolute inset-0 -z-1 rounded-sm border border-white/20 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175 backdrop-blur-2xl"
              aria-hidden
            />
          )}
        </button>

        <div
          className={cx(
            "absolute bottom-0 z-10 mt-1 translate-y-15/12 overflow-hidden text-lg duration-300",
            isMobile ? "-ml-4 w-[calc(100%+2rem)]" : "w-full",
          )}
          style={{
            clipPath: isOpen ? "inset(0% 0% 0% 0%)" : "inset(0% 0% 100% 0%)",
          }}
        >
          <ul
            id={listId}
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-activedescendant={options[activeIndex]?.value}
            className="relative z-50 flex h-full w-full flex-col gap-0.5 overflow-hidden duration-300"
          >
            {options.map((option, idx) => {
              const selectedNow = selected?.value === option.value;
              const active = idx === activeIndex;
              return (
                <li
                  id={option.value}
                  key={option.value}
                  role="option"
                  aria-selected={selectedNow}
                  className={cx(
                    "hover:bg-violet flex h-fit w-full justify-center px-2 py-0.5 duration-300 first:rounded-t-sm last:rounded-b-sm",
                    selectedNow && "bg-violet/60",
                    active && "outline outline-1 outline-white/60",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => commit(option)}
                    className="flex h-fit w-full cursor-pointer items-center justify-center text-nowrap"
                  >
                    <p className="ml-6 text-nowrap">{option.label}</p>&nbsp;
                    <Image
                      src="/shared/checkmark.mobile.svg"
                      alt=""
                      aria-hidden
                      width={isMobile ? 24 : 16}
                      height={isMobile ? 24 : 16}
                      className={cx(selectedNow ? "opacity-100" : "opacity-0")}
                    />
                  </button>
                </li>
              );
            })}
          </ul>

          <div
            className="absolute top-0 left-0 z-30 h-full w-full backdrop-blur-sm"
            aria-hidden
          />
          <div
            className={cx(
              "from-violet/20 to-violet/80 bg-violet/20 bg-gradient-65 absolute top-0 left-0 z-30 h-full w-full border border-white/20 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175",
              isMobile ? "rounded-t-sm rounded-b-2xl" : "rounded-sm",
            )}
            aria-hidden
          />
        </div>
      </div>
    </li>
  );
};

export default Select;
