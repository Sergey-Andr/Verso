import React from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const SearchCity = dynamic(() => import("@/app/(components)/SearchCity"), {
  ssr: false,
});

const Settings = dynamic(
  () => import("@/app/(Header)/components/SettingsDesktop"),
  {
    ssr: false,
  },
);

const Header = () => {
  return (
    <header className="mb-11 flex h-14 w-full items-center justify-between">
      <Link href="/" className="relative flex items-center gap-4">
        <Image
          src="/logo.png"
          alt=""
          aria-hidden="true"
          width={56}
          height={56}
          sizes="(max-width: 640px) 40px, 56px"
          priority
          className="shadow-violet rounded-full"
        />
        <p className="relative z-10 text-4xl">Verso</p>
        <div className="bg-conic-gradient quad-header-left absolute top-0 left-1/3 -z-1 h-16 w-32 rounded-3xl blur-2xl" />
      </Link>

      <div className="flex h-full items-center gap-11">
        <SearchCity />
        <Settings />
      </div>
    </header>
  );
};

export default Header;
