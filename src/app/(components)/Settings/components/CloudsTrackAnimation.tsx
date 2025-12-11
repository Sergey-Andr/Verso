"use client";

import React from "react";
import Image from "next/image";
import cx from "clsx";

const CloudsTrackAnimation = ({
  isSettingsOpen,
  shouldShiftAnimation,
}: {
  isSettingsOpen: boolean;
  shouldShiftAnimation: boolean;
}) => {
  return (
    <div
      className={cx(
        "z-50 -ml-6 w-[calc(100%+3rem)] overflow-hidden select-none",
        shouldShiftAnimation
          ? "absolute inset-0 h-[calc(100%+1.5rem)]"
          : "relative h-full",
      )}
      aria-hidden="true"
      style={{ contentVisibility: "auto", contain: "paint" }}
    >
      <div
        className={cx(
          "relative flex w-[400%] flex-col",
          shouldShiftAnimation ? "top-8/12" : "top-7/12",
        )}
        style={{
          animationPlayState: isSettingsOpen ? undefined : "paused",
        }}
      >
        <div className="animate-cloudsScrollTop relative flex h-fit w-1/2 gap-16 will-change-transform">
          <div className="relative h-fit w-1/2">
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={117}
              height={77}
              sizes="(max-width: 768px) 45vw, 20vw"
              loading="lazy"
              className="absolute top-1/2 -left-0 h-auto w-[45%] -translate-y-16/12 opacity-75"
            />
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={117}
              height={77}
              sizes="(max-width: 768px) 45vw, 20vw"
              loading="lazy"
              className="absolute top-1/2 right-0 h-auto w-[45%] -translate-x-0/12 -translate-y-16/12 opacity-75"
            />
          </div>
          <div className="relative h-fit w-1/2">
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={117}
              height={77}
              sizes="(max-width: 768px) 45vw, 20vw"
              loading="lazy"
              className="absolute top-1/2 -left-0 h-auto w-[45%] -translate-y-16/12 opacity-75"
            />
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={117}
              height={77}
              sizes="(max-width: 768px) 45vw, 20vw"
              loading="lazy"
              className="absolute top-1/2 right-0 h-auto w-[45%] -translate-x-0/12 -translate-y-16/12 opacity-75"
            />
          </div>
        </div>

        <div className="animate-cloudsScrollBottom relative flex h-fit w-1/2 gap-16 will-change-transform">
          <div className="relative h-fit w-1/2">
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={105}
              height={69}
              sizes="(max-width: 768px) 35vw, 18vw"
              loading="lazy"
              className="absolute top-1/2 -left-0 h-auto w-[35%] -translate-y-6/12 opacity-75"
            />
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={105}
              height={69}
              sizes="(max-width: 768px) 35vw, 18vw"
              loading="lazy"
              className="absolute top-1/2 right-0 h-auto w-[35%] -translate-x-4/12 -translate-y-6/12 opacity-75"
            />
          </div>
          <div className="relative h-fit w-1/2">
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={105}
              height={69}
              sizes="(max-width: 768px) 35vw, 18vw"
              loading="lazy"
              className="absolute top-1/2 -left-0 h-auto w-[35%] -translate-y-6/12 opacity-75"
            />
            <Image
              src="/weather/2.png"
              alt=""
              aria-hidden
              width={105}
              height={69}
              sizes="(max-width: 768px) 35vw, 18vw"
              loading="lazy"
              className="absolute top-1/2 right-0 h-auto w-[35%] -translate-x-4/12 -translate-y-6/12 opacity-75"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudsTrackAnimation;
