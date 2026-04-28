/**
 * AuthContext module - Provides client-side authentication state for MIS pages.
 *
 * The context verifies stored JWT sessions against the backend, exposes logout
 * behavior, and provides role/scope helpers used by protected dashboard routes.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthSession, getAuthToken, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * AuthProvider - Hydrates and exposes the current authenticated user session.
 *
 * The provider verifies the stored token through /auth/me before marking a user
 * authenticated, preventing stale localStorage data from unlocking officer
 * screens.
 *
 * @component
 * @param {Object} props - Provider properties.
 * @param {React.ReactNode} props.children - Application subtree.
 * @returns {React.ReactElement} Authentication context provider.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check whether a stored token still maps to an active backend user.
    const checkAuth = async () => {
      const token = getAuthToken();

      if (token) {
        try {
          // Verify token is still valid and normalize roles for comparisons.
          const response = await getCurrentUser();
          if (response.data.role) {
            response.data.role = response.data.role.toLowerCase();
          }
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Invalid or expired tokens are removed to avoid false access states.
          clearAuthSession();
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roles) => {
    // Accept both a single role and an array of roles for route guards.
    if (typeof roles === 'string') {
      return user?.role === roles;
    }
    return roles.includes(user?.role);
  };

  const canAccessDistrict = (districtName) => {
    // Admins can review all districts; district officers are scoped by assignment.
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.district === districtName;
  };

  const canAccessBlock = (blockName) => {
    // Block scope is intentionally stricter than district scope for local records.
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'district') return true;
    return user.block === blockName;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    logout,
    hasRole,
    canAccessDistrict,
    canAccessBlock,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
