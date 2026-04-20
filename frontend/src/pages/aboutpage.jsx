import React, { useMemo, useState } from "react";
import geoData from "../data/district.geojson";
import {
  MapPin,
  Users,
  Building2,
  Sprout,
  Mountain,
  TrendingUp,
  Info,
} from "lucide-react";

/* ---------- SAMPLE DATA ---------- */
/* Replace later with FastAPI data */
const SAMPLE_DISTRICTS = [
  { id: "almora", name: "Almora", blocks: 11, farmers: 1880, areaHa: 465 },
  { id: "bageshwar", name: "Bageshwar", blocks: 3, farmers: 720, areaHa: 210 },
  { id: "chamoli", name: "Chamoli", blocks: 9, farmers: 1180, areaHa: 300 },
  { id: "champawat", name: "Champawat", blocks: 4, farmers: 690, areaHa: 190 },
  { id: "dehradun", name: "Dehradun", blocks: 6, farmers: 1240, areaHa: 320 },
  { id: "haridwar", name: "Haridwar", blocks: 6, farmers: 980, areaHa: 280 },
  { id: "nainital", name: "Nainital", blocks: 8, farmers: 1110, areaHa: 290 },
  { id: "pauri garhwal", name: "Pauri Garhwal", blocks: 15, farmers: 2100, areaHa: 520 },
  { id: "pithoragarh", name: "Pithoragarh", blocks: 8, farmers: 1320, areaHa: 355 },
  { id: "rudraprayag", name: "Rudraprayag", blocks: 3, farmers: 640, areaHa: 175 },
  { id: "tehri garhwal", name: "Tehri Garhwal", blocks: 9, farmers: 1560, areaHa: 410 },
  { id: "udham singh nagar", name: "Udham Singh Nagar", blocks: 7, farmers: 970, areaHa: 260 },
  { id: "uttarkashi", name: "Uttarkashi", blocks: 6, farmers: 860, areaHa: 240 },
];

/* ---------- HELPERS ---------- */
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
  "udham सिंह nagar": "udham singh nagar",
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

/* ---------- UI ---------- */
function StatCard({ title, value, icon: Icon }) {
  return (
    <div
      style={{
        padding: "15px",
        borderRadius: "10px",
        background: "#fff",
        border: "1px solid #e5e7eb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <p style={{ fontSize: "12px", color: "#555", margin: 0 }}>{title}</p>
        <h3 style={{ margin: "6px 0 0 0" }}>{value}</h3>
      </div>
      <Icon size={20} color="#166534" />
    </div>
  );
}

function MapSection({ data }) {
  const [hover, setHover] = useState(null);

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

  const xs = allCoords.map((c) => c[0]);
  const ys = allCoords.map((c) => c[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const width = 800;
  const height = 620;
  const padding = 30;

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

  return (
    <div
      style={{
        position: "relative",
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        border: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          marginBottom: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h3 style={{ margin: 0 }}>District Coverage Map</h3>
          <p style={{ margin: "6px 0 0 0", color: "#666", fontSize: "14px" }}>
            Hover over a district to view blocks, farmers, and area under millets.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#666" }}>
          <span>Low</span>
          <div style={{ display: "flex", overflow: "hidden", borderRadius: "999px", border: "1px solid #ddd" }}>
            {["#dcfce7", "#bbf7d0", "#86efac", "#4ade80", "#16a34a"].map((c) => (
              <div key={c} style={{ width: "26px", height: "10px", background: c }} />
            ))}
          </div>
          <span>High</span>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ display: "block" }}>
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

          return (
            <path
              key={`${canonicalName}-${index}`}
              d={pathData}
              fill={fill}
              stroke="#ffffff"
              strokeWidth="1.2"
              style={{ cursor: "pointer", transition: "opacity 0.2s ease" }}
              onMouseEnter={() => setHover(info || { name: districtName, blocks: "-", farmers: "-", areaHa: "-" })}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hover && (
        <div
          style={{
            position: "absolute",
            right: "20px",
            top: "20px",
            background: "#fff",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "10px",
            minWidth: "220px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: "8px" }}>{hover.name}</div>
          <div style={{ fontSize: "14px", lineHeight: 1.7 }}>
            <div>Blocks: {hover.blocks}</div>
            <div>Farmers: {hover.farmers && hover.farmers.toLocaleString ? hover.farmers.toLocaleString() : hover.farmers}</div>
            <div>Area under Millets: {hover.areaHa !== undefined ? `${hover.areaHa} ha` : "-"}</div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- MAIN PAGE ---------- */
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
    <div style={{ padding: "20px", background: "#f9fafb", minHeight: "100vh" }}>
      <div
        style={{
          background: "#166534",
          color: "#fff",
          padding: "30px",
          borderRadius: "10px",
        }}
      >
        <h1 style={{ margin: 0 }}>Uttarakhand Millet Programme</h1>
        <p style={{ margin: "10px 0 0 0" }}>
          Promoting millets for nutrition, sustainability, climate resilience, and farmer income.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        <StatCard title="Districts" value={totals.districts} icon={MapPin} />
        <StatCard title="Blocks" value={totals.blocks} icon={Building2} />
        <StatCard title="Farmers" value={totals.farmers.toLocaleString()} icon={Users} />
        <StatCard title="Area under Millets" value={`${totals.areaHa} ha`} icon={Sprout} />
        <StatCard title="Villages Reached" value={totals.villages} icon={Mountain} />
        <StatCard title="SHGs / Groups" value={totals.shgs} icon={TrendingUp} />
      </div>

      <div style={{ marginTop: "20px" }}>
        <MapSection data={SAMPLE_DISTRICTS} />
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0 }}>About Programme</h2>
        <p style={{ lineHeight: 1.7 }}>
          The Uttarakhand Millet Programme promotes traditional crops, strengthens farmer livelihoods,
          improves nutrition security, and supports climate-resilient agriculture across the state.
        </p>
        <p style={{ lineHeight: 1.7 }}>
          Millets are well suited to Uttarakhand’s hill and rainfed farming systems. The programme
          encourages production, processing, value addition, and market linkage through coordinated
          support at the state, district, block, and community levels.
        </p>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#fff",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Objectives</h2>
        <ul style={{ lineHeight: 1.9, paddingLeft: "18px" }}>
          <li>Increase millet cultivation and productivity.</li>
          <li>Support farmer registration and district-level monitoring.</li>
          <li>Promote nutrition, traditional crops, and resilient agriculture.</li>
          <li>Encourage processing, value addition, and local entrepreneurship.</li>
          <li>Strengthen SHGs, FPOs, and market linkages.</li>
        </ul>
      </div>

      <div
        style={{
          marginTop: "20px",
          background: "#fefce8",
          padding: "20px",
          borderRadius: "10px",
          border: "1px solid #f3e8a6",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Info size={20} />
        <span>Millets are key to sustainable mountain agriculture in Uttarakhand.</span>
      </div>
    </div>
  );
}