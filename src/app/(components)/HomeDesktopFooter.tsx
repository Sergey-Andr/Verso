"use client";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import MainBackgroundLayer from "@/app/(components)/MainBackgroundLayer";

// ssr:false разрешён только в клиентском компоненте, поэтому ленивый CitiesHeap живёт здесь
const CitiesHeap = dynamic(
  () => import("@/app/(pages)/Home/components/desktop/CitiesHeap"),
  { ssr: false },
);

export default function HomeDesktopFooter() {
  const { t } = useTranslation();

  return (
    <footer className="mt-16">
      <div className="mb-12 h-fit w-full">
        <div className="relative mx-auto h-fit w-fit px-4 py-1 text-2xl">
          <h3 className="relative z-50">— {t("footer.label")} —</h3>
          <MainBackgroundLayer borderWidth={2} />
        </div>
      </div>
      <CitiesHeap />
    </footer>
  );
}
