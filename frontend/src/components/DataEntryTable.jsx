import React, { useEffect, useMemo, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { deleteDataEntry, getDataEntries, saveDataEntries } from "../services/api";

const textInputClass =
  "h-10 w-full rounded-none border-0 bg-transparent px-2 text-sm font-medium text-[#024b37] outline-none focus:bg-[#f7faf8] focus:ring-2 focus:ring-inset focus:ring-[#66b9ac] dark:text-white dark:focus:bg-[#1f2937]";

const buttonBaseClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-[#024b37] text-white hover:bg-[#035344]`;

const secondaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-white text-[#024b37] hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]`;

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d7e4df] bg-white text-[#831843] transition hover:bg-[#fff4f7] disabled:text-[#9aa5a1] disabled:hover:bg-white dark:border-[#444444] dark:bg-[#2a2a2a] dark:hover:bg-[#333333]";

const inputKeys = [
  "data_type",
  "metric_name",
  "value",
  "unit",
  "reporting_period",
  "remarks",
];

function clientRowId() {
  return `row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function makeEmptyRow(scopeType, user, defaults = {}) {
  const isAdmin = user?.role === "admin";

  return {
    clientId: clientRowId(),
    id: null,
    section_key: defaults.section_key || "",
    district: isAdmin ? defaults.district || "" : user?.district || "",
    block: scopeType === "block" ? (isAdmin ? defaults.block || "" : user?.block || "") : "",
    data_type: "",
    metric_name: "",
    value: "",
    unit: "",
    reporting_period: "",
    remarks: "",
  };
}

function mapEntryToRow(entry) {
  return {
    clientId: `saved-${entry.id}`,
    id: entry.id,
    section_key: entry.section_key || "",
    district: entry.district || "",
    block: entry.block || "",
    data_type: entry.data_type || "",
    metric_name: entry.metric_name || "",
    value: entry.value || "",
    unit: entry.unit || "",
    reporting_period: entry.reporting_period || "",
    remarks: entry.remarks || "",
  };
}

function rowHasUserInput(row) {
  return inputKeys.some((key) => String(row[key] || "").trim());
}

function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.detail || "Invalid data").join("; ");
  }
  return detail || error?.message || "Unable to save data.";
}

function DataEntryTable({ scopeType, sectionKey = "", queryFilters = {} }) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState("");
  const [status, setStatus] = useState({ type: "", text: "" });

  const apiFilters = useMemo(
    () => ({
      district: queryFilters.district || "",
      block: queryFilters.block || "",
      section_key: sectionKey || queryFilters.section_key || queryFilters.sectionKey || "",
    }),
    [
      queryFilters.block,
      queryFilters.district,
      queryFilters.sectionKey,
      queryFilters.section_key,
      sectionKey,
    ],
  );

  const rowDefaults = useMemo(
    () => ({
      district: apiFilters.district,
      block: apiFilters.block,
      section_key: apiFilters.section_key,
    }),
    [apiFilters.block, apiFilters.district, apiFilters.section_key],
  );

  const showDistrictColumn = isAdmin && !apiFilters.district;
  const showBlockColumn = isAdmin && scopeType === "block" && !apiFilters.block;

  const columns = useMemo(() => {
    const baseColumns = [
      { key: "data_type", label: "Category", width: "min-w-[150px]" },
      { key: "metric_name", label: "Metric Name *", width: "min-w-[190px]" },
      { key: "value", label: "Value", width: "min-w-[120px]" },
      { key: "unit", label: "Unit", width: "min-w-[110px]" },
      { key: "reporting_period", label: "Reporting Period", width: "min-w-[170px]" },
      { key: "remarks", label: "Remarks", width: "min-w-[220px]" },
    ];

    if (showBlockColumn) {
      baseColumns.unshift({ key: "block", label: "Block *", width: "min-w-[150px]" });
    }
    if (showDistrictColumn) {
      baseColumns.unshift({ key: "district", label: "District *", width: "min-w-[160px]" });
    }

    return baseColumns;
  }, [showBlockColumn, showDistrictColumn]);

  useEffect(() => {
    let mounted = true;

    async function loadEntries() {
      setLoading(true);
      setStatus({ type: "", text: "" });
      try {
        const response = await getDataEntries(scopeType, apiFilters);
        if (!mounted) return;
        const loadedRows = (response.data.entries || []).map(mapEntryToRow);
        setRows(loadedRows.length ? loadedRows : [makeEmptyRow(scopeType, user, rowDefaults)]);
      } catch (error) {
        if (!mounted) return;
        setRows([makeEmptyRow(scopeType, user, rowDefaults)]);
        setStatus({ type: "error", text: formatApiError(error) });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      mounted = false;
    };
  }, [
    apiFilters,
    rowDefaults,
    scopeType,
    user,
  ]);

  const updateCell = (clientId, key, value) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.clientId === clientId ? { ...row, [key]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((currentRows) => [...currentRows, makeEmptyRow(scopeType, user, rowDefaults)]);
    setStatus({ type: "", text: "" });
  };

  const validateRows = (rowsToSave) => {
    if (!rowsToSave.length) {
      return "Enter at least one row before saving.";
    }

    for (const [index, row] of rowsToSave.entries()) {
      if (!String(row.metric_name || "").trim()) {
        return `Metric Name is required on row ${index + 1}.`;
      }
      if (isAdmin && !apiFilters.district && !String(row.district || "").trim()) {
        return `District is required on row ${index + 1}.`;
      }
      if (
        isAdmin &&
        scopeType === "block" &&
        !apiFilters.block &&
        !String(row.block || "").trim()
      ) {
        return `Block is required on row ${index + 1}.`;
      }
    }

    return "";
  };

  const handleSave = async () => {
    const rowsToSave = rows.filter((row) => row.id || rowHasUserInput(row));
    const validationError = validateRows(rowsToSave);
    if (validationError) {
      setStatus({ type: "error", text: validationError });
      return;
    }

    setSaving(true);
    setStatus({ type: "", text: "" });

    try {
      const payload = rowsToSave.map((row) => ({
        id: row.id || undefined,
        section_key: apiFilters.section_key || row.section_key || undefined,
        district: apiFilters.district || row.district,
        block: apiFilters.block || row.block,
        data_type: row.data_type,
        metric_name: row.metric_name,
        value: row.value,
        unit: row.unit,
        reporting_period: row.reporting_period,
        remarks: row.remarks,
      }));
      const response = await saveDataEntries(scopeType, payload, apiFilters);
      const savedRows = (response.data.entries || []).map(mapEntryToRow);
      setRows(savedRows.length ? savedRows : [makeEmptyRow(scopeType, user, rowDefaults)]);
      setStatus({ type: "success", text: `Saved ${savedRows.length} row(s).` });
    } catch (error) {
      setStatus({ type: "error", text: formatApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRow = async (row) => {
    if (!row.id) {
      setRows((currentRows) => {
        const nextRows = currentRows.filter((currentRow) => currentRow.clientId !== row.clientId);
        return nextRows.length ? nextRows : [makeEmptyRow(scopeType, user, rowDefaults)];
      });
      setStatus({ type: "", text: "" });
      return;
    }

    setDeletingRowId(row.clientId);
    setStatus({ type: "", text: "" });

    try {
      await deleteDataEntry(scopeType, row.id, apiFilters);
      setRows((currentRows) => {
        const nextRows = currentRows.filter((currentRow) => currentRow.clientId !== row.clientId);
        return nextRows.length ? nextRows : [makeEmptyRow(scopeType, user, rowDefaults)];
      });
      setStatus({ type: "success", text: "Row deleted." });
    } catch (error) {
      setStatus({ type: "error", text: formatApiError(error) });
    } finally {
      setDeletingRowId("");
    }
  };

  const statusClassName =
    status.type === "success"
      ? "border-[#b6dfc4] bg-[#f0fff5] text-[#14532d] dark:border-[#2f6b46] dark:bg-[#13251b] dark:text-[#b8f7ca]"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-[#2b1717] dark:text-red-200";

  const controlsDisabled = loading || saving || Boolean(deletingRowId);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm font-semibold text-[#4a5f58] dark:text-[#d5dfdc]">
          {loading ? "Loading data..." : `${rows.length} row(s)`}
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={secondaryButtonClass} type="button" onClick={addRow} disabled={controlsDisabled}>
            <Plus aria-hidden="true" size={16} />
            Add Row
          </button>
          <button className={primaryButtonClass} type="button" onClick={handleSave} disabled={controlsDisabled}>
            <Save aria-hidden="true" size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {status.text ? (
        <div className={`mb-4 rounded-md border px-4 py-3 text-sm font-semibold ${statusClassName}`} role="status" aria-live="polite">
          {status.text}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-[#d7e4df] dark:border-[#444444]">
        <table className="w-full min-w-[980px] border-collapse bg-white dark:bg-[#2a2a2a]">
          <thead>
            <tr>
              <th className="w-[58px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                No.
              </th>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${column.width} border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white`}
                >
                  {column.label}
                </th>
              ))}
              <th className="w-[70px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-center text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowDeleting = deletingRowId === row.clientId;

              return (
                <tr
                  key={row.clientId}
                  className="even:bg-[#f8fbfa] hover:bg-[#f2f8f6] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
                >
                  <td className="border border-[#d7e4df] px-3 py-2 text-sm font-bold text-[#024b37] dark:border-[#444444] dark:text-white">
                    {rowIndex + 1}
                  </td>
                  {columns.map((column) => (
                    <td key={`${row.clientId}-${column.key}`} className="border border-[#d7e4df] p-0 dark:border-[#444444]">
                      <input
                        aria-label={`${column.label.replace(" *", "")} row ${rowIndex + 1}`}
                        className={textInputClass}
                        disabled={controlsDisabled}
                        type="text"
                        value={row[column.key] || ""}
                        onChange={(event) => updateCell(row.clientId, column.key, event.target.value)}
                      />
                    </td>
                  ))}
                  <td className="border border-[#d7e4df] px-3 py-2 text-center dark:border-[#444444]">
                    <button
                      aria-label={`Delete row ${rowIndex + 1}`}
                      className={iconButtonClass}
                      disabled={controlsDisabled || rowDeleting}
                      title="Delete row"
                      type="button"
                      onClick={() => handleDeleteRow(row)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default DataEntryTable;
