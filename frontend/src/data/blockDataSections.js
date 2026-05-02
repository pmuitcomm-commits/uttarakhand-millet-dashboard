export const blockDataSections = [
  {
    slug: "inputs-millet-cultivation",
    tableName: "millet_cultivation_inputs",
    title: "Inputs for Millet Cultivation: (Bio-fertilizer / Bio-pesticide / Zinc / Micronutrients - 1600.00 / hectare)",
  },
  {
    slug: "incentive-sowing",
    tableName: "sowing_incentives",
    title: "Incentive for Sowing: (10 percent increase for other sowing methods)",
  },
  {
    slug: "bukhari-storage-structure",
    tableName: "bukhari_storage",
    title: "Bukhari (Storage Structure): (Capacity 2 quintals) / Rs. 300.00",
  },
  {
    slug: "transportation-millet-intake",
    tableName: "millet_transportation_expenditure",
    title: "Transportation Expenditure for Millet Intake: (Calculated based on 10 quintals / hectare yield and divided by 2) = 1.50 lakh quintal production / Rs. 75.00 / quintal",
  },
  {
    slug: "incentive-millet-intake-shg",
    tableName: "millet_intake_shg_incentives",
    title: "Incentive for Millet Intake for SHGs (Self-Help Groups) etc.: Rs. 300.00 / quintal (150,000 quintals)",
  },
  {
    slug: "awards-excellent-work-block",
    tableName: "block_level_awards",
    title: "Awards for Excellent Work at Block Level: Rs. 10,000.00 / block to 02 farmers / groups",
  },
  {
    slug: "pmu-establishment-capacity",
    tableName: "pmu_capacity_building",
    title: "PMU (Project Management Unit) Establishment and Capacity Development Work:",
  },
  {
    slug: "administrative-expenses",
    tableName: "administrative_expenses",
    title: "Administrative Expenses",
  },
];

export const blockDataSectionsBySlug = blockDataSections.reduce(
  (sectionsBySlug, section) => ({
    ...sectionsBySlug,
    [section.slug]: section,
  }),
  {},
);

export const defaultBlockDataSectionSlug = blockDataSections[0].slug;

export const legacyBlockDataSectionSlugRedirects = {
  "input-millet-cultivation": "inputs-millet-cultivation",
  "maize-sowing-promotion": "incentive-sowing",
  "sowing-seed-2-quintals": "bukhari-storage-structure",
  "millet-processing-unit-expenditure": "transportation-millet-intake",
  "grant-75-per-quintal": "incentive-millet-intake-shg",
  "assistance-processing-units": "awards-excellent-work-block",
  "development-work-block-cluster": "pmu-establishment-capacity",
  "training-capacity-building": "administrative-expenses",
};

export const getBlockDataSectionRedirectSlug = (slug) =>
  blockDataSectionsBySlug[slug] ? slug : legacyBlockDataSectionSlugRedirects[slug] || "";
