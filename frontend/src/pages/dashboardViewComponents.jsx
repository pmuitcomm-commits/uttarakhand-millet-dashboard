import { useMemo, useState } from "react";

const overviewCardClassName =
  "flex min-h-[430px] min-w-0 flex-col overflow-hidden rounded-[18px] border border-[#e2e8f0] bg-white p-5 shadow-card max-[640px]:min-h-[360px] max-[640px]:rounded-xl max-[640px]:p-3 dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white";

const overviewSelectClassName =
  "min-w-[150px] rounded-lg border border-[#b9c8c1] bg-white px-3 py-2 text-sm font-semibold text-[#024b37] shadow-sm transition focus:border-[#024b37] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10 max-[640px]:w-full dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white";

export const overviewSearchClassName =
  "min-w-[210px] rounded-lg border border-[#b9c8c1] bg-white px-3 py-2 text-sm font-semibold text-[#024b37] shadow-sm transition placeholder:text-[#6b8078] focus:border-[#024b37] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10 max-[640px]:w-full dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white dark:placeholder:text-[#a7b4ae]";

const mapLegend = [
  { label: "0-25%", color: "#eef4e6" },
  { label: "26-50%", color: "#c7dfa0" },
  { label: "51-75%", color: "#76a84c" },
  { label: "76-100%", color: "#23693f" },
];

function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function formatNumber(value, maximumFractionDigits = 0) {
  return toNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits,
  });
}

export function formatCompactNumber(value) {
  const numeric = toNumber(value);

  if (numeric >= 100000) {
    return `${(numeric / 100000).toFixed(1)}L`;
  }

  if (numeric >= 1000) {
    return `${(numeric / 1000).toFixed(1)}k`;
  }

  return formatNumber(numeric);
}

function axisTitle(title) {
  return {
    display: Boolean(title),
    text: title,
    color: "#024b37",
    font: { size: 12, weight: "700" },
  };
}

export function overviewChartOptions({ yTitle, y1Title, xTitle = "", stacked = false } = {}) {
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

export function chartOptionsWithTooltip(baseOptions, labelFormatter) {
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

export const pointValueLabelsPlugin = {
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

export function OverviewSelect({ label, value, onChange, children }) {
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

export function OverviewCard({ title, subtitle, controls, children, className = "" }) {
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

export function LoadingState({ label = "Loading dashboard data..." }) {
  return (
    <div className="flex h-full min-h-[260px] items-center justify-center rounded-lg border border-dashed border-[#b9c8c1] bg-[#f7faf8] px-4 text-center text-sm font-bold text-[#024b37] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-white">
      {label}
    </div>
  );
}

export function EmptyState({ label = "No records available for this selection." }) {
  return (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-[#d7dfdc] bg-[#fafcfb] px-4 text-center text-sm font-bold text-[#64756f] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-[#cbd5d1]">
      {label}
    </div>
  );
}

export function ChartFrame({ children }) {
  return (
    <div className="h-[310px] min-h-0 w-full max-[640px]:h-[270px]">
      {children}
    </div>
  );
}

export function CardInsight({ children }) {
  return (
    <div className="mt-3 rounded-lg border border-[#d8e3de] bg-[#f7faf8] px-3 py-2 text-xs font-semibold leading-relaxed text-[#024b37] dark:border-[#4b5563] dark:bg-[#1f2937] dark:text-[#e5f0ed]">
      {children}
    </div>
  );
}

export function OverviewDataTable({ columns, rows, emptyLabel }) {
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

function normalizeGeoDistrictName(name = "") {
  const cleanName = String(name).trim().replace(/\s+/g, " ");
  const aliases = {
    garhwal: "Pauri Garhwal",
    hardwar: "Haridwar",
  };

  return aliases[cleanName.toLowerCase()] || cleanName;
}

function getRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
  return [];
}

function getCoverageColor(percentage) {
  if (percentage <= 25) return mapLegend[0].color;
  if (percentage <= 50) return mapLegend[1].color;
  if (percentage <= 75) return mapLegend[2].color;
  return mapLegend[3].color;
}

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

export function DistrictCoverageMap({ geojson, rows }) {
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

  function showTooltip(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

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
