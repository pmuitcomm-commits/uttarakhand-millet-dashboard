import { useEffect, useState, useMemo } from "react";
import _ from "lodash";
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

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import { getAllProcurement } from "../services/api";
import { useLanguage } from "../context/LanguageContext";
import "../styles/dashboard.css";

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const procurementRes = await getAllProcurement();
      setProcurementData(procurementRes.data);
    } catch (error) {
      console.error("Procurement API Error:", error);
    }
  };

  const procurementKPIs = useMemo(() => {
    if (procurementData.length === 0) return {};

    return {
      totalDistricts: _.uniqBy(procurementData, "District").length,
      totalCentres: _.sumBy(procurementData, "Nos.of Centre"),
      totalTarget: _.sumBy(procurementData, "Target (in MT)"),
      totalFarmers: _.sumBy(procurementData, "No. of Farmer's /SHGs"),
      totalProcurement: _.sumBy(procurementData, "Procurement quantity (in MT)"),
      avgProcurement: _.meanBy(procurementData, "Procurement (in %)").toFixed(2),
      pvtAgenciesProcurement: _.sumBy(procurementData, "Procurement by Pvt. agencies (in MT)"),
      cropCoverage: _.uniqBy(procurementData, "Crop").length,
    };
  }, [procurementData]);

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

  return (
    <div className="page-wrapper">
      <TopBar />
      <div className="dashboard-container">
        <Sidebar />
        <div className="main-content">
          <Header />

          <div className="page-heading-row" data-aos="fade-up">
            <h2>{t('procurementSummary')}</h2>
          </div>

          <div className="dashboard-metrics-row">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="dashboard-metric-card">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-table-card" data-aos="fade-up" data-aos-delay="300">
            <DataTable data={procurementData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Procurement;
