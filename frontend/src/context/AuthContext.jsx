/**
 * AuthContext module - Provides client-side authentication state for MIS pages.
 *
 * The context verifies cookie sessions against the backend, exposes logout
 * behavior, and provides role/scope helpers used by protected dashboard routes.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearAuthSession, getCurrentUser, logoutUser } from '../services/api';

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
 * The provider verifies the session cookie through /auth/me before marking a
 * user authenticated.
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
    // Clear legacy bearer-token storage and hydrate from the HttpOnly cookie.
    const checkAuth = async () => {
      clearAuthSession();

      try {
        const response = await getCurrentUser();
        if (response.data.role) {
          response.data.role = response.data.role.toLowerCase();
        }
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setIsAuthenticated(false);
    logoutUser().catch(() => {});
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
