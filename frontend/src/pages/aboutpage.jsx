/**
 * About page module - Public project narrative for the Uttarakhand Millet MIS.
 *
 * The page combines programme statistics, an interactive district map,
 * milestones, system architecture, and workflow content for public awareness
 * and government handover documentation.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
  MapPin,
  Phone,
  Mail,
  Globe,
  Send,
  Camera,
  Video,
} from "lucide-react";

import districtGeojsonUrl from "../data/district.geojson";

// District map constants describe current block coverage and programme reach.
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

/**
 * Normalize district labels from GeoJSON data to dashboard names.
 *
 * @param {string} name - District name from map data.
 * @returns {string} Canonical district label.
 */
function normalizeDistrictName(name = "") {
  const cleanName = name.trim().replace(/\s+/g, " ");
  const aliasKey = cleanName.toLowerCase();
  return districtNameAliases[aliasKey] || cleanName;
}

/**
 * Resolve the legend color for a district based on acquired block coverage.
 *
 * @param {string} district - Canonical district name.
 * @returns {string} Hex color used in the SVG map.
 */
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
 * Build the SVG map model used by the public about page.
 *
 * @param {Array<Object>} features - District GeoJSON features.
 * @returns {Object|null} SVG dimensions and district path metadata.
 */
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
        // Sampling keeps the inline SVG light enough for public landing pages.
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

/**
 * DistrictMap - Render an interactive district block-coverage map.
 *
 * @component
 * @returns {React.ReactElement} District map with hover/focus tooltip.
 */
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

    /**
     * Load district GeoJSON and avoid state updates after unmount.
     *
     * @returns {Promise<void>} Updates map state when data is available.
     */
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

  /**
   * Show tooltip when a district receives hover or keyboard focus.
   *
   * @param {MouseEvent|FocusEvent} event - Pointer or focus event.
   * @param {Object} district - District map metadata.
   * @returns {void}
   */
  function handleDistrictEnter(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

  /**
   * Keep tooltip aligned to the current pointer position.
   *
   * @param {MouseEvent} event - Pointer move event.
   * @param {Object} district - District map metadata.
   * @returns {void}
   */
  function handleDistrictMove(event, district) {
    setTooltip({
      visible: true,
      x: event.clientX,
      y: event.clientY,
      district,
    });
  }

  /**
   * Hide tooltip when pointer/focus leaves a district path.
   *
   * @returns {void}
   */
  function handleDistrictLeave() {
    setTooltip({
      visible: false,
      x: 0,
      y: 0,
      district: null,
    });
  }

  return (
    <div className="relative mx-auto flex w-full max-w-[660px] flex-col items-center rounded-2xl border border-[#d8e3be] bg-[#f7f9f1] px-3 py-4 shadow-sm sm:rounded-[2rem] sm:px-6 sm:py-5">
      <div className="relative flex aspect-[1.18/1] w-full items-center justify-center overflow-hidden rounded-2xl bg-[#edf3e5] sm:rounded-[1.5rem]">
        <div className="absolute inset-3 rounded-2xl border border-dashed border-[#b2c768] sm:inset-4 sm:rounded-[1.25rem]" />
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
          className="pointer-events-none fixed z-50 max-w-[calc(100vw-2rem)] rounded-xl bg-slate-900/95 px-3 py-2 text-xs font-medium text-white shadow-lg sm:text-sm"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y + 14,
          }}
        >
          {`${tooltip.district.name}: ${tooltip.district.blockCount}/${tooltip.district.totalBlocks} blocks (${tooltip.district.percentage}%)`}
        </div>
      ) : null}

      <div className="mt-4 rounded-full bg-[#94ab1b] px-4 py-2 text-center text-xs font-semibold text-white shadow sm:px-5 sm:text-sm">
        Uttarakhand District Map
      </div>
    </div>
  );
}

// Programme recognition text shown in the public overview timeline.

const recognitions = [
  "The Uttarakhand Millet Initiative is aligned with the International Year of Millets vision and promotes nutri-cereals as climate-resilient crops for hill agriculture.",
  "The project strengthens farmer registration, district-level planning and real-time monitoring through a digital MIS dashboard tailored for Uttarakhand.",
  "The initiative supports evidence-based decision making for administrators at state, district and block level through role-based dashboards.",
  "Special focus is placed on traditional millet cultivation, local value chains and improved access to schemes and services for farmers.",
  "The platform is designed to improve transparency in farmer data management, regional reporting and monthly progress tracking.",
  "The project encourages convergence between agriculture, extension systems and local institutions for sustainable millet-based livelihoods.",
];

// Project milestone text for the visual timeline.

const milestones = [
  "Uttarakhand became one of the leading Himalayan states to promote traditional millets (mandua, jhangora, chaulai) through integrated government initiatives and farmer outreach programs.",
  "Uttarakhand implemented region-specific millet promotion under state agriculture schemes, ensuring support to hill farmers through input subsidies and technical guidance.",
  "Uttarakhand strengthened millet value chains by linking farmers with processing units and promoting local entrepreneurship in millet-based products.",
  "Uttarakhand actively promoted millets under nutrition programs such as ICDS and Mid-Day Meal schemes to improve dietary diversity in rural and tribal areas.",
  "Uttarakhand encouraged branding and marketing of traditional millets through fairs, exhibitions, and GI-based identity (e.g., mandua), enhancing market visibility.",
  "Uttarakhand integrated millets into sustainable agriculture practices, promoting climate-resilient farming in rainfed and hill regions."
];

/**
 * SoftImage - Visual block for project content sections.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {string} props.label - Image alt text or fallback placeholder label.
 * @param {string} [props.src] - Optional local image source.
 * @param {string} [props.className=""] - Additional Tailwind classes.
 * @returns {React.ReactElement} Styled image placeholder.
 */
function SoftImage({ label, src, className = "" }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-lg border border-[#0b4f3a]/15 bg-[#f7f3e8] shadow-[0_24px_70px_rgba(11,79,58,0.16)] ${className}`}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={label}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b4f3a]/35 via-transparent to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,79,58,.14)_25%,transparent_25%),linear-gradient(225deg,rgba(242,181,68,.22)_25%,transparent_25%)] bg-[length:38px_38px]" />
          <div className="relative flex h-full min-h-[220px] items-center justify-center p-6 text-center text-xl font-semibold text-[#0b4f3a] max-[640px]:min-h-[180px] max-[640px]:p-4 max-[640px]:text-base">
            {label}
          </div>
        </>
      )}
    </div>
  );
}

// Architecture cards document the department, MIS, and open-stack responsibilities.

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

// Project objectives shown in the public framework section.

const objectives = [
  "Build a state-wide millet farmer registry",
  "Enable district and block level monitoring",
  "Track monthly field progress efficiently",
  "Support transparent farmer data management",
  "Strengthen millet-focused planning and reporting",
  "Improve administrative decision-making through dashboards",
  "Create a scalable foundation for AgriStack-like services",
];

/**
 * MiniBadge - Compact visual label used inside the objectives framework.
 *
 * @component
 * @param {Object} props - Component properties.
 * @param {React.ReactNode} props.children - Badge content.
 * @returns {React.ReactElement} Styled badge.
 */
function MiniBadge({ children }) {
  return (
    <div className="relative w-full overflow-hidden rounded-lg border border-[#0b4f3a]/15 bg-[#0b4f3a] px-4 py-4 text-center text-sm font-semibold text-[#f7f3e8] shadow-[0_14px_30px_rgba(11,79,58,0.18)] transition duration-300 hover:-translate-y-1 md:text-base">
      <span className="absolute inset-x-0 top-0 h-1 bg-[#f2b544]" />
      <span className="relative">{children}</span>
    </div>
  );
}

// Project component cards describe the functional areas supported by the MIS.

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

const contentImageSources = ["/1.png", "/4.jpg", "/5.jpg", "/7.jpg", "/8.jpg", "/9.jpg", "/2.png", "/3.png"];

// UK Millet MIS workflow labels and steps for the implementation flow section.

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

const footerInformation = [
  {
    title: "Privacy Policy",
    intro:
      "This policy explains how information connected with the Uttarakhand Millet MIS is handled on this public website and related dashboard workflows.",
    points: [
      "The system may collect farmer registration details, contact information, location records and programme data submitted through authorized workflows.",
      "Information is used for registration, verification, monitoring, reporting, service delivery and communication related to millet development activities.",
      "Administrative access is role-based. Public pages are not intended to publish sensitive personal information.",
      "Users should submit accurate information and use the listed contact channels for correction, support or data-related queries.",
    ],
  },
  {
    title: "Terms of Use",
    intro:
      "Use of this website and MIS dashboard is subject to responsible, lawful and authorized use for Uttarakhand Millet Project purposes.",
    points: [
      "Website content is provided for public information, programme awareness and dashboard access for authorized users.",
      "Users must not attempt unauthorized access, impersonation, tampering, automated scraping or misuse of project data.",
      "Dashboard users are responsible for keeping login credentials confidential and for entering accurate information.",
      "External links are provided for convenience. Their content and policies are managed by the respective websites.",
    ],
  },
  {
    title: "Accessibility",
    intro:
      "The website aims to provide accessible public information and dashboard entry points for a wide range of users and devices.",
    points: [
      "The interface supports keyboard navigation, visible focus states and scalable text controls from the top bar.",
      "Text, controls and content sections are structured to remain readable across desktop, tablet and mobile screens.",
      "Images and interactive controls should include meaningful labels where they convey information or perform an action.",
      "Accessibility issues can be reported through the contact details listed in this footer.",
    ],
  },
  {
    title: "Screen Reader Access",
    intro:
      "The page is structured so screen reader users can navigate headings, links, buttons and content sections in a predictable order.",
    points: [
      "Use standard screen reader navigation commands to move through headings, lists, links and form controls.",
      "Interactive controls are designed to be reachable by keyboard using Tab, Shift+Tab, Enter and Space.",
      "Allow the page to finish loading before starting screen reader navigation for the most reliable experience.",
      "If any content is not announced clearly, report the issue through the footer contact details so it can be reviewed.",
    ],
  },
];

/**
 * UttarakhandMilletProjectLandingPage - Render the public about/project page.
 *
 * @component
 * @returns {React.ReactElement} Public project information page.
 */
export default function UttarakhandMilletProjectLandingPage() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [activeFooterTopic, setActiveFooterTopic] = useState(null);

  useEffect(() => {
    const target = 25;
    let count = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      count = Math.min(count + step, target);
      setVisitorCount(count);
      if (count >= target) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  const currentYear = new Date().getFullYear();

  const lastUpdated = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const activeFooterDetails = useMemo(
    () => footerInformation.find((item) => item.title === activeFooterTopic),
    [activeFooterTopic]
  );

  useEffect(() => {
    if (!activeFooterDetails) return undefined;

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setActiveFooterTopic(null);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeFooterDetails]);

  return (
    <div className="min-h-full overflow-x-hidden bg-[#efefef] font-dm text-slate-900">
      
      {/* Hero section uses a full-bleed responsive background image with text overlay. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-[#06351d]/45" />
        <div className="relative mx-auto flex h-[150px] max-w-7xl items-center justify-center px-4 text-center sm:h-[185px] sm:px-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white sm:text-4xl md:text-6xl">About Project</h1>
          </div>
        </div>
      </section>

      {/* District map section uses a three-column desktop grid and stacks naturally on smaller screens. */}
      <section id="about" className="mx-auto max-w-7xl px-4 pb-12 pt-2 sm:pb-16 lg:px-8">
        <div className="relative z-10 grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)_220px] xl:grid-cols-[300px_minmax(0,1fr)_230px]">
          <div className="w-full overflow-hidden rounded-2xl border border-[#a4b153] bg-white shadow-sm">
            {stats.map((item, idx) => (
              <div
                key={item.label}
                className={`grid min-h-[68px] grid-cols-[auto_minmax(0,1fr)] items-center gap-4 px-4 py-3 sm:min-h-[78px] sm:px-5 sm:py-4 ${idx !== stats.length - 1 ? "border-b border-[#a4b153]" : ""}`}
              >
                <span className="min-w-0 break-words text-2xl font-extrabold tracking-wide text-[#0e7b1b] sm:text-3xl">
                  {item.value}
                </span>
                <span className="min-w-0 break-words text-right text-base font-medium leading-tight text-slate-800 sm:text-lg xl:text-xl">
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
            <h3 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">Block Coverage (%)</h3>
          </div>
        </div>
      </section>

      {/* Overview text introduces the governance purpose of the public page. */}
      <section className="mx-auto max-w-7xl px-4 pb-6 lg:px-8">
        <div className="flex justify-center pb-4">
        </div>
        <div className="text-center">
          <h2 className="break-words text-2xl text-slate-900 sm:text-3xl md:text-5xl">Overview and impact of the Uttarakhand Millet Project</h2>
          <div className="mx-auto mt-4 h-px w-full max-w-5xl bg-slate-300" />
          <h3 className="mt-5 text-xl text-[#0d7b17] md:text-4xl">
            A digital initiative for farmer registry, monitoring and millet-focused governance.
          </h3>
        </div>
      </section>

      <section className="relative isolate bg-[#f7f3e8] px-4 py-12 sm:py-16 lg:px-8">
        <div className="absolute inset-x-0 top-0 h-px bg-[#0b4f3a]/10" />
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recognitions.map((item, index) => (
            <article
              key={item}
              className="group relative min-h-[190px] animate-slide-in-soft overflow-hidden rounded-lg border border-[#0b4f3a]/10 bg-[#f7f3e8] p-5 shadow-[0_18px_46px_rgba(11,79,58,0.08)] transition duration-300 hover:-translate-y-1 hover:border-[#f2b544] hover:shadow-[0_24px_58px_rgba(11,79,58,0.16)] sm:p-6"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="mb-5 flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-[#0b4f3a] text-sm font-black text-[#f7f3e8]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <CheckCircle2 className="h-7 w-7 text-[#f2b544] transition duration-300 group-hover:rotate-12" />
              </div>
              <p className="text-base font-medium leading-7 text-[#0b4f3a] sm:text-lg">
                {item}
              </p>
            </article>
          ))}
        </div>
      </section>
      
      {/* ========== SECTION 5: PROJECT MILESTONES ========== */}
      <section className="bg-[#0b4f3a] py-14 text-[#f7f3e8] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[#f2b544]/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f2b544]">
              <span className="h-2 w-2 rounded-full bg-[#f2b544]" />
              Project Focus
            </div>
            <h2 className="break-words font-playfair text-3xl font-black sm:text-4xl md:text-6xl">
              Project Milestones
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base font-medium leading-7 text-[#f7f3e8]/80 md:text-xl">
              Key progress areas of the Uttarakhand Millet Project:
            </p>
            <div className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-[#f2b544]" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {milestones.map((item, index) => (
              <article
                key={item}
                className="relative animate-slide-in-soft overflow-hidden rounded-lg border border-[#f2b544]/30 bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-[0_24px_70px_rgba(0,0,0,0.24)] transition duration-300 hover:-translate-y-1 sm:p-6"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[#f2b544]" />
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#0b4f3a] text-sm font-black text-[#f7f3e8]">
                    {index + 1}
                  </span>
                  <div className="h-px flex-1 bg-[#0b4f3a]/20" />
                  <Wheat className="h-6 w-6 text-[#f2b544]" />
                </div>
                <p className="text-base font-semibold leading-7 sm:text-lg">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 6: BACKGROUND ========== */}
      <section className="bg-[#f7f3e8] px-4 py-14 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <SoftImage
            label="Background consultation photograph"
            src={contentImageSources[0]}
            className="min-h-[280px] sm:min-h-[440px]"
          />
          <article className="relative border-l-4 border-[#f2b544] pl-5 sm:pl-8">
            <h2 className="font-playfair text-4xl font-black text-[#0b4f3a] md:text-6xl">Background</h2>
            <div className="mt-6 space-y-5 text-[#0b4f3a] sm:space-y-6">
              <p className="text-lg font-semibold leading-8 sm:text-2xl sm:leading-10">
                The Uttarakhand Millet Project is a digital agriculture initiative designed to support farmer registry, reporting and decision-making for millet-focused development in the state.
              </p>
              <p className="text-base font-medium leading-8 sm:text-xl sm:leading-9">
                The platform has been structured to help manage farmer data, strengthen monitoring systems and improve access to region-wise insights for administrators and field teams.
              </p>
              <p className="text-base font-medium leading-8 sm:text-xl sm:leading-9">
                It supports a practical, scalable MIS approach for state, district and block-level use, with special emphasis on transparent records and progress tracking.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* ========== SECTION 7: SYSTEM ARCHITECTURE ========== */}
      <section className="bg-[#0b4f3a] py-14 text-[#f7f3e8] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-12 max-w-3xl text-left">
            <div className="mb-4 flex w-fit items-center gap-2 rounded-full border border-[#f2b544]/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f2b544]">
              <span className="h-2 w-2 rounded-full bg-[#f2b544]" />
              Project Focus
            </div>
            <h2 className="break-words font-playfair text-4xl font-black md:text-6xl">System Architecture</h2>
            <div className="mt-6 h-[3px] w-24 rounded-full bg-[#f2b544]" />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr_1fr]">
            <div className="space-y-6">
              <div className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.22)] sm:p-8">
                <h3 className="mb-4 text-xl font-black sm:text-2xl">{architectureCards[0].title}</h3>
                <ul className="space-y-3 text-base font-medium text-[#0b4f3a] sm:text-xl">
                  {architectureCards[0].points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#f2b544]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="relative h-[310px] w-full max-w-[520px] rounded-lg border border-[#f2b544]/30 bg-[#f7f3e8] shadow-[0_24px_70px_rgba(0,0,0,0.24)] [--circle-offset-x:91px] [--circle-offset-y:52.5px] [--circle-radius:105px] sm:h-[460px] sm:[--circle-offset-x:139px] sm:[--circle-offset-y:80px] sm:[--circle-radius:160px]">
                <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-[#f2b544] sm:h-[320px] sm:w-[320px]" />
                <div
                  style={{ left: "50%", top: "calc(50% - var(--circle-radius))" }}
                  className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0b4f3a] text-[#f2b544] shadow-xl sm:h-28 sm:w-28"
                >
                  <Landmark className="h-8 w-8 sm:h-14 sm:w-14" />
                </div>
                <div
                  style={{ left: "calc(50% - var(--circle-offset-x))", top: "calc(50% + var(--circle-offset-y))" }}
                  className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0b4f3a] text-[#f2b544] shadow-xl sm:h-28 sm:w-28"
                >
                  <Wheat className="h-8 w-8 sm:h-14 sm:w-14" />
                </div>
                <div
                  style={{ left: "calc(50% + var(--circle-offset-x))", top: "calc(50% + var(--circle-offset-y))" }}
                  className="absolute flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0b4f3a] text-[#f2b544] shadow-xl sm:h-28 sm:w-28"
                >
                  <BookOpen className="h-8 w-8 sm:h-14 sm:w-14" />
                </div>
                <div className="absolute left-1/2 top-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#f2b544] p-2 shadow-2xl sm:h-52 sm:w-52 sm:p-3">
                  <div className="flex h-full w-full items-center justify-center rounded-full border-4 border-[#0b4f3a]/35 text-center text-base font-black uppercase text-[#0b4f3a] sm:text-2xl">
                    Millet Project
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.22)] sm:p-8">
                <h3 className="mb-4 text-xl font-black sm:text-2xl">{architectureCards[1].title}</h3>
                <ul className="space-y-3 text-base font-medium text-[#0b4f3a] sm:text-xl">
                  {architectureCards[1].points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#f2b544]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.22)] sm:p-8">
                <h3 className="mb-4 text-xl font-black sm:text-2xl">{architectureCards[2].title}</h3>
                <ul className="space-y-3 text-base font-medium text-[#0b4f3a] sm:text-xl">
                  {architectureCards[2].points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#f2b544]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 8: OBJECTIVES & FRAMEWORK ========== */}
      <section className="bg-[#f7f3e8] px-4 py-14 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <h2 className="text-center font-playfair text-4xl font-black text-[#0b4f3a] sm:text-5xl md:text-6xl">
              Objectives and Framework
            </h2>
            <div className="my-7 text-center text-xl font-black uppercase tracking-[0.16em] text-[#f2b544] sm:my-9 sm:text-2xl">
              Core Objectives
            </div>
            <div className="space-y-3">
              {objectives.map((item, idx) => (
                <div
                  key={item}
                  className="flex items-center gap-4 rounded-lg border border-[#0b4f3a]/10 bg-[#f7f3e8] p-4 text-base font-bold text-[#0b4f3a] shadow-[0_12px_34px_rgba(11,79,58,0.08)] transition duration-300 hover:translate-x-1 hover:border-[#f2b544] sm:p-5 sm:text-xl"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b4f3a] text-xs font-black text-[#f7f3e8]">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-lg border border-[#0b4f3a]/10 bg-[#0b4f3a] p-5 shadow-[0_24px_70px_rgba(11,79,58,0.22)] sm:p-7">
            <div className="absolute inset-5 rounded-lg border border-dashed border-[#f2b544]/35" />
            <div className="relative grid place-items-center gap-4 sm:gap-5 md:grid-cols-3">
              <MiniBadge>Farmer registry with district and block mapping</MiniBadge>
              <MiniBadge>Role-based dashboard access for officials</MiniBadge>
              <MiniBadge>Millet-focused regional monitoring and analytics</MiniBadge>
              <MiniBadge>Monthly progress tracking across field teams</MiniBadge>
              <div className="grid h-44 w-44 place-items-center rounded-full bg-[#f2b544] p-3 text-center text-lg font-black uppercase text-[#0b4f3a] shadow-[0_18px_44px_rgba(242,181,68,0.35)] sm:h-56 sm:w-56 sm:text-2xl">
                <span className="grid h-full w-full place-items-center rounded-full border-2 border-[#0b4f3a]/30">
                  Millet Project
                </span>
              </div>
              <MiniBadge>Scalable digital backbone for future expansion</MiniBadge>
            </div>
          </div>
        </div>
      </section>

      {/* ========== SECTION 9: COMPONENTS OF PROJECT ========== */}
      <section className="bg-[#0b4f3a] py-14 text-[#f7f3e8] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-[#f2b544]/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#f2b544]">
              <span className="h-2 w-2 rounded-full bg-[#f2b544]" />
              Project Focus
            </div>
            <h2 className="font-playfair text-4xl font-black sm:text-5xl md:text-6xl">Components of the Project</h2>
            <div className="mx-auto mt-6 h-[3px] w-24 rounded-full bg-[#f2b544]" />
          </div>
          <p className="mx-auto mb-10 max-w-5xl text-base font-medium leading-8 text-[#f7f3e8]/85 sm:mb-14 sm:text-xl sm:leading-9">
            <span className="font-black text-[#f2b544]">Implementation Structure:</span> The project is designed for use across state, district and block levels, supporting farmer registration, dashboard reporting, employee monitoring and millet-focused administration.
          </p>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {components.map((item, idx) => (
              <article
                key={item.title}
                className="group flex min-h-full animate-slide-in-soft flex-col overflow-hidden rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] text-[#0b4f3a] shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition duration-300 hover:-translate-y-1 hover:border-[#f2b544]"
              >
                <SoftImage
                  label={`${item.title} image`}
                  src={contentImageSources[(idx + 1) % contentImageSources.length]}
                  className="min-h-[190px] rounded-none border-0 shadow-none sm:min-h-[230px]"
                />
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="mb-4 flex items-start gap-3">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-[#0b4f3a] text-[#f2b544] shadow-md">
                      {item.icon}
                    </div>
                    <h3 className="break-words text-2xl font-black leading-tight">{item.title} :</h3>
                  </div>
                  <ul className="space-y-3 text-base font-medium leading-7">
                    {item.points.map((point) => (
                      <li key={point} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-[#f2b544]" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SECTION 10: PROJECT DELIVERY MECHANISM ========== */}
      <section className="bg-[#f7f3e8] px-4 py-14 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-[#0b4f3a]/15 bg-[#0b4f3a] text-[#f7f3e8] shadow-[0_24px_70px_rgba(11,79,58,0.24)]">
          <div className="grid lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[300px] overflow-hidden sm:min-h-[430px]">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517022812141-23620dba5c23?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center transition duration-700 hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0b4f3a]/85 via-[#0b4f3a]/50 to-transparent" />
              <div className="relative flex h-full min-h-[300px] items-end p-6 sm:min-h-[430px] sm:p-10 md:p-14">
                <h2 className="max-w-xl font-playfair text-4xl font-black leading-tight sm:text-5xl md:text-7xl">Project Delivery Mechanism</h2>
              </div>
            </div>
            <div className="p-6 sm:p-8 md:p-12">
              <div className="mb-8 flex items-start gap-4 sm:items-center">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg bg-[#f2b544] text-[#0b4f3a] sm:h-16 sm:w-16">
                  <BadgeIndianRupee className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <div className="break-words text-sm font-bold uppercase tracking-[0.25em] text-[#f2b544] sm:text-base">Fund Flow</div>
                  <h3 className="break-words text-3xl font-black text-[#f7f3e8] md:text-5xl">System Flow Design</h3>
                </div>
              </div>
              <div className="space-y-5 text-base leading-8 sm:text-lg sm:leading-9">
                <article className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8]/10 p-5">
                  <h4 className="mb-2 text-2xl font-black text-[#f2b544] sm:text-3xl">Project Data Flow</h4>
                  <p>
                    Farmer registration, administrative review and dashboard insights move through a structured digital workflow to support transparent project implementation.
                  </p>
                </article>
                <article className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8]/10 p-5">
                  <h4 className="mb-2 text-2xl font-black text-[#f2b544] sm:text-3xl">Monitoring Flow</h4>
                  <p>
                    Progress reports and regional summaries are consolidated to help officials review performance and make timely decisions.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== IMPLEMENTATION FLOW (Grid Structure) ========== */}
      <section className="bg-[#f7f3e8] px-4 pb-14 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-lg border border-[#0b4f3a]/12 bg-[#f7f3e8] p-4 shadow-[0_24px_70px_rgba(11,79,58,0.14)] sm:p-7">
          <div className="grid gap-8 xl:grid-cols-[240px_1fr_1fr] xl:gap-10">
            <div className="flex flex-col items-center justify-start gap-6 border-[#0b4f3a]/15 xl:border-r xl:pr-6">
              <div className="grid place-items-center rounded-lg bg-[#0b4f3a] p-6 text-[#f2b544] shadow-[0_18px_44px_rgba(11,79,58,0.2)]">
                <Users className="h-20 w-20" />
              </div>

              <div className="text-center text-[#0b4f3a]">
                <p className="text-lg font-black sm:text-xl">
                  Project implementation happens at three levels:
                </p>
              </div>

              <div className="w-full space-y-3">
                {flowLevels.map((level) => (
                  <div
                    key={level}
                    className="flex min-h-[58px] items-center justify-center rounded-lg bg-[#0b4f3a] px-4 py-3 text-center text-lg font-black leading-snug text-[#f7f3e8] shadow sm:min-h-[64px] sm:text-xl"
                  >
                    {level}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
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
                      className="flex min-h-[92px] items-center justify-center rounded-lg border border-[#0b4f3a]/10 bg-[#0b4f3a] p-4 text-center text-base font-bold leading-snug text-[#f7f3e8] shadow transition duration-300 hover:-translate-y-1 hover:border-[#f2b544] sm:min-h-[110px] sm:text-lg"
                    >
                      {box}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex min-h-[76px] items-center justify-center rounded-lg bg-[#f2b544] p-5 text-center text-xl font-black leading-snug text-[#0b4f3a] shadow sm:min-h-[86px] sm:text-2xl">
                State Project Administrator
              </div>

              <div className="flex min-h-[76px] items-center justify-center rounded-lg bg-[#f2b544] p-5 text-center text-xl font-black leading-snug text-[#0b4f3a] shadow sm:min-h-[86px] sm:text-2xl">
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
                    className="flex min-h-[78px] items-center justify-center rounded-lg border border-[#0b4f3a]/10 bg-[#f7f3e8] p-4 text-center text-base font-bold leading-snug text-[#0b4f3a] shadow transition duration-300 hover:-translate-y-1 hover:border-[#f2b544] sm:min-h-[92px] sm:text-lg"
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
      <section className="bg-[#0b4f3a] py-14 text-[#f7f3e8] sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10 text-center">
            <h2 className="break-words font-playfair text-4xl font-black sm:text-5xl md:text-6xl">Uttarakhand Millet MIS Workflow</h2>
            <p className="mt-4 text-xl font-medium text-[#f7f3e8]/80 sm:text-2xl md:text-4xl">Farmer Registry and Dashboard System</p>
          </div>

          <div className="mx-auto mb-8 max-w-4xl rounded-lg border border-[#f2b544]/35 bg-[#f2b544] px-4 py-4 text-center text-xl font-black text-[#0b4f3a] shadow-lg sm:px-6 sm:py-5 sm:text-2xl md:text-4xl">
            Process of Farmer Registration and Monitoring
          </div>

          <div className="grid gap-5 sm:gap-6 lg:grid-cols-[240px_repeat(3,1fr)]">
            <div className="flex flex-col items-center justify-center gap-5 rounded-lg border border-[#f2b544]/35 bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.22)]">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#0b4f3a] text-[#f2b544]">
                <Users className="h-12 w-12" />
              </div>
              <div className="text-2xl font-black sm:text-3xl">Farmer</div>
            </div>

            {mPassteps.slice(0, 6).map((step, idx) => (
              <div
                key={step}
                className="relative flex min-h-[150px] animate-slide-in-soft items-center justify-center rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] p-5 text-center text-base font-bold leading-7 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 sm:p-6 sm:text-lg"
              >
                <span className="absolute left-4 top-4 grid h-8 w-8 place-items-center rounded-full bg-[#0b4f3a] text-xs font-black text-[#f7f3e8]">
                  {idx + 1}
                </span>
                <div className="pt-6">{step}</div>
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 rounded-full bg-[#f2b544] p-1 text-[#0b4f3a] lg:block" />
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 sm:gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-[#f2b544]/25 bg-[#f7f3e8] p-5 text-center text-base font-bold leading-7 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:p-6 sm:text-lg md:text-2xl">
              {mPassteps[6]}
            </div>
            <div className="rounded-lg border border-[#f2b544]/35 bg-[#f2b544] p-5 text-center text-base font-black leading-7 text-[#0b4f3a] shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:p-6 sm:text-lg md:text-2xl">
              {mPassteps[7]}
            </div>
          </div>
        </div>
      </section>

      <footer style={{ background: "#0b4f3a", color: "#f7f3e8" }} className="w-full mt-0">
        {/* --- TOP BAR: Logos + Branding --- */}
        <div style={{ borderBottom: "1px solid rgba(242, 181, 68, 0.28)" }} className="px-6 py-8 sm:px-10">
          <div className="flex flex-wrap items-center gap-5 mb-3">
            <img
              src="/topbarlogo.png"
              alt="Uttarakhand Millet Project"
              className="h-14 w-auto max-w-[220px] object-contain"
            />
            <img
              src="/logo2.png"
              alt="Agriculture Department Uttarakhand"
              className="h-14 w-auto object-contain"
            />
            <img
              src="/logo1.png"
              alt="Ministry of Agriculture and Farmers Welfare"
              className="h-14 w-auto max-w-[180px] object-contain"
            />
            <div style={{ borderLeft: "2px solid #f2b544" }} className="pl-4 ml-1">
              <p style={{ color: "#f7f3e8" }} className="text-[15.68px] font-semibold leading-snug">
                Government of Uttarakhand<br />
                Department of Agriculture &amp; Horticulture
              </p>
            </div>
          </div>
          <p style={{ color: "#f7f3e8" }} className="text-[13.44px] italic">
            Millet Development Programme — Digital Management Information System
          </p>
        </div>

        {/* --- MAIN GRID: 4 columns --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Contact */}
          <div style={{ borderRight: "1px solid rgba(242, 181, 68, 0.22)" }} className="p-6 sm:p-7">
            <p
              style={{ color: "#f2b544", borderBottom: "1px solid rgba(242, 181, 68, 0.22)" }}
              className="text-[11.2px] font-semibold uppercase tracking-widest mb-4 pb-2"
            >
              Contact Us
            </p>

            {/* Helpline badge */}
            <div
              style={{ background: "#f2b544", border: "1px solid rgba(247, 243, 232, 0.35)" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 mb-4"
            >
              <Phone size={14} style={{ color: "#0b4f3a", flexShrink: 0 }} />
              <div>
                <p style={{ color: "#0b4f3a" }} className="text-[10.08px] uppercase tracking-widest">
                  Kisan Helpline
                </p>
                <p style={{ color: "#0b4f3a" }} className="text-[15.68px] font-semibold tracking-wide">
                  1800 180 1551
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-2 mb-3">
              <MapPin size={14} style={{ color: "#f2b544", flexShrink: 0, marginTop: 3 }} />
              <p style={{ color: "#f7f3e8" }} className="text-[13.44px] leading-relaxed">
                Directorate of Agriculture (Uttarakhand)<br />
                Krishi Bhawan, Nanda-Ki-Chowki,<br />
                Premnagar, Dehradun — 248007
              </p>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-2 mb-3">
              <Phone size={14} style={{ color: "#f2b544", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ color: "#f7f3e8" }} className="text-[13.44px]">
                  0135-2972421 / 2972422
                </p>
                <p style={{ color: "#f7f3e8" }} className="text-[11.2px]">
                  Fax: 2972425
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-2">
              <Mail size={14} style={{ color: "#f2b544", flexShrink: 0, marginTop: 2 }} />
              <div>
                <a
                  href="mailto:dir-agri-ua@nic.in"
                  style={{ color: "#f7f3e8" }}
                  className="text-[13.44px] block hover:underline"
                >
                  dir-agri-ua@nic.in
                </a>
                <a
                  href="mailto:dir.agri.uttarakhand@gmail.com"
                  style={{ color: "#f7f3e8" }}
                  className="text-[13.44px] block hover:underline"
                >
                  dir.agri.uttarakhand@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div style={{ borderRight: "1px solid rgba(242, 181, 68, 0.22)" }} className="p-6 sm:p-7">
            <p
              style={{ color: "#f2b544", borderBottom: "1px solid rgba(242, 181, 68, 0.22)" }}
              className="text-[11.2px] font-semibold uppercase tracking-widest mb-4 pb-2"
            >
              Quick Links
            </p>
            <ul className="space-y-2">
              {[
                ["Login", "/login"],
                ["Contact", "/contact"],
                ["Disclaimer", "/disclaimer"],
                ["FAQ", "/faq"],
                ["About", "/about-programme"],
                ["Sitemap", "/sitemap"],
              ].map(([label, href]) => (
                <li key={label} className="flex items-center gap-2">
                  <span style={{ background: "#f2b544" }} className="w-1 h-1 rounded-full flex-shrink-0" />
                  <Link
                    to={href}
                    style={{ color: "#f7f3e8" }}
                    className="text-[13.44px] transition-colors hover:text-[#f2b544]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Important Links */}
          <div style={{ borderRight: "1px solid rgba(242, 181, 68, 0.22)" }} className="p-6 sm:p-7">
            <p
              style={{ color: "#f2b544", borderBottom: "1px solid rgba(242, 181, 68, 0.22)" }}
              className="text-[11.2px] font-semibold uppercase tracking-widest mb-4 pb-2"
            >
              Important Links
            </p>
            <ul className="space-y-2">
              {[
                ["india.gov.in", "https://india.gov.in"],
                ["uk.gov.in", "https://uk.gov.in"],
                ["agriculture.uk.gov.in", "https://agriculture.uk.gov.in"],
                ["agricoop.nic.in", "https://agricoop.nic.in"],
                ["mkisan.gov.in", "https://mkisan.gov.in"],
              ].map(([label, href]) => (
                <li key={label} className="flex items-center gap-2">
                  <span style={{ background: "#f2b544" }} className="w-1 h-1 rounded-full flex-shrink-0" />
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#f7f3e8" }}
                    className="text-[13.44px] transition-colors hover:text-[#f2b544]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Connect + Visitor Counter */}
          <div className="p-6 sm:p-7">
            <p
              style={{ color: "#f2b544", borderBottom: "1px solid rgba(242, 181, 68, 0.22)" }}
              className="text-[11.2px] font-semibold uppercase tracking-widest mb-4 pb-2"
            >
              Connect
            </p>

            {/* Social icons */}
            <div className="flex gap-2 flex-wrap mb-5">
              {[
                [Globe, "Facebook"],
                [Send, "X / Twitter"],
                [Camera, "Instagram"],
                [Video, "YouTube"],
              ].map(([Icon, label]) => (
                <button
                  key={label}
                  type="button"
                  title={label}
                  aria-label={label}
                  style={{ background: "#0b4f3a", border: "1px solid rgba(242, 181, 68, 0.35)" }}
                  className="w-9 h-9 rounded-md flex items-center justify-center transition-colors hover:bg-[#f7f3e8]"
                >
                  <Icon size={15} style={{ color: "#f2b544" }} />
                </button>
              ))}
            </div>

            {/* Visitor counter */}
            <div style={{ background: "#f7f3e8", border: "1px solid rgba(242, 181, 68, 0.35)" }} className="rounded-lg px-4 py-3">
              <p style={{ color: "#0b4f3a" }} className="text-[11.2px] uppercase tracking-widest mb-1">
                Visitors
              </p>
              <p style={{ color: "#0b4f3a" }} className="text-[22.4px] font-semibold tracking-wide tabular-nums">
                {visitorCount.toLocaleString("en-IN")}
              </p>
              <p style={{ color: "#0b4f3a" }} className="text-[11.2px] mt-1">
                Last updated: {lastUpdated}
              </p>
            </div>
          </div>
        </div>

        {/* --- BOTTOM BAR --- */}
        <div
          style={{ background: "#083f2e", borderTop: "1px solid rgba(242, 181, 68, 0.28)" }}
          className="px-6 py-4 sm:px-10 flex flex-wrap items-center justify-between gap-3"
        >
          <p style={{ color: "#f7f3e8" }} className="text-[13.44px]">
            &copy; {currentYear} Government of Uttarakhand — Department of Agriculture &amp; Horticulture. All rights
            reserved.
          </p>
          <div className="flex flex-wrap gap-4">
            {footerInformation.map((item) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setActiveFooterTopic(item.title)}
                style={{ color: "#f7f3e8" }}
                className="text-left text-[12.32px] transition-colors hover:text-[#f2b544] hover:underline"
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>

        {activeFooterDetails ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-info-title"
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 px-4 py-6"
            onClick={() => setActiveFooterTopic(null)}
          >
            <div
              className="max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-lg bg-[#f7f3e8] p-5 text-[#0b4f3a] shadow-2xl sm:p-7"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <h2 id="footer-info-title" className="text-2xl font-extrabold text-[#0b4f3a]">
                  {activeFooterDetails.title}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveFooterTopic(null)}
                  className="rounded-md border border-[#0b4f3a]/20 px-3 py-1 text-sm font-semibold text-[#0b4f3a] hover:bg-[#f2b544]/20"
                >
                  Close
                </button>
              </div>
              <p className="mb-4 text-base leading-7 text-[#0b4f3a]/80">{activeFooterDetails.intro}</p>
              <ul className="list-disc space-y-3 pl-5 text-base leading-7 text-[#0b4f3a]/80">
                {activeFooterDetails.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </footer>
    </div>
  );
}
