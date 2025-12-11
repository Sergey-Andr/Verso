import React from "react";
import cx from "clsx";
import { motion, MotionValue, useTransform } from "framer-motion";
import Image from "next/image";

type PanelBackgroundProps = {
  mainWeatherOpacity: MotionValue<number>;
  stationaryContentY: MotionValue<number>;
  backgroundOverlayOpacity: MotionValue<number>;
  borderRadius: MotionValue<string>;
};

const PanelBackground = ({
  mainWeatherOpacity,
  stationaryContentY,
  backgroundOverlayOpacity,
  borderRadius,
}: PanelBackgroundProps) => {
  const boxShadow = useTransform(mainWeatherOpacity, (latestState: number) =>
    latestState * 100 < 5
      ? "inset 0px 5px 5px -4px #FFFFFF33"
      : "inset 0px 5px 5px -4px #ffffff",
  );
  return (
    <>
      <motion.div
        style={{ y: stationaryContentY }}
        className="absolute inset-0 h-screen will-change-[transform] before:pointer-events-none before:absolute before:inset-0 before:z-1 before:h-full before:w-full before:bg-gradient-to-b before:from-[#2E335A] before:from-50% before:to-[#9452D1]/20 before:blur-xl"
      >
        <Image
          className="absolute bottom-0 h-screen w-screen object-cover"
          src="/background/bg-night-sky.mobile.jpg"
          alt="main background"
          fill
          priority
          sizes="100vw"
          fetchPriority="high"
          placeholder="blur"
          blurDataURL="/background/blurred-night-sky.mobile.jpg"
        />
        <Image
          src="/shared/house.mobile.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 480px) 100vw, 480px"
          fetchPriority="high"
          className="!fixed !inset-y-16 z-1"
        />
      </motion.div>
      <motion.div
        className={cx(
          "bg-violet/5 absolute inset-0 z-10 h-full w-full touch-none backdrop-blur-2xl will-change-[backdrop-filter]",
        )}
        style={{
          borderRadius,
          boxShadow,
        }}
      />
      <motion.div
        style={{ opacity: backgroundOverlayOpacity }}
        className="from-deep-indigo to-charcoal-indigo absolute inset-0 h-full w-screen bg-linear-145 will-change-[opacity] contain-paint"
      />
      <motion.div
        className="bg-soft-purple/10 absolute inset-0 z-1 h-full w-full blur-3xl will-change-[opacity]"
        style={{ opacity: backgroundOverlayOpacity }}
      />
    </>
  );
};

export default PanelBackground;
