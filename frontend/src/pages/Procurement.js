import { useEffect, useState } from "react";
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
import { getAllProcurement, getProcurementKPIs } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

const REGION_BY_DISTRICT = {
  Almora: "Kumaon",
  Bageshwar: "Kumaon",
  Champawat: "Kumaon",
  Nainital: "Kumaon",
  Pithoragarh: "Kumaon",
  "Udham Singh Nagar": "Kumaon",
  Chamoli: "Garhwal",
  Dehradun: "Garhwal",
  Haridwar: "Garhwal",
  "Pauri Garhwal": "Garhwal",
  Rudraprayag: "Garhwal",
  "Tehri Garhwal": "Garhwal",
  Uttarkashi: "Garhwal",
};

const DISTRICT_ALIASES = {
  pauri: "Pauri Garhwal",
  "pauri garhwal": "Pauri Garhwal",
  tehri: "Tehri Garhwal",
  "tehri garhwal": "Tehri Garhwal",
  usnagar: "Udham Singh Nagar",
  "u s nagar": "Udham Singh Nagar",
  "udham singh nagar": "Udham Singh Nagar",
};

const compactPageWrapperClass =
  `${dashboardClasses.pageWrapper} !h-auto !min-h-full !overflow-visible !p-2`;
const compactContainerClass =
  `${dashboardClasses.dashboardContainer} !flex-none !overflow-visible !gap-2`;
const compactMainContentClass =
  `${dashboardClasses.mainContent} !h-auto !min-h-full !overflow-visible !p-0`;
const compactHeadingRowClass = `${dashboardClasses.pageHeadingRow} !mb-1 !p-2`;
const compactHeadingTitleClass =
  `${dashboardClasses.pageHeadingTitle} !text-[1.65rem] max-[640px]:!text-[1.3rem]`;
const compactNoticeClass = `${dashboardClasses.dashboardNotice} !mb-2 !px-3 !py-2`;
const compactMetricsRowClass = `${dashboardClasses.metricsRow} !mb-2 !gap-3 !p-2`;
const compactMetricCardClassName = (index) =>
  `${metricCardClassName(index)} !rounded-2xl !px-4 !py-[1.15rem] !shadow-[0_8px_18px_rgba(0,0,0,0.10)]`;
const compactMetricValueClass =
  `${dashboardClasses.metricValue} !mb-1.5 !text-[1.65rem] max-[640px]:!text-[1.35rem]`;
const compactMetricLabelClass =
  `${dashboardClasses.metricLabel} !text-[0.82rem] max-[640px]:!text-[0.78rem]`;
const compactChartRowClass = `${dashboardClasses.chartRow} !mb-2 !gap-3 !p-2`;
const compactChartCardClass =
  `${dashboardClasses.chartCard} !h-[230px] !min-h-[230px] !rounded-2xl !p-3 flex flex-col`;
const compactChartCanvasClass = "min-h-0 flex-1 w-full";
const compactTableCardClass =
  `${dashboardClasses.tableCard} !mx-2 !mb-2 !rounded-2xl !p-3 overflow-visible`;

function getSortableSNo(value) {
  const numericValue = Number.parseFloat(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : Number.MAX_SAFE_INTEGER;
}

function normalizeDistrictName(name = "") {
  const cleaned = String(name).trim().replace(/\s+/g, " ");
  return DISTRICT_ALIASES[cleaned.toLowerCase()] || cleaned;
}

function Procurement() {
  const { t } = useLanguage();
  const [procurementData, setProcurementData] = useState([]);
  const [procurementKPIs, setProcurementKPIs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
    fetchKPIs();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const procurementRes = await getAllProcurement();
      const data = Array.isArray(procurementRes.data) ? procurementRes.data : [];

      const normalizedData = data
        .map((item) => ({
          "S.no": item["S.no"] || item.s_no || "",
          District: normalizeDistrictName(item["District"] || item.district || ""),
          Crop: item["Crop"] || item.crop || "",
          "Nos.of Centre": item["Nos.of Centre"] || item.nos_of_centre || 0,
          "Target (in MT)": item["Target (in MT)"] || item.target_in_mt || 0,
          "No. of Farmer's /SHGs":
            item["No. of Farmer's /SHGs"] || item.no_of_farmers_shgs || 0,
          "Procurement quantity (in MT)":
            item["Procurement quantity (in MT)"] || item.procurement_quantity_in_mt || 0,
          "Procurement (in %)":
            item["Procurement (in %)"] || item.procurement_in_percent || 0,
          "Procurement by Pvt. agencies (in MT)":
            item["Procurement by Pvt. agencies (in MT)"] ||
            item.procurement_by_pvt_agencies_in_mt ||
            0,
        }))
        .sort((left, right) => getSortableSNo(left["S.no"]) - getSortableSNo(right["S.no"]));

      setProcurementData(normalizedData);
    } catch {
      setError("Failed to fetch procurement data");
      setProcurementData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKPIs = async () => {
    try {
      const kpiRes = await getProcurementKPIs();
      const kpiData = kpiRes.data;

      setProcurementKPIs({
        totalDistricts: kpiData.total_districts || 0,
        totalCentres: kpiData.total_centres || 0,
        totalTarget: kpiData.total_target || 0,
        totalFarmers: kpiData.total_farmers || 0,
        totalProcurement: kpiData.total_procurement || 0,
        avgProcurement: kpiData.avg_procurement || 0,
        pvtAgenciesProcurement: kpiData.pvt_agencies_procurement || 0,
        cropCoverage: kpiData.crop_coverage || 0,
      });
    } catch {
      setProcurementKPIs({
        totalDistricts: 0,
        totalCentres: 0,
        totalTarget: 0,
        totalFarmers: 0,
        totalProcurement: 0,
        avgProcurement: 0,
        pvtAgenciesProcurement: 0,
        cropCoverage: 0,
      });
    }
  };

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

  const districtProcurement = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurement = Number.parseFloat(item["Procurement quantity (in MT)"] || 0);
    acc[district] = (acc[district] || 0) + procurement;
    return acc;
  }, {});

  const procurementByDistrictData = {
    labels: Object.keys(districtProcurement).sort(),
    datasets: [
      {
        label: "Procurement (MT)",
        data: Object.keys(districtProcurement)
          .sort()
          .map((key) => districtProcurement[key]),
        backgroundColor: "#024b37",
        borderColor: "#035344",
        borderWidth: 1,
      },
    ],
  };

  const procurementByDistrictOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Procurement by District",
        color: "#024b37",
        font: { size: 14, weight: 700 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "District Wise Procurement",
          color: "#000000",
          font: { size: 11, weight: 700 },
        },
        ticks: {
          color: "#000000",
          font: { size: 10, weight: 600 },
          maxRotation: 35,
          minRotation: 35,
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: "#000000",
          font: { size: 10, weight: 600 },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  const regionProcurement = procurementData.reduce(
    (acc, item) => {
      const district = normalizeDistrictName(item.District || "Unknown");
      const region = REGION_BY_DISTRICT[district];
      const procurement = Number.parseFloat(
        String(item["Procurement quantity (in MT)"] || 0).replace(/,/g, ""),
      );

      if (region) {
        acc[region] += procurement;
      }

      return acc;
    },
    { Garhwal: 0, Kumaon: 0 },
  );

  const regionalProcurementData = {
    labels: ["Garhwal", "Kumaon"],
    datasets: [
      {
        data: [
          Number(regionProcurement.Garhwal.toFixed(2)),
          Number(regionProcurement.Kumaon.toFixed(2)),
        ],
        backgroundColor: ["#19a5a5", "#a7307f"],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 3,
        hoverOffset: 10,
      },
    ],
  };

  const regionalProcurementOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#024b37",
          boxWidth: 12,
          boxHeight: 12,
          padding: 12,
          font: { size: 11, weight: 700 },
        },
      },
      title: {
        display: true,
        text: "Garhwal vs Kumaon Procurement",
        color: "#000000",
        font: { size: 14, weight: 700 },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = Number(context.raw || 0);
            return `${context.label}: ${value.toLocaleString("en-IN", {
              maximumFractionDigits: 2,
            })} MT`;
          },
        },
      },
    },
  };

  const achievementData = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurementPct = Number.parseFloat(item["Procurement (in %)"] || 0);
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(procurementPct);
    return acc;
  }, {});

  const avgAchievement = Object.keys(achievementData).reduce((acc, district) => {
    acc[district] =
      achievementData[district].reduce((sum, value) => sum + value, 0) /
      achievementData[district].length;
    return acc;
  }, {});

  const achievementPercentageData = {
    labels: Object.keys(avgAchievement).sort(),
    datasets: [
      {
        label: "Achievement %",
        data: Object.keys(avgAchievement)
          .sort()
          .map((key) => avgAchievement[key].toFixed(2)),
        backgroundColor: [
          "rgba(255, 99, 132, 0.7)",
          "rgba(54, 162, 235, 0.7)",
          "rgba(255, 206, 86, 0.7)",
          "rgba(75, 192, 192, 0.7)",
          "rgba(153, 102, 255, 0.7)",
          "rgba(255, 159, 64, 0.7)",
          "rgba(100, 180, 120, 0.7)",
          "rgba(200, 100, 150, 0.7)",
          "rgba(100, 150, 200, 0.7)",
          "rgba(150, 200, 100, 0.7)",
          "rgba(200, 150, 100, 0.7)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(100, 180, 120, 1)",
          "rgba(200, 100, 150, 1)",
          "rgba(100, 150, 200, 1)",
          "rgba(150, 200, 100, 1)",
          "rgba(200, 150, 100, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const achievementPercentageOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "District Wise Achievement",
        color: "#024b37",
        font: { size: 14, weight: 700 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: "Achievement %",
          color: "#000000",
          font: { size: 11, weight: 700 },
        },
        ticks: {
          color: "#000000",
          font: { size: 10, weight: 600 },
          callback: (value) => `${value}%`,
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
      y: {
        ticks: {
          color: "#000000",
          font: { size: 10, weight: 600 },
        },
        grid: { color: "rgba(0,0,0,0.05)" },
      },
    },
  };

  return (
    <div className={compactPageWrapperClass}>
      <div className={compactContainerClass}>
        <Sidebar />
        <div className={compactMainContentClass}>
          <div className={compactHeadingRowClass} data-aos="fade-up">
            <h2 className={compactHeadingTitleClass}>{t("procurementSummary")}</h2>
          </div>

          {error && <div className={compactNoticeClass}>Warning: {error}</div>}

          <div className={compactMetricsRowClass}>
            {dashboardMetrics.map((metric, index) => (
              <div key={metric.label} className={compactMetricCardClassName(index)}>
                <div className={compactMetricValueClass}>{metric.value}</div>
                <div className={compactMetricLabelClass}>{metric.label}</div>
              </div>
            ))}
          </div>

          <div className={compactChartRowClass}>
            <div className={compactChartCardClass} data-aos="fade-up" key="procurement-by-district">
              <div className={compactChartCanvasClass}>
                <Bar data={procurementByDistrictData} options={procurementByDistrictOptions} />
              </div>
            </div>

            <div className={compactChartCardClass} data-aos="fade-up" data-aos-delay="100" key="regional-procurement">
              <div className={compactChartCanvasClass}>
                <Doughnut
                  data={regionalProcurementData}
                  options={regionalProcurementOptions}
                />
              </div>
            </div>

            <div className={compactChartCardClass} data-aos="fade-up" data-aos-delay="200" key="achievement-percentage">
              <div className={compactChartCanvasClass}>
                <Bar
                  data={achievementPercentageData}
                  options={achievementPercentageOptions}
                />
              </div>
            </div>
          </div>

          <div className={compactTableCardClass} data-aos="fade-up" data-aos-delay="300">
            {loading ? (
              <p className={dashboardClasses.dashboardMessage}>Loading data...</p>
            ) : procurementData.length === 0 ? (
              <p className={dashboardClasses.dashboardMessage}>No procurement data available</p>
            ) : (
              <DataTable
                data={procurementData}
                title="Detailed Procurement Data"
                recordsPerPage={procurementData.length || 1}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Procurement;
