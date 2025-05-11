import React from "react";

const TemperaturesBlock = () => {
  return (
    <>
      <h3 className="text-label relative z-50 mb-3 flex">Temperatures</h3>
      <div className="relative h-full w-full">
        <ul className="flex h-full w-full items-end justify-between rounded-3xl p-[2.5vmin] pb-[5vmin] pl-[5vmin]">
          <li className="relative h-[60%] w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
          <li className="relative flex h-[77%] w-[2.5vw] flex-col items-center justify-between rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-70 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
            <div className="relative -top-[calc(100%+1.5vh+4.44vh)] -mb-[4.44vh] flex h-[3.33vh] w-fit items-center justify-center rounded-lg p-3 text-nowrap">
              <p className="text-temperatures-active-temp relative z-50 h-fit w-fit">
                20&nbsp;
                <span className="text-temperatures-active-temp-symbol">°C</span>
              </p>
              <div className="absolute top-0 left-0 z-40 h-full w-full rounded-lg border-2 border-white mix-blend-soft-light backdrop-blur-2xl"></div>
              <span
                className="absolute top-[calc(100%-2px)] left-1/2 z-40 h-3 w-4 -translate-x-1/2 bg-[#B2A4E7] mix-blend-overlay brightness-110 contrast-95"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
              />
              <span
                className="absolute top-[calc(100%-2px)] left-1/2 z-40 h-3 w-4 -translate-x-1/2 bg-[#4d32db] brightness-115 contrast-115"
                style={{ clipPath: "polygon(0% 0%, 100% 0%, 50% 100%)" }}
              />
              <div className="absolute top-0 left-0 z-30 h-full w-full rounded-lg bg-[#B2A4E7] mix-blend-overlay brightness-110 contrast-95 backdrop-blur-2xl"></div>
            </div>
          </li>
          <li className="relative h-full w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
          <li className="relative h-full w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
          <li className="relative h-[85%] w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
          <li className="relative h-[50%] w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
          <li className="relative h-[35%] w-[2.5vw] rounded-t-3xl">
            <div className="absolute top-0 left-0 z-20 h-full w-full rounded-t-3xl bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% opacity-35 backdrop-blur-2xl" />
            <div className="relative z-30 h-full w-full rounded-t-3xl border-2 border-white bg-gradient-to-b from-[#D24FC3] from-5% via-[#CB53D1] via-35% to-[#3859B2] to-80% mix-blend-overlay backdrop-blur-2xl" />
          </li>
        </ul>
        <ul className="text-temperatures-xy-axis absolute top-[2.5vmin] left-[2.5vmin] z-10 flex h-full w-full flex-col items-start justify-between pb-[7vh] text-white/50">
          <li>25</li>
          <li>20</li>
          <li>15</li>
          <li>10</li>
          <li>5</li>
          <li>0</li>
        </ul>
        <ul className="absolute top-[3.4vmin] left-[5vmin] z-10 flex h-full w-[calc(100%-8.4vmin)] flex-col items-start justify-between pb-[8.4vh] text-white/50">
          <li className="h-0.5 w-full bg-white/50"></li>
          <li className="h-0.5 w-full bg-white/50"></li>
          <li className="h-0.5 w-full bg-white/50"></li>
          <li className="h-0.5 w-full bg-white/50"></li>
          <li className="h-0.5 w-full bg-white/50"></li>
          <li className="h-0.5 w-full bg-white/50"></li>
        </ul>
        <ul className="text-temperatures-xy-axis absolute -bottom-[3.5vmin] left-[5vmin] z-50 flex h-fit w-full items-start justify-between pr-[7.7vmin] pb-[5vh] text-white/50">
          <li>03:00</li>
          <li>06:00</li>
          <li>09:00</li>
          <li>12:00</li>
          <li>15:00</li>
          <li>18:00</li>
          <li>21:00</li>
        </ul>
        <div className="absolute top-0 left-0 z-1 h-full w-full rounded-3xl border-1 border-[#444C8D] bg-[#2B0B54]/75 opacity-75 mix-blend-soft-light brightness-175 contrast-115" />
      </div>
    </>
  );
};

export default TemperaturesBlock;
