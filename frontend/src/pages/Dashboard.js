/**
 * Dashboard page module - Production, district, millet, and overview analytics.
 *
 * This module builds Chart.js datasets, map models, KPI metrics, and data
 * tables for the public Millet MIS dashboards using API-provided data.
 */

import { useEffect, useMemo, useState } from "react";
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
import { Bar, Chart, Line } from "react-chartjs-2";

import Sidebar from "../components/Sidebar";
import DistrictChart from "../components/DistrictChart";
import MilletChart from "../components/MilletChart";
import DataTable from "../components/DataTable";
import { dashboardClasses, metricCardClassName } from "../components/dashboardStyles";
import { useLanguage } from "../context/LanguageContext";
import {
  CardInsight,
  ChartFrame,
  DistrictCoverageMap,
  EmptyState,
  formatCompactNumber,
  formatNumber,
  LoadingState,
  overviewChartOptions,
  OverviewCard,
  OverviewDataTable,
  overviewSearchClassName,
  OverviewSelect,
  pointValueLabelsPlugin,
  chartOptionsWithTooltip,
} from "./dashboardViewComponents";
import {
  chcCmscProgress,
  districtCoverage,
  enterpriseDetails,
  enterpriseProgress,
  enterpriseTypes,
  enterpriseYears,
  getCropDemonstrationRows,
  getOverviewFinancialYears,
  getOverviewSeasons,
  milletDemonstrationProgress,
  ragiProcurementProgress,
} from "./overviewDashboardData";
import { useProductionDashboardData } from "./useProductionDashboardData";

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

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function getMilletLabel(record) {
  if (!record) return "";
  return record.millet || record.millet_name || record.crop || record.millet_id?.toString() || "";
}

/**
 * Dashboard - Render the selected Millet MIS analytics page.
 *
 * The ``page`` prop switches between the state overview, production summary,
 * district analysis, and millet analysis views while sharing data fetching,
 * KPI calculations, chart rendering, and data table behavior.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.page="dashboard"] - Dashboard page variant.
 * @returns {React.ReactElement} Dashboard page.
 */
function Dashboard({ page = "dashboard" }) {
  const { t } = useLanguage();
  const {
    dataNotice,
    districtData,
    kpis,
    loading,
    milletData,
    overviewGeojson,
    tableData,
  } = useProductionDashboardData(page);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedMillet, setSelectedMillet] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedEnterpriseYear, setSelectedEnterpriseYear] = useState("");
  const [selectedEnterpriseDistrict, setSelectedEnterpriseDistrict] = useState("all");
  const [enterpriseSearch, setEnterpriseSearch] = useState("");

  const pageTitles = {
    dashboard: t('overviewDashboard'),
    production: t('productionSummary'),
    district: t('districtAnalysisTitle'),
    millet: t('milletAnalysisTitle'),
  };

  const districtOptions = useMemo(
    () =>
      uniqueSorted(
        [...districtData, ...tableData].map((record) => record.district)
      ),
    [districtData, tableData]
  );

  const milletOptions = useMemo(
    () =>
      uniqueSorted(
        [...milletData, ...tableData].map((record) => getMilletLabel(record))
      ),
    [milletData, tableData]
  );

  const overviewFinancialYears = useMemo(
    () => getOverviewFinancialYears(tableData),
    [tableData]
  );

  const overviewSeasons = useMemo(
    () => getOverviewSeasons(tableData),
    [tableData]
  );

  useEffect(() => {
    if (!selectedFinancialYear && overviewFinancialYears.length) {
      setSelectedFinancialYear(overviewFinancialYears[0]);
    }
  }, [overviewFinancialYears, selectedFinancialYear]);

  useEffect(() => {
    if (!selectedSeason && overviewSeasons.length) {
      setSelectedSeason(overviewSeasons[0]);
    }
  }, [overviewSeasons, selectedSeason]);

  // Filter data based on selected district for district analysis.
  const filteredDistrictData = selectedDistrict === "all" 
    ? districtData 
    : districtData.filter(item => item.district === selectedDistrict);

  const filteredTableData = selectedDistrict === "all" 
    ? tableData 
    : tableData.filter(item => item.district === selectedDistrict);

  // Filter data based on selected millet for crop analysis.
  const filteredMilletData = selectedMillet === "all"
    ? milletData
    : milletData.filter(item => getMilletLabel(item) === selectedMillet);

  const cropDemoRows = useMemo(
    () => getCropDemonstrationRows(tableData, selectedFinancialYear, selectedSeason),
    [tableData, selectedFinancialYear, selectedSeason]
  );

  const enterpriseChartRows = useMemo(() => {
    // Summarize enterprise counts by type after year and district filters.
    const filteredRows = enterpriseProgress.filter(
      (row) =>
        row.year === selectedEnterpriseYear &&
        (selectedEnterpriseDistrict === "all" ||
          row.district === selectedEnterpriseDistrict)
    );

    return enterpriseTypes.map((enterpriseType) =>
      filteredRows
        .filter((row) => row.enterpriseType === enterpriseType)
        .reduce(
          (summary, row) => ({
            enterpriseType,
            wshg: summary.wshg + row.wshg,
            fpo: summary.fpo + row.fpo,
          }),
          { enterpriseType, wshg: 0, fpo: 0 }
        )
    );
  }, [selectedEnterpriseDistrict, selectedEnterpriseYear]);

  const filteredEnterpriseDetails = useMemo(() => {
    // Apply officer-friendly search across enterprise unit and district labels.
    const searchTerm = enterpriseSearch.trim().toLowerCase();

    return enterpriseDetails.filter((row) => {
      const matchesYear = row.year === selectedEnterpriseYear;
      const matchesDistrict =
        selectedEnterpriseDistrict === "all" ||
        row.district === selectedEnterpriseDistrict;
      const matchesSearch =
        !searchTerm ||
        row.unitName.toLowerCase().includes(searchTerm) ||
        row.district.toLowerCase().includes(searchTerm);

      return matchesYear && matchesDistrict && matchesSearch;
    });
  }, [enterpriseSearch, selectedEnterpriseDistrict, selectedEnterpriseYear]);

  const highestAreaLowFarmerDistrict = useMemo(() => {
    // Identify districts with high area but comparatively lower farmer density.
    if (!cropDemoRows.length) return null;

    return cropDemoRows.reduce((selected, row) => {
      const rowEfficiency = row.farmers ? row.areaAchievement / row.farmers : 0;
      const selectedEfficiency = selected.farmers
        ? selected.areaAchievement / selected.farmers
        : 0;

      if (
        row.areaAchievement > selected.areaAchievement &&
        rowEfficiency < selectedEfficiency
      ) {
        return row;
      }

      return selected;
    }, cropDemoRows[0]);
  }, [cropDemoRows]);

  const highFarmerLowAreaDistrict = useMemo(() => {
    // Identify districts with high farmer participation but smaller area per farmer.
    if (!cropDemoRows.length) return null;

    return cropDemoRows.reduce((selected, row) => {
      const rowAreaPerFarmer = row.farmers ? row.areaAchievement / row.farmers : 0;
      const selectedAreaPerFarmer = selected.farmers
        ? selected.areaAchievement / selected.farmers
        : Number.POSITIVE_INFINITY;

      if (row.farmers > selected.farmers && rowAreaPerFarmer < selectedAreaPerFarmer) {
        return row;
      }

      return selected;
    }, cropDemoRows[0]);
  }, [cropDemoRows]);

  const cropDemoChartData = {
    labels: cropDemoRows.map((row) => row.district),
    datasets: [
      {
        type: "bar",
        label: "Area Achievement (ha)",
        data: cropDemoRows.map((row) => row.areaAchievement),
        yAxisID: "y",
        backgroundColor: "rgba(102, 185, 172, 0.78)",
        borderColor: "#2f7f79",
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 28,
      },
      {
        type: "line",
        label: "Number of Farmers",
        data: cropDemoRows.map((row) => row.farmers),
        yAxisID: "y1",
        borderColor: "#831843",
        backgroundColor: "rgba(131, 24, 67, 0.16)",
        borderWidth: 3,
        pointBackgroundColor: "#831843",
        pointRadius: 3.5,
        tension: 0.34,
      },
    ],
  };

  const cropDemoOptions = chartOptionsWithTooltip(
    overviewChartOptions({
      xTitle: "Districts",
      yTitle: "Area Achievement (ha)",
      y1Title: "Farmers",
    }),
    (context) => {
      const unit = context.dataset.yAxisID === "y" ? "ha" : "farmers";
      return `${context.dataset.label}: ${formatNumber(context.parsed.y)} ${unit}`;
    }
  );

  const milletProgressChartData = {
    labels: milletDemonstrationProgress.map((row) => row.year),
    datasets: [
      {
        type: "line",
        label: "Farmers",
        data: milletDemonstrationProgress.map((row) => row.farmers),
        yAxisID: "y",
        borderColor: "#024b37",
        backgroundColor: "rgba(2, 75, 55, 0.12)",
        borderWidth: 3,
        pointBackgroundColor: "#024b37",
        pointRadius: 4,
        tension: 0.36,
      },
      {
        type: "line",
        label: "Area Demonstration (ha)",
        data: milletDemonstrationProgress.map((row) => row.areaDemonstration),
        yAxisID: "y1",
        borderColor: "#e67e22",
        backgroundColor: "rgba(230, 126, 34, 0.12)",
        borderWidth: 3,
        pointBackgroundColor: "#e67e22",
        pointRadius: 4,
        tension: 0.36,
      },
    ],
  };

  const milletProgressOptions = chartOptionsWithTooltip(
    overviewChartOptions({
      xTitle: "Financial Year",
      yTitle: "Farmers",
      y1Title: "Area (ha)",
    }),
    (context) => {
      const unit = context.dataset.yAxisID === "y" ? "farmers" : "ha";
      return `${context.dataset.label}: ${formatNumber(context.parsed.y)} ${unit}`;
    }
  );

  milletProgressOptions.plugins.pointValueLabels = {
    formatter: (value) => formatCompactNumber(value),
  };

  const ragiProcurementChartData = {
    labels: ragiProcurementProgress.map((row) => row.year),
    datasets: [
      {
        type: "line",
        label: "Quantity Procured (quintals)",
        data: ragiProcurementProgress.map((row) => row.quantityProcured),
        yAxisID: "y",
        borderColor: "#003366",
        backgroundColor: "rgba(0, 51, 102, 0.12)",
        borderWidth: 3,
        pointBackgroundColor: "#003366",
        pointRadius: 4,
        tension: 0.34,
      },
      {
        type: "line",
        label: "Farmers Covered",
        data: ragiProcurementProgress.map((row) => row.farmersCovered),
        yAxisID: "y1",
        borderColor: "#c12f2f",
        backgroundColor: "rgba(193, 47, 47, 0.12)",
        borderWidth: 3,
        pointBackgroundColor: "#c12f2f",
        pointRadius: 4,
        tension: 0.34,
      },
    ],
  };

  const ragiProcurementOptions = chartOptionsWithTooltip(
    overviewChartOptions({
      xTitle: "Financial Year",
      yTitle: "Quantity (quintals)",
      y1Title: "Farmers",
    }),
    (context) => {
      const unit = context.dataset.yAxisID === "y" ? "quintals" : "farmers";
      return `${context.dataset.label}: ${formatNumber(context.parsed.y)} ${unit}`;
    }
  );

  ragiProcurementOptions.plugins.pointValueLabels = {
    formatter: (value) => formatCompactNumber(value),
  };

  const ragiPeak = ragiProcurementProgress.length
    ? ragiProcurementProgress.reduce((peak, row) =>
        row.quantityProcured > peak.quantityProcured ? row : peak
      )
    : null;
  const ragiDip = ragiProcurementProgress.length
    ? ragiProcurementProgress.reduce((dip, row) =>
        row.quantityProcured < dip.quantityProcured ? row : dip
      )
    : null;

  const infrastructureChartData = {
    labels: chcCmscProgress.map((row) => row.district),
    datasets: [
      {
        type: "bar",
        label: "Programme Blocks",
        data: chcCmscProgress.map((row) => row.programmeBlocks),
        yAxisID: "y",
        backgroundColor: "rgba(2, 75, 55, 0.76)",
        borderColor: "#024b37",
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 28,
      },
      {
        type: "line",
        label: "CHC count",
        data: chcCmscProgress.map((row) => row.chcCount),
        yAxisID: "y1",
        borderColor: "#f0b429",
        backgroundColor: "rgba(240, 180, 41, 0.14)",
        borderWidth: 3,
        pointBackgroundColor: "#f0b429",
        pointRadius: 3.5,
        tension: 0.34,
      },
      {
        type: "line",
        label: "CMSC count",
        data: chcCmscProgress.map((row) => row.cmscCount),
        yAxisID: "y1",
        borderColor: "#831843",
        backgroundColor: "rgba(131, 24, 67, 0.14)",
        borderWidth: 3,
        pointBackgroundColor: "#831843",
        pointRadius: 3.5,
        tension: 0.34,
      },
    ],
  };

  const infrastructureOptions = chartOptionsWithTooltip(
    overviewChartOptions({
      xTitle: "Districts",
      yTitle: "Programme Blocks",
      y1Title: "Facilities",
    }),
    (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
  );

  const enterpriseChartData = {
    labels: enterpriseChartRows.map((row) => row.enterpriseType),
    datasets: [
      {
        label: "Enterprises with WSHGs",
        data: enterpriseChartRows.map((row) => row.wshg),
        backgroundColor: "rgba(102, 185, 172, 0.82)",
        borderColor: "#2f7f79",
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 32,
      },
      {
        label: "Enterprises with FPOs",
        data: enterpriseChartRows.map((row) => row.fpo),
        backgroundColor: "rgba(254, 221, 86, 0.9)",
        borderColor: "#b99200",
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 32,
      },
    ],
  };

  const enterpriseOptions = chartOptionsWithTooltip(
    overviewChartOptions({
      xTitle: "Enterprise types",
      yTitle: "Enterprise count",
    }),
    (context) => `${context.dataset.label}: ${formatNumber(context.parsed.y)}`
  );

  const enterpriseDetailRows = filteredEnterpriseDetails.map((row) => ({
    unitName: row.unitName,
    wshgCount: row.wshgCount,
    fpoCount: row.fpoCount,
  }));

  const enterpriseDetailColumns = [
    { key: "unitName", label: "Unit Name" },
    { key: "wshgCount", label: "WSHG count", numeric: true },
    { key: "fpoCount", label: "FPO count", numeric: true },
  ];

  const districtCoverageColumns = [
    { key: "district", label: "District" },
    { key: "totalBlocks", label: "Total Blocks", numeric: true },
    { key: "gps", label: "No. of GPs", numeric: true },
    { key: "villages", label: "Villages", numeric: true },
    { key: "totalFarmers", label: "Total Farmers", numeric: true },
  ];

  const overviewSummary = {
    farmers: districtCoverage.reduce((sum, row) => sum + row.totalFarmers, 0),
    villages: districtCoverage.reduce((sum, row) => sum + row.villages, 0),
    blocks: districtCoverage.reduce((sum, row) => sum + row.totalBlocks, 0),
  };

  if (page === "dashboard") {
    return (
      <div className={dashboardClasses.pageWrapper}>
        <div className={dashboardClasses.dashboardContainer}>
          <Sidebar />
          <div className={dashboardClasses.mainContent}>
            <div className={`${dashboardClasses.pageHeadingRow} !mb-3`} data-aos="fade-up">
              <h2 className={dashboardClasses.pageHeadingTitle}>{pageTitles.dashboard}</h2>
              <p className="mx-auto mt-2 max-w-4xl text-sm font-semibold leading-relaxed text-[#4a5f58] dark:text-[#d5dfdc]">
                State overview for Shree Anna Abhiyan coverage, demonstrations,
                procurement, infrastructure, enterprises, and district reach.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold text-[#024b37] dark:text-white">
                <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
                  {formatNumber(overviewSummary.blocks)} blocks
                </span>
                <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
                  {formatNumber(overviewSummary.villages)} villages
                </span>
                <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
                  {formatNumber(overviewSummary.farmers)} farmers
                </span>
              </div>
            </div>

            {dataNotice ? (
              <div className="mx-4 mb-4 rounded-lg border border-[#f0d98a] bg-[#fff8dc] px-4 py-3 text-sm font-semibold text-[#5f4a00] max-[640px]:mx-2 dark:border-[#7c6a28] dark:bg-[#2b2614] dark:text-[#fff2b8]">
                {dataNotice}
              </div>
            ) : null}

            {/* Overview grid uses two columns on desktop and collapses to one column on small screens. */}
            <div className="grid min-w-0 grid-cols-1 gap-5 p-4 min-[1024px]:grid-cols-2 max-[640px]:gap-3 max-[640px]:p-2">
              <OverviewCard
                title="Crop Demonstration Overview"
                subtitle="Coverage and farmer participation by district."
                controls={
                  <>
                    <OverviewSelect
                      label="Financial Year"
                      value={selectedFinancialYear}
                      onChange={setSelectedFinancialYear}
                    >
                      {overviewFinancialYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </OverviewSelect>
                    <OverviewSelect
                      label="Select Season"
                      value={selectedSeason}
                      onChange={setSelectedSeason}
                    >
                      {overviewSeasons.map((season) => (
                        <option key={season} value={season}>
                          {season}
                        </option>
                      ))}
                    </OverviewSelect>
                  </>
                }
              >
                {loading ? (
                  <LoadingState />
                ) : cropDemoRows.length ? (
                  <>
                    <ChartFrame>
                      <Chart type="bar" data={cropDemoChartData} options={cropDemoOptions} />
                    </ChartFrame>
                    <CardInsight>
                      {highestAreaLowFarmerDistrict?.district || "-"} shows a high area base,
                      while {highFarmerLowAreaDistrict?.district || "-"} indicates higher
                      farmer participation with lower area per farmer.
                    </CardInsight>
                  </>
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="Millet Demonstration Progress"
                subtitle="Year-wise comparison of farmers and demonstration area."
              >
                {loading ? (
                  <LoadingState />
                ) : milletDemonstrationProgress.length ? (
                  <ChartFrame>
                    <Line
                      data={milletProgressChartData}
                      options={milletProgressOptions}
                      plugins={[pointValueLabelsPlugin]}
                    />
                  </ChartFrame>
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="Ragi Procurement Progress"
                subtitle="Procurement quantity and farmers covered over time."
              >
                {loading ? (
                  <LoadingState />
                ) : ragiProcurementProgress.length ? (
                  <>
                    <ChartFrame>
                      <Line
                        data={ragiProcurementChartData}
                        options={ragiProcurementOptions}
                        plugins={[pointValueLabelsPlugin]}
                      />
                    </ChartFrame>
                    <CardInsight>
                      Peak procurement is {formatNumber(ragiPeak.quantityProcured)} quintals in{" "}
                      {ragiPeak.year}; the lowest point is {formatNumber(ragiDip.quantityProcured)}{" "}
                      quintals in {ragiDip.year}.
                    </CardInsight>
                  </>
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="CHC & CMSC Establishment Progress"
                subtitle="Programme blocks compared with established facilities."
              >
                {loading ? (
                  <LoadingState />
                ) : chcCmscProgress.length ? (
                  <ChartFrame>
                    <Chart
                      type="bar"
                      data={infrastructureChartData}
                      options={infrastructureOptions}
                    />
                  </ChartFrame>
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="Millet Enterprise Progress"
                subtitle="Enterprise ecosystem by WSHG and FPO ownership."
                controls={
                  <>
                    <OverviewSelect
                      label="Year"
                      value={selectedEnterpriseYear}
                      onChange={setSelectedEnterpriseYear}
                    >
                      {enterpriseYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </OverviewSelect>
                    <OverviewSelect
                      label="District"
                      value={selectedEnterpriseDistrict}
                      onChange={setSelectedEnterpriseDistrict}
                    >
                      <option value="all">All Districts</option>
                      {districtOptions.map((district) => (
                        <option key={district} value={district}>
                          {district}
                        </option>
                      ))}
                    </OverviewSelect>
                  </>
                }
              >
                {loading ? (
                  <LoadingState />
                ) : enterpriseChartRows.some((row) => row.wshg || row.fpo) ? (
                  <ChartFrame>
                    <Bar data={enterpriseChartData} options={enterpriseOptions} />
                  </ChartFrame>
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="Enterprise Details"
                subtitle="Unit-level counts supporting the enterprise chart."
                controls={
                  <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#4a5f58] max-[640px]:w-full dark:text-[#d5dfdc]">
                    <span>Search</span>
                    <input
                      aria-label="Search enterprise units"
                      className={overviewSearchClassName}
                      placeholder="Search unit or district"
                      type="search"
                      value={enterpriseSearch}
                      onChange={(event) => setEnterpriseSearch(event.target.value)}
                    />
                  </label>
                }
              >
                {loading ? (
                  <LoadingState />
                ) : (
                  <OverviewDataTable
                    columns={enterpriseDetailColumns}
                    emptyLabel="No enterprise units match this selection."
                    rows={enterpriseDetailRows}
                  />
                )}
              </OverviewCard>

              <OverviewCard
                title="Scale of Shree Anna Abhiyan"
                subtitle="District-wise spatial reach based on farmer coverage."
              >
                {loading ? (
                  <LoadingState />
                ) : districtCoverage.length ? (
                  <DistrictCoverageMap geojson={overviewGeojson} rows={districtCoverage} />
                ) : (
                  <EmptyState />
                )}
              </OverviewCard>

              <OverviewCard
                title="District-wise Coverage"
                subtitle="Administrative coverage metrics for planning and monitoring."
              >
                {loading ? (
                  <LoadingState />
                ) : (
                  <OverviewDataTable
                    columns={districtCoverageColumns}
                    emptyLabel="No district coverage rows available."
                    rows={districtCoverage}
                  />
                )}
              </OverviewCard>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // For millet page, use filtered data; otherwise use all data.
  const dataForMilletMetrics = page === "millet" ? filteredMilletData : milletData;

  // For district page, use filtered data; otherwise use all data.
  const dataForMetrics = page === "district" ? filteredDistrictData : districtData;
  
  const totalProduction = page === "district" 
    ? (dataForMetrics.reduce((sum, item) => sum + (item.production || 0), 0)).toFixed(2)
    : kpis.total_production || 0;
  const totalProductionNumber = Number(totalProduction) || 0;
  const totalTarget = kpis.total_target || 0;
  const totalCentres = kpis.total_centres || 0;
  const totalFarmers = kpis.total_farmers || 0;
  const avgProcurement = dataForMetrics.length
    ? (
        dataForMetrics.reduce((sum, item) => sum + (item.production || 0), 0) /
        dataForMetrics.length
      ).toFixed(2)
    : 0;
  const pvtAgencies = kpis.pvt_agencies_procurement || kpis.pvt_agencies || 0;
  const cropCoverage = kpis.crop_coverage || kpis.total_millets || 0;

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

  const topMilletShare = topMilletItem && totalProductionNumber
    ? ((topMilletItem.production / totalProductionNumber) * 100).toFixed(2)
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
          return totalProductionNumber ? Math.min((value / totalProductionNumber) * 100, 100) : 0;
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
      { label: t('totalDistricts'), value: kpis.total_districts || districtOptions.length },
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

  // Always show millet chart on all pages for crop-level comparison.
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

  // Determine table data based on page and filters.
  const getTableData = () => {
    if (page === "district") return filteredTableData;
    if (page === "millet") {
      return selectedMillet === "all" 
        ? tableData 
        : tableData.filter(item => getMilletLabel(item) === selectedMillet);
    }
    return tableData;
  };

  const getTableTitle = () => {
    if (page === "production") return "Production Records";
    if (page === "district") return "District Production Records";
    if (page === "millet") return "Millet Production Records";
    return "Production Overview";
  };

  const tableRows = getTableData();

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          {/* Shared Tailwind heading block includes responsive filter controls for district/millet pages. */}
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
                  {districtOptions.map((district) => (
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
                  {milletOptions.map((millet) => (
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
              data={tableRows}
              recordsPerPage={Math.max(tableRows.length, 1)}
              title={getTableTitle()}
            />
          </div>
        </div>
      </div>
    </div>
  );

}

export default Dashboard;
