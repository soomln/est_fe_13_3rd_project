import ProgressBar from "./ProgressBar";
import DoughnutChart from "./Chart/DoughnutChart";
import ChartLegend from "./Chart/ChartLegend";

const PIE_COLORS = ["#C4B5FD", "#BBF7D0", "#E9F5A1"];

function toChartData(ratio) {
  return {
    labels: ratio.map((item) => item.label),
    datasets: [
      {
        data: ratio.map((item) => item.value),
        backgroundColor: ratio.map((_, index) => PIE_COLORS[index % PIE_COLORS.length]),
        borderWidth: 0,
      },
    ],
  };
}

function withColor(ratio) {
  return ratio.map((item, index) => ({ ...item, color: PIE_COLORS[index % PIE_COLORS.length] }));
}

export default function InterviewStatistics({ stats }) {
  return (
    <section>
      <ProgressBar value={stats.difficultyAvg} grade={stats.difficultyGrade} />

      <h3>면접 경험</h3>
      <DoughnutChart data={toChartData(stats.experienceRatio)} />
      <ChartLegend chartData={withColor(stats.experienceRatio)} />

      <h3>면접 경로</h3>
      <ul>
        {stats.channelRatio.map((channel) => (
          <li key={channel.code}>
            <span>{channel.label} </span>
            <span>{channel.value}%</span>
          </li>
        ))}
      </ul>

      <h3>면접 결과</h3>
      <DoughnutChart data={toChartData(stats.resultRatio)} />
      <ChartLegend chartData={withColor(stats.resultRatio)} />
    </section>
  );
}
