import React from "react";
import Image from "next/image";

const HighlightBlock = () => {
  return (
    <>
      <h3 className="text-label relative z-50 mb-3 flex">
        Today&apos;s Highlight
      </h3>
      <ul className="relative z-50 grid h-[calc(100%-1.45vw-1.25rem)] w-full [grid-auto-rows:minmax(0,1fr)] grid-cols-[10.83vw_10.83vw_15vw] grid-rows-2 gap-6">
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/wind.png"
              alt="wind icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              Wind
            </h5>
          </div>
          <div className="relative mx-auto h-fit w-fit">
            <Image
              src="/wind_direction.png"
              alt="wind direction icon"
              width={110}
              height={110}
              className="h-[12vh] w-[5.93vw]"
            />
            <p className="text-highlight-wind-speed-number leading-highlight-wind absolute top-1/3 left-[30%] h-fit w-fit text-center font-semibold">
              9.7
              <br />
              <span className="text-highlight-wind-speed-text font-normal">
                km/h
              </span>
              <br />
              <span className="text-highlight-wind-speed-text font-normal text-white/60">
                90 deg
              </span>
            </p>
            <div className="absolute top-0 left-1/2 h-1/2 w-[0.20vw] origin-bottom rotate-[90deg]">
              <span className="absolute top-0 -left-1/2 h-[0.84vh] w-[0.41vw] rounded-full outline-[0.20vw] outline-white" />
            </div>
          </div>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/humidity.png"
              alt="humidity icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              Humidity
            </h5>
          </div>
          <p className="text-highlight-main-text leading-highlight-main-text mb-6">
            90%
          </p>
          <span className="text-highlight-subtitle">Dew point is low</span>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/pressure.png"
              alt="pressure icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              Pressure
            </h5>
          </div>
          <p className="text-highlight-main-text leading-highlight-main-text mb-6">
            1014 <span>hPa</span>
          </p>
          <span className="text-highlight-subtitle">Dew point is low</span>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/dew_point.png"
              alt="dew point icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              Dew point
            </h5>
          </div>
          <p className="text-highlight-main-text leading-highlight-main-text mb-6">
            297
          </p>
          <span className="text-highlight-subtitle">Dew point is low</span>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/uv_index.png"
              alt="UV index icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              UV index
            </h5>
          </div>
          <p className="text-highlight-main-text leading-highlight-main-text mb-3">
            4
          </p>
          <span className="text-highlight-subtitle mb-3">Moderate</span>
          <div className="bg-pink-violet relative h-2 w-full rounded-full">
            <span className="absolute -top-1/4 left-0 z-999 h-3 w-3 rounded-full bg-white" />
          </div>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
        <li className="relative z-50 flex h-full min-h-[159px] w-full flex-col p-[0.83vw]">
          <div className="mb-2 flex items-start gap-2">
            <Image
              src="/sunrise.png"
              alt="sunrise icon"
              width={20}
              height={20}
              className="h-[1vw] min-h-4 w-[1vw] min-w-4"
            />
            <h5 className="text-highlight-name h-fit w-fit tracking-wider">
              Sunrise
            </h5>
          </div>
          <p className="text-highlight-main-text leading-highlight-main-text text-nowrap">
            5:18 AM&nbsp;
            <span className="text-highlight-subtitle text-nowrap">
              Sunset: 7:25 PM
            </span>
          </p>
          <div className="relative h-full w-full">
            <Image
              src="/sunrise_steep.png"
              alt="sunrise steep icon"
              width={256}
              height={52}
              className="h-full w-full"
            />
            <div className="absolute top-[34%] left-[25%] z-10 h-2 w-2 rounded-full bg-white">
              <div className="absolute h-full w-full rounded-full bg-white blur-sm" />
              <div className="absolute h-full w-full rounded-full bg-white blur-sm" />
              <div className="absolute h-full w-full rounded-full bg-white blur-sm" />
            </div>
            <hr className="border-soft-purple absolute top-[60%] -left-[0.83vw] w-[calc(100%+0.83vw*2)] border-1" />
          </div>
          <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
        </li>
      </ul>
      <div className="bg-violet/50 absolute top-1/4 left-[15%] -z-1 h-[13vw] w-[13vw] rounded-3xl blur-2xl" />
      <div className="bg-violet/50 absolute top-1/4 left-1/2 -z-1 h-[13vw] w-[13vw] rounded-3xl blur-2xl" />
    </>
  );
};

export default HighlightBlock;
