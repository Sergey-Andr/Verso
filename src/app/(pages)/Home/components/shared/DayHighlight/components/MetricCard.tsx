import React from "react";
import cx from "clsx";

const MetricCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <li
      className={cx(
        "relative z-50 flex h-[159px] w-full flex-col p-4",
        className,
      )}
    >
      {children}
      <div className="from-violet/20 to-violet/80 bg-gradient-65 absolute top-0 left-0 -z-1 h-full w-full rounded-3xl border border-white/40 bg-gradient-to-b from-60% opacity-65 brightness-125 contrast-175" />
    </li>
  );
};

export default MetricCard;
