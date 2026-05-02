/**
 * DataEntryPage module - District/block data-entry surfaces for officers.
 */

import React, { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, Navigate, useLocation, useParams, useSearchParams } from "react-router-dom";

import DataEntryTable from "../components/DataEntryTable";
import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import {
  blockDataSections,
  blockDataSectionsBySlug,
  defaultBlockDataSectionSlug,
  getBlockDataSectionRedirectSlug,
} from "../data/blockDataSections";

const backButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#024b37] bg-white px-3 text-sm font-bold text-[#024b37] transition hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]";

const sectionNavLinkClass = (isActive) =>
  [
    "inline-flex h-full min-h-12 min-w-0 items-center rounded-md border px-3 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-[#66b9ac]",
    isActive
      ? "border-[#024b37] bg-[#024b37] text-white shadow-sm"
      : "border-[#d8e3de] bg-white text-[#024b37] hover:border-[#66b9ac] hover:bg-[#f2f8f6] dark:border-[#444444] dark:bg-[#1f2937] dark:text-white dark:hover:bg-[#333333]",
  ].join(" ");

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

function BlockDataBreadcrumbs({ activeSection, search }) {
  if (!activeSection) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-2 flex min-w-0 flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#4a5f58] dark:text-slate-200"
    >
      <Link
        className="text-[#024b37] underline underline-offset-2 dark:text-white"
        to={`/block/data/${defaultBlockDataSectionSlug}${search}`}
      >
        Block Data
      </Link>
      <span aria-hidden="true">/</span>
      <span className="max-w-full truncate" title={activeSection.title}>
        {activeSection.title}
      </span>
    </nav>
  );
}

function BlockDataSectionNav({ activeSlug, search }) {
  return (
    <nav aria-label="Block data sections" className="mb-4">
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 md:grid-cols-2 xl:grid-cols-4">
        {blockDataSections.map((section) => {
          const isActive = section.slug === activeSlug;

          return (
            <li key={section.slug} className="min-w-0">
              <Link
                aria-current={isActive ? "page" : undefined}
                className={sectionNavLinkClass(isActive)}
                title={section.title}
                to={`/block/data/${section.slug}${search}`}
              >
                <span className="min-w-0 truncate">{section.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
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

  if (isBlockData && !sectionSlug) {
    return <Navigate to={`/block/data/${defaultBlockDataSectionSlug}${location.search}`} replace />;
  }

  if (isBlockData && sectionSlug && !selectedSection) {
    const redirectSlug = getBlockDataSectionRedirectSlug(sectionSlug) || defaultBlockDataSectionSlug;
    return <Navigate to={`/block/data/${redirectSlug}${location.search}`} replace />;
  }

  const pageTitle = selectedSection?.title || (scopeType === "district" ? "District Data" : "Block Data");
  const showDefaultSectionLink =
    isBlockData && selectedSection?.slug && selectedSection.slug !== defaultBlockDataSectionSlug;

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            {showDefaultSectionLink ? (
              <div className="mb-4 flex justify-start">
                <Link
                  className={backButtonClass}
                  to={`/block/data/${defaultBlockDataSectionSlug}${location.search}`}
                >
                  <ArrowLeft aria-hidden="true" size={16} />
                  First Section
                </Link>
              </div>
            ) : null}
            <BlockDataBreadcrumbs activeSection={selectedSection} search={location.search} />
            <h2 className={dashboardClasses.pageHeadingTitle} title={pageTitle}>
              {pageTitle}
            </h2>
            <ScopeBadges scopeType={scopeType} queryFilters={queryFilters} />
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            {isBlockData ? (
              <>
                <BlockDataSectionNav activeSlug={selectedSection.slug} search={location.search} />
                <DataEntryTable
                  queryFilters={queryFilters}
                  scopeType={scopeType}
                  sectionKey={selectedSection.slug}
                />
              </>
            ) : (
              <DataEntryTable
                queryFilters={queryFilters}
                scopeType={scopeType}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DataEntryPage;
