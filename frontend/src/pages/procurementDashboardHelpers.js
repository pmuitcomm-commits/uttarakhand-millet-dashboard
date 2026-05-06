const REGION_BY_DISTRICT = {
  Almora: "Kumaon",
  Bageshwar: "Kumaon",
  Champawat: "Kumaon",
  Nainital: "Kumaon",
  Pithoragarh: "Kumaon",
  "Udham Singh Nagar": "Kumaon",
  Chamoli: "Garhwal",
  Dehradun: "Garhwal",
  Haridwar: "Garhwal",
  "Pauri Garhwal": "Garhwal",
  Rudraprayag: "Garhwal",
  "Tehri Garhwal": "Garhwal",
  Uttarkashi: "Garhwal",
};

const DISTRICT_ALIASES = {
  pauri: "Pauri Garhwal",
  "pauri garhwal": "Pauri Garhwal",
  tehri: "Tehri Garhwal",
  "tehri garhwal": "Tehri Garhwal",
  usnagar: "Udham Singh Nagar",
  "u s nagar": "Udham Singh Nagar",
  "udham singh nagar": "Udham Singh Nagar",
};

const emptyProcurementKPIs = {
  totalDistricts: 0,
  totalCentres: 0,
  totalTarget: 0,
  totalFarmers: 0,
  totalProcurement: 0,
  avgProcurement: 0,
  pvtAgenciesProcurement: 0,
  cropCoverage: 0,
};

export function normalizeDistrictName(name = "") {
  const cleaned = String(name).trim().replace(/\s+/g, " ");
  return DISTRICT_ALIASES[cleaned.toLowerCase()] || cleaned;
}

export function normalizeProcurementRecords(records) {
  const data = Array.isArray(records) ? records : [];

  return data.map((item) => ({
    "S.no": item["S.no"] || item.s_no || "",
    District: normalizeDistrictName(item.District || item.district || ""),
    Crop: item.Crop || item.crop || "",
    "Nos.of Centre": item["Nos.of Centre"] || item.nos_of_centre || 0,
    "Target (in MT)": item["Target (in MT)"] || item.target_in_mt || 0,
    "No. of Farmer's /SHGs": item["No. of Farmer's /SHGs"] || item.no_of_farmers_shgs || 0,
    "Procurement quantity (in MT)":
      item["Procurement quantity (in MT)"] || item.procurement_quantity_in_mt || 0,
    "Procurement (in %)": item["Procurement (in %)"] || item.procurement_in_percent || 0,
    "Procurement by Pvt. agencies (in MT)":
      item["Procurement by Pvt. agencies (in MT)"] ||
      item.procurement_by_pvt_agencies_in_mt ||
      0,
  }));
}

export function mapProcurementKPIs(kpiData = {}) {
  return {
    totalDistricts: kpiData.total_districts || 0,
    totalCentres: kpiData.total_centres || 0,
    totalTarget: kpiData.total_target || 0,
    totalFarmers: kpiData.total_farmers || 0,
    totalProcurement: kpiData.total_procurement || 0,
    avgProcurement: kpiData.avg_procurement || 0,
    pvtAgenciesProcurement: kpiData.pvt_agencies_procurement || 0,
    cropCoverage: kpiData.crop_coverage || 0,
  };
}

export function getEmptyProcurementKPIs() {
  return { ...emptyProcurementKPIs };
}

export function buildProcurementByDistrictChart(procurementData) {
  const districtProcurement = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurement = parseFloat(item["Procurement quantity (in MT)"] || 0);
    acc[district] = (acc[district] || 0) + procurement;
    return acc;
  }, {});
  const labels = Object.keys(districtProcurement).sort();

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Procurement (MT)",
          data: labels.map((key) => districtProcurement[key]),
          backgroundColor: "#024b37",
          borderColor: "#035344",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "Procurement by District",
          color: "#024b37",
          font: { size: 16, weight: 700 },
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "District Wise Procurement",
            color: "#000000",
            font: { size: 12, weight: 700 },
          },
          ticks: {
            color: "#000000",
            font: { size: 12, weight: 600 },
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: "#000000",
            font: { size: 12, weight: 600 },
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    },
  };
}

export function buildRegionalProcurementChart(procurementData) {
  const regionProcurement = procurementData.reduce(
    (acc, item) => {
      const district = normalizeDistrictName(item.District || "Unknown");
      const region = REGION_BY_DISTRICT[district];
      const procurement = parseFloat(item["Procurement quantity (in MT)"] || 0);

      if (region) {
        acc[region] += procurement;
      }

      return acc;
    },
    { Garhwal: 0, Kumaon: 0 }
  );

  return {
    data: {
      labels: ["Garhwal", "Kumaon"],
      datasets: [
        {
          data: [
            Number(regionProcurement.Garhwal.toFixed(2)),
            Number(regionProcurement.Kumaon.toFixed(2)),
          ],
          backgroundColor: ["#19a5a5", "#a7307f"],
          borderColor: ["#ffffff", "#ffffff"],
          borderWidth: 3,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            color: "#024b37",
            boxWidth: 14,
            boxHeight: 14,
            font: { size: 12, weight: 700 },
          },
        },
        title: {
          display: true,
          text: "Garhwal vs Kumaon Procurement",
          color: "#000000",
          font: { size: 16, weight: 700 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const value = Number(context.raw || 0);
              return `${context.label}: ${value.toLocaleString("en-IN", {
                maximumFractionDigits: 2,
              })} MT`;
            },
          },
        },
      },
    },
  };
}

export function buildAchievementPercentageChart(procurementData) {
  const achievementData = procurementData.reduce((acc, item) => {
    const district = item.District || "Unknown";
    const procurementPct = parseFloat(item["Procurement (in %)"] || 0);
    if (!acc[district]) {
      acc[district] = [];
    }
    acc[district].push(procurementPct);
    return acc;
  }, {});

  const avgAchievement = Object.keys(achievementData).reduce((acc, district) => {
    acc[district] =
      achievementData[district].reduce((a, b) => a + b, 0) / achievementData[district].length;
    return acc;
  }, {});
  const labels = Object.keys(avgAchievement).sort();

  return {
    data: {
      labels,
      datasets: [
        {
          label: "Achievement %",
          data: labels.map((key) => avgAchievement[key].toFixed(2)),
          backgroundColor: [
            "rgba(255, 99, 132, 0.7)",
            "rgba(54, 162, 235, 0.7)",
            "rgba(255, 206, 86, 0.7)",
            "rgba(75, 192, 192, 0.7)",
            "rgba(153, 102, 255, 0.7)",
            "rgba(255, 159, 64, 0.7)",
            "rgba(100, 180, 120, 0.7)",
            "rgba(200, 100, 150, 0.7)",
            "rgba(100, 150, 200, 0.7)",
            "rgba(150, 200, 100, 0.7)",
            "rgba(200, 150, 100, 0.7)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
            "rgba(100, 180, 120, 1)",
            "rgba(200, 100, 150, 1)",
            "rgba(100, 150, 200, 1)",
            "rgba(150, 200, 100, 1)",
            "rgba(200, 150, 100, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: "District Wise Achievement",
          color: "#024b37",
          font: { size: 16, weight: 700 },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: "Achievement %",
            color: "#000000",
            font: { size: 12, weight: 700 },
          },
          ticks: {
            color: "#000000",
            font: { size: 12, weight: 600 },
            callback: (value) => `${value}%`,
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
        y: {
          ticks: {
            color: "#000000",
            font: { size: 12, weight: 600 },
          },
          grid: { color: "rgba(0,0,0,0.05)" },
        },
      },
    },
  };
}
