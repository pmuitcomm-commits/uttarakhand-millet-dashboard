/**
 * Procurement page - Displays procurement KPIs, charts, and detailed records.
 *
 * The page combines backend procurement data with district/region normalization
 * so state officers can review centre coverage, procurement quantity, and
 * achievement percentages.
 */

import { useMemo } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import { dashboardClasses, metricCardClassName } from "../components/dashboardStyles";
import { useLanguage } from "../context/LanguageContext";
import {
  buildAchievementPercentageChart,
  buildProcurementByDistrictChart,
  buildRegionalProcurementChart,
} from "./procurementDashboardHelpers";
import { useProcurementData } from "./useProcurementData";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const compactMetricsRowClass = `${dashboardClasses.metricsRow} !mb-2 !gap-3 !p-2`;

const compactMetricCardClassName = (index) =>
  `${metricCardClassName(index)} !rounded-2xl !px-4 !py-[1.15rem] !shadow-[0_8px_18px_rgba(0,0,0,0.10)]`;

const compactMetricValueClass =
  `${dashboardClasses.metricValue} !mb-1.5 !text-[1.65rem] max-[640px]:!text-[1.35rem]`;

const compactMetricLabelClass =
  `${dashboardClasses.metricLabel} !text-[0.82rem] max-[640px]:!text-[0.78rem]`;

function Procurement() {
  const { t } = useLanguage();
  const { error, loading, procurementData, procurementKPIs } = useProcurementData();

  const procurementByDistrictChart = useMemo(
    () => buildProcurementByDistrictChart(procurementData),
    [procurementData]
  );
  const regionalProcurementChart = useMemo(
    () => buildRegionalProcurementChart(procurementData),
    [procurementData]
  );
  const achievementPercentageChart = useMemo(
    () => buildAchievementPercentageChart(procurementData),
    [procurementData]
  );

  const dashboardMetrics = [
    { label: t("totalDistricts"), value: procurementKPIs.totalDistricts || 0 },
    { label: t("totalCentres"), value: procurementKPIs.totalCentres || 0 },
    { label: t("totalTarget"), value: procurementKPIs.totalTarget || 0 },
    { label: t("totalFarmers"), value: procurementKPIs.totalFarmers || 0 },
    { label: t("totalProcurement"), value: procurementKPIs.totalProcurement || 0 },
    { label: t("avgProcurement"), value: procurementKPIs.avgProcurement || 0 },
    { label: t("pvtAgencies"), value: procurementKPIs.pvtAgenciesProcurement || 0 },
    { label: t("cropCoverage"), value: procurementKPIs.cropCoverage || 0 },
  ];

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>{t("procurementSummary")}</h2>
          </div>

          {error && (
            <div className={dashboardClasses.dashboardNotice}>
              ⚠️ {error}
            </div>
          )}

          <div className={compactMetricsRowClass}>
            {dashboardMetrics.map((metric, index) => (
              <div key={metric.label} className={compactMetricCardClassName(index)}>
                <div className={compactMetricValueClass}>{metric.value}</div>
                <div className={compactMetricLabelClass}>{metric.label}</div>
              </div>
            ))}
          </div>

          <div className={dashboardClasses.chartRow}>
            <div
              className={dashboardClasses.chartCard}
              data-aos="fade-up"
              key="procurement-by-district"
            >
              <Bar
                data={procurementByDistrictChart.data}
                options={procurementByDistrictChart.options}
              />
            </div>
            <div
              className={dashboardClasses.chartCard}
              data-aos="fade-up"
              data-aos-delay="100"
              key="regional-procurement"
            >
              <Doughnut
                data={regionalProcurementChart.data}
                options={regionalProcurementChart.options}
              />
            </div>
            <div
              className={dashboardClasses.chartCard}
              data-aos="fade-up"
              data-aos-delay="200"
              key="achievement-percentage"
            >
              <Bar
                data={achievementPercentageChart.data}
                options={achievementPercentageChart.options}
              />
            </div>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            {loading ? (
              <p className={dashboardClasses.dashboardMessage}>Loading data...</p>
            ) : procurementData.length === 0 ? (
              <p className={dashboardClasses.dashboardMessage}>No procurement data available</p>
            ) : (
              <DataTable data={procurementData} title="Detailed Procurement Data" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Procurement;
