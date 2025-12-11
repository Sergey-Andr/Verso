"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type BIP = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type Ctx = {
  canInstall: boolean;
  install: () => Promise<void> | void;
  isInstalled: boolean;
  isIOS: boolean;
};

const C = createContext<Ctx>({
  canInstall: false,
  install: () => {},
  isInstalled: false,
  isIOS: false,
});

export function PWAInstallProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const deferred = useRef<BIP | null>(null);
  const registeredOnce = useRef(false);

  useEffect(() => {
    (async () => {
      if (registeredOnce.current) return;
      registeredOnce.current = true;

      if ("serviceWorker" in navigator) {
        try {
          const existing = await navigator.serviceWorker.getRegistration("/");
          if (!existing)
            await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          await navigator.serviceWorker.ready;
        } catch (e) {
          console.error("SW register failed", e);
        }
      }

      const ua = navigator.userAgent || navigator.vendor;
      const isiOS =
        /iphone|ipad|ipod/i.test(ua) ||
        (navigator.platform === "MacIntel" &&
          (navigator as any).maxTouchPoints > 1);
      setIsIOS(isiOS);

      const checkStandalone =
        window.matchMedia?.("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      setIsInstalled(checkStandalone);

      const onBIP = (e: Event) => {
        e.preventDefault();
        deferred.current = e as BIP;
        setCanInstall(true);
      };
      const onInstalled = () => {
        deferred.current = null;
        setCanInstall(false);
        setIsInstalled(true);
      };
      window.addEventListener("beforeinstallprompt", onBIP as any, {
        once: true,
      });
      window.addEventListener("appinstalled", onInstalled);
    })();

    return () => {
      window.removeEventListener("appinstalled", () => {});
    };
  }, []);

  const install = async () => {
    if (!deferred.current) return;
    setCanInstall(false);
    await deferred.current.prompt();
    const { outcome } = await deferred.current.userChoice;

    deferred.current = null;
    if (outcome !== "accepted") {
      setTimeout(() => setCanInstall(true), 10_000);
    }
  };

  return (
    <C.Provider value={{ canInstall, install, isInstalled, isIOS }}>
      {children}
    </C.Provider>
  );
}

export const usePWAInstall = () => useContext(C);
