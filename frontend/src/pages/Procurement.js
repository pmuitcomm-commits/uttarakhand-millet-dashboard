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

import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import DataTable from "../components/DataTable";
import { getAllProcurement, getProcurementKPIs } from "../services/api";
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

          {error && (
            <div style={{ 
              padding: '15px', 
              marginBottom: '20px', 
              backgroundColor: '#fee', 
              color: '#c33', 
              borderRadius: '4px' 
            }}>
              ⚠️ {error}
            </div>
          )}

          <div className="dashboard-metrics-row">
            {dashboardMetrics.map((metric) => (
              <div key={metric.label} className="dashboard-metric-card">
                <div className="metric-value">{metric.value}</div>
                <div className="metric-label">{metric.label}</div>
              </div>
            ))}
          </div>

          <div className="dashboard-table-card" data-aos="fade-up" data-aos-delay="300">
            {loading ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>Loading data...</p>
            ) : procurementData.length === 0 ? (
              <p style={{ padding: '20px', textAlign: 'center' }}>No procurement data available</p>
            ) : (
              <DataTable data={procurementData} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Procurement;
