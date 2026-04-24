import { uttarakhandDistricts } from "../data/districts";

// Page-local placeholder MIS data for the overview dashboard.
// Replace these exports with API-shaped data when dedicated endpoints are available.
export const overviewFinancialYears = [
  "2025-26",
  "2024-25",
  "2023-24",
  "2022-23",
  "2021-22",
  "2020-21",
  "2019-20",
  "2018-19",
  "2017-18",
];

export const overviewSeasons = ["All Seasons", "Kharif", "Rabi"];

const cropBaseByDistrict = {
  Almora: { area: 1280, farmers: 1780, kharifShare: 0.68 },
  Bageshwar: { area: 560, farmers: 790, kharifShare: 0.72 },
  Chamoli: { area: 1030, farmers: 1420, kharifShare: 0.66 },
  Champawat: { area: 430, farmers: 620, kharifShare: 0.7 },
  Dehradun: { area: 320, farmers: 510, kharifShare: 0.62 },
  Haridwar: { area: 210, farmers: 390, kharifShare: 0.58 },
  Nainital: { area: 610, farmers: 880, kharifShare: 0.64 },
  "Pauri Garhwal": { area: 1180, farmers: 1690, kharifShare: 0.67 },
  Pithoragarh: { area: 720, farmers: 1110, kharifShare: 0.71 },
  Rudraprayag: { area: 640, farmers: 910, kharifShare: 0.69 },
  "Tehri Garhwal": { area: 990, farmers: 1470, kharifShare: 0.65 },
  "Udham Singh Nagar": { area: 260, farmers: 430, kharifShare: 0.55 },
  Uttarkashi: { area: 760, farmers: 1090, kharifShare: 0.73 },
};

const financialYearMultipliers = {
  "2025-26": 1,
  "2024-25": 0.92,
  "2023-24": 0.84,
  "2022-23": 0.76,
  "2021-22": 0.68,
  "2020-21": 0.59,
  "2019-20": 0.53,
  "2018-19": 0.45,
  "2017-18": 0.38,
};

function seasonFactor(base, season) {
  if (season === "Kharif") return base.kharifShare;
  if (season === "Rabi") return 1 - base.kharifShare;
  return 1;
}

export const cropDemonstrationOverview = overviewFinancialYears.flatMap((financialYear) =>
  overviewSeasons.flatMap((season) => {
    const yearFactor = financialYearMultipliers[financialYear] || 1;

    return uttarakhandDistricts.map((district, index) => {
      const base = cropBaseByDistrict[district];
      const seasonalFactor = seasonFactor(base, season);
      const areaAchievement = Math.round(base.area * yearFactor * seasonalFactor);
      const farmers = Math.round(base.farmers * yearFactor * seasonalFactor * (0.98 + (index % 4) * 0.025));

      return {
        district,
        financialYear,
        season,
        areaAchievement,
        farmers,
      };
    });
  })
);

export const milletDemonstrationProgress = [
  { year: "2017-18", farmers: 3650, areaDemonstration: 2200 },
  { year: "2018-19", farmers: 4280, areaDemonstration: 2640 },
  { year: "2019-20", farmers: 5120, areaDemonstration: 3180 },
  { year: "2020-21", farmers: 5860, areaDemonstration: 3760 },
  { year: "2021-22", farmers: 6940, areaDemonstration: 4520 },
  { year: "2022-23", farmers: 8120, areaDemonstration: 5480 },
  { year: "2023-24", farmers: 9780, areaDemonstration: 6820 },
  { year: "2024-25", farmers: 11840, areaDemonstration: 8350 },
];

export const ragiProcurementProgress = [
  { year: "2017-18", quantityProcured: 920, farmersCovered: 870 },
  { year: "2018-19", quantityProcured: 1180, farmersCovered: 1030 },
  { year: "2019-20", quantityProcured: 1510, farmersCovered: 1320 },
  { year: "2020-21", quantityProcured: 1360, farmersCovered: 1260 },
  { year: "2021-22", quantityProcured: 2140, farmersCovered: 1780 },
  { year: "2022-23", quantityProcured: 2460, farmersCovered: 2110 },
  { year: "2023-24", quantityProcured: 3180, farmersCovered: 2830 },
  { year: "2024-25", quantityProcured: 2890, farmersCovered: 2660 },
];

export const chcCmscProgress = [
  { district: "Almora", programmeBlocks: 6, chcCount: 4, cmscCount: 3 },
  { district: "Bageshwar", programmeBlocks: 1, chcCount: 1, cmscCount: 1 },
  { district: "Chamoli", programmeBlocks: 4, chcCount: 3, cmscCount: 2 },
  { district: "Champawat", programmeBlocks: 0, chcCount: 0, cmscCount: 0 },
  { district: "Dehradun", programmeBlocks: 0, chcCount: 0, cmscCount: 0 },
  { district: "Haridwar", programmeBlocks: 0, chcCount: 0, cmscCount: 0 },
  { district: "Nainital", programmeBlocks: 0, chcCount: 1, cmscCount: 0 },
  { district: "Pauri Garhwal", programmeBlocks: 4, chcCount: 3, cmscCount: 3 },
  { district: "Pithoragarh", programmeBlocks: 0, chcCount: 1, cmscCount: 0 },
  { district: "Rudraprayag", programmeBlocks: 3, chcCount: 2, cmscCount: 2 },
  { district: "Tehri Garhwal", programmeBlocks: 4, chcCount: 3, cmscCount: 2 },
  { district: "Udham Singh Nagar", programmeBlocks: 0, chcCount: 0, cmscCount: 0 },
  { district: "Uttarkashi", programmeBlocks: 2, chcCount: 2, cmscCount: 1 },
];

export const enterpriseYears = ["2025-26", "2024-25", "2023-24", "2022-23"];

export const enterpriseTypes = [
  "Primary Processing",
  "Value Added Foods",
  "Millet Bakery",
  "Ready-to-Cook Mix",
  "Seed Production",
  "Retail Outlet",
];

const enterpriseBase = {
  "Primary Processing": { wshg: 36, fpo: 12 },
  "Value Added Foods": { wshg: 42, fpo: 9 },
  "Millet Bakery": { wshg: 18, fpo: 5 },
  "Ready-to-Cook Mix": { wshg: 24, fpo: 7 },
  "Seed Production": { wshg: 14, fpo: 11 },
  "Retail Outlet": { wshg: 28, fpo: 8 },
};

export const enterpriseProgress = enterpriseYears.flatMap((year, yearIndex) =>
  uttarakhandDistricts.flatMap((district, districtIndex) =>
    enterpriseTypes.map((enterpriseType, typeIndex) => {
      const base = enterpriseBase[enterpriseType];
      const yearFactor = 1 - yearIndex * 0.12;
      const districtFactor = 0.42 + ((districtIndex % 5) + 1) * 0.08;
      const typeFactor = 0.9 + (typeIndex % 3) * 0.06;

      return {
        year,
        district,
        enterpriseType,
        wshg: Math.max(0, Math.round(base.wshg * yearFactor * districtFactor * typeFactor)),
        fpo: Math.max(0, Math.round(base.fpo * yearFactor * districtFactor * (0.95 + typeIndex * 0.025))),
      };
    })
  )
);

export const enterpriseDetails = [
  { unitName: "Mandua Processing Unit - Almora Cluster", district: "Almora", year: "2025-26", wshgCount: 14, fpoCount: 3 },
  { unitName: "Jhangora Value Addition Centre - Bageshwar", district: "Bageshwar", year: "2025-26", wshgCount: 8, fpoCount: 2 },
  { unitName: "Hill Millet Bakery - Chamoli", district: "Chamoli", year: "2025-26", wshgCount: 11, fpoCount: 2 },
  { unitName: "Ready Mix Enterprise - Pauri Garhwal", district: "Pauri Garhwal", year: "2025-26", wshgCount: 16, fpoCount: 4 },
  { unitName: "Millet Seed Production Unit - Rudraprayag", district: "Rudraprayag", year: "2025-26", wshgCount: 7, fpoCount: 3 },
  { unitName: "Shree Anna Retail Outlet - Tehri Garhwal", district: "Tehri Garhwal", year: "2025-26", wshgCount: 13, fpoCount: 3 },
  { unitName: "Traditional Grain Cleaning Unit - Uttarkashi", district: "Uttarkashi", year: "2025-26", wshgCount: 10, fpoCount: 2 },
  { unitName: "Millet Snack Enterprise - Nainital", district: "Nainital", year: "2025-26", wshgCount: 9, fpoCount: 2 },
  { unitName: "Primary Processing Unit - Pithoragarh", district: "Pithoragarh", year: "2025-26", wshgCount: 8, fpoCount: 3 },
  { unitName: "Mandua Flour Unit - Champawat", district: "Champawat", year: "2024-25", wshgCount: 6, fpoCount: 1 },
  { unitName: "Urban Millet Outlet - Dehradun", district: "Dehradun", year: "2024-25", wshgCount: 5, fpoCount: 2 },
  { unitName: "Farmer Producer Retail Unit - Haridwar", district: "Haridwar", year: "2024-25", wshgCount: 4, fpoCount: 2 },
  { unitName: "FPO Processing Hub - Udham Singh Nagar", district: "Udham Singh Nagar", year: "2024-25", wshgCount: 4, fpoCount: 3 },
];

export const districtCoverage = [
  { district: "Almora", totalBlocks: 11, gps: 590, villages: 2184, totalFarmers: 1780 },
  { district: "Bageshwar", totalBlocks: 3, gps: 240, villages: 902, totalFarmers: 790 },
  { district: "Chamoli", totalBlocks: 9, gps: 610, villages: 1270, totalFarmers: 1420 },
  { district: "Champawat", totalBlocks: 4, gps: 313, villages: 691, totalFarmers: 620 },
  { district: "Dehradun", totalBlocks: 6, gps: 401, villages: 764, totalFarmers: 510 },
  { district: "Haridwar", totalBlocks: 6, gps: 316, villages: 612, totalFarmers: 390 },
  { district: "Nainital", totalBlocks: 8, gps: 511, villages: 1141, totalFarmers: 880 },
  { district: "Pauri Garhwal", totalBlocks: 15, gps: 1180, villages: 3464, totalFarmers: 1690 },
  { district: "Pithoragarh", totalBlocks: 8, gps: 686, villages: 1652, totalFarmers: 1110 },
  { district: "Rudraprayag", totalBlocks: 3, gps: 336, villages: 688, totalFarmers: 910 },
  { district: "Tehri Garhwal", totalBlocks: 9, gps: 1035, villages: 1872, totalFarmers: 1470 },
  { district: "Udham Singh Nagar", totalBlocks: 7, gps: 397, villages: 655, totalFarmers: 430 },
  { district: "Uttarkashi", totalBlocks: 6, gps: 565, villages: 898, totalFarmers: 1090 },
];

function normalizeRecordFinancialYear(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (text.includes("-")) return text;

  const numericYear = Number(text);
  if (!Number.isFinite(numericYear)) return text;
  return `${numericYear}-${String((numericYear + 1) % 100).padStart(2, "0")}`;
}

function getSeasonName(seasonId) {
  const seasonMap = {
    1: "Kharif",
    2: "Rabi",
  };

  return seasonMap[Number(seasonId)] || "All Seasons";
}

export function getCropDemonstrationRows(productionRows, financialYear, season) {
  const fallbackRows = cropDemonstrationOverview.filter(
    (row) => row.financialYear === financialYear && row.season === season
  );

  const matchingProductionRows = (productionRows || []).filter((record) => {
    const recordFinancialYear = normalizeRecordFinancialYear(record.year);
    const recordSeason = getSeasonName(record.season_id);
    const matchesYear = recordFinancialYear === financialYear;
    const matchesSeason = season === "All Seasons" || recordSeason === season;

    return matchesYear && matchesSeason && record.district;
  });

  if (!matchingProductionRows.length) {
    return fallbackRows;
  }

  const productionByDistrict = matchingProductionRows.reduce((districts, record) => {
    const current = districts[record.district] || 0;
    return {
      ...districts,
      [record.district]: current + Number(record.area_hectare || 0),
    };
  }, {});

  const fallbackFarmersByDistrict = fallbackRows.reduce(
    (districts, row) => ({
      ...districts,
      [row.district]: row.farmers,
    }),
    {}
  );

  return uttarakhandDistricts.map((district) => ({
    district,
    financialYear,
    season,
    areaAchievement: Math.round(productionByDistrict[district] || 0),
    farmers: fallbackFarmersByDistrict[district] || 0,
  }));
}

