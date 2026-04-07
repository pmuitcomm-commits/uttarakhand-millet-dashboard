import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requiredRoles = null }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRoles && !hasRole(requiredRoles)) {
    return (
      <div style={{ 
        padding: '40px 20px', 
        textAlign: 'center',
        backgroundColor: '#fee',
        minHeight: '100vh'
      }}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Required roles: {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
