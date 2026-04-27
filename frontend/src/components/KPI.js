/**
 * KPI component module - Displays high-level dashboard metric cards.
 *
 * This component is retained for reusable production KPI summaries.
 */

import { dashboardClasses, metricCardClassName } from "./dashboardStyles";

/**
 * KPI - Render production KPI cards from dashboard data.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Object} props.data - KPI response object from the backend.
 * @returns {React.ReactElement} KPI metric row.
 */
function KPI({ data }) {
  return (
    <div className={dashboardClasses.metricsRow}>
      <div className={metricCardClassName(0)} data-aos="zoom-in" data-aos-delay="100">
        <h3 className={dashboardClasses.metricValue}>{data.total_production || 0}</h3>
        <p className={dashboardClasses.metricLabel}>Total Production (Tons)</p>
      </div>

      <div className={metricCardClassName(1)} data-aos="zoom-in" data-aos-delay="200">
        <h3 className={dashboardClasses.metricValue}>{data.total_districts || 0}</h3>
        <p className={dashboardClasses.metricLabel}>Total Districts</p>
      </div>

      <div className={metricCardClassName(2)} data-aos="zoom-in" data-aos-delay="300">
        <h3 className={dashboardClasses.metricValue}>{data.total_millets || 0}</h3>
        <p className={dashboardClasses.metricLabel}>Millet Types</p>
      </div>

      <div className={metricCardClassName(3)} data-aos="zoom-in" data-aos-delay="400">
        <h3 className={dashboardClasses.metricValue}>{data.total_records || 0}</h3>
        <p className={dashboardClasses.metricLabel}>Total Records</p>
      </div>
    </div>
  );
}

export default KPI;
