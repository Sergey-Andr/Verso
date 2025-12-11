"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import cx from "clsx";
import { useTranslation } from "react-i18next";
import { HandleSettingsBtn } from "@/app/(pages)/Home/types/handlers";
import Settings from "@/app/(components)/Settings";
import BodyPortal from "@/app/(components)/BodyPortal";

const SettingsDesktop = () => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.show();
    else setTimeout(() => dialog.close(), 300);
  }, [open]);

  useLayoutEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const dlg = dialogRef.current;
      if (
        dlg &&
        !dlg.contains(e.target as Node) &&
        !wrapperRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (open && e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSettingsBtn: HandleSettingsBtn = (state: boolean) => {
    setOpen(state);
  };

  return (
    <div ref={wrapperRef} className="h-full">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-full w-14 items-center justify-center rounded-full"
      >
        <Image
          className="relative z-50 cursor-pointer text-white"
          src="/shared/settings.svg"
          alt={t("header.settings.label_settings")}
          width={26}
          height={26}
        />
        <div className="border-soft-purple bg-dark-indigo absolute inset-0 z-10 rounded-full border-2 mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl" />
        <div className="border-soft-purple absolute inset-0 z-10 rounded-full border-2 mix-blend-overlay" />
        <div className="bg-violet absolute top-1/2 left-1/2 -z-2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-3xl blur-2xl brightness-125" />
      </button>

      <BodyPortal>
        <div
          className={cx("sheet z-60 will-change-transform")}
          data-state={open ? "open" : "closed"}
          aria-hidden={!open}
          style={{ ["--sheet-w" as any]: "26.875rem" }}
          onClick={(e) => e.stopPropagation()}
        >
          <dialog
            ref={dialogRef}
            className="h-full w-full"
            onClose={() => setOpen(false)}
          >
            <Settings
              handleSettingsBtn={handleSettingsBtn}
              isSettingsOpen={open}
            />
          </dialog>
        </div>
      </BodyPortal>
    </div>
  );
};

export default SettingsDesktop;
