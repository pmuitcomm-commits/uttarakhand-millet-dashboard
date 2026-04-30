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
import { dashboardClasses } from "../components/dashboardStyles";
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

const procurementMainContentClass = `${dashboardClasses.mainContent} pb-4`;

const procurementMetricsRowClass =
  "mb-3 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-3 p-2 max-[1280px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[640px]:mb-3 max-[640px]:grid-cols-1 max-[640px]:gap-3 max-[640px]:p-2";

const procurementMetricToneClasses = [
  "border-0 bg-[#024b37] text-white",
  "border-0 bg-[#003366] text-white",
  "border-0 bg-[#66b9ac] text-white",
  "border-0 bg-[#fedd56] text-[#024b37]",
  "border-0 bg-[#831843] text-white",
  "border-0 bg-[#c12f2f] text-white",
  "border border-[#e0e0e0] bg-white text-[#024b37] dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  "border-0 bg-[#e67e22] text-white",
];

const procurementMetricCardClassName = (index) =>
  [
    "group min-w-0 cursor-pointer rounded-2xl px-4 py-[1.15rem] text-center shadow-[0_8px_18px_rgba(0,0,0,0.10)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_12px_24px_rgba(0,0,0,0.14)] max-[640px]:rounded-xl max-[640px]:px-4 max-[640px]:py-4 max-[640px]:hover:translate-y-0 max-[640px]:hover:scale-100",
    procurementMetricToneClasses[index % procurementMetricToneClasses.length],
  ].join(" ");

const procurementMetricValueClass =
  "mb-1.5 block min-w-0 break-words text-[1.65rem] font-extrabold leading-tight text-inherit transition-transform duration-300 group-hover:scale-105 max-[640px]:text-[1.35rem]";

const procurementMetricLabelClass =
  "min-w-0 break-words text-[0.82rem] font-semibold leading-snug text-inherit opacity-90 max-[640px]:text-[0.78rem]";

const procurementTableCardClass =
  "mx-4 mb-6 min-w-0 rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-card max-[640px]:mx-2 max-[640px]:rounded-xl max-[640px]:p-3 dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white";

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
        <div className={procurementMainContentClass}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>{t("procurementSummary")}</h2>
          </div>

          {error && (
            <div className={dashboardClasses.dashboardNotice}>
              ⚠️ {error}
            </div>
          )}

          <div className={procurementMetricsRowClass}>
            {dashboardMetrics.map((metric, index) => (
              <div key={metric.label} className={procurementMetricCardClassName(index)}>
                <div className={procurementMetricValueClass}>{metric.value}</div>
                <div className={procurementMetricLabelClass}>{metric.label}</div>
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

          <div className={procurementTableCardClass} data-aos="fade-up" data-aos-delay="300">
            {loading ? (
              <p className={dashboardClasses.dashboardMessage}>Loading data...</p>
            ) : procurementData.length === 0 ? (
              <p className={dashboardClasses.dashboardMessage}>No procurement data available</p>
            ) : (
              <DataTable
                data={procurementData}
                recordsPerPage={Math.max(procurementData.length, 1)}
                title="Detailed Procurement Data"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Procurement;
