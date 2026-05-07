/**
 * DistrictDashboard page - District officer workspace for the Millet MIS.
 */

import React, { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { useLocation } from "react-router-dom";

import PhaseOneProgressTracker from "../components/PhaseOneProgressTracker";
import RoleDashboard from "../components/RoleDashboard";
import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";
import {
  getDistrictOfficerDetails,
  updateDistrictOfficerDetails,
} from "../services/api";

const mobilePattern = /^\d{10}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const emptyDetails = {
  full_name: "",
  mobile: "",
  email: "",
};

const buttonBaseClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50";

const primaryButtonClass =
  `${buttonBaseClass} border-[#024b37] bg-[#024b37] text-white hover:bg-[#035344]`;

const textInputClass =
  "h-10 w-full min-w-0 rounded-md border border-[#cbd8d3] bg-white px-3 text-sm font-medium text-[#024b37] outline-none focus:border-[#66b9ac] focus:ring-2 focus:ring-[#66b9ac]/30 dark:border-[#444444] dark:bg-[#1f2937] dark:text-white";

function formatApiError(error) {
  const detail = error?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg || item.detail || "Invalid data").join("; ");
  }
  return detail || error?.message || "Unable to update district officer details.";
}

function makeDetails(user) {
  return {
    full_name: user?.full_name || "",
    mobile: user?.mobile || "",
    email: user?.email || "",
  };
}

function validateDetails(details) {
  const errors = {};
  const fullName = details.full_name.trim();
  const mobile = details.mobile.trim();
  const email = details.email.trim();

  if (!fullName) {
    errors.full_name = "Name is required.";
  }
  if (!mobilePattern.test(mobile)) {
    errors.mobile = "Mobile number must be exactly 10 digits.";
  }
  if (email && !emailPattern.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

function DistrictOfficerDetailsCard() {
  const { updateUser } = useAuth();
  const [details, setDetails] = useState(emptyDetails);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;

    async function loadDetails() {
      setLoading(true);
      setStatus({ type: "", text: "" });

      try {
        const response = await getDistrictOfficerDetails();
        if (!mounted) return;
        setDetails(makeDetails(response.data?.user));
        setErrors({});
      } catch (error) {
        if (!mounted) return;
        setStatus({ type: "error", text: formatApiError(error) });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDetails();

    return () => {
      mounted = false;
    };
  }, []);

  const updateDetails = (field, value) => {
    setDetails((currentDetails) => ({
      ...currentDetails,
      [field]: field === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: "" }));
    setStatus({ type: "", text: "" });
  };

  const saveDetails = async () => {
    const nextErrors = validateDetails(details);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus({ type: "error", text: "Fix the highlighted fields before saving." });
      return;
    }

    setSaving(true);
    setStatus({ type: "", text: "" });

    try {
      const response = await updateDistrictOfficerDetails({
        full_name: details.full_name.trim(),
        mobile: details.mobile.trim(),
        email: details.email.trim() || null,
      });
      const updatedUser = response.data?.user;
      setDetails(makeDetails(updatedUser));
      updateUser(updatedUser);
      setErrors({});
      setStatus({ type: "success", text: "District officer details updated successfully." });
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

  return (
    <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="400">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-lg font-extrabold text-[#024b37] dark:text-white">
          District Officer Details
        </h3>
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
          Loading district officer details...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1">
            <label className="min-w-0 text-sm font-bold text-[#024b37] dark:text-white">
              <span className="mb-2 block">Name</span>
              <input
                className={textInputClass}
                disabled={saving}
                type="text"
                value={details.full_name}
                onChange={(event) => updateDetails("full_name", event.target.value)}
              />
              {errors.full_name ? (
                <span className="mt-1 block text-xs font-bold text-red-700 dark:text-red-200">
                  {errors.full_name}
                </span>
              ) : null}
            </label>

            <label className="min-w-0 text-sm font-bold text-[#024b37] dark:text-white">
              <span className="mb-2 block">Email ID</span>
              <input
                className={textInputClass}
                disabled={saving}
                type="email"
                value={details.email}
                onChange={(event) => updateDetails("email", event.target.value)}
              />
              {errors.email ? (
                <span className="mt-1 block text-xs font-bold text-red-700 dark:text-red-200">
                  {errors.email}
                </span>
              ) : null}
            </label>

            <label className="min-w-0 text-sm font-bold text-[#024b37] dark:text-white">
              <span className="mb-2 block">Mobile Number</span>
              <input
                className={textInputClass}
                disabled={saving}
                inputMode="numeric"
                maxLength="10"
                type="text"
                value={details.mobile}
                onChange={(event) => updateDetails("mobile", event.target.value)}
              />
              {errors.mobile ? (
                <span className="mt-1 block text-xs font-bold text-red-700 dark:text-red-200">
                  {errors.mobile}
                </span>
              ) : null}
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button
              className={primaryButtonClass}
              disabled={saving}
              type="button"
              onClick={saveDetails}
            >
              <Save aria-hidden="true" size={16} />
              {saving ? "Saving..." : "Save/Update"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function DistrictReportsSection() {
  const { user } = useAuth();

  return (
    <div className={dashboardClasses.pageWrapper}>
      <div className={dashboardClasses.dashboardContainer}>
        <Sidebar />
        <div className={dashboardClasses.mainContent}>
          <div className={dashboardClasses.pageHeadingRow} data-aos="fade-up">
            <h2 className={dashboardClasses.pageHeadingTitle}>District Reports</h2>
            <div className="mt-3 text-sm font-bold text-[#4a5f58] dark:text-slate-200">
              District: {user?.district || "Not assigned"}
            </div>
          </div>

          <div className={dashboardClasses.tableCard} data-aos="fade-up" data-aos-delay="200">
            <PhaseOneProgressTracker />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * DistrictDashboard - Render the district officer dashboard shell.
 *
 * @component
 * @returns {React.ReactElement} District officer dashboard view.
 */
function DistrictDashboard() {
  const location = useLocation();

  if (location.hash === "#district-reports") {
    return <DistrictReportsSection />;
  }

  return (
    <RoleDashboard
      requiredRole="district"
      title="District Officer Dashboard"
      summary={(user) => `District: ${user?.district || "Not assigned"}`}
    >
      <DistrictOfficerDetailsCard />
    </RoleDashboard>
  );
}

export default DistrictDashboard;
