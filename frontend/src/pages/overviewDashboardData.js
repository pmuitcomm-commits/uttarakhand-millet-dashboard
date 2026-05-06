/**
 * Overview dashboard data helpers.
 *
 * This file intentionally contains no page-local MIS datasets. Overview widgets
 * should use backend-provided records; sections without endpoints render empty
 * states until live data is available.
 */

export const milletDemonstrationProgress = [];
export const ragiProcurementProgress = [];
export const chcCmscProgress = [];
export const enterpriseYears = [];
export const enterpriseTypes = [];
export const enterpriseProgress = [];
export const enterpriseDetails = [];
export const districtCoverage = [];

const ALL_SEASONS_LABEL = "All Seasons";

/**
 * Convert numeric production years to financial-year display format.
 *
 * @param {string|number|null} value - Source year value from API data.
 * @returns {string} Financial year string such as "2025-26".
 */
function normalizeRecordFinancialYear(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (text.includes("-")) return text;

  const numericYear = Number(text);
  if (!Number.isFinite(numericYear)) return text;
  return `${numericYear}-${String((numericYear + 1) % 100).padStart(2, "0")}`;
}

/**
 * Translate numeric season identifiers into dashboard filter labels.
 *
 * @param {number|string} seasonId - Season identifier from production data.
 * @returns {string} Season display name.
 */
function getSeasonName(seasonId) {
  const seasonMap = {
    1: "Kharif",
    2: "Rabi",
  };

  return seasonMap[Number(seasonId)] || "";
}

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

export function getOverviewFinancialYears(productionRows) {
  return uniqueSorted((productionRows || []).map((record) => normalizeRecordFinancialYear(record.year)));
}

export function getOverviewSeasons(productionRows) {
  const seasons = uniqueSorted((productionRows || []).map((record) => getSeasonName(record.season_id)));
  return seasons.length ? [ALL_SEASONS_LABEL, ...seasons] : [];
}

/**
 * Build district-wise crop demonstration rows from live production records.
 *
 * @param {Array<Object>} productionRows - Production records from the API.
 * @param {string} financialYear - Selected financial year.
 * @param {string} season - Selected season.
 * @returns {Array<Object>} District-level demonstration rows.
 */
export function getCropDemonstrationRows(productionRows, financialYear, season) {
  const matchingProductionRows = (productionRows || []).filter((record) => {
    const recordFinancialYear = normalizeRecordFinancialYear(record.year);
    const recordSeason = getSeasonName(record.season_id);
    const matchesYear = !financialYear || recordFinancialYear === financialYear;
    const matchesSeason = !season || season === ALL_SEASONS_LABEL || recordSeason === season;

    return matchesYear && matchesSeason && record.district;
  });

  const rowsByDistrict = matchingProductionRows.reduce((districts, record) => {
    const district = record.district;
    const current = districts[district] || {
      district,
      financialYear,
      season,
      areaAchievement: 0,
      farmers: 0,
    };

    return {
      ...districts,
      [district]: {
        ...current,
        areaAchievement: current.areaAchievement + Number(record.area_hectare || 0),
        farmers:
          current.farmers +
          Number(record.farmers || record.farmers_count || record.total_farmers || 0),
      },
    };
  }, {});

  return Object.values(rowsByDistrict)
    .map((row) => ({
      ...row,
      areaAchievement: Math.round(row.areaAchievement),
    }))
    .sort((left, right) => left.district.localeCompare(right.district));
}
