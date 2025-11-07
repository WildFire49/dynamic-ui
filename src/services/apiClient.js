"use client";

/**
 * Common API Client Service
 * Centralized API service with authentication and error handling
 * 
 * This is the SINGLE source for making authenticated API calls across the app.
 * It automatically adds Bearer token from localStorage to all requests.
 * 
 * Usage:
 *   import apiClient from '@/services/apiClient';
 *   const data = await apiClient.get('/api/endpoint');
 *   const result = await apiClient.post('/api/endpoint', { data });
 * 
 * Note: authService.js handles authentication-specific logic (login, token refresh, logout)
 *       All other services should use this apiClient for API calls.
 */

import { API_BASE_URL } from '@/lib/config';

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * Get headers with bearer token for authenticated requests
   * @param {Object} additionalHeaders - Additional headers to merge
   * @returns {Object} Headers object with authorization
   */
  getHeaders(additionalHeaders = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    const headers = {
      "Content-Type": "application/json",
      ...additionalHeaders,
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return headers;
  }

  /**
   * Handle API response
   * @param {Response} response - Fetch response object
   * @param {boolean} isRetry - Whether this is a retry after token refresh
   * @returns {Promise<any>} Parsed response data
   */
  async handleResponse(response, isRetry = false) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      // If unauthorized and not a retry, attempt token refresh
      if (response.status === 401 && !isRetry) {
        console.log("401 Unauthorized - attempting token refresh...");
        
        // Dynamically import authService to avoid circular dependency
        const authService = (await import('./authService')).default;
        
        if (authService.hasRefreshToken()) {
          const refreshResult = await authService.refreshToken();
          if (refreshResult.success) {
            console.log("Token refreshed, will retry request");
            // Return a special marker to indicate retry is needed
            return { __shouldRetry: true };
          }
        }
        
        console.error("Token refresh failed or no refresh token available");
        // Logout user if refresh fails
        authService.logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async get(endpoint, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "GET",
        headers: this.getHeaders(options.headers),
        ...options,
      });
      
      const result = await this.handleResponse(response, options.__isRetry);
      
      // If token was refreshed, retry the request
      if (result && result.__shouldRetry) {
        console.log("Retrying GET request with new token...");
        return this.get(endpoint, { ...options, __isRetry: true });
      }
      
      return result;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async post(endpoint, data = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });
      
      const result = await this.handleResponse(response, options.__isRetry);
      
      // If token was refreshed, retry the request
      if (result && result.__shouldRetry) {
        console.log("Retrying POST request with new token...");
        return this.post(endpoint, data, { ...options, __isRetry: true });
      }
      
      return result;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async put(endpoint, data = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * PATCH request
   * @param {string} endpoint - API endpoint
   * @param {Object} data - Request body data
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async patch(endpoint, data = {}, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: this.getHeaders(options.headers),
        body: JSON.stringify(data),
        ...options,
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`PATCH ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async delete(endpoint, options = {}) {
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(options.headers),
        ...options,
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  /**
   * Upload file(s) with multipart/form-data
   * @param {string} endpoint - API endpoint
   * @param {FormData} formData - FormData object with files
   * @param {Object} options - Additional fetch options
   * @returns {Promise<any>} Response data
   */
  async upload(endpoint, formData, options = {}) {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
      const headers = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      // Don't set Content-Type for FormData - browser will set it with boundary
      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { ...headers, ...options.headers },
        body: formData,
        ...options,
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error(`UPLOAD ${endpoint} failed:`, error);
      throw error;
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
