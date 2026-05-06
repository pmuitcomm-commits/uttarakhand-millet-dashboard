/**
 * MilletChart component module - Visualizes millet-wise production share.
 *
 * The pie chart supports dashboard pages that compare production across millet
 * crop categories.
 */

import { Pie } from "react-chartjs-2";
import { chartClasses } from "./dashboardStyles";

/**
 * MilletChart - Render millet production as a pie chart.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.data - Millet production records.
 * @returns {React.ReactElement} Chart container.
 */
function MilletChart({ data }) {
  const chartData = {
    labels: data.map((m) => m.millet),
    datasets: [
      {
        label: "Production",
        data: data.map((m) => m.production),
        backgroundColor: [
          '#228B22',
          '#32CD32',
          '#006400',
          '#9ACD32',
          '#6B8E23',
          '#556B2F',
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Millet-wise Production Distribution',
      },
    },
  };

  return (
    <div className={chartClasses.wrapper} data-aos="fade-left">
      <h2 className={chartClasses.title}>Millet Production</h2>
      <Pie data={chartData} options={options} />
    </div>
  );
}

export default MilletChart;
