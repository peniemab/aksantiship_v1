"use client";

import {
  Chart as ChartJS,
  Filler,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
} from "chart.js";
import type { ChartData, ChartOptions } from "chart.js";
import { Radar } from "react-chartjs-2";

ChartJS.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler);

const RED = "rgb(227, 27, 35)";
const RED_FILL = "rgba(227, 27, 35, 0.18)";
const ORANGE = "rgb(247, 148, 29)";
const ORANGE_FILL = "rgba(247, 148, 29, 0.12)";
const GRID = "rgba(26, 26, 46, 0.07)";

const PROFILE_LABELS = ["Académique", "Langues", "Documents", "Éligibilité", "Profil"];

function backdropOptions(): ChartOptions<"radar"> {
  return {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 1200, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    elements: {
      line: { borderWidth: 2.5 },
      point: { radius: 0, hoverRadius: 0 },
    },
    scales: {
      r: {
        angleLines: { color: GRID },
        grid: { color: GRID },
        ticks: { display: false, stepSize: 25 },
        pointLabels: { display: false },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
    layout: { padding: 4 },
  };
}

const backdropData: ChartData<"radar"> = {
  labels: PROFILE_LABELS,
  datasets: [
    {
      data: [78, 65, 58, 88, 72],
      fill: true,
      backgroundColor: RED_FILL,
      borderColor: RED,
      borderWidth: 2.5,
    },
    {
      data: [55, 82, 48, 62, 70],
      fill: true,
      backgroundColor: ORANGE_FILL,
      borderColor: ORANGE,
      borderWidth: 2,
    },
  ],
};

const ghostData: ChartData<"radar"> = {
  labels: PROFILE_LABELS,
  datasets: [
    {
      data: [62, 48, 70, 55, 60],
      fill: true,
      backgroundColor: "rgba(247, 148, 29, 0.08)",
      borderColor: "rgba(247, 148, 29, 0.35)",
      borderWidth: 2,
    },
  ],
};

type BackdropRadarProps = {
  data?: ChartData<"radar">;
  className?: string;
};

function BackdropRadar({ data = backdropData, className }: BackdropRadarProps) {
  return (
    <div className={className} aria-hidden>
      <Radar data={data} options={backdropOptions()} />
    </div>
  );
}

/** Grands radars en filigrane — remplissent les zones blanches du hero. */
export function HeroRadarBackdrop() {
  return (
    <>
      <BackdropRadar className="pointer-events-none absolute left-1/2 top-20 size-56 -translate-x-1/2 opacity-50 sm:top-24 sm:size-72 lg:size-80" />
      <BackdropRadar
        data={ghostData}
        className="pointer-events-none absolute right-0 top-1/2 size-44 -translate-y-1/2 opacity-35 sm:size-56 lg:right-8"
      />
      <BackdropRadar
        data={ghostData}
        className="pointer-events-none absolute bottom-4 left-1/3 size-36 opacity-25 max-lg:hidden"
      />
    </>
  );
}
