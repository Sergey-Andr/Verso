"use client";
import React, { useEffect } from "react";

const ScreenScalar = () => {
  useEffect(() => {
    const adjustZoom = () => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      const designWidth = 1920;
      const designHeight = 1080;

      const widthRatio = currentWidth / designWidth;
      const heightRatio = currentHeight / designHeight;

      const wrapper = document.getElementById("main-wrapper");
      if (!wrapper) return;

      wrapper.style.transform = `scale(${widthRatio}, ${heightRatio})`;
      wrapper.style.transformOrigin = "top left";

      wrapper.style.position = "fixed";
      wrapper.style.left = `0px`;
      wrapper.style.top = `0px`;
    };

    adjustZoom();
    window.addEventListener("resize", adjustZoom);
    return () => window.removeEventListener("resize", adjustZoom);
  }, []);
  return <></>;
};

export default ScreenScalar;
