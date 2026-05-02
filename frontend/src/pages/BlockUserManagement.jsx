import React, { useEffect, useMemo, useState } from "react";
import { Edit3, Save, X } from "lucide-react";

import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import { blocksByDistrict } from "./registerFarmerForm";
import {
  getDistrictBlockOfficers,
  updateDistrictBlockOfficer,
} from "../services/api";

const mobilePattern = /^\d{10}$/;

const buttonBaseClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-[#024b37] text-white hover:bg-[#035344]`;

const secondaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-white text-[#024b37] hover:bg-[#f2f8f6] dark:bg-[#2a2a2a] dark:text-white dark:hover:bg-[#333333]`;

const cancelButtonClass =
  `${buttonBaseClass} border-[#d7e4df] bg-white text-[#831843] hover:bg-[#fff4f7] dark:border-[#444444] dark:bg-[#2a2a2a] dark:hover:bg-[#333333]`;

const textInputClass =
  "h-10 w-full min-w-0 rounded-md border border-[#cbd8d3] bg-white px-3 text-sm font-medium text-[#024b37] outline-none focus:border-[#66b9ac] focus:ring-2 focus:ring-[#66b9ac]/30 dark:border-[#444444] dark:bg-[#1f2937] dark:text-white";

function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.detail || "Invalid data").join("; ");
  }
  return detail || error?.message || "Unable to update block officer.";
}

function makeDraft(officer) {
  return {
    name: officer?.name || "",
    mobile: officer?.mobile || "",
    block: officer?.block || "",
  };
}

function validateDraft(draft) {
  const errors = {};
  if (!draft.name.trim()) {
    errors.name = "Name is required.";
  }
  if (draft.mobile.trim() && !mobilePattern.test(draft.mobile.trim())) {
    errors.mobile = "Mobile number must be exactly 10 digits.";
  }
  if (!draft.block.trim()) {
    errors.block = "Block is required.";
  }
  return errors;
}

function BlockSelector({ value, options, disabled, onChange }) {
  if (!options.length) {
    return (
      <input
        aria-label="Block"
        className={textInputClass}
        disabled={disabled}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <select
      aria-label="Block"
      className={textInputClass}
      disabled={disabled}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">Select block</option>
      {value && !options.includes(value) ? <option value={value}>{value}</option> : null}
      {options.map((block) => (
        <option key={block} value={block}>
          {block}
        </option>
      ))}
    </select>
  );
}

function BlockUserManagement() {
  const { user } = useAuth();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(makeDraft());
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });

  const blockOptions = useMemo(
    () => blocksByDistrict[user?.district] || [],
    [user?.district],
  );

  useEffect(() => {
    let mounted = true;

    async function loadOfficers() {
      setLoading(true);
      setStatus({ type: "", text: "" });
      try {
        const response = await getDistrictBlockOfficers();
        if (!mounted) return;
        setOfficers(response.data?.users || []);
      } catch (error) {
        if (!mounted) return;
        setOfficers([]);
        setStatus({ type: "error", text: formatApiError(error) });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadOfficers();

    return () => {
      mounted = false;
    };
  }, []);

  const startEdit = (officer) => {
    setEditingId(officer.id);
    setDraft(makeDraft(officer));
    setErrors({});
    setStatus({ type: "", text: "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(makeDraft());
    setErrors({});
  };

  const updateDraft = (field, value) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [field]: field === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
  };

  const saveOfficer = async (officer) => {
    const nextErrors = validateDraft(draft);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus({ type: "error", text: "Fix the highlighted fields before saving." });
      return;
    }

    setSavingId(officer.id);
    setStatus({ type: "", text: "" });

    try {
      const response = await updateDistrictBlockOfficer(officer.id, {
        full_name: draft.name.trim(),
        mobile: draft.mobile.trim() || null,
        block: draft.block.trim(),
      });
      const updatedOfficer = response.data?.user || {
        ...officer,
        name: draft.name.trim(),
        mobile: draft.mobile.trim(),
        block: draft.block.trim(),
      };
      setOfficers((currentOfficers) =>
        currentOfficers.map((currentOfficer) =>
          currentOfficer.id === officer.id ? updatedOfficer : currentOfficer,
        ),
      );
      setEditingId(null);
      setDraft(makeDraft());
      setErrors({});
      setStatus({ type: "success", text: "Block officer updated successfully." });
    } catch (error) {
      setStatus({ type: "error", text: formatApiError(error) });
    } finally {
      setSavingId(null);
    }
  };

  const statusClassName =
    status.type === "success"
      ? "border-[#b6dfc4] bg-[#f0fff5] text-[#14532d] dark:border-[#2f6b46] dark:bg-[#13251b] dark:text-[#b8f7ca]"
      : "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-[#2b1717] dark:text-red-200";

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>Block User Management</h2>
            <div className="mt-3 text-sm font-bold text-[#4a5f58] dark:text-slate-200">
              District: {user?.district || "Not assigned"}
            </div>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-[#4a5f58] dark:text-[#d5dfdc]">
                {loading ? "Loading block officers..." : `${officers.length} block officer(s)`}
              </div>
            </div>

            {status.text ? (
              <div
                className={`mb-4 rounded-md border px-4 py-3 text-sm font-semibold ${statusClassName}`}
                role="status"
                aria-live="polite"
              >
                {status.text}
              </div>
            ) : null}

            {loading ? (
              <div className="rounded-md border border-[#d7e4df] bg-[#f8fbfa] px-4 py-8 text-center font-semibold text-[#4a5f58] dark:border-[#444444] dark:bg-[#1f2937] dark:text-slate-200">
                Loading block officer users...
              </div>
            ) : officers.length === 0 ? (
              <div className="rounded-md border border-[#d7e4df] bg-[#f8fbfa] px-4 py-8 text-center font-semibold text-[#4a5f58] dark:border-[#444444] dark:bg-[#1f2937] dark:text-slate-200">
                No block officer users found for this district.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-[#d7e4df] dark:border-[#444444]">
                <table className="w-full min-w-[920px] border-collapse bg-white dark:bg-[#2a2a2a]">
                  <thead>
                    <tr>
                      <th className="border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                        Name
                      </th>
                      <th className="border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                        Mobile
                      </th>
                      <th className="border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                        Block
                      </th>
                      <th className="border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-left text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                        District
                      </th>
                      <th className="w-[170px] border border-[#d7e4df] bg-[#edf5f2] px-3 py-3 text-center text-xs font-extrabold uppercase text-[#003366] dark:border-[#444444] dark:bg-[#1a1a1a] dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {officers.map((officer) => {
                      const isEditing = editingId === officer.id;
                      const isSaving = savingId === officer.id;
                      const controlsDisabled = Boolean(savingId) && !isSaving;

                      return (
                        <tr
                          key={officer.id}
                          className="even:bg-[#f8fbfa] hover:bg-[#f2f8f6] dark:even:bg-[#252525] dark:hover:bg-[#333333]"
                        >
                          <td className="min-w-[220px] border border-[#d7e4df] px-3 py-2 dark:border-[#444444]">
                            {isEditing ? (
                              <>
                                <input
                                  aria-label="Name"
                                  className={textInputClass}
                                  disabled={isSaving}
                                  type="text"
                                  value={draft.name}
                                  onChange={(event) => updateDraft("name", event.target.value)}
                                />
                                {errors.name ? (
                                  <div className="mt-1 text-xs font-bold text-red-700 dark:text-red-200">
                                    {errors.name}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <span className="font-semibold text-[#024b37] dark:text-white">
                                {officer.name || "-"}
                              </span>
                            )}
                          </td>
                          <td className="min-w-[160px] border border-[#d7e4df] px-3 py-2 dark:border-[#444444]">
                            {isEditing ? (
                              <>
                                <input
                                  aria-label="Mobile"
                                  className={textInputClass}
                                  disabled={isSaving}
                                  inputMode="numeric"
                                  maxLength="10"
                                  type="text"
                                  value={draft.mobile}
                                  onChange={(event) => updateDraft("mobile", event.target.value)}
                                />
                                {errors.mobile ? (
                                  <div className="mt-1 text-xs font-bold text-red-700 dark:text-red-200">
                                    {errors.mobile}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-[#024b37] dark:text-white">
                                {officer.mobile || "-"}
                              </span>
                            )}
                          </td>
                          <td className="min-w-[190px] border border-[#d7e4df] px-3 py-2 dark:border-[#444444]">
                            {isEditing ? (
                              <>
                                <BlockSelector
                                  disabled={isSaving}
                                  options={blockOptions}
                                  value={draft.block}
                                  onChange={(value) => updateDraft("block", value)}
                                />
                                {errors.block ? (
                                  <div className="mt-1 text-xs font-bold text-red-700 dark:text-red-200">
                                    {errors.block}
                                  </div>
                                ) : null}
                              </>
                            ) : (
                              <span className="text-[#024b37] dark:text-white">
                                {officer.block || "-"}
                              </span>
                            )}
                          </td>
                          <td className="min-w-[180px] border border-[#d7e4df] px-3 py-2 font-semibold text-[#024b37] dark:border-[#444444] dark:text-white">
                            {officer.district || "-"}
                          </td>
                          <td className="border border-[#d7e4df] px-3 py-2 text-center dark:border-[#444444]">
                            {isEditing ? (
                              <div className="flex flex-wrap justify-center gap-2">
                                <button
                                  className={primaryButtonClass}
                                  disabled={isSaving}
                                  type="button"
                                  onClick={() => saveOfficer(officer)}
                                >
                                  <Save aria-hidden="true" size={16} />
                                  {isSaving ? "Saving..." : "Save"}
                                </button>
                                <button
                                  className={cancelButtonClass}
                                  disabled={isSaving}
                                  type="button"
                                  onClick={cancelEdit}
                                >
                                  <X aria-hidden="true" size={16} />
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <button
                                className={secondaryButtonClass}
                                disabled={controlsDisabled}
                                type="button"
                                onClick={() => startEdit(officer)}
                              >
                                <Edit3 aria-hidden="true" size={16} />
                                Edit
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlockUserManagement;
