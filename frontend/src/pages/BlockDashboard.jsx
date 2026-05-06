/**
 * BlockDashboard page - Block officer workspace for the Millet MIS.
 */

import React from "react";

import RoleDashboard from "../components/RoleDashboard";

/**
 * BlockDashboard - Render the block officer dashboard shell.
 *
 * @component
 * @returns {React.ReactElement} Block officer dashboard view.
 */
function BlockDashboard() {
  return (
    <RoleDashboard
      requiredRole="block"
      title="Block Officer Dashboard"
      summary={(user) => `District: ${user?.district || "Not assigned"}`}
    />
  );
}

export default BlockDashboard;
