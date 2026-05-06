/**
 * AdminDashboard page - Administrative overview for system-level MIS users.
 */

import React from "react";

import RoleDashboard from "../components/RoleDashboard";

/**
 * AdminDashboard - Render the admin-only dashboard shell.
 *
 * @component
 * @returns {React.ReactElement} Admin dashboard view.
 */
function AdminDashboard() {
  return (
    <RoleDashboard
      requiredRole="admin"
      title="Admin Dashboard"
      summary={() => "Admin Dashboard - User Management"}
    />
  );
}

export default AdminDashboard;
