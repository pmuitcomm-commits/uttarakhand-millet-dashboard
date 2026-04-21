export const dashboardClasses = {
  pageWrapper:
    "flex h-full min-h-0 w-full flex-col overflow-hidden bg-white p-4 text-[#024b37] dark:bg-[#1a1a1a] dark:text-white",
  dashboardContainer:
    "flex min-h-0 flex-1 gap-4 overflow-hidden bg-white text-[#024b37] max-[860px]:flex-col dark:bg-[#1a1a1a] dark:text-white",
  mainContent:
    "flex min-h-0 w-full flex-1 flex-col overflow-y-auto bg-white p-0 max-[860px]:p-4 dark:bg-[#1a1a1a] dark:text-white",
  pageHeadingRow: "mb-6 p-[18px] text-center",
  pageHeadingTitle: "m-0 text-[1.8rem] font-bold text-black dark:text-white",
  metricsRow:
    "mb-[26px] grid grid-cols-[repeat(4,minmax(200px,1fr))] gap-[18px] p-[18px] max-[1200px]:grid-cols-[repeat(2,minmax(220px,1fr))] max-[900px]:grid-cols-1",
  metricValue:
    "mb-2.5 block text-[2rem] font-extrabold text-inherit transition-transform duration-300 group-hover:scale-110",
  metricLabel: "text-[0.95rem] font-semibold text-inherit opacity-90",
  chartRow:
    "mb-[26px] grid grid-cols-[repeat(3,minmax(280px,1fr))] gap-5 p-[18px] max-[1200px]:grid-cols-[repeat(2,minmax(220px,1fr))] max-[900px]:grid-cols-1",
  chartCard:
    "rounded-[24px] border border-[#e2e8f0] bg-white p-[22px] shadow-card dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  tableCard:
    "mx-[18px] mb-[18px] rounded-[24px] border border-[#e2e8f0] bg-white p-6 shadow-card dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  selectorWrapper: "mt-4",
  selector:
    "min-w-[200px] cursor-pointer rounded-lg border-2 border-[#024b37] bg-white px-4 py-2.5 text-base font-medium text-[#024b37] transition-all duration-300 hover:border-[#034d3a] hover:shadow-[0_2px_8px_rgba(2,75,55,0.15)] focus:border-[#034d3a] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10",
  dashboardMessage: "p-5 text-center",
  dashboardNotice:
    "mb-5 rounded border border-red-200 bg-red-50 p-[15px] text-red-700",
  sidebar:
    "relative left-0 top-0 z-10 h-full w-[220px] shrink-0 overflow-y-auto border-r border-[rgba(102,185,172,0.2)] bg-[#024b37] px-[18px] py-[26px] text-white max-[860px]:h-auto max-[860px]:w-full",
  sidebarLogo: "mb-[35px] text-center",
  sidebarLogoTitle: "m-0 text-xl font-bold text-white",
  sidebarLogoText: "mt-1.5 text-[0.87rem] text-white/75",
  sidebarNav: "flex flex-col",
  sidebarLink:
    "mb-2.5 block rounded-xl px-4 py-3.5 font-semibold text-white/95 no-underline transition duration-200 hover:translate-x-[3px] hover:bg-[#66b9ac]",
};

const metricToneClasses = [
  "border-0 bg-[#024b37] text-white",
  "border-0 bg-[#003366] text-white",
  "border-0 bg-[#66b9ac] text-white",
  "border-0 bg-[#fedd56] text-[#024b37]",
  "border-0 bg-[#831843] text-white",
  "border-0 bg-[#c12f2f] text-white",
  "border border-[#e0e0e0] bg-white text-[#024b37] dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  "border-0 bg-[#e67e22] text-white",
];

export function metricCardClassName(index) {
  return [
    "group cursor-pointer rounded-[24px] px-[22px] py-6 text-center shadow-card transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)]",
    metricToneClasses[index % metricToneClasses.length],
  ].join(" ");
}

export const chartClasses = {
  wrapper:
    "relative flex h-full w-full flex-col [&_canvas]:max-h-[300px] [&_canvas]:max-w-full",
  title: "mb-4 mt-0 text-[1.2rem] font-bold text-[#024b37] dark:text-white",
};
