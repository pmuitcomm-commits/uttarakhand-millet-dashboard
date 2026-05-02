export const monitoringSections = [
  {
    tableName: "millet_cultivation_inputs",
    title: "Inputs for Millet Cultivation",
  },
  {
    tableName: "sowing_incentives",
    title: "Incentive for Sowing",
  },
  {
    tableName: "bukhari_storage",
    title: "Bukhari (Storage Structure)",
  },
  {
    tableName: "millet_transportation_expenditure",
    title: "Transportation Expenditure for Millet Intake",
  },
  {
    tableName: "millet_intake_shg_incentives",
    title: "Incentive for Millet Intake for SHGs",
  },
  {
    tableName: "block_level_awards",
    title: "Awards for Excellent Work at Block Level",
  },
  {
    tableName: "pmu_capacity_building",
    title: "PMU Establishment and Capacity Development Work",
  },
  {
    tableName: "administrative_expenses",
    title: "Administrative Expenses",
  },
];

export const monitoringSectionsByTableName = monitoringSections.reduce(
  (sectionsByTableName, section) => ({
    ...sectionsByTableName,
    [section.tableName]: section,
  }),
  {},
);

export const isAllowedMonitoringTable = (tableName) =>
  Object.prototype.hasOwnProperty.call(monitoringSectionsByTableName, tableName);
