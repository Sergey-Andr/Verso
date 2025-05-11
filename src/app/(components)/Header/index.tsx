import React from "react";
import Image from "next/image";

const Header = () => {
  return (
    <header className="mb-6 flex h-(--h-header) w-full items-center justify-between">
      <div className="relative flex items-center gap-4">
        <Image
          src="/logo.png"
          alt="Logo"
          width={56}
          height={56}
          className="shadow-violet h-(--h-header) w-fit rounded-full"
        />
        <p className="text-header-app-name leading-header-app-name relative z-10">
          Verso
        </p>
        <div className="bg-conic-gradient quad-header-left absolute top-0 left-1/3 -z-1 h-[3.3vw] w-[6.6vw] rounded-3xl blur-2xl" />
      </div>
      <div className="flex h-full items-center gap-11">
        <div className="relative inline h-full w-[20vw]">
          <input className="bg-dark-indigo border-soft-purple focus-visible:ring-none shadow-violet relative h-full w-full rounded-full border-2 p-4 mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl placeholder:text-white focus-visible:outline-none" />
          <input
            placeholder="Seach your city"
            className="focus-visible:ring-none text-header-search-city leading-header-search-city absolute top-0 left-0 h-full w-full rounded-full p-4 pl-(--h-header) placeholder:text-white focus-visible:outline-none"
          />
          <Image
            src="/zoom.svg"
            alt="Zoom icon"
            width={24}
            height={24}
            className="absolute top-[clamp(0.75rem,28.5%,28.5%)] left-[clamp(1rem,4%,4%)] h-[1.25vw] w-[1.25vw] max-xl:top-[35%] max-lg:top-[40%]"
          />
          <div className="border-soft-purple pointer-events-none absolute top-0 left-0 h-full w-full rounded-full border-2 mix-blend-overlay" />
        </div>
        <button className="relative flex h-full w-(--h-header) cursor-pointer items-center justify-center rounded-full">
          <Image
            className="relative z-50 h-6/12 w-6/12 text-white"
            src="/settings.svg"
            alt="Settings icon"
            width={36}
            height={36}
          />
          <div className="border-soft-purple bg-dark-indigo shadow-violet absolute top-0 left-0 z-10 h-full w-full rounded-full border-2 mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl" />
          <div className="border-soft-purple absolute top-0 left-0 z-10 h-full w-full rounded-full border-2 mix-blend-overlay" />
        </button>
      </div>
    </header>
  );
};

export default Header;
