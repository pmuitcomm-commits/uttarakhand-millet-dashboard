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

export function getDistrictName(record) {
  if (!record) {
    return "";
  }

  return record.district || districtNameById[record.district_id] || "";
}
