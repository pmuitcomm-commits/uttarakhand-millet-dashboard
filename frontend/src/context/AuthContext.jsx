import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('userInfo');

      if (token && storedUser) {
        try {
          // Verify token is still valid
          const response = await getCurrentUser();
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('userRole');
          setUser(null);
          setIsAuthenticated(false);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userRole');
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roles) => {
    if (typeof roles === 'string') {
      return user?.role === roles;
    }
    return roles.includes(user?.role);
  };

  const canAccessDistrict = (districtName) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.district === districtName;
  };

  const canAccessBlock = (blockName) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'district_officer') return true;
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
