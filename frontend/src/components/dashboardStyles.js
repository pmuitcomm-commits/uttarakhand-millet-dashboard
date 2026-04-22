export const dashboardClasses = {
  pageWrapper:
    "flex h-full min-h-0 w-full flex-col overflow-hidden bg-white p-4 text-[#024b37] max-[1024px]:p-3 max-[640px]:p-0 dark:bg-[#1a1a1a] dark:text-white",
  dashboardContainer:
    "flex min-h-0 flex-1 gap-4 overflow-hidden bg-white text-[#024b37] max-[900px]:flex-col max-[900px]:gap-3 dark:bg-[#1a1a1a] dark:text-white",
  mainContent:
    "flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-y-auto bg-white p-0 max-[900px]:p-3 max-[640px]:p-2 dark:bg-[#1a1a1a] dark:text-white",
  pageHeadingRow: "mb-5 p-4 text-center max-[640px]:mb-3 max-[640px]:p-3",
  pageHeadingTitle: "m-0 break-words text-[1.8rem] font-bold text-black max-[640px]:text-[1.35rem] dark:text-white",
  metricsRow:
    "mb-6 grid grid-cols-[repeat(4,minmax(0,1fr))] gap-4 p-4 max-[1280px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[640px]:mb-4 max-[640px]:grid-cols-1 max-[640px]:gap-3 max-[640px]:p-2",
  metricValue:
    "mb-2.5 block min-w-0 break-words text-[2rem] font-extrabold leading-tight text-inherit transition-transform duration-300 group-hover:scale-105 max-[640px]:text-[1.55rem]",
  metricLabel: "min-w-0 break-words text-[0.95rem] font-semibold leading-snug text-inherit opacity-90 max-[640px]:text-[0.88rem]",
  chartRow:
    "mb-6 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-5 p-4 max-[1280px]:grid-cols-[repeat(2,minmax(0,1fr))] max-[760px]:grid-cols-1 max-[640px]:mb-4 max-[640px]:gap-3 max-[640px]:p-2",
  chartCard:
    "min-h-[330px] min-w-0 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-card max-[640px]:min-h-[280px] max-[640px]:rounded-xl max-[640px]:p-3 dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  tableCard:
    "mx-4 mb-4 min-w-0 overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white p-5 shadow-card max-[640px]:mx-2 max-[640px]:rounded-xl max-[640px]:p-3 dark:border-[#444444] dark:bg-[#2a2a2a] dark:text-white",
  selectorWrapper: "mt-4 max-[640px]:mt-3",
  selector:
    "min-w-[200px] cursor-pointer rounded-lg border-2 border-[#024b37] bg-white px-4 py-2.5 text-base font-medium text-[#024b37] transition-all duration-300 hover:border-[#034d3a] hover:shadow-[0_2px_8px_rgba(2,75,55,0.15)] focus:border-[#034d3a] focus:outline-none focus:ring-4 focus:ring-[#024b37]/10 max-[640px]:w-full max-[640px]:min-w-0",
  dashboardMessage: "p-5 text-center",
  dashboardNotice:
    "mb-5 rounded border border-red-200 bg-red-50 p-[15px] text-red-700",
  sidebar:
    "relative left-0 top-0 z-10 h-full w-[220px] shrink-0 overflow-y-auto border-r border-[rgba(102,185,172,0.2)] bg-[#024b37] px-[18px] py-[26px] text-white max-[900px]:h-auto max-[900px]:w-full max-[900px]:overflow-x-auto max-[900px]:overflow-y-hidden max-[900px]:border-b max-[900px]:border-r-0 max-[900px]:px-3 max-[900px]:py-3",
  sidebarLogo: "mb-[35px] text-center max-[900px]:mb-3 max-[900px]:text-left",
  sidebarLogoTitle: "m-0 text-xl font-bold text-white",
  sidebarLogoText: "mt-1.5 text-[0.87rem] text-white/75",
  sidebarNav: "flex flex-col max-[900px]:flex-row max-[900px]:gap-2",
  sidebarLink:
    "mb-2.5 block rounded-xl px-4 py-3.5 font-semibold text-white/95 no-underline transition duration-200 hover:translate-x-[3px] hover:bg-[#66b9ac] max-[900px]:mb-0 max-[900px]:shrink-0 max-[900px]:whitespace-nowrap max-[900px]:px-3 max-[900px]:py-2.5 max-[900px]:text-sm max-[900px]:hover:translate-x-0",
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
    "group min-w-0 cursor-pointer rounded-[20px] px-5 py-6 text-center shadow-card transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] max-[640px]:rounded-xl max-[640px]:px-4 max-[640px]:py-4 max-[640px]:hover:translate-y-0 max-[640px]:hover:scale-100",
    metricToneClasses[index % metricToneClasses.length],
  ].join(" ");
}

export const chartClasses = {
  wrapper:
    "relative flex h-full min-h-[280px] w-full min-w-0 flex-col [&_canvas]:max-h-[270px] [&_canvas]:max-w-full",
  title: "mb-4 mt-0 break-words text-[1.2rem] font-bold text-[#024b37] max-[640px]:mb-3 max-[640px]:text-base dark:text-white",
};
