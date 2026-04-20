import React, { useMemo, useState } from "react";
import { MapPin, Users, Building2, Sprout, Mountain, TrendingUp, Info } from "lucide-react";

/* ---------- SAMPLE DATA ---------- */
const SAMPLE_DISTRICTS = [
  { id: "dehradun", name: "Dehradun", blocks: 6, farmers: 1240, areaHa: 320 },
  { id: "haridwar", name: "Haridwar", blocks: 6, farmers: 980, areaHa: 280 },
  { id: "tehri", name: "Tehri Garhwal", blocks: 9, farmers: 1560, areaHa: 410 },
  { id: "pauri", name: "Pauri Garhwal", blocks: 15, farmers: 2100, areaHa: 520 },
];

/* ---------- MAP SHAPES (TEMP) ---------- */
const MAP = [
  { id: "dehradun", path: "M60 220 L120 205 L135 240 L105 275 L50 260 Z" },
  { id: "haridwar", path: "M120 255 L170 248 L182 285 L132 300 L105 275 Z" },
  { id: "tehri", path: "M145 105 L205 115 L220 175 L155 165 Z" },
  { id: "pauri", path: "M155 165 L220 175 L235 235 L170 248 L120 205 Z" },
];

/* ---------- HELPER ---------- */
function getColor(value, min, max) {
  if (max === min) return "#86efac";
  const ratio = (value - min) / (max - min);
  if (ratio < 0.3) return "#bbf7d0";
  if (ratio < 0.6) return "#4ade80";
  return "#16a34a";
}

/* ---------- STAT CARD ---------- */
function StatCard({ title, value, icon: Icon }) {
  return (
    <div style={{
      padding: "15px",
      borderRadius: "10px",
      background: "#fff",
      border: "1px solid #e5e7eb",
      display: "flex",
      justifyContent: "space-between"
    }}>
      <div>
        <p style={{ fontSize: "12px", color: "#555" }}>{title}</p>
        <h3>{value}</h3>
      </div>
      <Icon size={20} />
    </div>
  );
}

/* ---------- MAP ---------- */
function MapSection({ data }) {
  const [hover, setHover] = useState(null);

  const mapData = {};
  data.forEach(d => mapData[d.id] = d);

  const values = data.map(d => d.farmers);
  const min = Math.min(...values);
  const max = Math.max(...values);

  return (
    <div style={{ position: "relative", background: "#fff", padding: "20px", borderRadius: "10px" }}>
      <h3>District Map</h3>

      <svg viewBox="0 0 520 400" width="100%">
        {MAP.map((d) => {
          const info = mapData[d.id];
          const color = info ? getColor(info.farmers, min, max) : "#ccc";

          return (
            <path
              key={d.id}
              d={d.path}
              fill={color}
              stroke="#fff"
              onMouseEnter={() => setHover(info)}
              onMouseLeave={() => setHover(null)}
            />
          );
        })}
      </svg>

      {hover && (
        <div style={{
          position: "absolute",
          right: "20px",
          top: "20px",
          background: "#fff",
          padding: "10px",
          border: "1px solid #ddd"
        }}>
          <b>{hover.name}</b>
          <p>Blocks: {hover.blocks}</p>
          <p>Farmers: {hover.farmers}</p>
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
    };
  }, []);

  return (
    <div style={{ padding: "20px", background: "#f9fafb", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{
        background: "#166534",
        color: "#fff",
        padding: "30px",
        borderRadius: "10px"
      }}>
        <h1>Uttarakhand Millet Programme</h1>
        <p>Promoting millets for nutrition, sustainability, and farmer income.</p>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px", marginTop: "20px" }}>
        <StatCard title="Districts" value={totals.districts} icon={MapPin} />
        <StatCard title="Blocks" value={totals.blocks} icon={Building2} />
        <StatCard title="Farmers" value={totals.farmers} icon={Users} />
      </div>

      {/* MAP */}
      <div style={{ marginTop: "20px" }}>
        <MapSection data={SAMPLE_DISTRICTS} />
      </div>

      {/* ABOUT */}
      <div style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <h2>About Programme</h2>
        <p>
          The Uttarakhand Millet Programme promotes traditional crops,
          strengthens farmer livelihoods, and builds climate-resilient agriculture.
        </p>
      </div>

      {/* OBJECTIVES */}
      <div style={{ marginTop: "20px", background: "#fff", padding: "20px", borderRadius: "10px" }}>
        <h2>Objectives</h2>
        <ul>
          <li>Increase millet production</li>
          <li>Support farmers</li>
          <li>Promote nutrition</li>
        </ul>
      </div>

      {/* INFO */}
      <div style={{ marginTop: "20px", background: "#fefce8", padding: "20px", borderRadius: "10px" }}>
        <Info size={20} /> Millets are key to sustainable agriculture in Uttarakhand.
      </div>

    </div>
  );
}