"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
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

export default function BarChart({data}) {
  return (
    <Bar
      data={data}
      options={options}
    />
  );
}
