/**
 * DistrictChart component module - Visualizes district-wise production totals.
 *
 * The bar chart supports public and officer dashboards by showing relative
 * production contribution across Uttarakhand districts.
 */

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
import { chartClasses } from "./dashboardStyles";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

/**
 * DistrictChart - Render district production as a bar chart.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.data - District production records.
 * @returns {React.ReactElement} Chart container.
 */
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
    maintainAspectRatio: true,
    maxBarThickness: 40,
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
    <div className={chartClasses.wrapper} data-aos="fade-right">
      <h2 className={chartClasses.title}>District Production</h2>
      <Bar data={chartData} options={options} />
    </div>
  );
}

export default DistrictChart;
