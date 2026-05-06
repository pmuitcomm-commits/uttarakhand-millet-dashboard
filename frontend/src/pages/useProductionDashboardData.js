/**
 * Data-loading hook for production dashboard pages.
 */

import { useEffect, useState } from "react";

import districtGeojsonUrl from "../data/district.geojson";
import { getDistrictName } from "../data/districts";
import {
  getAllProduction,
  getDistrictProduction,
  getKPIs,
  getMilletProduction,
} from "../services/api";

function withDistrictName(record) {
  const district = getDistrictName(record);

  return {
    ...record,
    district,
  };
}

function withMilletLabel(record) {
  const millet =
    record.millet ||
    record.millet_name ||
    record.crop ||
    record.millet_id?.toString() ||
    "";

  return {
    ...record,
    millet,
  };
}

export function useProductionDashboardData(page) {
  const [kpis, setKpis] = useState({});
  const [districtData, setDistrictData] = useState([]);
  const [milletData, setMilletData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [overviewGeojson, setOverviewGeojson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataNotice, setDataNotice] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setDataNotice("");

        const kpiRes = await getKPIs();
        setKpis(kpiRes.data);

        const districtRes = await getDistrictProduction();
        setDistrictData((districtRes.data || []).map(withDistrictName));

        const milletRes = await getMilletProduction();
        setMilletData((milletRes.data || []).map(withMilletLabel));

        const tableRes = await getAllProduction();
        setTableData((tableRes.data || []).map((record) => withMilletLabel(withDistrictName(record))));
      } catch {
        setTableData([]);
        setDataNotice("Live production data is unavailable.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (page !== "dashboard") {
      return undefined;
    }

    let isMounted = true;

    async function loadDistrictMap() {
      try {
        if (typeof districtGeojsonUrl !== "string") {
          if (isMounted) {
            setOverviewGeojson(districtGeojsonUrl);
          }
          return;
        }

        const response = await fetch(districtGeojsonUrl);
        if (!response.ok) {
          throw new Error("Map data unavailable");
        }

        const data = await response.json();
        if (isMounted) {
          setOverviewGeojson(data);
        }
      } catch {
        if (isMounted) {
          setOverviewGeojson(null);
        }
      }
    }

    loadDistrictMap();

    return () => {
      isMounted = false;
    };
  }, [page]);

  return {
    dataNotice,
    districtData,
    kpis,
    loading,
    milletData,
    overviewGeojson,
    tableData,
  };
}
