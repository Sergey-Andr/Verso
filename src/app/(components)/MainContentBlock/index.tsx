"use client";
import React, { useEffect } from "react";

/*
   function adjustZoom() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      // Обчислюємо коефіцієнт масштабування
      const widthRatio = currentWidth / 1920;
      const heightRatio = currentHeight / 1080;

      // Обираємо мінімальний масштаб
      const scale = Math.min(widthRatio, heightRatio, 1); // не більше 1

      // Застосовуємо transform до обгортки
      const root = document.body;

      root.style.transform = `scale(${scale})`;
      root.style.transformOrigin = "top left";

      // Щоб wrapper займав реальний розмір (не 100vw/100vh)
      root.style.width = `${1920}px`;
      root.style.height = `${1080}px`;

      // Центруємо (можна прибрати)
      root.style.position = "absolute";
      root.style.left = `${(currentWidth - 1920 * scale) / 2}px`;
      root.style.top = `${(currentHeight - 1080 * scale) / 2}px`;
    }
    * */

const MainContentBackgroundLayer = () => {
  useEffect(() => {
    function adjustZoom() {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;

      const widthRatio = currentWidth / 1920;
      const heightRatio = currentHeight / 1080;

      const scale = Math.min(widthRatio, heightRatio, 1);

      const root = document.body;

      root.style.transform = `scale(${scale})`;
      root.style.transformOrigin = "top left";

      root.style.width = `${1920}px`;
      root.style.height = `${1080}px`;

      root.style.position = "absolute";
      root.style.left = `${(currentWidth - 1920 * scale) / 2}px`;
      root.style.top = `${(currentHeight - 1080 * scale) / 2}px`;
    }

    adjustZoom();
    window.onresize = adjustZoom;
  }, []);
  return (
    <div className="absolute top-0 left-0 h-full w-full">
      <div className="bg-dark-indigo border-soft-purple absolute top-0 left-0 h-full w-full rounded-3xl border-4 mix-blend-soft-light brightness-122 contrast-75 backdrop-blur-xl" />
      <div className="border-soft-purple absolute top-0 left-0 h-full w-full rounded-3xl border-4 mix-blend-overlay" />
    </div>
  );
};

export default MainContentBackgroundLayer;
