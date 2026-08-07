"use client";

export default function ChartLegend({ chartData }) {
  return (
    <ul>
      {chartData.map((item) => (
        <li key={item.label}>
          <span
            style={{ backgroundColor: item.color }}
          />
          <span>{item.label} </span>
          <span>{item.value}%</span>
        </li>
      ))}
    </ul>
  );
}