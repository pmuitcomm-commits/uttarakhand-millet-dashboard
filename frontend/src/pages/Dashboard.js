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
import { Line } from "react-chartjs-2";

import Sidebar from "../components/Sidebar";
import DistrictChart from "../components/DistrictChart";
import MilletChart from "../components/MilletChart";
import DataTable from "../components/DataTable";
import { dashboardClasses, metricCardClassName } from "../components/dashboardStyles";
import { useLanguage } from "../context/LanguageContext";
import { getDistrictName, uttarakhandDistricts } from "../data/districts";

import {
  getKPIs,
  getDistrictProduction,
  getMilletProduction,
  getAllProduction,
} from "../services/api";

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

function withDistrictName(record) {
  const district = getDistrictName(record);

  return {
    ...record,
    district,
  };
}

function Dashboard({ page = "dashboard" }) {
  const { t } = useLanguage();
  const [kpis, setKpis] = useState({});
  const [districtData, setDistrictData] = useState([]);
  const [milletData, setMilletData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedMillet, setSelectedMillet] = useState("all");

  const pageTitles = {
    dashboard: t('overviewDashboard'),
    production: t('productionSummary'),
    district: t('districtAnalysisTitle'),
    millet: t('milletAnalysisTitle'),
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const kpiRes = await getKPIs();
      setKpis(kpiRes.data);

      const districtRes = await getDistrictProduction();
      setDistrictData((districtRes.data || []).map(withDistrictName));

      const milletRes = await getMilletProduction();
      setMilletData(milletRes.data);

      const tableRes = await getAllProduction();
      setTableData((tableRes.data || []).map(withDistrictName));
    } catch {
      setTableData([]);
    }
  };

  // Filter data based on selected district
  const filteredDistrictData = selectedDistrict === "all" 
    ? districtData 
    : districtData.filter(item => item.district === selectedDistrict);

  const filteredTableData = selectedDistrict === "all" 
    ? tableData 
    : tableData.filter(item => item.district === selectedDistrict);

  // Filter data based on selected millet
  const filteredMilletData = selectedMillet === "all"
    ? milletData
    : milletData.filter(item => item.millet === selectedMillet);

  const milletVarieties = ["Mandua", "Jhangora", "Ramdana", "Cheena", "Kauni"];

  // For millet page, use filtered data; otherwise use all data
  const dataForMilletMetrics = page === "millet" ? filteredMilletData : milletData;

  // For district page, use filtered data; otherwise use all data
  const dataForMetrics = page === "district" ? filteredDistrictData : districtData;
  
  const totalProduction = page === "district" 
    ? (dataForMetrics.reduce((sum, item) => sum + (item.production || 0), 0)).toFixed(2)
    : kpis.total_production || 0;
  const totalTarget = Math.max(Math.round(totalProduction * 1.8), 10000);
  const totalCentres = Math.max(districtData.length * 12, 210);
  const totalFarmers = 11837;
  const avgProcurement = dataForMetrics.length
    ? (
        dataForMetrics.reduce((sum, item) => sum + (item.production || 0), 0) /
        dataForMetrics.length
      ).toFixed(2)
    : 0;
  const pvtAgencies = Math.round(totalProduction * 0.05);
  const cropCoverage = 1;

  const avgDistrictProduction = dataForMetrics.length
    ? (
        dataForMetrics.reduce((sum, item) => sum + (item.production || 0), 0) / dataForMetrics.length
      ).toFixed(2)
    : 0;

  const highestDistrict = dataForMetrics.length
    ? dataForMetrics.reduce((max, item) =>
        item.production > max.production ? item : max,
      dataForMetrics[0])
    : null;

  const lowestDistrict = dataForMetrics.length
    ? dataForMetrics.reduce((min, item) =>
        item.production < min.production ? item : min,
      dataForMetrics[0])
    : null;

  const districtsAboveAverage = dataForMetrics.length
    ? dataForMetrics.filter((item) => item.production > avgDistrictProduction).length
    : 0;

  const topMilletItem = dataForMilletMetrics.length
    ? dataForMilletMetrics.reduce((max, item) =>
        item.production > max.production ? item : max,
      dataForMilletMetrics[0])
    : null;

  const topMilletShare = topMilletItem && totalProduction
    ? ((topMilletItem.production / totalProduction) * 100).toFixed(2)
    : "0";

  const avgMilletProduction = page === "millet" && filteredMilletData.length
    ? (filteredMilletData.reduce((sum, item) => sum + (item.production || 0), 0) / filteredMilletData.length).toFixed(2)
    : (milletData.length
        ? (milletData.reduce((sum, item) => sum + (item.production || 0), 0) / milletData.length).toFixed(2)
        : 0);

  const procurementTrendData = {
    labels: dataForMetrics.map((d) => d.district),
    datasets: [
      {
        label: "Procurement %",
        data: dataForMetrics.map((d) => {
          const value = d.production || 0;
          return totalProduction ? Math.min((value / totalProduction) * 100, 100) : 0;
        }),
        borderColor: "#88ce99",
        backgroundColor: "rgba(136, 206, 153, 0.24)",
        tension: 0.35,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const procurementTrendOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: t('procurementByDistrict'),
        color: '#f8fafc',
        font: { size: 16, weight: 700 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
          callback: (value) => `${value}%`,
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
        },
      },
    },
  };

  const pageMetricsMap = {
    dashboard: [
      { label: t('totalDistricts'), value: kpis.total_districts || districtData.length },
      { label: t('totalCentres'), value: totalCentres },
      { label: t('totalTarget'), value: totalTarget },
      { label: t('totalFarmers'), value: totalFarmers },
      { label: t('totalProcurement'), value: totalProduction },
      { label: t('avgProcurement'), value: avgProcurement },
      { label: t('pvtAgencies'), value: pvtAgencies },
      { label: t('cropCoverage'), value: cropCoverage },
    ],
    production: [
      { label: t('totalProduction'), value: totalProduction },
      { label: t('totalTarget'), value: totalTarget },
      { label: t('totalCentres'), value: totalCentres },
      { label: t('totalFarmers'), value: totalFarmers },
      { label: t('avgDistrictProd'), value: avgDistrictProduction },
      { label: t('avgProcurement'), value: avgProcurement },
      { label: t('pvtAgencies'), value: pvtAgencies },
      { label: t('cropCoverage'), value: cropCoverage },
    ],
    district: [
      { label: t('totalDistricts'), value: uttarakhandDistricts.length },
      { label: t('totalProduction'), value: totalProduction },
      { label: t('avgDistrictProd'), value: avgDistrictProduction },
      {
        label: t('highestProducing'),
        value: highestDistrict ? `${highestDistrict.district} (${highestDistrict.production})` : "-",
      },
      {
        label: t('lowestProducing'),
        value: lowestDistrict ? `${lowestDistrict.district} (${lowestDistrict.production})` : "-",
      },
      { label: t('districtsAboveAvg'), value: districtsAboveAverage },
      { label: t('avgProcurement'), value: avgProcurement },
      { label: t('productionGoal'), value: totalTarget },
    ],
    millet: [
      { label: t('milletVarieties'), value: milletData.length },
      { label: t('totalProduction'), value: totalProduction },
      { label: t('topMillet'), value: topMilletItem ? topMilletItem.millet : "-" },
      { label: t('topMilletShare'), value: `${topMilletShare}%` },
      { label: t('avgMilletProd'), value: avgMilletProduction },
      { label: t('totalTarget'), value: totalTarget },
      { label: t('pvtAgencies'), value: pvtAgencies },
      { label: t('cropCoverage'), value: cropCoverage },
    ],
  };

  const isMilletPage = page === "millet";

  const milletTrendData = {
    labels: milletData.map((m) => m.millet),
    datasets: [
      {
        label: "Millet Production",
        data: milletData.map((m) => m.production),
        borderColor: "#f7d060",
        backgroundColor: "rgba(247, 208, 96, 0.25)",
        tension: 0.35,
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const milletTrendOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Millet Production by Variety",
        color: '#f8fafc',
        font: { size: 16, weight: 700 },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#000000',
          font: { size: 12, weight: 600 },
        },
        grid: {
          color: 'rgba(255,255,255,0.08)',
        },
      },
    },
  };

  const chartCards = [];

  if (!isMilletPage) {
    chartCards.push(
      <div className={dashboardClasses.chartCard} data-aos="fade-up" key="district-chart">
        <DistrictChart data={page === "district" ? filteredDistrictData : districtData} />
      </div>
    );
  }

  // Always show millet chart on all pages
  chartCards.push(
    <div className={dashboardClasses.chartCard} data-aos="fade-up" data-aos-delay="100" key="millet-chart">
      <MilletChart data={page === "millet" ? filteredMilletData : (page === "district" ? filteredDistrictData : milletData)} />
    </div>
  );

  if (isMilletPage) {
    chartCards.push(
      <div className={dashboardClasses.chartCard} data-aos="fade-up" data-aos-delay="200" key="millet-line-chart">
        <Line data={milletTrendData} options={milletTrendOptions} />
      </div>
    );
  } else {
    chartCards.push(
      <div className={dashboardClasses.chartCard} data-aos="fade-up" data-aos-delay="200" key="procurement-line-chart">
        <Line data={procurementTrendData} options={procurementTrendOptions} />
      </div>
    );
  }

  const pageTitle = pageTitles[page] || pageTitles.dashboard;

  // Determine table data based on page and filters
  const getTableData = () => {
    if (page === "district") return filteredTableData;
    if (page === "millet") {
      return selectedMillet === "all" 
        ? tableData 
        : tableData.filter(item => item.millet === selectedMillet);
    }
    return tableData;
  };

  const getTableTitle = () => {
    if (page === "production") return "Production Records";
    if (page === "district") return "District Production Records";
    if (page === "millet") return "Millet Production Records";
    return "Production Overview";
  };

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>{pageTitle}</h2>
            {page === "district" && (
              <div className={dashboardClasses.selectorWrapper}>
                <select 
                  value={selectedDistrict} 
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className={dashboardClasses.selector}
                >
                  <option value="all">All Districts</option>
                  {uttarakhandDistricts.map((district) => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {page === "millet" && (
              <div className={dashboardClasses.selectorWrapper}>
                <select 
                  value={selectedMillet} 
                  onChange={(e) => setSelectedMillet(e.target.value)}
                  className={dashboardClasses.selector}
                >
                  <option value="all">All Millets</option>
                  {milletVarieties.map((millet) => (
                    <option key={millet} value={millet}>
                      {millet}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={dashboardClasses.metricsRow}>
            {(pageMetricsMap[page] || pageMetricsMap.dashboard).map((metric, index) => (
              <div key={metric.label} className={metricCardClassName(index)}>
                <div className={dashboardClasses.metricValue}>{metric.value}</div>
                <div className={dashboardClasses.metricLabel}>{metric.label}</div>
              </div>
            ))}
          </div>

          <div className={dashboardClasses.chartRow}>{chartCards}</div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="300">
            <DataTable
              data={getTableData()}
              title={getTableTitle()}
            />
          </div>
        </div>
      </div>
    </div>
  );

}

export default Dashboard;
