/**
 * DistrictDashboard page - District officer workspace for the Millet MIS.
 */

import React from "react";
import { useLocation } from "react-router-dom";

import PhaseOneProgressTracker from "../components/PhaseOneProgressTracker";
import RoleDashboard from "../components/RoleDashboard";
import Sidebar from "../components/Sidebar";
import { dashboardClasses } from "../components/dashboardStyles";
import { useAuth } from "../context/AuthContext";

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
    />
  );
}

export default DistrictDashboard;
