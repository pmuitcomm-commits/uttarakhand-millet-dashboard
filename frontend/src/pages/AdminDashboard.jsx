/**
 * AdminDashboard page - Administrative overview for system-level MIS users.
 */

import React from "react";

import RoleDashboard from "../components/RoleDashboard";

/**
 * AdminDashboard - Render the admin-only dashboard placeholder.
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
      featureTitle="Admin Features:"
      features={() => [
        "✓ Manage all users (Admin, District Officers, Block Officers)",
        "✓ View system-wide data",
        "✓ Update user roles and permissions",
        "✓ Access all district and block information",
        "✓ Generate system reports",
        "✓ System configuration and settings",
      ]}
    />
  );
}

export default AdminDashboard;
