import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import {
  isAllowedMonitoringTable,
  monitoringSectionsByTableName,
} from "../data/monitoringSections";
import { getMonitoringTableRows } from "../services/api";
import {
  formatApiError,
  getMonitoringScope,
  MonitoringAdminFilters,
  MonitoringScopeBadges,
} from "./MonitoringPageScope";

const PAGE_SIZE = 1000;

const backButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-[#024b37] bg-white px-3 text-sm font-bold text-[#024b37] transition hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]";

const buttonBaseClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const secondaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-white text-[#024b37] hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]`;

const stateBoxClass =
  "rounded-md border border-[#d8e3de] bg-[#f7faf8] px-4 py-5 text-center text-sm font-bold text-[#4a5f58] dark:border-[#444444] dark:bg-[#1f2937] dark:text-slate-200";

const errorBoxClass =
  "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 dark:border-red-900 dark:bg-[#2b1717] dark:text-red-200";

function getPage(searchParams) {
  const rawPage = Number(searchParams.get("page") || 1);
  if (!Number.isFinite(rawPage) || rawPage < 1) {
    return 1;
  }
  return Math.floor(rawPage);
}

function formatCellValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

function MonitoringRowsTable({ columns, rows, from }) {
  if (!rows.length) {
    return <div className={stateBoxClass}>No records found</div>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[#d7e4df] dark:border-[#444444]">
      <table className="w-full min-w-[1100px] border-collapse bg-white dark:bg-[#2a2a2a]">
        <thead>
          <tr>
            <th className="w-[70px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
              No.
            </th>
            {columns.map((column) => (
              <th
                key={column}
                className="min-w-[150px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={`${from}-${rowIndex}`}
              className="even:bg-[#f8fbfa] hover:bg-[#f2f8f6] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
            >
              <td className="border border-[#d7e4df] px-3 py-2 text-sm font-bold text-[#024b37] dark:border-[#444444] dark:text-white">
                {from + rowIndex + 1}
              </td>
              {columns.map((column) => {
                const cellValue = formatCellValue(row[column]);
                return (
                  <td
                    key={`${from}-${rowIndex}-${column}`}
                    className="max-w-[320px] whitespace-nowrap border border-[#d7e4df] px-3 py-2 text-sm font-medium text-[#024b37] dark:border-[#444444] dark:text-white"
                    title={cellValue}
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonitoringDetailPage() {
  const { level, tableName } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const normalizedLevel = level === "block" || level === "district" ? level : "";
  const invalidLevel = !normalizedLevel;
  const invalidSection = !isAllowedMonitoringTable(tableName);
  const unauthorizedScope =
    (normalizedLevel === "district" && user?.role === "block") ||
    (normalizedLevel === "block" && user?.role === "district");
  const section = monitoringSectionsByTableName[tableName];
  const page = getPage(searchParams);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  const scopeLevel = normalizedLevel || "district";
  const scope = useMemo(
    () => getMonitoringScope(scopeLevel, user, searchParams),
    [scopeLevel, searchParams, user],
  );

  const apiFilters = useMemo(
    () => ({
      district: scope.district,
      block: normalizedLevel === "block" ? scope.block : "",
      from,
      to,
    }),
    [from, normalizedLevel, scope.block, scope.district, to],
  );

  const overviewSearch = useMemo(() => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("page");
    const queryString = nextParams.toString();
    return queryString ? `?${queryString}` : "";
  }, [searchParams]);

  const overviewPath = `/${normalizedLevel || "district"}/monitoring${overviewSearch}`;

  useEffect(() => {
    let mounted = true;

    async function loadRows() {
      if (invalidLevel || invalidSection || unauthorizedScope || !scope.ready) {
        setRows([]);
        setTotalCount(0);
        setHasNext(false);
        setLoading(false);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await getMonitoringTableRows(normalizedLevel, tableName, apiFilters);
        if (!mounted) return;
        setRows(response.data.rows || []);
        setTotalCount(response.data.total_count || 0);
        setHasNext(Boolean(response.data.has_next));
      } catch (fetchError) {
        if (!mounted) return;
        setRows([]);
        setTotalCount(0);
        setHasNext(false);
        setError(formatApiError(fetchError));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadRows();

    return () => {
      mounted = false;
    };
  }, [
    apiFilters,
    invalidLevel,
    invalidSection,
    normalizedLevel,
    scope.ready,
    tableName,
    unauthorizedScope,
  ]);

  const columns = useMemo(() => (rows.length ? Object.keys(rows[0]) : []), [rows]);

  const setPage = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) {
      nextParams.delete("page");
    } else {
      nextParams.set("page", String(nextPage));
    }
    setSearchParams(nextParams);
  };

  const showingFrom = totalCount === 0 ? 0 : from + 1;
  const showingTo = totalCount === 0 ? 0 : Math.min(from + rows.length, totalCount);
  const pageTitle = invalidSection ? "Invalid section" : section?.title || "Monitoring";

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <div className="mb-4 flex justify-start">
              <Link className={backButtonClass} to={overviewPath}>
                <ArrowLeft aria-hidden="true" size={16} />
                Back to {normalizedLevel === "block" ? "Block Monitoring" : "District Monitoring"}
              </Link>
            </div>
            <nav
              aria-label="Breadcrumb"
              className="mb-2 flex min-w-0 flex-wrap items-center justify-center gap-2 text-xs font-bold text-[#4a5f58] dark:text-slate-200"
            >
              <Link
                className="text-[#024b37] underline underline-offset-2 dark:text-white"
                to={overviewPath}
              >
                {normalizedLevel === "block" ? "Block Monitoring" : "District Monitoring"}
              </Link>
              <span aria-hidden="true">/</span>
              <span className="max-w-full truncate" title={pageTitle}>
                {pageTitle}
              </span>
            </nav>
            <h2 className={dashboardClasses.pageHeadingTitle} title={pageTitle}>
              {pageTitle}
            </h2>
            {!invalidLevel ? (
              <>
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
                    resetPage
                  />
                ) : null}
              </>
            ) : null}
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            {invalidLevel ? (
              <div className={errorBoxClass} role="alert">
                Invalid monitoring level
              </div>
            ) : invalidSection ? (
              <div className={errorBoxClass} role="alert">
                Invalid section
              </div>
            ) : unauthorizedScope ? (
              <div className={errorBoxClass} role="alert">
                Not authorized for this monitoring scope
              </div>
            ) : !scope.ready ? (
              <div className={stateBoxClass}>
                {normalizedLevel === "block"
                  ? "Select a district and block."
                  : "Select a district."}
              </div>
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[#4a5f58] dark:text-[#d5dfdc]">
                    {loading
                      ? "Loading data..."
                      : `Showing ${showingFrom}-${showingTo} of ${totalCount} records`}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className={secondaryButtonClass}
                      disabled={loading || page <= 1}
                      type="button"
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft aria-hidden="true" size={16} />
                      Previous
                    </button>
                    <button
                      className={secondaryButtonClass}
                      disabled={loading || !hasNext}
                      type="button"
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                      <ChevronRight aria-hidden="true" size={16} />
                    </button>
                  </div>
                </div>

                {error ? (
                  <div className={errorBoxClass} role="alert">
                    {error}
                  </div>
                ) : loading ? (
                  <div className={stateBoxClass}>Loading data...</div>
                ) : (
                  <MonitoringRowsTable columns={columns} rows={rows} from={from} />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonitoringDetailPage;
