/**
 * District reference data for Uttarakhand Millet MIS dashboards.
 *
 * The exported district order is reused by filters, map legends, and fallback
 * data generation so district labels remain consistent across pages.
 */

export const uttarakhandDistricts = [
  "Almora",
  "Bageshwar",
  "Chamoli",
  "Champawat",
  "Dehradun",
  "Haridwar",
  "Nainital",
  "Pauri Garhwal",
  "Pithoragarh",
  "Rudraprayag",
  "Tehri Garhwal",
  "Udham Singh Nagar",
  "Uttarkashi",
];

export const districtNameById = uttarakhandDistricts.reduce(
  (districtsById, district, index) => ({
    ...districtsById,
    [index + 1]: district,
  }),
  {},
);

/**
 * Resolve a display district name from a production/procurement record.
 *
 * @param {Object|null} record - API or local data record.
 * @returns {string} District display name or an empty string.
 */
export function getDistrictName(record) {
  if (!record) {
    return "";
  }

  return record.district || districtNameById[record.district_id] || "";
}
