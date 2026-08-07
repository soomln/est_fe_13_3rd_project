import ProgressBar from "./ProgressBar";
import DoughnutChart from "./Chart/DoughnutChart";
import ChartLegend from "./Chart/ChartLegend";

export default function InterviewStatistics({chartData, interviewRoutes}){
  const doughnutChartData = {
    labels: chartData.map(item => item.label),
    datasets: [
      {
        data: chartData.map(item => item.value),
        backgroundColor: chartData.map(item => item.color),
        borderWidth: 0,
      },
    ],
  };


  return(
    <>
      <div className="chartSection">
        <ProgressBar value={2.8}/>
        <DoughnutChart data={doughnutChartData}/>
        <ChartLegend chartData={chartData}/>
        <h1>=======면접경로=======</h1>
        {interviewRoutes.map((routes) => (
        <li key={routes.label}>
          <span>{routes.label} </span>
          <span>{routes.value}%</span>
        </li>
        ))}

      </div>
    </>
  );
}