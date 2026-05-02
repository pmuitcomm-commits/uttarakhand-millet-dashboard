import React from "react";

import { uttarakhandDistricts } from "../data/districts";
import { blocksByDistrict } from "./registerFarmerForm";

const badgeClass =
  "rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]";

const selectorClass =
  "min-w-[220px] rounded-lg border-2 border-[#024b37] bg-white px-3 py-2 text-sm font-bold text-[#024b37] outline-none transition focus:ring-4 focus:ring-[#024b37]/10 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-[#2a2a2a] dark:text-white";

export function formatApiError(error, fallback = "Unable to fetch monitoring data.") {
  const detail = error?.response?.data?.detail;
  if (error?.response?.status === 404 && detail === "Not Found") {
    return "Monitoring data service was not found. Restart the backend with the latest code and try again.";
  }
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.detail || fallback).join("; ");
  }
  return detail || error?.message || fallback;
}

export function getMonitoringScope(level, user, searchParams) {
  const isAdmin = user?.role === "admin";
  const district = isAdmin ? searchParams.get("district") || "" : user?.district || "";
  const block = level === "block"
    ? (isAdmin ? searchParams.get("block") || "" : user?.block || "")
    : "";

  return {
    isAdmin,
    district,
    block,
    ready: Boolean(district) && (level !== "block" || Boolean(block)),
  };
}

export function MonitoringScopeBadges({ level, district, block }) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold text-[#024b37] dark:text-white">
      <span className={badgeClass}>
        District: {district || "Not selected"}
      </span>
      {level === "block" ? (
        <span className={badgeClass}>
          Block: {block || "Not selected"}
        </span>
      ) : null}
    </div>
  );
}

export function MonitoringAdminFilters({
  level,
  district,
  block,
  searchParams,
  setSearchParams,
  resetPage = false,
}) {
  const blockOptions = district ? blocksByDistrict[district] || [] : [];

  const updateParams = (updater) => {
    const nextParams = new URLSearchParams(searchParams);
    updater(nextParams);
    if (resetPage) {
      nextParams.delete("page");
    }
    setSearchParams(nextParams);
  };

  const handleDistrictChange = (event) => {
    const value = event.target.value;
    updateParams((nextParams) => {
      if (value) {
        nextParams.set("district", value);
      } else {
        nextParams.delete("district");
      }
      nextParams.delete("block");
    });
  };

  const handleBlockChange = (event) => {
    const value = event.target.value;
    updateParams((nextParams) => {
      if (value) {
        nextParams.set("block", value);
      } else {
        nextParams.delete("block");
      }
    });
  };

  return (
    <div className="mt-4 flex flex-wrap justify-center gap-3">
      <label className="flex flex-col gap-1 text-left text-xs font-extrabold uppercase text-[#4a5f58] dark:text-slate-200">
        District
        <select className={selectorClass} value={district} onChange={handleDistrictChange}>
          <option value="">Select district</option>
          {uttarakhandDistricts.map((districtName) => (
            <option key={districtName} value={districtName}>
              {districtName}
            </option>
          ))}
        </select>
      </label>
      {level === "block" ? (
        <label className="flex flex-col gap-1 text-left text-xs font-extrabold uppercase text-[#4a5f58] dark:text-slate-200">
          Block
          <select
            className={selectorClass}
            disabled={!district}
            value={block}
            onChange={handleBlockChange}
          >
            <option value="">Select block</option>
            {blockOptions.map((blockName) => (
              <option key={blockName} value={blockName}>
                {blockName}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
}
