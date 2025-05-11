import React from "react";
import Image from "next/image";

const MainInfoBlock = () => {
  return (
    <>
      <div className="relative mb-[7.5%] h-[9.7%] w-full">
        <div className="relative z-10 flex h-full w-[27%] items-center justify-center gap-2 rounded-full">
          <Image
            src="/point.svg"
            alt="point icon"
            width={16}
            height={20}
            className="w-[6.25%] min-w-3"
          />
          <p className="leading-main-city text-main-city">Dhaka, Bangladesh</p>
          <div className="bg-deep-indigo/20 absolute z-10 flex h-full min-h-8 w-full items-center justify-center rounded-full mix-blend-overlay brightness-0 contrast-200" />
        </div>
        <div className="bg-violet absolute top-0 left-0 -z-1 h-[4.23vh] w-[15vw] rounded-3xl blur-2xl" />
      </div>
      <div className="relative z-50 h-fit w-fit">
        <h2 className="text-main-week-day leatext-main-week-day">Sunday</h2>
        <sub className="text-main-date leading-main-date">04 Aug, 2024</sub>
        <div className="bg-violet absolute top-0 left-0 -z-1 h-[11.8vh] w-[5.83vw] rounded-3xl blur-3xl" />
      </div>
      <Image
        src="/house.png"
        alt="House icon"
        width={450}
        height={244}
        className="absolute bottom-0 left-1/8 z-50 w-[23.4vw]"
      />
      <div className="bg-violet/70 absolute bottom-0 left-1/4 -z-1 h-[27vh] w-[13.3vw] rounded-3xl blur-3xl" />
      <Image
        src="/shower_rain.png"
        alt="cloud icon"
        width={164}
        height={164}
        className="absolute top-[1.6vh] left-[23vw] z-50 w-[17.5%]"
      />
      <div className="bg-violet/70 absolute top-0 left-1/2 -z-1 h-[25vh] w-[10vw] rounded-3xl blur-3xl" />
      <div className="absolute top-1/4 right-[2.5vmin] z-50 flex h-fit w-fit flex-col text-right">
        <div className="relative mb-[25.5%]">
          <p className="text-main-temp leading-main-temp mb-2">28°C</p>
          <p className="text-main-temp-min leading-main-temp-min text-white/60">
            /24°C
          </p>
        </div>
        <div className="bg-violet/70 absolute -top-1/12 left-1/10 -z-1 h-[12vh] w-[7.8vw] rounded-3xl blur-2xl" />
        <div className="relative">
          <p className="text-main-forecast leading-main-forecast mb-4">
            Heavy Rain
          </p>
          <p className="text-main-feels leading-main-feels">Feels like 31°</p>
          <div className="bg-violet/70 absolute -top-1/4 left-0 -z-1 h-[11vh] w-[8.8vw] rounded-3xl blur-2xl" />
        </div>
      </div>
    </>
  );
};

export default MainInfoBlock;
