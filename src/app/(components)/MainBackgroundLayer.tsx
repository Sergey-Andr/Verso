import React from "react";
import cx from "clsx";

const MainBackgroundLayer = ({ borderWidth = 4, className }:{borderWidth?:number, className?:string}) => {
  return (
    <div className="absolute top-0 left-0 h-full w-full">
      <div
        className={cx(
          `bg-dark-indigo border-soft-purple absolute top-0 left-0 h-full w-full overflow-hidden rounded-3xl mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl`,
          className
        )}
        style={{ borderWidth }}
      />
      <div
        className={cx(
          `border-soft-purple absolute top-0 left-0 h-full w-full rounded-3xl mix-blend-overlay`,
        )}
        style={{ borderWidth }}
      />
    </div>
  );
};

export default MainBackgroundLayer;
