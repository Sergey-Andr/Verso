import MainContentBackgroundLayer from "@/app/(components)/MainContentBlock";
import React from "react";
import MainInfoBlock from "@/app/(components)/MainInfoBlock";
import HighlightBlock from "@/app/(components)/HighlightBlock";
import Header from "@/app/(components)/Header";
import TemperaturesBlock from "@/app/(components)/TemperaturesBlock";
import SixDaysForecastBlock from "@/app/(components)/SixDaysForecastBlock";

export default function Home() {
  return (
    <div className="flex h-full min-h-screen min-w-screen flex-col px-16 py-8">
      <Header />
      <main className="h-[calc(100dvh-32px-theme(--h-header)-24px-32px)] flex w-full flex-col items-center gap-11 sm:items-start">
        <div className="flex h-[53%] w-full gap-11">
          <section className="relative w-[54%] overflow-hidden rounded-3xl p-[2.5vmin]">
            <MainInfoBlock />
            <MainContentBackgroundLayer />
          </section>
          <section className="relative flex h-full w-[46%] flex-col overflow-hidden rounded-3xl p-[2.5vmin]">
            <HighlightBlock />
            <MainContentBackgroundLayer />
          </section>
        </div>
        <div className="flex h-[47%] w-full gap-11">
          <section className="relative flex h-full w-[46%] flex-col overflow-hidden rounded-3xl p-[2.5vmin]">
            <SixDaysForecastBlock />
            <MainContentBackgroundLayer />
          </section>
          <section className="relative flex h-full w-[54%] flex-col overflow-hidden rounded-3xl p-[2.5vmin]">
            <TemperaturesBlock />
            <MainContentBackgroundLayer />
          </section>
        </div>
      </main>
      <footer className=""></footer>
    </div>
  );
}
