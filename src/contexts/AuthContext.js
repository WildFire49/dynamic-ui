'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import { ROLES } from '../config/roleConfig';

const AuthContext = createContext({});

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

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, []);

  // Auto token refresh timer
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(async () => {
        await authService.ensureValidToken();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const initializeAuth = async () => {
    try {
      setLoading(true);
      
      const token = authService.getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }

      // Ensure token is valid
      const isValid = await authService.ensureValidToken();
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Verify token and get user info
      const verifyResult = await authService.verifyToken();
      if (verifyResult.success) {
        setUser(verifyResult.data);
        setIsAuthenticated(true);
      } else {
        authService.logout();
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setLoading(true);
      
      const loginResult = await authService.login(username, password);
      if (loginResult.success) {
        // Verify token to get user info
        const verifyResult = await authService.verifyToken();
        if (verifyResult.success) {
          setUser(verifyResult.data);
          setIsAuthenticated(true);
          return { success: true, message: loginResult.message };
        } else {
          return { success: false, message: 'Failed to verify user information' };
        }
      } else {
        return { success: false, message: loginResult.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'An error occurred during login' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUserInfo = async () => {
    try {
      const verifyResult = await authService.verifyToken();
      if (verifyResult.success) {
        setUser(verifyResult.data);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Refresh user info error:', error);
      logout();
      return false;
    }
  };

  // Helper functions for role checking
  const hasRole = (roleCode) => {
    return user?.roles?.some(role => role.roleCode === roleCode) || false;
  };

  const isSuperAdmin = () => {
    return hasRole(ROLES.SUPER_ADMIN);
  };

  const isRegularUser = () => {
    return hasRole(ROLES.RECON_USER) || hasRole(ROLES.RECON_CONFIGURATOR);
  };

  const getUserRoles = () => {
    return user?.roles?.map(role => role.roleCode) || [];
  };

  const getAccessibleMenuItems = () => {
    if (!isAuthenticated || !user) return [];

    // Base items for all authenticated users
    const baseItems = [
      { id: 'chat', label: 'Chat', icon: 'ChatIcon' },
      { id: 'dashboard', label: 'Dashboard', icon: 'DashboardIcon' },
    ];

    // Super Admin gets access to all items
    if (isSuperAdmin()) {
      return [
        ...baseItems,
        { id: 'configurator', label: 'Configurator', icon: 'ConfiguratorIcon' },
        { id: 'accessControl', label: 'Access Control', icon: 'AccessControlIcon' },
        { id: 'settings', label: 'Settings', icon: 'SettingsIcon' },
      ];
    }

    // Regular users only get base items
    return baseItems;
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    refreshUserInfo,
    hasRole,
    isSuperAdmin,
    isRegularUser,
    getUserRoles,
    getAccessibleMenuItems,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
