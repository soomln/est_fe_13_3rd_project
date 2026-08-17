'use client';

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js';
import { Pie } from 'react-chartjs-2';

import { CHART_COLORS } from '@/app/search-companies/_lib/options';
import styles from './RatioPie.module.sass';

ChartJS.register(ArcElement, Tooltip);

const PIE_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

// 파이차트 + 범례
export default function RatioPie({ title, ratio }) {
  const isEmpty = ratio.every((item) => item.value === 0);

  const data = {
    labels: ratio.map((item) => item.label),
    datasets: [
      {
        data: isEmpty ? ratio.map(() => 1) : ratio.map((item) => item.value),
        backgroundColor: ratio.map((_, index) => CHART_COLORS[index % CHART_COLORS.length]),
        borderWidth: 0,
      },
    ],
  };

  return (
    <section className={styles.pie}>
      <h2 className={`${styles.pie_title} font_h3`}>{title}</h2>

      <div className={styles.pie_body}>
        <div className={styles.pie_chart}>
          <Pie data={data} options={PIE_OPTIONS} />
        </div>

        <ul className={styles.pie_legend}>
          {ratio.map((item, index) => (
            <li key={item.code} className={styles.pie_legend_item}>
              <span
                className={styles.pie_dot}
                style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
              />

              <span className={`${styles.pie_legend_text} font_body_l_r`}>
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
