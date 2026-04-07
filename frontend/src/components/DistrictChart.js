import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

function DistrictChart({ data }) {
  const chartData = {
    labels: data.map((d) => d.district),
    datasets: [
      {
        label: "Production (Tons)",
        data: data.map((d) => d.production),
        backgroundColor: [
          '#228B22',
          '#32CD32',
          '#006400',
          '#9ACD32',
          '#6B8E23',
          '#556B2F',
          '#8FBC8F',
        ],
        borderColor: '#ffffff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'District-wise Millet Production',
      },
    },
  };

  return (
    <div className="chart" data-aos="fade-right">
      <h2>District Production</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DistrictChart;