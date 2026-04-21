import React, { useMemo, useState } from "react";
import geoData from "../data/district.geojson";
import "../styles/aboutpage.css";
import {
  MapPin,
  Users,
  Building2,
  Sprout,
  Mountain,
  TrendingUp,
  Info,
} from "lucide-react";

const SAMPLE_DISTRICTS = [
  { id: "almora", name: "Almora", blocks: 5, farmers: 1880, areaHa: 465 },
  { id: "bageshwar", name: "Bageshwar", blocks: 3, farmers: 720, areaHa: 210 },
  { id: "chamoli", name: "Chamoli", blocks: 9, farmers: 1180, areaHa: 300 },
  { id: "champawat", name: "Champawat", blocks: 4, farmers: 690, areaHa: 190 },
  { id: "dehradun", name: "Dehradun", blocks: 6, farmers: 1240, areaHa: 320 },
  { id: "haridwar", name: "Haridwar", blocks: 6, farmers: 980, areaHa: 280 },
  { id: "nainital", name: "Nainital", blocks: 8, farmers: 1110, areaHa: 290 },
  { id: "pauri garhwal", name: "Pauri Garhwal", blocks: 6, farmers: 2100, areaHa: 520 },
  { id: "pithoragarh", name: "Pithoragarh", blocks: 8, farmers: 1320, areaHa: 355 },
  { id: "rudraprayag", name: "Rudraprayag", blocks: 3, farmers: 640, areaHa: 175 },
  { id: "tehri garhwal", name: "Tehri Garhwal", blocks: 9, farmers: 1560, areaHa: 410 },
  { id: "udham singh nagar", name: "Udham Singh Nagar", blocks: 7, farmers: 970, areaHa: 260 },
  { id: "uttarkashi", name: "Uttarkashi", blocks: 6, farmers: 860, areaHa: 240 },
];

function normalizeName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const DISTRICT_NAME_ALIASES = {
  "u.s. nagar": "udham singh nagar",
  "us nagar": "udham singh nagar",
};

function getCanonicalDistrictName(name) {
  const normalized = normalizeName(name);
  return DISTRICT_NAME_ALIASES[normalized] || normalized;
}

function getColor(value, min, max) {
  if (max === min) return "#86efac";
  const ratio = (value - min) / (max - min);
  if (ratio < 0.2) return "#dcfce7";
  if (ratio < 0.4) return "#bbf7d0";
  if (ratio < 0.6) return "#86efac";
  if (ratio < 0.8) return "#4ade80";
  return "#16a34a";
}

function getAllCoordinates(features) {
  const coords = [];

  features.forEach((feature) => {
    const geometry = feature.geometry;
    if (!geometry) return;

    if (geometry.type === "Polygon") {
      geometry.coordinates.forEach((ring) => {
        ring.forEach(([x, y]) => coords.push([x, y]));
      });
    }

    if (geometry.type === "MultiPolygon") {
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach(([x, y]) => coords.push([x, y]));
        });
      });
    }
  });

  return coords;
}

function buildPathFromRing(ring, project) {
  if (!ring || ring.length === 0) return "";
  const first = project(ring[0]);
  let path = `M ${first[0]} ${first[1]}`;

  for (let i = 1; i < ring.length; i += 1) {
    const [x, y] = project(ring[i]);
    path += ` L ${x} ${y}`;
  }

  path += " Z";
  return path;
}

function buildFeaturePath(feature, project) {
  const geometry = feature.geometry;
  if (!geometry) return "";

  if (geometry.type === "Polygon") {
    return geometry.coordinates.map((ring) => buildPathFromRing(ring, project)).join(" ");
  }

  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates
      .map((polygon) => polygon.map((ring) => buildPathFromRing(ring, project)).join(" "))
      .join(" ");
  }

  return "";
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="stat-card">
      <div>
        <p className="stat-card-title">{title}</p>
        <h3 className="stat-card-value">{value}</h3>
      </div>
      <Icon size={20} color="#166534" />
    </div>
  );
}

function MapSection({ data }) {
  const [hover, setHover] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const mapData = useMemo(() => {
    const obj = {};
    data.forEach((d) => {
      obj[getCanonicalDistrictName(d.name)] = d;
    });
    return obj;
  }, [data]);

  const values = data.map((d) => d.farmers);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const features = geoData.features || [];
  const allCoords = getAllCoordinates(features);

  if (!allCoords.length) {
    return (
      <div className="map-container">
        <h3 className="section-title">District Coverage Map</h3>
        <p>No district geometry found.</p>
      </div>
    );
  }

  const xs = allCoords.map((c) => c[0]);
  const ys = allCoords.map((c) => c[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = 900;
  const height = 650;
  const padding = 40;

  const scaleX = (width - padding * 2) / (maxX - minX);
  const scaleY = (height - padding * 2) / (maxY - minY);
  const scale = Math.min(scaleX, scaleY);

  const usedWidth = (maxX - minX) * scale;
  const usedHeight = (maxY - minY) * scale;
  const offsetX = (width - usedWidth) / 2;
  const offsetY = (height - usedHeight) / 2;

  const project = ([x, y]) => {
    const px = (x - minX) * scale + offsetX;
    const py = height - ((y - minY) * scale + offsetY);
    return [px, py];
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div className="map-container">
      <div className="map-header">
        <div>
          <h3 className="section-title">District Coverage Map</h3>
          <p className="section-subtitle">
            Hover over a district to view blocks, farmers, and area under millets.
          </p>
        </div>

        <div className="map-legend">
          <span>Low</span>
          <div className="legend-scale">
            {["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#16a34a"].map((c) => (
              <div key={c} className="legend-color" style={{ background: c }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      <div className="map-wrapper" onMouseMove={handleMouseMove}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="district-map-svg">
          {features.map((feature, index) => {
            const districtName =
              feature.properties?.NAME_2 ||
              feature.properties?.district ||
              feature.properties?.name ||
              feature.properties?.DIST_NAME ||
              "";

            const canonicalName = getCanonicalDistrictName(districtName);
            const info = mapData[canonicalName];
            const fill = info ? getColor(info.farmers, min, max) : "#d1d5db";
            const pathData = buildFeaturePath(feature, project);
            const isHovered = hover && hover.name === info?.name;

            return (
              <path
                key={`${canonicalName}-${index}`}
                d={pathData}
                fill={fill}
                stroke={isHovered ? "#166534" : "#ffffff"}
                strokeWidth={isHovered ? "2.5" : "1.2"}
                className="district-path"
                style={{
                  filter: isHovered ? "drop-shadow(0 0 8px rgba(22, 101, 52, 0.4))" : "none",
                }}
                onMouseEnter={() =>
                  setHover(info || { name: districtName, blocks: "-", farmers: "-", areaHa: "-" })
                }
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </svg>

        {hover && (
          <div
            className="map-tooltip"
            style={{
              left: `${tooltipPos.x + 20}px`,
              top: `${tooltipPos.y - 80}px`,
            }}
          >
            <div className="tooltip-header">
              <h4 className="tooltip-title">{hover.name}</h4>
              <p className="tooltip-subtitle">Millet Programme Data</p>
            </div>
            <div className="tooltip-body">
              <div className="tooltip-row">
                <span className="tooltip-label">Blocks</span>
                <span className="tooltip-value">{hover.blocks}</span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Farmers</span>
                <span className="tooltip-value">
                  {hover.farmers && hover.farmers.toLocaleString
                    ? hover.farmers.toLocaleString()
                    : hover.farmers}
                </span>
              </div>
              <div className="tooltip-row">
                <span className="tooltip-label">Area (Millets)</span>
                <span className="tooltip-value">{hover.areaHa !== undefined ? `${hover.areaHa} ha` : "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const totals = useMemo(() => {
    return {
      districts: SAMPLE_DISTRICTS.length,
      farmers: SAMPLE_DISTRICTS.reduce((a, b) => a + b.farmers, 0),
      blocks: SAMPLE_DISTRICTS.reduce((a, b) => a + b.blocks, 0),
      areaHa: SAMPLE_DISTRICTS.reduce((a, b) => a + b.areaHa, 0),
      villages: 1248,
      shgs: 186,
    };
  }, []);

  return (
    <div className="about-container">
      <div className="about-header">
        <h1 className="about-header-title">Uttarakhand State Millet Mission Policy</h1>
        <p className="about-header-text">About the Programme</p>
        <p className="about-header-text">
          Promoting millets for nutrition, sustainability, climate resilience, and farmer income.
        </p>
      </div>

      <div className="about-grid">
        <StatCard title="Districts" value={totals.districts} icon={MapPin} />
        <StatCard title="Blocks" value={totals.blocks} icon={Building2} />
        <StatCard title="Farmers" value={totals.farmers.toLocaleString()} icon={Users} />
        <StatCard title="Area under Millets" value={`${totals.areaHa} ha`} icon={Sprout} />
        <StatCard title="Villages Reached" value={totals.villages} icon={Mountain} />
        <StatCard title="SHGs / Groups" value={totals.shgs} icon={TrendingUp} />
      </div>

      <MapSection data={SAMPLE_DISTRICTS} />

      <div className="section-card">
        <h2 className="section-title">About Programme</h2>
        <p className="section-text">
          The Uttarakhand Millet Programme promotes traditional crops, strengthens farmer livelihoods,
          improves nutrition security, and supports climate-resilient agriculture across the state.
        </p>
        <p className="section-text">
         The Uttarakhand Millet Mission (Shree Anna Uttarakhand) is a flagship initiative of the Department of Agriculture, Government of Uttarakhand. The programme aims to revive traditional millet cultivation—especially mandua (finger millet), jhangora (barnyard millet), kangni, and other local crops—while strengthening farmer livelihoods and improving nutritional security.

The mission adopts an integrated approach covering production, processing, value addition, and market linkage, ensuring end-to-end support for farmers, Self Help Groups (SHGs), and rural enterprises.

It also promotes climate-resilient agriculture, particularly suited to the hill ecosystems of Uttarakhand.
        </p>
      </div>

      <div className="section-card">
        <h2 className="section-title">Objectives</h2>
        <ul className="objectives-list">
          <li>Increase millet cultivation and productivity across all 13 districts.</li>
          <li>Support farmer registration, monitoring, and livelihood enhancement.</li>
          <li>Promote nutrition, traditional crops, and resilient agriculture in hill regions.</li>
          <li>Encourage processing, value addition, and local entrepreneurship.</li>
          <li>Strengthen SHGs, FPOs, cooperatives, and market linkages.</li>
          <li>Build capacity for sustainable farming and climate adaptation.</li>
        </ul>
      </div>

      <div className="info-box">
        <Info size={20} />
        <span>Millets are key to sustainable mountain agriculture in Uttarakhand. Rich in nutrition and climate-resilient, they support both farmer income and environmental sustainability.</span>
      </div>
    </div>
  );
}