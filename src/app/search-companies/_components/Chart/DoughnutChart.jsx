"use client"

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);



const options = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  cutout: "70%",
};

export default function DoughnutChart({data}) {
  return (
    <Doughnut
      data={data}
      options={options}
    />
  );
}