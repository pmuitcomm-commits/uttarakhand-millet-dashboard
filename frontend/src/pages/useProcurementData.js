import { useEffect, useState } from "react";

import { getAllProcurement, getProcurementKPIs } from "../services/api";
import {
  getEmptyProcurementKPIs,
  mapProcurementKPIs,
  normalizeProcurementRecords,
} from "./procurementDashboardHelpers";

export function useProcurementData() {
  const [procurementData, setProcurementData] = useState([]);
  const [procurementKPIs, setProcurementKPIs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const procurementRes = await getAllProcurement();
        setProcurementData(normalizeProcurementRecords(procurementRes.data));
      } catch {
        setError("Failed to fetch procurement data");
        setProcurementData([]);
      } finally {
        setLoading(false);
      }
    }

    async function fetchKPIs() {
      try {
        const kpiRes = await getProcurementKPIs();
        setProcurementKPIs(mapProcurementKPIs(kpiRes.data));
      } catch {
        setProcurementKPIs(getEmptyProcurementKPIs());
      }
    }

    fetchData();
    fetchKPIs();
  }, []);

  return {
    error,
    loading,
    procurementData,
    procurementKPIs,
  };
}
