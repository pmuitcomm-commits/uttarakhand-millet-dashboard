/**
 * DataEntryPage module - District/block data-entry surfaces for officers.
 */

import React, { useMemo } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";

import DataEntryTable from "../components/DataEntryTable";
import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import { blockDataSections, blockDataSectionsBySlug } from "../data/blockDataSections";

const backButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#024b37] bg-white px-3 text-sm font-bold text-[#024b37] transition hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]";

function ScopeBadges({ scopeType, queryFilters }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const districtLabel = queryFilters.district || user?.district || "";
  const blockLabel = queryFilters.block || user?.block || "";

  return (
    <div className="mt-3 flex flex-wrap justify-center gap-2 text-xs font-bold text-[#024b37] dark:text-white">
      {isAdmin ? (
        <>
          <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
            Admin
          </span>
          {queryFilters.district ? (
            <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
              {queryFilters.district}
            </span>
          ) : null}
          {scopeType === "block" && queryFilters.block ? (
            <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
              {queryFilters.block}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
            {districtLabel || "District not assigned"}
          </span>
          {scopeType === "block" ? (
            <span className="rounded-full border border-[#d8e3de] bg-[#f7faf8] px-3 py-1.5 dark:border-[#444444] dark:bg-[#1f2937]">
              {blockLabel || "Block not assigned"}
            </span>
          ) : null}
        </>
      )}
    </div>
  );
}

function BlockDataSectionList({ search }) {
  return (
    <ul className="m-0 list-disc space-y-3 pl-6 text-base leading-snug text-black dark:text-white">
      {blockDataSections.map((section) => (
        <li key={section.slug} className="pl-1">
          <Link
            className="inline-flex min-w-0 items-center gap-1.5 font-medium text-black underline decoration-[1.5px] underline-offset-2 transition hover:text-[#024b37] focus:outline-none focus:ring-2 focus:ring-[#66b9ac] dark:text-white dark:hover:text-[#9de0d5]"
            to={`/block/data/${section.slug}${search}`}
          >
            <span className="min-w-0 break-words">{section.title}</span>
            <ExternalLink aria-hidden="true" className="mt-0.5 shrink-0" size={14} strokeWidth={2.4} />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DataEntryPage({ scopeType }) {
  const location = useLocation();
  const { sectionSlug } = useParams();
  const [searchParams] = useSearchParams();
  const isBlockData = scopeType === "block";
  const selectedSection = isBlockData && sectionSlug ? blockDataSectionsBySlug[sectionSlug] : null;

  const queryFilters = useMemo(
    () => ({
      district: searchParams.get("district") || "",
      block: searchParams.get("block") || "",
    }),
    [searchParams],
  );

  if (isBlockData && sectionSlug && !selectedSection) {
    return <Navigate to={`/block/data${location.search}`} replace />;
  }

  const pageTitle = selectedSection?.title || (scopeType === "district" ? "District Data" : "Block Data");
  const showSectionList = isBlockData && !selectedSection;

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            {selectedSection ? (
              <div className="mb-4 flex justify-start">
                <Link className={backButtonClass} to={`/block/data${location.search}`}>
                  <ArrowLeft aria-hidden="true" size={16} />
                  Back to Block Data
                </Link>
              </div>
            ) : null}
            <h2 className={dashboardClasses.pageHeadingTitle}>{pageTitle}</h2>
            <ScopeBadges scopeType={scopeType} queryFilters={queryFilters} />
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            {showSectionList ? (
              <BlockDataSectionList search={location.search} />
            ) : (
              <DataEntryTable
                queryFilters={queryFilters}
                scopeType={scopeType}
                sectionKey={selectedSection?.slug || ""}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntryPage;
