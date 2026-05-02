import React, { useEffect, useMemo, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import { monitoringSections } from "../data/monitoringSections";
import { getMonitoringSections } from "../services/api";
import {
  formatApiError,
  getMonitoringScope,
  MonitoringAdminFilters,
  MonitoringScopeBadges,
} from "./MonitoringPageScope";

const sectionListLinkClass =
  "group flex min-h-[118px] min-w-0 items-start justify-between gap-3 rounded-md border border-[#d8e3de] bg-white p-4 text-left font-bold text-[#024b37] transition hover:border-[#66b9ac] hover:bg-[#f2f8f6] focus:outline-none focus:ring-2 focus:ring-[#66b9ac] dark:border-[#444444] dark:bg-[#1f2937] dark:text-white dark:hover:bg-[#333333]";

const stateBoxClass =
  "rounded-md border border-[#d8e3de] bg-[#f7faf8] px-4 py-5 text-center text-sm font-bold text-[#4a5f58] dark:border-[#444444] dark:bg-[#1f2937] dark:text-slate-200";

const errorBoxClass =
  "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-[#2b1717] dark:text-red-200";

function MonitoringSkeletonCards() {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 xl:grid-cols-4">
      {monitoringSections.map((section) => (
        <li key={section.tableName} className="min-w-0">
          <div className="min-h-[118px] rounded-md border border-[#d8e3de] bg-white p-4 dark:border-[#444444] dark:bg-[#1f2937]">
            <div className="mb-3 h-3 w-20 rounded bg-[#d8e3de] dark:bg-[#444444]" />
            <div className="mb-2 h-4 w-4/5 rounded bg-[#d8e3de] dark:bg-[#444444]" />
            <div className="h-4 w-2/3 rounded bg-[#d8e3de] dark:bg-[#444444]" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function MonitoringSectionCards({ level, countsByTable, countsUnavailable = false, search }) {
  return (
    <nav aria-label={`${level} monitoring sections`}>
      <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 md:grid-cols-2 xl:grid-cols-4">
        {monitoringSections.map((section, index) => (
          <li key={section.tableName} className="min-w-0">
            <Link
              className={sectionListLinkClass}
              title={section.title}
              to={`/monitoring/${level}/${section.tableName}${search}`}
            >
              <span className="min-w-0">
                <span className="mb-2 block text-xs uppercase tracking-normal text-[#4a5f58] dark:text-slate-300">
                  Section {index + 1}
                </span>
                <span className="block min-w-0 break-words leading-snug">{section.title}</span>
                <span className="mt-2 block min-w-0 truncate text-xs font-semibold text-[#4a5f58] dark:text-slate-300">
                  {section.tableName}
                </span>
                <span className="mt-3 inline-flex rounded-full bg-[#edf5f2] px-3 py-1 text-xs font-extrabold text-[#024b37] dark:bg-[#2a2a2a] dark:text-white">
                  {countsUnavailable ? "Count unavailable" : `${countsByTable[section.tableName] ?? 0} records`}
                </span>
              </span>
              <ExternalLink
                aria-hidden="true"
                className="mt-1 shrink-0 text-[#024b37] transition group-hover:translate-x-0.5 dark:text-white"
                size={16}
                strokeWidth={2.4}
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function MonitoringOverviewPage({ level }) {
  const { user } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaryRows, setSummaryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedLevel = level === "block" ? "block" : "district";
  const pageTitle = normalizedLevel === "block" ? "Block Monitoring" : "District Monitoring";
  const scope = useMemo(
    () => getMonitoringScope(normalizedLevel, user, searchParams),
    [normalizedLevel, searchParams, user],
  );

  const apiFilters = useMemo(
    () => ({
      district: scope.district,
      block: normalizedLevel === "block" ? scope.block : "",
    }),
    [normalizedLevel, scope.block, scope.district],
  );

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      if (!scope.ready) {
        setSummaryRows([]);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getMonitoringSections(normalizedLevel, apiFilters);
        if (!mounted) return;
        setSummaryRows(response.data.sections || []);
      } catch (fetchError) {
        if (!mounted) return;
        setSummaryRows([]);
        setError(formatApiError(fetchError, "Unable to fetch monitoring summary."));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      mounted = false;
    };
  }, [apiFilters, normalizedLevel, scope.ready]);

  const countsByTable = useMemo(
    () =>
      summaryRows.reduce(
        (counts, section) => ({
          ...counts,
          [section.table_name]: section.count,
        }),
        {},
      ),
    [summaryRows],
  );

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle} title={pageTitle}>
              {pageTitle}
            </h2>
            <MonitoringScopeBadges
              level={normalizedLevel}
              district={scope.district}
              block={scope.block}
            />
            {scope.isAdmin ? (
              <MonitoringAdminFilters
                level={normalizedLevel}
                district={scope.district}
                block={scope.block}
                searchParams={searchParams}
                setSearchParams={setSearchParams}
              />
            ) : null}
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            {!scope.ready ? (
              <div className={stateBoxClass}>
                {normalizedLevel === "block"
                  ? "Select a district and block."
                  : "Select a district."}
              </div>
            ) : loading ? (
              <MonitoringSkeletonCards />
            ) : (
              <>
                {error ? (
                  <div className={`${errorBoxClass} mb-4`} role="alert">
                    {error}
                  </div>
                ) : null}
                <MonitoringSectionCards
                  level={normalizedLevel}
                  countsByTable={countsByTable}
                  countsUnavailable={Boolean(error)}
                  search={location.search}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonitoringOverviewPage;
