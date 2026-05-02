import React, { useEffect, useMemo, useState } from "react";

import { useAuth } from "../context/AuthContext";

const NAVY = "#1A3A5C";
const GOLD = "#C8A951";
const TOTAL_AREA_HECTARES = 30000;
const TOTAL_BUDGET_CRORE = 60.469;
const PHYSICAL_STORAGE_KEY = "mp1_ph";
const FINANCIAL_STORAGE_KEY = "mp1_fn";

const textPrimary = "#1A3A5C";
const textSecondary = "#4a5568";
const textTertiary = "#718096";
const backgroundPrimary = "#ffffff";
const backgroundSecondary = "#f8fafc";
const borderSecondary = "#cbd5e1";
const borderTertiary = "#dbe4ed";

const DIS = [
  {
    id: 1,
    name: "Chamoli",
    blk: [
      { name: "Karnprayag", v: 236, ha: 1464 },
      { name: "Deval", v: 75, ha: 340 },
      { name: "Dasholi", v: 136, ha: 1113 },
      { name: "Gairsain", v: 231, ha: 1729 },
    ],
  },
  {
    id: 2,
    name: "Pauri Garhwal",
    blk: [
      { name: "Pauri", v: 228, ha: 373 },
      { name: "Pabo", v: 158, ha: 542 },
      { name: "Thaleesom", v: 224, ha: 1000 },
      { name: "Bironkhal", v: 267, ha: 518 },
    ],
  },
  {
    id: 3,
    name: "Rudraprayag",
    blk: [
      { name: "Augustmuni", v: 366, ha: 1500 },
      { name: "Jakholi", v: 168, ha: 1671 },
      { name: "Ukhimath", v: 147, ha: 1245 },
    ],
  },
  {
    id: 4,
    name: "Tehri Garhwal",
    blk: [
      { name: "Jaunpur", v: 260, ha: 850 },
      { name: "Kirtinagar", v: 160, ha: 450 },
      { name: "Pratapnagar", v: 128, ha: 840 },
      { name: "Bhilangna", v: 274, ha: 746 },
    ],
  },
  {
    id: 5,
    name: "Uttarkashi",
    blk: [
      { name: "Dunda", v: 130, ha: 700 },
      { name: "Nougaon", v: 186, ha: 1000 },
    ],
  },
  {
    id: 6,
    name: "Almora",
    blk: [
      { name: "Dwarhat", v: 217, ha: 1250 },
      { name: "Dholadevi", v: 232, ha: 3457 },
      { name: "Hawalbagh", v: 234, ha: 1770 },
      { name: "Syalde", v: 195, ha: 3293 },
      { name: "Lamgara", v: 218, ha: 2250 },
      { name: "Takula", v: 158, ha: 1143 },
    ],
  },
  {
    id: 7,
    name: "Bageshwar",
    blk: [{ name: "Garud", v: 189, ha: 756 }],
  },
];

const ALL_BLOCKS = DIS.flatMap((district) =>
  district.blk.map((block) => ({ ...block, did: district.id, dname: district.name })),
);

const SPHY = [
  { k: "seeds", lbl: "Seeds distributed", u: "qtl", t: 3000, h: "NFSM/CMRKY — 1000 qtl/yr × 3 yrs" },
  { k: "bukhari", lbl: "Bukharis installed (2 qtl capacity)", u: "nos", t: 3000, h: "State Mission — 1000/yr × 3 yrs" },
  { k: "equipment", lbl: "Agricultural equipment (80% subsidy)", u: "nos", t: 150, h: "SMAM — 75/yr × 2 yrs" },
  { k: "processing", lbl: "Primary processing units", u: "nos", t: 24, h: "NFSM — 12/yr × 2 yrs" },
  { k: "felicitation", lbl: "Farmers/groups felicitated", u: "nos", t: 144, h: "State Mission — 48/yr × 3 yrs" },
];

const SCH = [
  { id: "inputs", nm: "Farm inputs (bio-fertilizer/pesticide/zinc/micronutrients) @ ₹1,600/ha", src: "State Millet Mission", b: 14.40 },
  { id: "sowing", nm: "Sowing encouragement — alternative sowing methods (10% yield increase)", src: "State Millet Mission", b: 19.14 },
  { id: "bukh_s", nm: "Bukhari (2 qtl capacity) @ ₹300/nos", src: "State Millet Mission", b: 0.09 },
  { id: "transp", nm: "Millet procurement transport @ ₹75/qtl", src: "State Millet Mission", b: 3.375 },
  { id: "shg", nm: "SHG/FPO millet procurement incentive @ ₹300/qtl (1,50,000 qtl)", src: "State Millet Mission", b: 13.50 },
  { id: "award", nm: "Block-level farmer/group felicitation @ ₹10,000/block (02 per block)", src: "State Millet Mission", b: 0.144 },
  { id: "pmu", nm: "PMU establishment & capacity development work", src: "State Millet Mission", b: 4.53 },
  { id: "admin", nm: "Administrative expenses", src: "State Millet Mission", b: 1.50 },
  { id: "nfsm_s", nm: "Millet seed — NFSM/Seed Village @ ₹3,000/qtl", src: "Central Schemes (NFSM/SMAM/SMSP)", b: 0.90 },
  { id: "smam", nm: "Agricultural equipment — SMAM @ ₹50,000/unit", src: "Central Schemes (NFSM/SMAM/SMSP)", b: 0.76 },
  { id: "nfsm_p", nm: "Primary processing units — NFSM @ ₹4,00,000/unit", src: "Central Schemes (NFSM/SMAM/SMSP)", b: 0.96 },
  { id: "smsp_b", nm: "Bukhari subsidy — SMSP (50% cost or ₹200, whichever less)", src: "Central Schemes (NFSM/SMAM/SMSP)", b: 0.06 },
  { id: "cmrky_s", nm: "Millet seed — CMRKY @ ₹3,000/qtl", src: "Other Schemes (CMRKY)", b: 0.78 },
  { id: "irrig", nm: "Water pump / sprinkler set / polyhouse — CMRKY @ ₹22,000/unit", src: "Other Schemes (CMRKY)", b: 0.33 },
];

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "physical", label: "Physical Progress" },
  { id: "financial", label: "Financial Progress" },
];

function blockId(name) {
  return `b_${name.replace(/\s+/g, "_")}`;
}

function percentage(value, maxValue) {
  return maxValue > 0 ? Math.min(100, Math.round((value / maxValue) * 100)) : 0;
}

function formatCrore(value) {
  return value.toFixed(3);
}

function cleanNumber(value) {
  return Math.max(0, Number(value) || 0);
}

function readStoredObject(key) {
  if (typeof window === "undefined") return {};
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}

function saveStoredObject(key, value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort; the tracker remains usable without storage.
  }
}

function useStoredProgress(key) {
  const [progress, setProgress] = useState(() => readStoredObject(key));

  useEffect(() => {
    const saveTimer = window.setTimeout(() => {
      saveStoredObject(key, progress);
    }, 700);

    return () => window.clearTimeout(saveTimer);
  }, [key, progress]);

  return [progress, setProgress];
}

function ProgressBar({ percent, color = GOLD, height = 5 }) {
  return (
    <div
      style={{
        background: "#e2e8f0",
        borderRadius: 3,
        height,
        marginBottom: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: color,
          borderRadius: 3,
          height: "100%",
          transition: "width 0.35s",
          width: `${percent}%`,
        }}
      />
    </div>
  );
}

function NumberInput({ value, max, step = "1", placeholder = "0", emphasized = false, alignRight = false, onChange }) {
  return (
    <input
      min="0"
      max={max}
      step={step}
      type="number"
      value={value || ""}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      style={{
        background: backgroundPrimary,
        border: `0.5px solid ${borderSecondary}`,
        borderRadius: 6,
        color: textPrimary,
        fontFamily: "inherit",
        fontSize: emphasized ? 15 : 13,
        fontWeight: emphasized ? 500 : 400,
        outline: "none",
        padding: "4px 7px",
        textAlign: alignRight ? "right" : "left",
        width: "100%",
      }}
    />
  );
}

function Badge({ children }) {
  return (
    <span
      style={{
        background: NAVY,
        borderRadius: 4,
        color: GOLD,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 9px",
      }}
    >
      {children}
    </span>
  );
}

function KpiCard({ label, value, subLabel }) {
  return (
    <div style={{ background: backgroundSecondary, borderRadius: 8, padding: "0.875rem 1rem" }}>
      <div style={{ color: textSecondary, fontSize: 11, marginBottom: 3 }}>{label}</div>
      <div style={{ color: textPrimary, fontSize: 20, fontWeight: 500 }}>{value}</div>
      <div style={{ color: textTertiary, fontSize: 11, marginTop: 2 }}>{subLabel}</div>
    </div>
  );
}

function DistrictDetailTable({ district, achievedArea }) {
  const districtTargetArea = district.blk.reduce((sum, block) => sum + block.ha, 0);
  const districtBudget = ((districtTargetArea / TOTAL_AREA_HECTARES) * TOTAL_BUDGET_CRORE).toFixed(2);
  const totalVillages = district.blk.reduce((sum, block) => sum + block.v, 0);

  return (
    <div style={{ borderTop: `0.5px solid ${borderTertiary}`, padding: "0 12px 12px" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: 720, tableLayout: "fixed", width: "100%" }}>
          <colgroup>
            <col style={{ width: "22%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "26%" }} />
          </colgroup>
          <thead>
            <tr style={{ borderBottom: `1px solid ${GOLD}35` }}>
              {["Block", "Villages", "Target (ha)", "Achieved (ha)", "Budget (₹ cr)", "Progress"].map((heading, index) => (
                <th
                  key={heading}
                  style={{
                    color: NAVY,
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "7px 8px",
                    textAlign: index === 0 || index === 5 ? "left" : "right",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {district.blk.map((block) => {
              const currentValue = achievedArea(block.name);
              const blockBudget = ((block.ha / TOTAL_AREA_HECTARES) * TOTAL_BUDGET_CRORE).toFixed(3);
              const blockPercent = percentage(currentValue, block.ha);

              return (
                <tr key={block.name} style={{ borderBottom: `0.5px solid ${borderTertiary}` }}>
                  <td style={{ color: textPrimary, padding: "6px 8px" }}>{block.name}</td>
                  <td style={{ color: textSecondary, padding: "6px 8px", textAlign: "right" }}>{block.v}</td>
                  <td style={{ color: textSecondary, padding: "6px 8px", textAlign: "right" }}>{block.ha.toLocaleString()}</td>
                  <td style={{ color: textPrimary, fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>{currentValue.toLocaleString()}</td>
                  <td style={{ color: textSecondary, padding: "6px 8px", textAlign: "right" }}>₹{blockBudget}</td>
                  <td style={{ padding: "6px 8px", width: 82 }}>
                    <ProgressBar percent={blockPercent} />
                    <div style={{ color: textTertiary, fontSize: 10, textAlign: "right" }}>{blockPercent}%</div>
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: backgroundSecondary, borderTop: `1px solid ${GOLD}40` }}>
              <td style={{ color: NAVY, fontWeight: 500, padding: "6px 8px" }}>Total {district.name}</td>
              <td style={{ color: NAVY, fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>{totalVillages}</td>
              <td style={{ color: NAVY, fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>{districtTargetArea.toLocaleString()}</td>
              <td style={{ color: NAVY, fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>{achievedArea().toLocaleString()}</td>
              <td style={{ color: NAVY, fontWeight: 500, padding: "6px 8px", textAlign: "right" }}>₹{districtBudget}</td>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OverviewTab({ physicalProgress, expandedDistrictId, onToggleDistrict }) {
  const achievedForBlock = (blockName) => physicalProgress[`${blockId(blockName)}_ha`] || 0;

  return (
    <>
      {DIS.map((district) => {
        const districtTargetArea = district.blk.reduce((sum, block) => sum + block.ha, 0);
        const districtCurrentArea = district.blk.reduce((sum, block) => sum + achievedForBlock(block.name), 0);
        const districtBudget = ((districtTargetArea / TOTAL_AREA_HECTARES) * TOTAL_BUDGET_CRORE).toFixed(2);
        const districtPercent = percentage(districtCurrentArea, districtTargetArea);
        const isOpen = expandedDistrictId === district.id;

        return (
          <div
            key={district.id}
            style={{
              border: `0.5px solid ${borderTertiary}`,
              borderRadius: 10,
              marginBottom: 8,
              overflow: "hidden",
            }}
          >
            <button
              type="button"
              onClick={() => onToggleDistrict(district.id)}
              style={{
                alignItems: "center",
                background: isOpen ? backgroundSecondary : backgroundPrimary,
                border: 0,
                color: "inherit",
                cursor: "pointer",
                display: "flex",
                gap: 12,
                justifyContent: "space-between",
                padding: "10px 14px",
                textAlign: "left",
                width: "100%",
              }}
            >
              <span style={{ minWidth: 0 }}>
                <span style={{ color: textPrimary, fontWeight: 500 }}>{district.name}</span>
                <span style={{ color: textSecondary, fontSize: 12, marginLeft: 8 }}>
                  {district.blk.length} blocks · {districtTargetArea.toLocaleString()} ha · ₹{districtBudget} cr
                </span>
              </span>
              <span style={{ alignItems: "center", display: "flex", flexShrink: 0, gap: 10 }}>
                <span style={{ display: "block", width: 90 }}>
                  <ProgressBar percent={districtPercent} />
                  <span style={{ color: textTertiary, display: "block", fontSize: 10, marginTop: 1, textAlign: "right" }}>
                    {districtPercent}% area
                  </span>
                </span>
                <span style={{ color: textTertiary, fontSize: 11 }}>{isOpen ? "▲" : "▼"}</span>
              </span>
            </button>

            {isOpen ? (
              <DistrictDetailTable
                district={district}
                achievedArea={(blockName) =>
                  blockName
                    ? achievedForBlock(blockName)
                    : district.blk.reduce((sum, block) => sum + achievedForBlock(block.name), 0)
                }
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function PhysicalProgressTab({ physicalProgress, onBlockChange, onStatePhysicalChange }) {
  return (
    <>
      <div style={{ color: textSecondary, fontSize: 12, marginBottom: 12 }}>
        Enter actual achievement. Progress saves automatically across sessions.
      </div>

      <div style={{ borderBottom: `1px solid ${GOLD}35`, color: NAVY, fontSize: 13, fontWeight: 500, marginBottom: 10, paddingBottom: 4 }}>
        State-level physical targets (Phase 1 cumulative)
      </div>
      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", marginBottom: "1.5rem" }}>
        {SPHY.map((item) => {
          const value = physicalProgress[`s_${item.k}`] || 0;
          const itemPercent = percentage(value, item.t);

          return (
            <div key={item.k} style={{ border: `0.5px solid ${borderTertiary}`, borderRadius: 8, padding: "0.75rem" }}>
              <div style={{ color: textPrimary, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.lbl}</div>
              <div style={{ color: textTertiary, fontSize: 10, marginBottom: 7 }}>{item.h}</div>
              <div style={{ marginBottom: 6 }}>
                <NumberInput
                  emphasized
                  max={item.t}
                  value={value}
                  onChange={(inputValue) => onStatePhysicalChange(item.k, inputValue)}
                />
              </div>
              <ProgressBar percent={itemPercent} />
              <div style={{ color: textTertiary, fontSize: 10, marginTop: 2 }}>
                {value.toLocaleString()} / {item.t.toLocaleString()} {item.u} ({itemPercent}%)
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ borderBottom: `1px solid ${GOLD}35`, color: NAVY, fontSize: 13, fontWeight: 500, marginBottom: 10, paddingBottom: 4 }}>
        Block-level area coverage — enter achieved hectares
      </div>
      {DIS.map((district) => {
        const districtTargetArea = district.blk.reduce((sum, block) => sum + block.ha, 0);

        return (
          <div key={district.id} style={{ marginBottom: 16 }}>
            <div style={{ alignItems: "center", borderBottom: `1px solid ${GOLD}35`, display: "flex", gap: 8, marginBottom: 8, paddingBottom: 4 }}>
              <Badge>{district.name}</Badge>
              <span style={{ color: textTertiary, fontSize: 11 }}>
                {districtTargetArea.toLocaleString()} ha · {district.blk.length} blocks
              </span>
            </div>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
              {district.blk.map((block) => {
                const value = physicalProgress[`${blockId(block.name)}_ha`] || 0;
                const blockPercent = percentage(value, block.ha);

                return (
                  <div key={block.name} style={{ border: `0.5px solid ${borderTertiary}`, borderRadius: 8, padding: "0.65rem 0.75rem" }}>
                    <div style={{ color: textPrimary, fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{block.name}</div>
                    <div style={{ color: textTertiary, fontSize: 10, marginBottom: 6 }}>
                      Target: {block.ha} ha · {block.v} villages
                    </div>
                    <div style={{ marginBottom: 5 }}>
                      <NumberInput max={block.ha} value={value} onChange={(inputValue) => onBlockChange(block.name, inputValue)} />
                    </div>
                    <ProgressBar percent={blockPercent} />
                    <div style={{ color: textTertiary, fontSize: 10, marginTop: 1 }}>
                      {value} / {block.ha} ha ({blockPercent}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}

function FinancialProgressTab({ financialProgress, sourceGroups, totalFinancial, onFinancialChange }) {
  const overallPercent = percentage(totalFinancial, TOTAL_BUDGET_CRORE);

  return (
    <>
      <div style={{ background: backgroundSecondary, borderRadius: 8, marginBottom: "1rem", padding: "0.875rem 1rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ color: textPrimary, fontWeight: 500 }}>Overall Phase 1 Budget Utilisation</span>
          <span style={{ color: textPrimary, fontWeight: 500 }}>
            ₹{formatCrore(totalFinancial)} cr of ₹{TOTAL_BUDGET_CRORE} cr
          </span>
        </div>
        <ProgressBar color={NAVY} height={7} percent={overallPercent} />
        <div style={{ color: textTertiary, fontSize: 11, marginTop: 4 }}>
          {overallPercent}% utilised | ₹{(TOTAL_BUDGET_CRORE - totalFinancial).toFixed(3)} cr remaining
        </div>
      </div>

      <div style={{ color: textSecondary, fontSize: 12, marginBottom: 12 }}>
        Enter actual expenditure in ₹ crore against each sanctioned component. Data saves automatically.
      </div>

      {sourceGroups.map(({ source, rows, budget, spent }) => (
        <div key={source} style={{ marginBottom: 16 }}>
          <div
            style={{
              alignItems: "center",
              borderBottom: `1px solid ${GOLD}35`,
              display: "flex",
              flexWrap: "wrap",
              gap: 8,
              justifyContent: "space-between",
              marginBottom: 8,
              paddingBottom: 4,
            }}
          >
            <Badge>{source}</Badge>
            <span style={{ color: textSecondary, fontSize: 11 }}>
              Budget: ₹{formatCrore(budget)} cr | Spent: ₹{formatCrore(spent)} cr ({percentage(spent, budget)}%)
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", minWidth: 720, width: "100%" }}>
              <thead>
                <tr style={{ borderBottom: `0.5px solid ${borderSecondary}` }}>
                  <th style={{ color: textSecondary, fontSize: 11, fontWeight: 500, padding: "5px 8px", textAlign: "left" }}>Scheme component</th>
                  <th style={{ color: textSecondary, fontSize: 11, fontWeight: 500, padding: "5px 8px", textAlign: "right", whiteSpace: "nowrap" }}>Sanctioned (₹ cr)</th>
                  <th style={{ color: textSecondary, fontSize: 11, fontWeight: 500, padding: "5px 8px", textAlign: "right" }}>Spent (₹ cr)</th>
                  <th style={{ color: textSecondary, fontSize: 11, fontWeight: 500, padding: "5px 8px" }}>%</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((scheme) => {
                  const value = financialProgress[scheme.id] || 0;
                  const schemePercent = percentage(value, scheme.b);

                  return (
                    <tr key={scheme.id} style={{ borderBottom: `0.5px solid ${borderTertiary}` }}>
                      <td style={{ color: textPrimary, fontSize: 12, padding: "7px 8px" }}>{scheme.nm}</td>
                      <td style={{ color: textSecondary, fontSize: 12, padding: "7px 8px", textAlign: "right", whiteSpace: "nowrap" }}>₹{formatCrore(scheme.b)}</td>
                      <td style={{ padding: "7px 8px", width: 110 }}>
                        <NumberInput
                          alignRight
                          max={scheme.b}
                          placeholder="0.000"
                          step="0.001"
                          value={value}
                          onChange={(inputValue) => onFinancialChange(scheme.id, inputValue)}
                        />
                      </td>
                      <td style={{ padding: "7px 8px", width: 80 }}>
                        <ProgressBar percent={schemePercent} />
                        <div style={{ color: textTertiary, fontSize: 10, marginTop: 1, textAlign: "right" }}>{schemePercent}%</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </>
  );
}

function PhaseOneProgressTracker() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [expandedDistrictId, setExpandedDistrictId] = useState(null);
  const [physicalProgress, setPhysicalProgress] = useStoredProgress(PHYSICAL_STORAGE_KEY);
  const [financialProgress, setFinancialProgress] = useStoredProgress(FINANCIAL_STORAGE_KEY);

  // Existing auth normalizes district_officer to district; both represent District Officer access.
  const isDistrictOfficer = user?.role === "district_officer" || user?.role === "district";

  const totalArea = useMemo(
    () => ALL_BLOCKS.reduce((sum, block) => sum + (physicalProgress[`${blockId(block.name)}_ha`] || 0), 0),
    [physicalProgress],
  );

  const totalFinancial = useMemo(
    () => SCH.reduce((sum, scheme) => sum + (financialProgress[scheme.id] || 0), 0),
    [financialProgress],
  );

  const sourceGroups = useMemo(() => {
    const sources = [...new Set(SCH.map((scheme) => scheme.src))];
    return sources.map((source) => {
      const rows = SCH.filter((scheme) => scheme.src === source);
      return {
        source,
        rows,
        budget: rows.reduce((sum, scheme) => sum + scheme.b, 0),
        spent: rows.reduce((sum, scheme) => sum + (financialProgress[scheme.id] || 0), 0),
      };
    });
  }, [financialProgress]);

  const handleBlockChange = (blockName, value) => {
    setPhysicalProgress((currentProgress) => ({
      ...currentProgress,
      [`${blockId(blockName)}_ha`]: cleanNumber(value),
    }));
  };

  const handleStatePhysicalChange = (key, value) => {
    setPhysicalProgress((currentProgress) => ({
      ...currentProgress,
      [`s_${key}`]: cleanNumber(value),
    }));
  };

  const handleFinancialChange = (schemeId, value) => {
    setFinancialProgress((currentProgress) => ({
      ...currentProgress,
      [schemeId]: cleanNumber(value),
    }));
  };

  if (!isDistrictOfficer) {
    return null;
  }

  return (
    <section style={{ color: textPrimary, fontFamily: "inherit", fontSize: 14, padding: "1rem 0" }}>
      <h2 className="sr-only">
        Uttarakhand State Millet Policy Phase 1 progress tracker — 7 districts, 24 blocks, physical and financial monitoring against approved budget
      </h2>

      <div style={{ borderBottom: `2.5px solid ${NAVY}`, marginBottom: "1rem", paddingBottom: "0.75rem" }}>
        <div style={{ color: GOLD, fontSize: 10, fontWeight: 500, letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" }}>
          IIMR Nutrihub · Uttarakhand Millet Policy PMU
        </div>
        <div style={{ color: textPrimary, fontSize: 17, fontWeight: 500 }}>
          Phase 1 Progress Tracker — 7 Districts · 24 Blocks
        </div>
        <div style={{ color: textSecondary, fontSize: 12, marginTop: 2 }}>
          Area target: 30,000 ha | Budget: ₹60.469 crore | Implementation: 3 years
        </div>
      </div>

      <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit,minmax(135px,1fr))", marginBottom: "1.25rem" }}>
        <KpiCard
          label="Area covered"
          value={`${totalArea.toLocaleString()} ha`}
          subLabel={`${percentage(totalArea, TOTAL_AREA_HECTARES)}% of 30,000 ha`}
        />
        <KpiCard
          label="Budget utilised"
          value={`₹${formatCrore(totalFinancial)} cr`}
          subLabel={`${percentage(totalFinancial, TOTAL_BUDGET_CRORE)}% of ₹60.469 cr`}
        />
        <KpiCard label="Districts covered" value="7" subLabel="Phase 1 selected" />
        <KpiCard label="Blocks covered" value="24" subLabel="Phase 1 selected" />
      </div>

      <div style={{ borderBottom: `0.5px solid ${borderTertiary}`, display: "flex", gap: 0, marginBottom: "1rem", overflowX: "auto" }}>
        {tabs.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              style={{
                background: "transparent",
                border: 0,
                borderBottom: isActive ? `2px solid ${GOLD}` : "2px solid transparent",
                color: isActive ? textPrimary : textSecondary,
                cursor: "pointer",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                marginBottom: -1,
                padding: "7px 14px",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ minHeight: 200 }}>
        {activeTab === "overview" ? (
          <OverviewTab
            expandedDistrictId={expandedDistrictId}
            physicalProgress={physicalProgress}
            onToggleDistrict={(districtId) => setExpandedDistrictId((currentId) => (currentId === districtId ? null : districtId))}
          />
        ) : null}
        {activeTab === "physical" ? (
          <PhysicalProgressTab
            physicalProgress={physicalProgress}
            onBlockChange={handleBlockChange}
            onStatePhysicalChange={handleStatePhysicalChange}
          />
        ) : null}
        {activeTab === "financial" ? (
          <FinancialProgressTab
            financialProgress={financialProgress}
            sourceGroups={sourceGroups}
            totalFinancial={totalFinancial}
            onFinancialChange={handleFinancialChange}
          />
        ) : null}
      </div>

      <div style={{ borderTop: `0.5px solid ${borderTertiary}`, color: textTertiary, fontSize: 11, marginTop: "1.5rem", paddingTop: "0.75rem" }}>
        Uttarakhand State Millet Policy · Phase 1 · IIMR Nutrihub PMU · All entered data persists across sessions
      </div>
    </section>
  );
}

export default PhaseOneProgressTracker;
