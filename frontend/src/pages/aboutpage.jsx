import React, { useEffect, useMemo, useState } from "react";

import {
  BookOpen,
  LayoutDashboard,
  Map,
  Landmark,
  Wheat,
  BadgeIndianRupee,
  Factory,
  Sprout,
  Users,
  Megaphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import districtGeojsonUrl from "../data/district.geojson";

// --- Constants for District Map ---
const stats = [
  { label: "Districts", value: "7/13" },
  { label: "Blocks", value: "24/95" },
  { label: "GPs", value: "2867/7791" },
  { label: "Villages", value: "4817/16793" },
  { label: "Farmers", value: "12307" },
];

const blockLegend = [
  { label: "0-20%", color: "#eef4e6" },
  { label: "21-40%", color: "#c7dfa0" },
  { label: "41-60%", color: "#8eb95a" },
  { label: "61-80%", color: "#4f8f3a" },
  { label: "81-100%", color: "#23693f" },
];

const districtBlockCounts = {
  Almora: 6,
  Bageshwar: 1,
  Chamoli: 4,
  Champawat: 0,
  Dehradun: 0,
  Haridwar: 0,
  Nainital: 0,
  "Pauri Garhwal": 4,
  Pithoragarh: 0,
  Rudraprayag: 3,
  "Tehri Garhwal": 4,
  "Udham Singh Nagar": 0,
  Uttarkashi: 2,
};

const districtTotalBlocks = {
  Almora: 11,
  Bageshwar: 3,
  Chamoli: 9,
  Champawat: 4,
  Dehradun: 6,
  Haridwar: 6,
  Nainital: 8,
  "Pauri Garhwal": 15,
  Pithoragarh: 8,
  Rudraprayag: 3,
  "Tehri Garhwal": 9,
  "Udham Singh Nagar": 7,
  Uttarkashi: 6,
};

const districtNameAliases = {
  garhwal: "Pauri Garhwal",
  "pauri garhwal": "Pauri Garhwal",
  hardwar: "Haridwar",
  haridwar: "Haridwar",
};

// --- Utility Functions for District Map ---
function normalizeDistrictName(name = "") {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const aliasKey = cleanName.toLowerCase();
  return districtNameAliases[aliasKey] || cleanName;
}

function getBlockColor(district) {
  const acquired = districtBlockCounts[district] ?? 0;
  const total = districtTotalBlocks[district] ?? 1;
  const percentage = (acquired / total) * 100;

  if (percentage === 0) return blockLegend[0].color;
  if (percentage <= 25) return blockLegend[1].color;
  if (percentage <= 50) return blockLegend[2].color;
  if (percentage <= 75) return blockLegend[3].color;
  return blockLegend[4].color;
}

function getRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates || [];
  if (geometry.type === "MultiPolygon") return (geometry.coordinates || []).flat();
  return [];
}

function buildDistrictMap(features) {
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
  const project = ([longitude, latitude]) => [
    Number((offsetX + (longitude - minLongitude) * scale).toFixed(2)),
    Number((offsetY + (maxLatitude - latitude) * scale).toFixed(2)),
  ];

  const districts = features.map((feature) => {
    const name = normalizeDistrictName(feature.properties?.dtname);
    const blockCount = districtBlockCounts[name] ?? 0;
    const totalBlocks = districtTotalBlocks[name] ?? 1;
    const percentage = ((blockCount / totalBlocks) * 100).toFixed(0);

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
      name,
      blockCount,
      totalBlocks,
      percentage,
      color: getBlockColor(name),
      path,
    };
  });

  return { districts, height, width };
}

// --- District Map Component ---
function DistrictMap() {
  const [geojson, setGeojson] = useState(null);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    district: null,
  });
  const [hasMapError, setHasMapError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDistricts() {
      try {
        if (typeof districtGeojsonUrl !== "string") {
          setGeojson(districtGeojsonUrl);
          return;
        }

        const response = await fetch(districtGeojsonUrl);
        if (!response.ok) {
          throw new Error("District map data could not be loaded.");
        }

        const data = await response.json();
        if (isMounted) {
          setGeojson(data);
        }
      } catch {
        if (isMounted) {
          setHasMapError(true);
        }
      }
    }

    loadDistricts();

    return () => {
      isMounted = false;
    };
  }, []);

  const mapModel = useMemo(
    () => buildDistrictMap(geojson?.features || []),
    [geojson]
  );

  function handleDistrictEnter(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

  function handleDistrictMove(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

  function handleDistrictLeave() {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      district: null,
    });
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[660px] flex-col items-center rounded-[2rem] border border-[#d8e3be] bg-[#f7f9f1] px-4 py-5 shadow-sm sm:px-6">
      <div className="relative flex aspect-[1.18/1] w-full items-center justify-center overflow-hidden rounded-[1.5rem] bg-[#edf3e5]">
        <div className="absolute inset-4 rounded-[1.25rem] border border-dashed border-[#b2c768]" />
        {mapModel ? (
          <svg
            aria-label="Uttarakhand district map"
            className="relative h-full w-full"
            role="img"
            viewBox={`0 0 ${mapModel.width} ${mapModel.height}`}
          >
            {mapModel.districts.map((district) => (
              <path
                key={district.name}
                d={district.path}
                fill={district.color}
                className="cursor-pointer transition-opacity hover:opacity-90 focus:opacity-90"
                onMouseEnter={(event) => handleDistrictEnter(event, district)}
                onMouseMove={(event) => handleDistrictMove(event, district)}
                onMouseLeave={handleDistrictLeave}
                onFocus={(event) => handleDistrictEnter(event, district)}
                onBlur={handleDistrictLeave}
                stroke="#ffffff"
                strokeLinejoin="round"
                strokeWidth="1.8"
                tabIndex="0"
              />
            ))}
          </svg>
        ) : (
          <div className="relative text-center text-sm font-semibold text-slate-500">
            {hasMapError ? "District map unavailable" : "Loading district map"}
          </div>
        )}
      </div>

      {tooltip.visible && tooltip.district ? (
        <div
          className="pointer-events-none fixed z-50 rounded-xl bg-slate-900/95 px-3 py-2 text-sm font-medium text-white shadow-lg"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y + 14,
          }}
        >
          {`${tooltip.district.name}: ${tooltip.district.blockCount}/${tooltip.district.totalBlocks} blocks (${tooltip.district.percentage}%)`}
        </div>
      ) : null}

      <div className="mt-4 rounded-full bg-[#94ab1b] px-5 py-2 text-sm font-semibold text-white shadow">
        Uttarakhand District Map
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 4: RECOGNITIONS
// ============================================================================

const recognitions = [
  "The Uttarakhand Millet Initiative is aligned with the International Year of Millets vision and promotes nutri-cereals as climate-resilient crops for hill agriculture.",
  "The project strengthens farmer registration, district-level planning and real-time monitoring through a digital MIS dashboard tailored for Uttarakhand.",
  "The initiative supports evidence-based decision making for administrators at state, district and block level through role-based dashboards.",
  "Special focus is placed on traditional millet cultivation, local value chains and improved access to schemes and services for farmers.",
  "The platform is designed to improve transparency in farmer data management, regional reporting and monthly progress tracking.",
  "The project encourages convergence between agriculture, extension systems and local institutions for sustainable millet-based livelihoods.",
];

// ============================================================================
// SECTION 5: PROJECT MILESTONES
// ============================================================================

const milestones = [
  "Uttarakhand became one of the leading Himalayan states to promote traditional millets (mandua, jhangora, chaulai) through integrated government initiatives and farmer outreach programs.",
  "Uttarakhand implemented region-specific millet promotion under state agriculture schemes, ensuring support to hill farmers through input subsidies and technical guidance.",
  "Uttarakhand strengthened millet value chains by linking farmers with processing units and promoting local entrepreneurship in millet-based products.",
  "Uttarakhand actively promoted millets under nutrition programs such as ICDS and Mid-Day Meal schemes to improve dietary diversity in rural and tribal areas.",
  "Uttarakhand encouraged branding and marketing of traditional millets through fairs, exhibitions, and GI-based identity (e.g., mandua), enhancing market visibility.",
  "Uttarakhand integrated millets into sustainable agriculture practices, promoting climate-resilient farming in rainfed and hill regions."
];

// ============================================================================
// SECTION 6: BACKGROUND
// ============================================================================

function SoftImage({ label, className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-[#cfddb4] bg-gradient-to-br from-[#d7e4bb] via-[#eef3db] to-[#ccdca6] shadow-md ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.7),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(15,90,44,.08),transparent_30%)]" />
      <div className="relative flex h-full min-h-[220px] items-center justify-center p-6 text-center text-xl font-semibold text-slate-600">
        {label}
      </div>
    </div>
  );
}

// ============================================================================
// SECTION 7: SYSTEM ARCHITECTURE
// ============================================================================

const architectureCards = [
  {
    title: "Led By Department of Agriculture, Uttarakhand",
    points: [
      "Programme oversight and policy direction",
      "District-wise monitoring and review",
      "Coordination with field offices and implementation teams",
    ],
  },
  {
    title: "Powered By MIS Dashboard System",
    points: [
      "Role-based access for admin, district and block users",
      "Farmer registration, login and dashboard workflows",
      "Data-driven reporting for planning and implementation",
    ],
  },
  {
    title: "Built On Open Digital Stack",
    points: [
      "PostgreSQL-based data backbone",
      "Dashboard and reporting through open-source tools",
      "Scalable architecture for future agriculture modules",
    ],
  },
];

// ============================================================================
// SECTION 8: OBJECTIVES & FRAMEWORK
// ============================================================================

const objectives = [
  "Build a state-wide millet farmer registry",
  "Enable district and block level monitoring",
  "Track monthly field progress efficiently",
  "Support transparent farmer data management",
  "Strengthen millet-focused planning and reporting",
  "Improve administrative decision-making through dashboards",
  "Create a scalable foundation for AgriStack-like services",
];

function MiniBadge({ children }) {
  return (
    <div className="rounded-2xl bg-[#2f7f79] px-4 py-3 text-sm md:text-base font-semibold text-white shadow-md">
      {children}
    </div>
  );
}

// ============================================================================
// SECTION 9: COMPONENTS OF PROJECT
// ============================================================================

const components = [
  {
    title: "Farmer Registration and Login",
    icon: <Users className="h-6 w-6" />,
    points: [
      "Digital registration of millet farmers across Uttarakhand",
      "Secure login workflows for registered users",
      "Structured capture of farmer and regional details",
      "Improved accessibility of farmer records for administration",
    ],
  },
  {
    title: "State, District and Block Dashboards",
    icon: <LayoutDashboard className="h-6 w-6" />,
    points: [
      "Dedicated dashboards for each administrative level",
      "Region-wise summaries for faster monitoring",
      "Improved visibility into registrations and implementation progress",
      "Quick review of dashboard metrics for officials",
    ],
  },
  {
    title: "Millet Crop Focus",
    icon: <Sprout className="h-6 w-6" />,
    points: [
      "Exclusive focus on millet-related farmer data",
      "Support for traditional and climate-resilient crops",
      "Better planning for millet promotion in hill regions",
      "Alignment with nutrition and livelihood objectives",
    ],
  },
  {
    title: "Monthly Employee Progress Reports",
    icon: <BookOpen className="h-6 w-6" />,
    points: [
      "Track monthly work completed by field staff",
      "Support accountability and performance review",
      "Make reporting easier across administrative levels",
      "Enable structured monitoring of implementation activities",
    ],
  },
  {
    title: "Region-Based Analytics",
    icon: <Map className="h-6 w-6" />,
    points: [
      "District and block-wise analysis of farmer records",
      "Visual summaries for decision support",
      "Quick identification of gaps and coverage trends",
      "Improved planning for targeted interventions",
    ],
  },
  {
    title: "Open-Source Technology Framework",
    icon: <Factory className="h-6 w-6" />,
    points: [
      "Built using PostgreSQL and other free/open-source tools",
      "Designed for sustainability and cost efficiency",
      "Easier future expansion into additional agriculture services",
    ],
  },
  {
    title: "Administrative Decision Support",
    icon: <Megaphone className="h-6 w-6" />,
    points: [
      "Support evidence-based planning for officials",
      "Strengthen review and monitoring workflows",
      "Enable better coordination between state and field units",
    ],
  },
];

function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="text-3xl md:text-5xl font-extrabold tracking-wide text-[#0f5a2c] uppercase">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-3 text-lg md:text-2xl text-slate-800">{subtitle}</p>
      ) : null}
      <div className="mx-auto mt-5 h-px w-full max-w-5xl bg-[#b9c89d]" />
    </div>
  );
}

// ============================================================================
// SECTION 10: PROJECT DELIVERY MECHANISM
// ============================================================================

// (No additional constants - uses architectureCards from Section 7)

// ============================================================================
// SECTION 11: UK MILLET MIS WORKFLOW
// ============================================================================

const flowLevels = ["State Level", "District Level", "Block Level"];

const mPassteps = [
  "Farmer details are collected through the digital registration workflow.",
  "Farmer records are entered and validated in the Uttarakhand millet MIS system.",
  "District-level teams review registration and dashboard records.",
  "Regional mapping enables block and district-wise verification of entries.",
  "Authenticated users access dashboards based on their assigned role.",
  "Corrections and updates are managed through administrative review.",
  "Reports are generated for monitoring, planning and monthly progress review.",
  "Consolidated insights support faster decision-making at state level.",
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UttarakhandMilletProjectLandingPage() {
  return (
    <div className="min-h-full bg-[#efefef] font-dm text-slate-900">
      
      {/* ========== SECTION 1: HERO SECTION ========== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#06351d]/45" />
        <div className="relative mx-auto flex h-[185px] max-w-7xl items-center justify-center px-6 text-center">
          <div>
            <h1 className="text-4xl font-extrabold text-white md:text-6xl">About Project</h1>
          </div>
        </div>
      </section>

      {/* ========== SECTION 2: DISTRICT MAP + STATS + LEGEND ========== */}
      <section id="about" className="mx-auto max-w-7xl px-4 pt-2 pb-16 lg:px-8">
        <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)_220px] xl:grid-cols-[300px_minmax(0,1fr)_230px]">
          <div className="w-full overflow-hidden rounded-2xl border border-[#a4b153] bg-white shadow-sm">
            {stats.map((item, idx) => (
              <div
                key={item.label}
                className={`flex min-h-[78px] items-center justify-between gap-4 px-5 py-4 ${idx !== stats.length - 1 ? "border-b border-[#a4b153]" : ""}`}
              >
                <span className="shrink-0 text-3xl font-extrabold tracking-wide text-[#0e7b1b]">
                  {item.value}
                </span>
                <span className="min-w-0 flex-1 text-right text-lg font-medium leading-tight text-slate-800 xl:text-xl">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div className="flex min-w-0 justify-center">
            <DistrictMap />
          </div>

          <div className="flex w-full flex-col items-center justify-start rounded-2xl border border-[#d8e3be] bg-white/70 px-5 py-5 text-center shadow-sm">
            <div className="w-full space-y-3 text-sm font-medium text-slate-600">
              {blockLegend.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span
                    aria-hidden="true"
                    className="h-4 w-9 rounded-full border border-white shadow-sm"
                    style={{ backgroundColor: item.color }}
                  />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-900">Block Coverage (%)</h3>
          </div>
        </div>
      </section>

      {/* ========== OVERVIEW & PROJECT INFO ========== */}
      <section className="mx-auto max-w-10xl px-4 pb-6 lg:px-8">
        <div className="flex justify-center pb-4">
        </div>
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl text-slate-1900">Overview and impact of the Uttarakhand Millet Project</h2>
          <div className="mx-auto mt-4 h-px w-full max-w-5xl bg-slate-300" />
          <h3 className="mt-5 text-2xl md:text-4xl text-[#0d7b17]">
            A digital initiative for farmer registry, monitoring and millet-focused governance.
          </h3>
        </div>
      </section>

      <section className="relative mx-auto max-w-7xl px-4 py-16 lg:px-1">
        {/* Center line */}
        <div className="absolute left-0 right-0 top-1/2 h-[2px] bg-gray-300"></div>

        <div className="flex justify-between items-center relative">
          {recognitions.map((item, index) => (
            <div
              key={index}
              className={`relative w-[200px] p-6 bg-[#deebe6] shadow-sm 
              ${index % 2 === 0 ? "-translate-y-16" : "translate-y-16"}`}
            >
              {item}
            </div>
          ))}
        </div>
      </section>
      
      {/* ========== SECTION 5: PROJECT MILESTONES ========== */}
      <section className="mt-10 bg-[#dde3b7] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionTitle
            title="Project Milestones"
            subtitle="Key progress areas of the Uttarakhand Millet Project:"
          />

          <div className="relative mt-12 hidden md:block">
            <div className="absolute left-0 right-0 top-1/2 h-6 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#5f8c95] via-[#8ed5da] to-[#d7c965] opacity-80" />
            <div className="grid grid-cols-6 gap-4">
              {milestones.map((item, index) => (
                <div key={item} className={`relative ${index % 2 ? "pt-40" : "pb-40"}`}>
                  <div className={`absolute left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-4 border-white bg-[#eef0d3] shadow ${index % 2 ? "top-[calc(50%-12px)]" : "top-[calc(50%-12px)]"}`} />
                  <div className={`rounded-2xl p-4 text-lg font-semibold text-white shadow-lg ${index % 3 === 0 ? "bg-[#2f7f79]" : index % 3 === 1 ? "bg-[#a78a5a]" : "bg-[#6ca68a]"}`}>
                    {item}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:hidden">
            {milestones.map((item) => (
              <div key={item} className="rounded-2xl bg-[#70907b] p-4 text-white shadow">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: BACKGROUND ========== */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-2 lg:px-8">
        <SoftImage label="Background / Consultation Photograph" className="min-h-[380px]" />
        <div className="space-y-8">
          <h2 className="text-4xl md:text-5xl font-extrabold uppercase">Background</h2>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-2xl leading-10">
            The Uttarakhand Millet Project is a digital agriculture initiative designed to support farmer registry, reporting and decision-making for millet-focused development in the state.
          </p>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-xl leading-10">
            The platform has been structured to help manage farmer data, strengthen monitoring systems and improve access to region-wise insights for administrators and field teams.
          </p>
          <div className="h-px w-full bg-slate-300" />
          <p className="text-xl leading-10">
            It supports a practical, scalable MIS approach for state, district and block-level use, with special emphasis on transparent records and progress tracking.
          </p>
        </div>
      </section>

      {/* ========== SECTION 7: SYSTEM ARCHITECTURE ========== */}
      <section className="bg-[#dde6bc] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-left">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase text-[#0f5a2c]">System Architecture</h2>
            <div className="mt-5 h-px w-full max-w-xl bg-[#b9c89d]" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[0].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[0].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-[460px] w-full max-w-[520px]">
                <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#d6ac7e]" />
                <div className="absolute left-1/2 top-12 flex h-40 w-40 -translate-x-1/2 items-center justify-center rounded-full bg-white shadow-xl">
                  <Landmark className="h-20 w-20 text-slate-700" />
                </div>
                <div className="absolute bottom-10 left-10 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-xl">
                  <Wheat className="h-20 w-20 text-[#317a6f]" />
                </div>
                <div className="absolute bottom-10 right-10 flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-xl">
                  <BookOpen className="h-20 w-20 text-[#5647a5]" />
                </div>
                <div className="absolute left-1/2 top-1/2 flex h-52 w-52 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#d48c49] to-[#bb6c29] p-3 shadow-2xl">
                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#f8d5aa] text-center text-2xl font-extrabold uppercase text-white">
                    Millet Project
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[1].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[1].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-white p-8 shadow-lg">
                <h3 className="mb-4 text-2xl font-extrabold">{architectureCards[2].title}</h3>
                <ul className="space-y-3 text-xl text-slate-700">
                  {architectureCards[2].points.map((point) => (
                    <li key={point} className="flex gap-3"><span>•</span><span>{point}</span></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 8: OBJECTIVES & FRAMEWORK ========== */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-3xl bg-white p-6 shadow-lg">
            <h2 className="text-center text-3xl md:text-5xl font-extrabold uppercase">Objectives and Framework</h2>
            <div className="my-8 text-center text-2xl font-bold uppercase text-[#f0b321]">Core Objectives</div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              {objectives.map((item, idx) => (
                <div key={item} className={`px-6 py-5 text-center text-xl md:text-2xl font-semibold ${idx !== objectives.length - 1 ? "border-b border-slate-200" : ""}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex items-center justify-center rounded-3xl bg-[#f1f4e9] p-6 shadow-inner">
            <div className="grid w-full max-w-[700px] place-items-center gap-6 md:grid-cols-3">
              <MiniBadge>Farmer registry with district and block mapping</MiniBadge>
              <MiniBadge>Role-based dashboard access for officials</MiniBadge>
              <MiniBadge>Millet-focused regional monitoring and analytics</MiniBadge>
              <MiniBadge>Monthly progress tracking across field teams</MiniBadge>
              <div className="flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br from-[#d48c49] to-[#bb6c29] p-3 shadow-2xl">
                <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#f8d5aa] text-center text-2xl font-extrabold uppercase text-white">
                  Millet Project
                </div>
              </div>
              <MiniBadge>Scalable digital backbone for future expansion</MiniBadge>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 9: COMPONENTS OF PROJECT ========== */}
      <section className="bg-[#dce4b5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionTitle title="Components of the Project" />
          <p className="mb-12 text-xl md:text-2xl leading-10">
            <span className="font-extrabold">Implementation Structure:</span> The project is designed for use across state, district and block levels, supporting farmer registration, dashboard reporting, employee monitoring and millet-focused administration.
          </p>

          <div className="grid gap-12">
            {components.map((item, idx) => (
              <div key={item.title} className={`grid gap-10 items-center ${idx % 2 === 0 ? "lg:grid-cols-[380px_1fr]" : "lg:grid-cols-[1fr_380px]"}`}>
                {idx % 2 === 0 ? (
                  <SoftImage label={`${item.title} / Image`} className="min-h-[320px]" />
                ) : null}

                <div className="py-4">
                  <div className="mb-4 flex items-center gap-3 text-[#1a1a1a]">
                    <div className="rounded-2xl bg-white p-3 shadow">{item.icon}</div>
                    <h3 className="text-3xl md:text-4xl">{item.title} :</h3>
                  </div>
                  <ul className="space-y-3 text-lg md:text-2xl leading-10 text-slate-800">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-[#0d7b17]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {idx % 2 !== 0 ? (
                  <SoftImage label={`${item.title} / Image`} className="min-h-[320px]" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 10: PROJECT DELIVERY MECHANISM ========== */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-[#a77826] text-white shadow-2xl">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[360px] overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517022812141-23620dba5c23?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0c2d14]/45 to-transparent" />
              <div className="relative p-8 md:p-14">
                <h2 className="max-w-xl text-4xl md:text-7xl font-bold leading-tight">Project Delivery Mechanism</h2>
              </div>
            </div>
            <div className="p-8 md:p-12">
              <div className="mb-8 flex items-center gap-4 text-[#d9b36c]">
                <BadgeIndianRupee className="h-14 w-14" />
                <div>
                  <div className="text-lg uppercase tracking-[0.35em] text-[#d0ad63]">Fund Flow</div>
                  <h3 className="text-4xl md:text-5xl font-semibold text-white">System Flow Design</h3>
                </div>
              </div>
              <div className="space-y-8 text-lg md:text-2xl leading-10">
                <div>
                  <h4 className="mb-2 text-3xl font-extrabold">Project Data Flow</h4>
                  <p>
                    Farmer registration, administrative review and dashboard insights move through a structured digital workflow to support transparent project implementation.
                  </p>
                </div>
                <div>
                  <h4 className="mb-2 text-3xl font-extrabold">Monitoring Flow</h4>
                  <p>
                    Progress reports and regional summaries are consolidated to help officials review performance and make timely decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== IMPLEMENTATION FLOW (Grid Structure) ========== */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="rounded-[2.5rem] bg-white p-8 shadow-2xl">
          <div className="grid gap-10 xl:grid-cols-[240px_1fr_1fr]">
            <div className="flex flex-col items-center justify-start gap-6 border-r border-slate-200 pr-6">
              <div className="grid place-items-center rounded-3xl bg-[#eef3d8] p-6 shadow-inner">
                <Users className="h-20 w-20 text-[#827122]" />
              </div>

              <div className="text-center text-[#7a6a1e]">
                <p className="text-xl font-semibold">
                  Project implementation happens at three levels:
                </p>
              </div>

              <div className="w-full space-y-3">
                {flowLevels.map((level) => (
                  <div
                    key={level}
                    className="flex min-h-[64px] items-center justify-center rounded-xl bg-[#8a7b2a] px-4 py-3 text-center text-xl font-bold leading-snug text-white shadow"
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              {[
                ["State Agriculture Department", "Project Admin", "State Monitoring & Analytics"],
                ["District Dashboard Team", "District Nodal Officer", "District Reporting Unit"],
                ["Block Dashboard Team", "Field Monitoring", "Progress Review & Validation"],
                ["Farmer Registry", "Administrative Support", "Local Implementation Units"],
              ].map((row, idx) => (
                <div key={idx} className="grid gap-4 md:grid-cols-3">
                  {row.map((box) => (
                    <div
                      key={box}
                      className="flex min-h-[118px] items-center justify-center rounded-2xl bg-[#7f7923] p-4 text-center text-lg font-semibold leading-snug text-white shadow"
                    >
                      {box}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="space-y-5">
              <div className="flex min-h-[86px] items-center justify-center rounded-2xl bg-[#8c6120] p-5 text-center text-2xl font-semibold leading-snug text-white shadow">
                State Project Administrator
              </div>

              <div className="flex min-h-[86px] items-center justify-center rounded-2xl bg-[#9f6c23] p-5 text-center text-2xl font-semibold leading-snug text-white shadow">
                District Project Administrator
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  "Farmer Database",
                  "Block Administration",
                  "Farmer Registration",
                  "Dashboard Access",
                  "Regional Analytics",
                  "Progress Reporting",
                  "System Management",
                ].map((box) => (
                  <div
                    key={box}
                    className="flex min-h-[92px] items-center justify-center rounded-2xl bg-[#a17025] p-4 text-center text-lg font-semibold leading-snug text-white shadow"
                  >
                    {box}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 11: UK MILLET MIS WORKFLOW ========== */}
      <section className="bg-[#dce4b5] py-16">
        <div className="mx-auto max-w-7xl px-4 lg:px-1">
          <div className="mb-10 text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase">Uttarakhand Millet MIS Workflow</h2>
            <p className="mt-4 text-2xl md:text-5xl">Farmer Registry and Dashboard System</p>
          </div>

          <div className="mx-auto mb-8 max-w-4xl rounded-2xl bg-[#06777a] px-6 py-5 text-center text-2xl md:text-4xl text-slate-900 shadow-lg">
            Process of Farmer Registration and Monitoring
          </div>

          <div className="grid gap-8 lg:grid-cols-[260px_1fr_1fr_1fr]">
            <div className="flex flex-col items-center justify-start gap-8 rounded-3xl bg-[#ebdfc1] p-5">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-[#f6ead1]">
                <Users className="h-12 w-12 text-[#7f6335]" />
              </div>
              <div className="text-3xl">Farmer</div>
            </div>

            {mPassteps.slice(0, 6).map((step, idx) => (
              <div
                key={step}
                className={`relative rounded-2xl p-10 text-center text-lg md:text-2xl shadow ${idx % 3 === 0 ? "bg-[#a8ddd8]" : idx % 3 === 1 ? "bg-[#c9dfc0]" : "bg-[#efdebc]"}`}
              >
                <div className="flex h-full items-center justify-center">{step}</div>
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-white lg:block" />
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-2xl bg-[#d6e5a0] p-6 text-center text-lg md:text-2xl shadow">
              {mPassteps[6]}
            </div>
            <div className="rounded-2xl bg-[#8b8b8b] p-6 text-center text-lg md:text-2xl text-white shadow">
              {mPassteps[7]}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}