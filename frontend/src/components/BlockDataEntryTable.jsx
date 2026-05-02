import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Save, Trash2, Upload } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import {
  getBlockDataSchema,
  saveBlockDataRows,
  uploadBlockDataExcel,
} from "../services/api";

const textInputClass =
  "h-10 w-full rounded-none border-0 bg-transparent px-2 text-sm font-medium text-[#024b37] outline-none focus:bg-[#f7faf8] focus:ring-2 focus:ring-inset focus:ring-[#66b9ac] disabled:bg-[#eef5f2] disabled:text-[#4a5f58] dark:text-white dark:disabled:bg-[#1f2937] dark:disabled:text-slate-300 dark:focus:bg-[#1f2937]";

const buttonBaseClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-[#024b37] text-white hover:bg-[#035344]`;

const secondaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-white text-[#024b37] hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]`;

const iconButtonClass =
  "inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#d7e4df] bg-white text-[#831843] transition hover:bg-[#fff4f7] disabled:text-[#9aa5a1] disabled:hover:bg-white dark:border-[#444444] dark:bg-[#2a2a2a] dark:hover:bg-[#333333]";

const districtColumnNames = new Set(["district", "district_name"]);
const blockColumnNames = new Set(["block", "block_name"]);

function clientRowId() {
  return `block-row-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isBlank(value) {
  return value === undefined || value === null || (typeof value === "string" && !value.trim());
}

function humanizeColumnName(columnName) {
  return String(columnName || "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isDistrictColumn(columnName) {
  return districtColumnNames.has(String(columnName || "").toLowerCase());
}

function isBlockColumn(columnName) {
  return blockColumnNames.has(String(columnName || "").toLowerCase());
}

function getScopeDefault(columnName, user, queryFilters) {
  if (isDistrictColumn(columnName)) {
    return queryFilters.district || user?.district || "";
  }
  if (isBlockColumn(columnName)) {
    return queryFilters.block || user?.block || "";
  }
  return "";
}

function makeEmptyRow(columns, user, queryFilters) {
  const values = {};
  columns.forEach((column) => {
    values[column.name] = getScopeDefault(column.name, user, queryFilters);
  });
  return {
    clientId: clientRowId(),
    values,
  };
}

function makeRowsFromValues(valueRows, columns, user, queryFilters) {
  const columnNames = new Set(columns.map((column) => column.name));
  const nextRows = valueRows.map((valueRow) => {
    const row = makeEmptyRow(columns, user, queryFilters);
    Object.entries(valueRow || {}).forEach(([key, value]) => {
      if (columnNames.has(key)) {
        row.values[key] = value ?? "";
      }
    });
    columns.forEach((column) => {
      const scopedValue = getScopeDefault(column.name, user, queryFilters);
      if (scopedValue && (isDistrictColumn(column.name) || isBlockColumn(column.name))) {
        row.values[column.name] = scopedValue;
      }
    });
    return row;
  });
  return nextRows.length ? nextRows : [makeEmptyRow(columns, user, queryFilters)];
}

function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.detail || "Invalid data").join("; ");
  }
  return detail || error?.message || "Unable to save data.";
}

function BlockDataEntryTable({ tableName, queryFilters = {} }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState({ type: "", text: "" });

  const insertableColumns = useMemo(
    () => columns.filter((column) => column.insertable),
    [columns],
  );

  const scopeColumnNames = useMemo(
    () =>
      new Set(
        insertableColumns
          .filter((column) => isDistrictColumn(column.name) || isBlockColumn(column.name))
          .map((column) => column.name),
      ),
    [insertableColumns],
  );

  useEffect(() => {
    let mounted = true;

    async function loadSchema() {
      setLoading(true);
      setStatus({ type: "", text: "" });
      try {
        const response = await getBlockDataSchema(tableName);
        if (!mounted) return;
        const nextColumns = response.data.columns || [];
        const nextInsertableColumns = nextColumns.filter((column) => column.insertable);
        setColumns(nextColumns);
        setRows([makeEmptyRow(nextInsertableColumns, user, queryFilters)]);
        if (!nextInsertableColumns.length) {
          setStatus({
            type: "error",
            text: "This table does not have insertable columns.",
          });
        }
      } catch (error) {
        if (!mounted) return;
        setColumns([]);
        setRows([]);
        setStatus({ type: "error", text: formatApiError(error) });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSchema();

    return () => {
      mounted = false;
    };
  }, [queryFilters, tableName, user]);

  const isColumnLocked = (columnName) => {
    const isScopeColumn = isDistrictColumn(columnName) || isBlockColumn(columnName);
    if (!isScopeColumn) return false;
    if (user?.role !== "admin") return true;
    if (isDistrictColumn(columnName) && queryFilters.district) return true;
    if (isBlockColumn(columnName) && queryFilters.block) return true;
    return false;
  };

  const rowHasUserInput = (row) => {
    const dataColumns = insertableColumns.filter((column) => !scopeColumnNames.has(column.name));
    const columnsToCheck = dataColumns.length ? dataColumns : insertableColumns;
    return columnsToCheck.some((column) => !isBlank(row.values[column.name]));
  };

  const updateCell = (clientId, columnName, value) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.clientId === clientId
          ? { ...row, values: { ...row.values, [columnName]: value } }
          : row,
      ),
    );
  };

  const addRow = () => {
    setRows((currentRows) => [...currentRows, makeEmptyRow(insertableColumns, user, queryFilters)]);
    setStatus({ type: "", text: "" });
  };

  const removeRow = (clientId) => {
    setRows((currentRows) => {
      const nextRows = currentRows.filter((row) => row.clientId !== clientId);
      return nextRows.length ? nextRows : [makeEmptyRow(insertableColumns, user, queryFilters)];
    });
    setStatus({ type: "", text: "" });
  };

  const validateRows = (rowsToSave) => {
    if (!rowsToSave.length) {
      return "Enter at least one row before saving.";
    }

    for (const [rowIndex, row] of rowsToSave.entries()) {
      for (const column of insertableColumns) {
        if (column.required && isBlank(row.values[column.name])) {
          return `${humanizeColumnName(column.name)} is required on row ${rowIndex + 1}.`;
        }
      }

      const districtColumn = insertableColumns.find((column) => isDistrictColumn(column.name));
      if (districtColumn && isBlank(row.values[districtColumn.name])) {
        return `District is required on row ${rowIndex + 1}.`;
      }

      const blockColumn = insertableColumns.find((column) => isBlockColumn(column.name));
      if (blockColumn && isBlank(row.values[blockColumn.name])) {
        return `Block is required on row ${rowIndex + 1}.`;
      }
    }

    return "";
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setStatus({ type: "error", text: "Upload a .xlsx or .xls file." });
      return;
    }

    setUploading(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await uploadBlockDataExcel(tableName, file, queryFilters);
      const uploadedRows = response.data.rows || [];
      setRows(makeRowsFromValues(uploadedRows, insertableColumns, user, queryFilters));
      const ignoredCount = (response.data.ignored_columns || []).length;
      setStatus({
        type: "success",
        text: ignoredCount
          ? `Loaded ${uploadedRows.length} row(s). Ignored ${ignoredCount} unmatched Excel column(s).`
          : `Loaded ${uploadedRows.length} row(s).`,
      });
    } catch (error) {
      setStatus({ type: "error", text: formatApiError(error) });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const rowsToSave = rows.filter(rowHasUserInput);
    const validationError = validateRows(rowsToSave);
    if (validationError) {
      setStatus({ type: "error", text: validationError });
      return;
    }

    const payloadRows = rowsToSave.map((row) => {
      const payloadRow = {};
      insertableColumns.forEach((column) => {
        const value = row.values[column.name];
        if (!isBlank(value)) {
          payloadRow[column.name] = value;
        }
      });
      return payloadRow;
    });

    setSaving(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await saveBlockDataRows(tableName, payloadRows, queryFilters);
      const insertedCount = response.data.inserted_count || payloadRows.length;
      setRows([makeEmptyRow(insertableColumns, user, queryFilters)]);
      setStatus({ type: "success", text: `Saved ${insertedCount} row(s).` });
    } catch (error) {
      setStatus({ type: "error", text: formatApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  const statusClassName =
    status.type === "success"
      ? "border-[#b6dfc4] bg-[#f0fff5] text-[#14532d] dark:border-[#2f6b46] dark:bg-[#13251b] dark:text-[#b8f7ca]"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-[#2b1717] dark:text-red-200";

  const controlsDisabled = loading || saving || uploading || !insertableColumns.length;
  const tableMinWidth = Math.max(760, insertableColumns.length * 180 + 130);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 text-sm font-semibold text-[#4a5f58] dark:text-[#d5dfdc]">
          {loading ? "Loading columns..." : `${rows.length} row(s) / ${insertableColumns.length} column(s)`}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            accept=".xlsx,.xls"
            className="hidden"
            type="file"
            onChange={handleFileChange}
          />
          <button
            className={secondaryButtonClass}
            disabled={controlsDisabled}
            type="button"
            onClick={handleUploadClick}
          >
            <Upload aria-hidden="true" size={16} />
            {uploading ? "Uploading..." : "Upload Excel"}
          </button>
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
        <table
          className="w-full border-collapse bg-white dark:bg-[#2a2a2a]"
          style={{ minWidth: `${tableMinWidth}px` }}
        >
          <thead>
            <tr>
              <th className="w-[58px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                No.
              </th>
              {insertableColumns.map((column) => (
                <th
                  key={column.name}
                  className="min-w-[180px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white"
                  title={column.name}
                >
                  {humanizeColumnName(column.name)}
                  {column.required ? " *" : ""}
                </th>
              ))}
              <th className="w-[70px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-center text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.clientId}
                className="even:bg-[#f8fbfa] hover:bg-[#f2f8f6] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
              >
                <td className="border border-[#d7e4df] px-3 py-2 text-sm font-bold text-[#024b37] dark:border-[#444444] dark:text-white">
                  {rowIndex + 1}
                </td>
                {insertableColumns.map((column) => (
                  <td key={`${row.clientId}-${column.name}`} className="border border-[#d7e4df] p-0 dark:border-[#444444]">
                    <input
                      aria-label={`${humanizeColumnName(column.name)} row ${rowIndex + 1}`}
                      className={textInputClass}
                      disabled={controlsDisabled || isColumnLocked(column.name)}
                      type="text"
                      value={row.values[column.name] ?? ""}
                      onChange={(event) => updateCell(row.clientId, column.name, event.target.value)}
                    />
                  </td>
                ))}
                <td className="border border-[#d7e4df] px-3 py-2 text-center dark:border-[#444444]">
                  <button
                    aria-label={`Delete row ${rowIndex + 1}`}
                    className={iconButtonClass}
                    disabled={controlsDisabled}
                    title="Delete row"
                    type="button"
                    onClick={() => removeRow(row.clientId)}
                  >
                    <Trash2 aria-hidden="true" size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default BlockDataEntryTable;
