'use client';

import { useState, useCallback, useEffect } from 'react';
import uiConfiguratorService from '@/services/uiConfiguratorService';
import authService from '@/services/authService';

/**
 * Custom hook for managing component library
 * @returns {Object} Component library state and methods
 */
export const useComponentLibrary = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load component library for current user
   */
  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const username = authService.getUsername();
      if (!username) {
        console.warn('No username found, using default user');
        // You can set a default user or return empty
        setComponents([]);
        return;
      }

      const library = await uiConfiguratorService.getComponentLibrary(username);
      setComponents(library);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load component library:', err);
      // Set empty array on error to prevent UI breaks
      setComponents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh library
   */
  const refreshLibrary = useCallback(() => {
    loadLibrary();
  }, [loadLibrary]);

  /**
   * Load initial library on mount
   */
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return {
    components,
    loading,
    error,
    loadLibrary,
    refreshLibrary,
  };
};
