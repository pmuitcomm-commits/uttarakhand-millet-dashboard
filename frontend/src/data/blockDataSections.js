export const blockDataSections = [
  {
    slug: "input-millet-cultivation",
    title: "Input for Millet Cultivation (Bio-fertilizer / Bio-pesticide / Zinc / Micronutrients)",
  },
  {
    slug: "maize-sowing-promotion",
    title: "Promotion of Improved Sowing Methods for Maize (10% Increase)",
  },
  {
    slug: "sowing-seed-2-quintals",
    title: "Sowing (Seed @ 2 Quintals)",
  },
  {
    slug: "millet-processing-unit-expenditure",
    title: "Millet Processing Unit Expenditure",
  },
  {
    slug: "grant-75-per-quintal",
    title: "Grant @ ₹75.00 per Quintal",
  },
  {
    slug: "assistance-processing-units",
    title: "Assistance for Establishment of Processing Units",
  },
  {
    slug: "development-work-block-cluster",
    title: "Development Work at Block/Cluster Level",
  },
  {
    slug: "training-capacity-building",
    title: "Training and Capacity-Building Programs",
  },
  {
    slug: "administrative-expenses",
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
