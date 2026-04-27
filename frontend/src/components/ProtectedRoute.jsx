/**
 * ProtectedRoute component module - Generic route guard for authenticated UI.
 *
 * This component is available for pages that need authentication and optional
 * role checks beyond the officer-specific route guard in App.js.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute - Enforce authentication and optional role membership.
 *
 * @component
 * @param {Object} props - Route guard properties.
 * @param {React.ReactNode} props.children - Protected page content.
 * @param {string|string[]|null} props.requiredRoles - Allowed role or roles.
 * @returns {React.ReactElement} Protected content, redirect, or denial state.
 */
export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="p-5 text-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      /* Centered Tailwind denial state is intentionally plain for audit clarity. */
      <div className="min-h-screen bg-red-50 px-5 py-10 text-center">
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required roles: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
