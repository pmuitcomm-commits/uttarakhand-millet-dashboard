/**
 * BlockDashboard page - Block officer workspace for the Millet MIS.
 */

import React from "react";

import RoleDashboard from "../components/RoleDashboard";

/**
 * BlockDashboard - Render the block officer dashboard placeholder.
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
      featureTitle="Block Officer Features:"
      features={() => [
        "✓ View block-wise procurement data",
        "✓ View block-wise production data",
        "✓ Manage farmers in the block",
        "✓ View farmer details and records",
        "✓ Generate block reports",
        "✓ Monitor block activities",
        "✓ Read-only access (no user management)",
      ]}
    />
  );
}

export default BlockDashboard;
