/**
 * Dashboard page module - Production, district, millet, and overview analytics.
 *
 * This module builds Chart.js datasets, map models, KPI metrics, and data
 * tables for the public Millet MIS dashboards. It uses live API data when
 * available and page-local fallback data for the broader overview page.
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
import { getDistrictName, uttarakhandDistricts } from "../data/districts";
import districtGeojsonUrl from "../data/district.geojson";
import {
  chcCmscProgress,
  districtCoverage,
  enterpriseDetails,
  enterpriseProgress,
  enterpriseTypes,
  enterpriseYears,
  getCropDemonstrationRows,
  milletDemonstrationProgress,
  overviewFinancialYears,
  overviewSeasons,
  ragiProcurementProgress,
} from "./overviewDashboardData";

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

/**
 * Attach a display district name to a production record.
 *
 * @param {Object} record - Production record returned by the backend.
 * @returns {Object} Record with a normalized district display name.
 */
function withDistrictName(record) {
  const district = getDistrictName(record);

  return {
    ...record,
    district,
  };
}

const overviewCardClassName =
  "flex min-h-[430px] min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-5 shadow-card max-[640px]:min-h-[360px] max-[640px]:rounded-xl max-[640px]:p-3 dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white";

const overviewSelectClassName =
  "min-w-[150px] rounded-lg border border-[#b9c8c1] bg-white px-3 py-2 text-sm font-semibold text-[#024b37] shadow-sm transition focus:border-[#024b37] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10 max-[640px]:w-full dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white";

const overviewSearchClassName =
  "min-w-[210px] rounded-lg border border-[#b9c8c1] bg-white px-3 py-2 text-sm font-semibold text-[#024b37] shadow-sm transition placeholder:text-[#6b8078] focus:border-[#024b37] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10 max-[640px]:w-full dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white dark:placeholder:text-[#a7b4ae]";

const mapLegend = [
  { label: "0-25%", color: "#eef4e6" },
  { label: "26-50%", color: "#c7dfa0" },
  { label: "51-75%", color: "#76a84c" },
  { label: "76-100%", color: "#23693f" },
];

/**
 * Convert unknown numeric input into a safe number for chart calculations.
 *
 * @param {*} value - Value to convert.
 * @returns {number} Numeric value or 0 when conversion fails.
 */
function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

/**
 * Format a number using Indian digit grouping for government reports.
 *
 * @param {*} value - Numeric value to format.
 * @param {number} [maximumFractionDigits=0] - Maximum fraction digits.
 * @returns {string} Formatted number.
 */
function formatNumber(value, maximumFractionDigits = 0) {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits,
  });
}

/**
 * Format large chart labels into compact values.
 *
 * @param {*} value - Numeric value to format.
 * @returns {string} Compact display value such as 1.2k or 3.4L.
 */
function formatCompactNumber(value) {
  const numeric = toNumber(value);

  if (numeric >= 100000) {
    return `${(numeric / 100000).toFixed(1)}L`;
  }

  if (numeric >= 1000) {
    return `${(numeric / 1000).toFixed(1)}k`;
  }

  return formatNumber(numeric);
}

/**
 * Build a Chart.js axis title configuration.
 *
 * @param {string} title - Axis title text.
 * @returns {Object} Chart.js axis title options.
 */
function axisTitle(title) {
  return {
    display: Boolean(title),
    text: title,
    color: "#024b37",
    font: { size: 12, weight: "700" },
  };
}

/**
 * Build shared Chart.js options for overview dashboard charts.
 *
 * @param {Object} [config={}] - Chart option inputs.
 * @param {string} config.yTitle - Primary y-axis title.
 * @param {string} config.y1Title - Optional secondary y-axis title.
 * @param {string} [config.xTitle=""] - X-axis title.
 * @param {boolean} [config.stacked=false] - Whether axes are stacked.
 * @returns {Object} Chart.js options object.
 */
function overviewChartOptions({ yTitle, y1Title, xTitle = "", stacked = false } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          boxHeight: 10,
          boxWidth: 12,
          color: "#024b37",
          font: { size: 12, weight: "600" },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(2, 75, 55, 0.95)",
        titleFont: { size: 13, weight: "700" },
        bodyFont: { size: 12, weight: "600" },
        padding: 12,
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || "";
            return `${label}: ${formatNumber(context.parsed.y, 2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked,
        title: axisTitle(xTitle),
        ticks: {
          autoSkip: false,
          color: "#000000",
          font: { size: 11, weight: "600" },
          maxRotation: 55,
          minRotation: 30,
        },
        grid: { color: "rgba(2,75,55,0.06)" },
      },
      y: {
        stacked,
        beginAtZero: true,
        title: axisTitle(yTitle),
        ticks: {
          color: "#000000",
          font: { size: 11, weight: "600" },
          callback: (value) => formatCompactNumber(value),
        },
        grid: { color: "rgba(2,75,55,0.08)" },
      },
      ...(y1Title
        ? {
            y1: {
              beginAtZero: true,
              position: "right",
              title: axisTitle(y1Title),
              ticks: {
                color: "#000000",
                font: { size: 11, weight: "600" },
                callback: (value) => formatCompactNumber(value),
              },
              grid: { drawOnChartArea: false },
            },
          }
        : {}),
    },
  };
}

/**
 * Attach a custom tooltip formatter to shared chart options.
 *
 * @param {Object} baseOptions - Existing Chart.js options.
 * @param {Function} labelFormatter - Tooltip label callback.
 * @returns {Object} Chart.js options with tooltip callback.
 */
function chartOptionsWithTooltip(baseOptions, labelFormatter) {
  return {
    ...baseOptions,
    plugins: {
      ...baseOptions.plugins,
      tooltip: {
        ...baseOptions.plugins.tooltip,
        callbacks: {
          label: labelFormatter,
        },
      },
    },
  };
}

const pointValueLabelsPlugin = {
  id: "pointValueLabels",
  afterDatasetsDraw(chart, _args, pluginOptions) {
    if (pluginOptions?.display === false) return;

    const { ctx } = chart;
    ctx.save();
    ctx.font = "600 10px Montserrat, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";

    chart.data.datasets.forEach((dataset, datasetIndex) => {
      if (!chart.isDatasetVisible(datasetIndex)) return;
      if ((dataset.type || chart.config.type) !== "line") return;

      const meta = chart.getDatasetMeta(datasetIndex);
      ctx.fillStyle = dataset.borderColor || "#024b37";

      meta.data.forEach((point, index) => {
        const rawValue = dataset.data?.[index];
        const value =
          rawValue && typeof rawValue === "object" ? rawValue.y : rawValue;

        if (value == null || Number.isNaN(Number(value))) return;

        const label =
          typeof pluginOptions?.formatter === "function"
            ? pluginOptions.formatter(value, dataset, index)
            : formatCompactNumber(value);
        const verticalOffset = 8 + (datasetIndex % 2) * 12;
        ctx.fillText(label, point.x, point.y - verticalOffset);
      });
    });

    ctx.restore();
  },
};

/**
 * OverviewSelect - Shared select control for overview filters.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.label - Visible and accessible label.
 * @param {string} props.value - Selected value.
 * @param {Function} props.onChange - Change handler receiving the new value.
 * @param {React.ReactNode} props.children - Option elements.
 * @returns {React.ReactElement} Labeled select control.
 */
function OverviewSelect({ label, value, onChange, children }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-bold uppercase text-[#4a5f58] max-[640px]:w-full dark:text-[#d5dfdc]">
      <span>{label}</span>
      <select
        aria-label={label}
        className={overviewSelectClassName}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

/**
 * OverviewCard - Framed analytics section for the overview dashboard.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.title - Card title.
 * @param {string} props.subtitle - Supporting description.
 * @param {React.ReactNode} props.controls - Optional filter controls.
 * @param {React.ReactNode} props.children - Card body content.
 * @param {string} [props.className=""] - Additional Tailwind classes.
 * @returns {React.ReactElement} Overview card section.
 */
function OverviewCard({ title, subtitle, controls, children, className = "" }) {
  return (
    <section className={`${overviewCardClassName} ${className}`} data-aos="fade-up">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="m-0 break-words text-[1.08rem] font-extrabold leading-tight text-[#024b37] max-[640px]:text-base dark:text-white">
            {title}
          </h3>
          {subtitle ? (
            <p className="mb-0 mt-1 max-w-[58ch] text-sm font-medium leading-snug text-[#51645d] dark:text-[#d3d9d7]">
              {subtitle}
            </p>
          ) : null}
        </div>
        {controls ? (
          <div className="flex flex-wrap items-end justify-end gap-2 max-[640px]:w-full">
            {controls}
          </div>
        ) : null}
      </div>
      <div className="mt-4 min-h-0 flex-1">{children}</div>
    </section>
  );
}

/**
 * LoadingState - Shared loading message for dashboard cards.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.label] - Loading text.
 * @returns {React.ReactElement} Loading placeholder.
 */
function LoadingState({ label = "Loading dashboard data..." }) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#b9c8c1] bg-[#f7faf8] px-4 text-center text-sm font-bold text-[#024b37] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white">
      {label}
    </div>
  );
}

/**
 * EmptyState - Shared empty-state message for dashboard cards.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} [props.label] - Empty-state text.
 * @returns {React.ReactElement} Empty-state placeholder.
 */
function EmptyState({ label = "No records available for this selection." }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-[#d7dfdc] bg-[#fafcfb] px-4 text-center text-sm font-bold text-[#64756f] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-[#cbd5d1]">
      {label}
    </div>
  );
}

/**
 * ChartFrame - Stable-height wrapper for Chart.js canvases.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Chart component.
 * @returns {React.ReactElement} Chart frame.
 */
function ChartFrame({ children }) {
  return (
    <div className="h-[310px] min-h-0 w-full max-[640px]:h-[270px]">
      {children}
    </div>
  );
}

/**
 * CardInsight - Inline explanatory note for overview analytics.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Insight text.
 * @returns {React.ReactElement} Insight callout.
 */
function CardInsight({ children }) {
  return (
    <div className="mt-3 rounded-lg border border-[#d8e3de] bg-[#f7faf8] px-3 py-2 text-xs font-semibold leading-relaxed text-[#024b37] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-[#e5f0ed]">
      {children}
    </div>
  );
}

/**
 * OverviewDataTable - Render compact tabular data inside overview cards.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.columns - Column definitions.
 * @param {Array<Object>} props.rows - Row data.
 * @param {string} props.emptyLabel - Message shown when rows are empty.
 * @returns {React.ReactElement} Table or empty state.
 */
function OverviewDataTable({ columns, rows, emptyLabel }) {
  if (!rows.length) {
    return <EmptyState label={emptyLabel} />;
  }

  return (
    <div className="max-h-[325px] overflow-auto rounded-lg border border-[#e2e8f0] dark:border-[#444444]">
      <table className="min-w-[620px] w-full border-collapse bg-white text-sm dark:bg-[#2a2a2a]">
        <caption className="sr-only">Overview dashboard table</caption>
        <thead className="sticky top-0 z-[1]">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`whitespace-nowrap border-b border-[#d8e3de] bg-[#f5f8f6] px-4 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white ${
                  column.numeric ? "text-right" : ""
                }`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.unitName || row.district}-${index}`}
              className="even:bg-[#f7faf8] hover:bg-[#eef7f2] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
            >
              {columns.map((column) => (
                <td
                  key={`${row.unitName || row.district}-${column.key}`}
                  className={`border-b border-[#e9efec] px-4 py-3 text-[#024b37] dark:border-[#444444] dark:text-white ${
                    column.numeric ? "text-right font-bold tabular-nums" : "font-semibold"
                  }`}
                >
                  {column.numeric
                    ? formatNumber(row[column.key])
                    : row[column.key] ?? "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Normalize district names from GeoJSON properties.
 *
 * @param {string} name - District name from map data.
 * @returns {string} Canonical district label used by dashboard data.
 */
function normalizeGeoDistrictName(name = "") {
  const cleanName = String(name).trim().replace(/\s+/g, " ");
  const aliases = {
    garhwal: "Pauri Garhwal",
    hardwar: "Haridwar",
  };

  return aliases[cleanName.toLowerCase()] || cleanName;
}

/**
 * Extract polygon rings from GeoJSON geometry.
 *
 * @param {Object|null} geometry - GeoJSON Polygon or MultiPolygon geometry.
 * @returns {Array<Array>} Flattened polygon rings.
 */
function getRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
  return [];
}

/**
 * Resolve a map fill color from farmer coverage percentage.
 *
 * @param {number} percentage - Coverage percentage from 0 to 100.
 * @returns {string} Hex color for the coverage legend.
 */
function getCoverageColor(percentage) {
  if (percentage <= 25) return mapLegend[0].color;
  if (percentage <= 50) return mapLegend[1].color;
  if (percentage <= 75) return mapLegend[2].color;
  return mapLegend[3].color;
}

/**
 * Convert district GeoJSON features into SVG paths with coverage metadata.
 *
 * @param {Array<Object>} features - GeoJSON district features.
 * @param {Array<Object>} coverageRows - District coverage metrics.
 * @returns {Object|null} SVG map model or null when geometry is unavailable.
 */
function buildOverviewDistrictMap(features, coverageRows) {
  const width = 720;
  const height = 560;
  const padding = 24;
  const points = [];

  features.forEach((feature) => {
    getRings(feature.geometry).forEach((ring) => {
      ring.forEach((point) => {
        if (Array.isArray(point) && point.length >= 2) {
          points.push(point);
        }
      });
    });
  });

  if (!points.length) return null;

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const longitudeSpan = maxLongitude - minLongitude;
  const latitudeSpan = maxLatitude - minLatitude;
  const scale = Math.min(
    (width - padding * 2) / longitudeSpan,
    (height - padding * 2) / latitudeSpan
  );
  const mapWidth = longitudeSpan * scale;
  const mapHeight = latitudeSpan * scale;
  const offsetX = (width - mapWidth) / 2;
  const offsetY = (height - mapHeight) / 2;
  const coverageByDistrict = coverageRows.reduce(
    (districts, row) => ({
      ...districts,
      [row.district]: row,
    }),
    {}
  );
  const maxFarmers = Math.max(...coverageRows.map((row) => row.totalFarmers), 1);
  const project = ([longitude, latitude]) => [
    Number((offsetX + (longitude - minLongitude) * scale).toFixed(2)),
    Number((offsetY + (maxLatitude - latitude) * scale).toFixed(2)),
  ];

  const districts = features.map((feature) => {
    const name = normalizeGeoDistrictName(feature.properties?.dtname);
    const coverage = coverageByDistrict[name] || {
      district: name,
      totalBlocks: 0,
      gps: 0,
      villages: 0,
      totalFarmers: 0,
    };
    const coveragePercentage = Math.round((coverage.totalFarmers / maxFarmers) * 100);

    const path = getRings(feature.geometry)
      .map((ring) => {
        // Sampling keeps SVG paths lightweight while preserving district shape.
        const stride = Math.max(1, Math.ceil(ring.length / 420));
        const sampledRing = ring.filter(
          (_, index) => index % stride === 0 || index === ring.length - 1
        );

        return sampledRing
          .map((point, index) => {
            const [x, y] = project(point);
            return `${index === 0 ? "M" : "L"}${x} ${y}`;
          })
          .join(" ")
          .concat(" Z");
      })
      .join(" ");

    return {
      ...coverage,
      coveragePercentage,
      color: getCoverageColor(coveragePercentage),
      path,
    };
  });

  return { districts, height, width };
}

/**
 * CoverageFallback - Display coverage bars when GeoJSON cannot be rendered.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {Array<Object>} props.rows - District coverage rows.
 * @returns {React.ReactElement} Fallback coverage list.
 */
function CoverageFallback({ rows }) {
  const maxFarmers = Math.max(...rows.map((row) => row.totalFarmers), 1);

  return (
    <div className="space-y-2">
      {rows.map((row) => {
        const percentage = Math.round((row.totalFarmers / maxFarmers) * 100);

        return (
          <div key={row.district}>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-bold text-[#024b37] dark:text-white">
              <span>{row.district}</span>
              <span>{formatNumber(row.totalFarmers)} farmers</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-[#e7efeb] dark:bg-[#1f2937]">
              <div
                className="h-full rounded-full bg-[#23693f]"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * DistrictCoverageMap - Render an interactive district coverage map.
 *
 * @component
 * @param {Object|null} props.geojson - District GeoJSON data.
 * @param {Array<Object>} props.rows - District coverage metrics.
 * @returns {React.ReactElement} SVG map or fallback list.
 */
function DistrictCoverageMap({ geojson, rows }) {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    district: null,
  });
  const mapModel = useMemo(
    () => buildOverviewDistrictMap(geojson?.features || [], rows),
    [geojson, rows]
  );

  /**
   * Update tooltip position and district details for pointer/focus events.
   *
   * @param {MouseEvent|FocusEvent} event - Pointer or focus event.
   * @param {Object} district - District map metadata.
   * @returns {void}
   */
  function showTooltip(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

  /**
   * Hide the district tooltip when pointer or focus leaves a district.
   *
   * @returns {void}
   */
  function hideTooltip() {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      district: null,
    });
  }

  if (!mapModel) {
    return <CoverageFallback rows={rows} />;
  }

  return (
    <div className="relative h-full min-h-[320px]">
      <div className="relative flex h-[300px] items-center justify-center overflow-hidden rounded-lg border border-[#d8e3de] bg-[#f6faf6] max-[640px]:h-[250px] dark:border-[#444444] dark:bg-[#1f2937]">
        <svg
          aria-label="District-wise Shree Anna Abhiyan coverage map"
          className="h-full w-full"
          role="img"
          viewBox={`0 0 ${mapModel.width} ${mapModel.height}`}
        >
          {mapModel.districts.map((district) => (
            <path
              key={district.district}
              aria-label={`${district.district}: ${formatNumber(district.totalFarmers)} farmers`}
              className="cursor-pointer transition-opacity hover:opacity-90 focus:opacity-90"
              d={district.path}
              fill={district.color}
              onBlur={hideTooltip}
              onFocus={(event) => showTooltip(event, district)}
              onMouseEnter={(event) => showTooltip(event, district)}
              onMouseLeave={hideTooltip}
              onMouseMove={(event) => showTooltip(event, district)}
              stroke="#ffffff"
              strokeLinejoin="round"
              strokeWidth="1.8"
              tabIndex="0"
            >
              <title>{`${district.district}: ${formatNumber(district.totalFarmers)} farmers`}</title>
            </path>
          ))}
        </svg>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-[#024b37] dark:text-white">
        <span>Coverage intensity</span>
        {mapLegend.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span
              className="h-3 w-5 rounded-sm border border-[#cbd8d2]"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>

      {tooltip.visible && tooltip.district ? (
        <div
          className="pointer-events-none fixed z-50 max-w-[240px] rounded-lg bg-[#10251f] px-3 py-2 text-xs font-semibold leading-relaxed text-white shadow-lg"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y + 14,
          }}
        >
          <div className="font-extrabold">{tooltip.district.district}</div>
          <div>{formatNumber(tooltip.district.totalFarmers)} farmers</div>
          <div>{formatNumber(tooltip.district.totalBlocks)} blocks</div>
          <div>{formatNumber(tooltip.district.villages)} villages</div>
        </div>
      ) : null}
    </div>
  );
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
  const [kpis, setKpis] = useState({});
  const [districtData, setDistrictData] = useState([]);
  const [milletData, setMilletData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedMillet, setSelectedMillet] = useState("all");
  const [selectedFinancialYear, setSelectedFinancialYear] = useState("2025-26");
  const [selectedSeason, setSelectedSeason] = useState("All Seasons");
  const [selectedEnterpriseYear, setSelectedEnterpriseYear] = useState("2025-26");
  const [selectedEnterpriseDistrict, setSelectedEnterpriseDistrict] = useState("all");
  const [enterpriseSearch, setEnterpriseSearch] = useState("");
  const [overviewGeojson, setOverviewGeojson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataNotice, setDataNotice] = useState("");

  const pageTitles = {
    dashboard: t('overviewDashboard'),
    production: t('productionSummary'),
    district: t('districtAnalysisTitle'),
    millet: t('milletAnalysisTitle'),
  };

  useEffect(() => {
    // Load production data once when the dashboard variant mounts.
    fetchData();
  }, []);

  useEffect(() => {
    if (page !== "dashboard") {
      return;
    }

    let isMounted = true;

    /**
     * Load GeoJSON only for the overview page and ignore late responses.
     *
     * @returns {Promise<void>} Updates overview map state when mounted.
     */
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

  /**
   * Fetch production KPIs, grouped chart data, and detail records.
   *
   * @returns {Promise<void>} Updates dashboard state for all page variants.
   */
  const fetchData = async () => {
    try {
      setLoading(true);
      setDataNotice("");
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
      setDataNotice("Live production data is unavailable. Showing page-local placeholder data where needed.");
    } finally {
      setLoading(false);
    }
  };

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
    : milletData.filter(item => item.millet === selectedMillet);

  const milletVarieties = ["Mandua", "Jhangora", "Ramdana", "Cheena", "Kauni"];

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

  const ragiPeak = ragiProcurementProgress.reduce((peak, row) =>
    row.quantityProcured > peak.quantityProcured ? row : peak
  );
  const ragiDip = ragiProcurementProgress.reduce((dip, row) =>
    row.quantityProcured < dip.quantityProcured ? row : dip
  );

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
                      {uttarakhandDistricts.map((district) => (
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
