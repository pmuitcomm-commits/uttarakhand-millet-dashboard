import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import { dashboardClasses, metricCardClassName } from "../components/dashboardStyles";
import { getAllProcurement, getProcurementKPIs } from "../services/api";
import { useLanguage } from "../context/LanguageContext";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

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
      
      // Handle both array and non-array responses
      const data = Array.isArray(procurementRes.data) ? procurementRes.data : [];
      
      // Normalize field names if needed
      const normalizedData = data.map(item => ({
        "S.no": item["S.no"] || item.s_no || "",
        "District": item["District"] || item.district || "",
        "Crop": item["Crop"] || item.crop || "",
        "Nos.of Centre": item["Nos.of Centre"] || item.nos_of_centre || 0,
        "Target (in MT)": item["Target (in MT)"] || item.target_in_mt || 0,
        "No. of Farmer's /SHGs": item["No. of Farmer's /SHGs"] || item.no_of_farmers_shgs || 0,
        "Procurement quantity (in MT)": item["Procurement quantity (in MT)"] || item.procurement_quantity_in_mt || 0,
        "Procurement (in %)": item["Procurement (in %)"] || item.procurement_in_percent || 0,
        "Procurement by Pvt. agencies (in MT)": item["Procurement by Pvt. agencies (in MT)"] || item.procurement_by_pvt_agencies_in_mt || 0,
      }));
      
      setProcurementData(normalizedData);
    } catch (error) {
      console.error("Procurement API Error:", error);
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
      
      // Map backend KPI keys to frontend display format
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
    } catch (error) {
      console.error("KPI Fetch Error:", error);
      // Fallback to showing zeros if KPI fetch fails
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
    { label: t('totalDistricts'), value: procurementKPIs.totalDistricts || 0 },
    { label: t('totalCentres'), value: procurementKPIs.totalCentres || 0 },
    { label: t('totalTarget'), value: procurementKPIs.totalTarget || 0 },
    { label: t('totalFarmers'), value: procurementKPIs.totalFarmers || 0 },
    { label: t('totalProcurement'), value: procurementKPIs.totalProcurement || 0 },
    { label: t('avgProcurement'), value: procurementKPIs.avgProcurement || 0 },
    { label: t('pvtAgencies'), value: procurementKPIs.pvtAgenciesProcurement || 0 },
    { label: t('cropCoverage'), value: procurementKPIs.cropCoverage || 0 },
  ];

  // Chart 1: Procurement by District (Bar Chart)
  const districtProcurement = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurement = parseFloat(item["Procurement quantity (in MT)"] || 0);
    acc[district] = (acc[district] || 0) + procurement;
    return acc;
  }, {});

  const procurementByDistrictData = {
    labels: Object.keys(districtProcurement).sort(),
    datasets: [
      {
        label: "Procurement (MT)",
        data: Object.keys(districtProcurement).sort().map(key => districtProcurement[key]),
        backgroundColor: "#024b37",
        borderColor: "#035344",
        borderWidth: 1,
      },
    ],
  };

  const procurementByDistrictOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Procurement by District",
        color: '#024b37',
        font: { size: 16, weight: 700 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Chart 2: Target vs Actual Procurement (Line Chart)
  const targetVsActual = procurementData.reduce((acc, item) => {
    const crop = item.Crop || "Unknown";
    if (!acc[crop]) {
      acc[crop] = { target: 0, actual: 0 };
    }
    acc[crop].target += parseFloat(item["Target (in MT)"] || 0);
    acc[crop].actual += parseFloat(item["Procurement quantity (in MT)"] || 0);
    return acc;
  }, {});

  const targetVsActualData = {
    labels: Object.keys(targetVsActual).sort(),
    datasets: [
      {
        label: "Target (MT)",
        data: Object.keys(targetVsActual).sort().map(key => targetVsActual[key].target),
        borderColor: "#ff6b6b",
        backgroundColor: "rgba(255, 107, 107, 0.1)",
        tension: 0.35,
        pointRadius: 4,
        fill: true,
      },
      {
        label: "Actual (MT)",
        data: Object.keys(targetVsActual).sort().map(key => targetVsActual[key].actual),
        borderColor: "#51cf66",
        backgroundColor: "rgba(81, 207, 102, 0.1)",
        tension: 0.35,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const targetVsActualOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: "Target vs Actual Procurement by Crop",
        color: '#024b37',
        font: { size: 16, weight: 700 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  // Chart 3: Procurement Achievement % (Bar Chart)
  const achievementData = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurementPct = parseFloat(item["Procurement (in %)"] || 0);
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(procurementPct);
    return acc;
  }, {});

  const avgAchievement = Object.keys(achievementData).reduce((acc, district) => {
    acc[district] = achievementData[district].reduce((a, b) => a + b, 0) / achievementData[district].length;
    return acc;
  }, {});

  const achievementPercentageData = {
    labels: Object.keys(avgAchievement).sort(),
    datasets: [
      {
        label: "Achievement %",
        data: Object.keys(avgAchievement).sort().map(key => avgAchievement[key].toFixed(2)),
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
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Procurement Achievement % by District",
        color: '#024b37',
        font: { size: 16, weight: 700 },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
          callback: (value) => `${value}%`,
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y: {
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  };

  return (
    <div className={dashboardClasses.pageWrapper}>
      <TopBar />
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <Header />

          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>{t('procurementSummary')}</h2>
          </div>

          {error && (
            <div className={dashboardClasses.dashboardNotice}>
              ⚠️ {error}
            </div>
          )}

          <div className={dashboardClasses.metricsRow}>
            {dashboardMetrics.map((metric, index) => (
              <div key={metric.label} className={metricCardClassName(index)}>
                <div className={dashboardClasses.metricValue}>{metric.value}</div>
                <div className={dashboardClasses.metricLabel}>{metric.label}</div>
              </div>
            ))}
          </div>

          <div className={dashboardClasses.chartRow}>
            <div className={dashboardClasses.chartCard} data-aos="fade-up" key="procurement-by-district">
              <Bar data={procurementByDistrictData} options={procurementByDistrictOptions} />
            </div>
            <div className={dashboardClasses.chartCard} data-aos="fade-up" data-aos-delay="100" key="target-vs-actual">
              <Line data={targetVsActualData} options={targetVsActualOptions} />
            </div>
            <div className={dashboardClasses.chartCard} data-aos="fade-up" data-aos-delay="200" key="achievement-percentage">
              <Bar data={achievementPercentageData} options={achievementPercentageOptions} />
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
