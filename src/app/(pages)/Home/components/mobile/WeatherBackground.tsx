import Image from "next/image";

export default function WeatherBackground() {
  return (
    <Image
      src="/shared/house.mobile.webp"
      alt=""
      aria-hidden
      fill
      priority
      fetchPriority="high"
      sizes="(max-width: 480px) 100vw, 480px"
      className="pointer-events-none !fixed !inset-y-16 -z-[1]"
    />
  );
}
