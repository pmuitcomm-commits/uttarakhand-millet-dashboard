/**
 * DistrictDashboard page - District officer workspace for the Millet MIS.
 */

import React from "react";

import RoleDashboard from "../components/RoleDashboard";

/**
 * DistrictDashboard - Render the district officer dashboard placeholder.
 *
 * @component
 * @returns {React.ReactElement} District officer dashboard view.
 */
function DistrictDashboard() {
  return (
    <RoleDashboard
      requiredRole="district"
      title="District Officer Dashboard"
      summary={(user) => `District: ${user?.district || "Not assigned"}`}
      featureTitle="District Officer Features:"
      features={(user) => [
        `✓ Manage block officers in ${user?.district || "your district"}`,
        "✓ View district-wise procurement data",
        "✓ View district-wise production data",
        "✓ Manage farmers in the district",
        "✓ Generate district reports",
        "✓ Monitor block officer activities",
      ]}
    />
  );
}

export default DistrictDashboard;
