"use client";

import { ROLES } from "../config/roleConfig";
import apiClient from "./apiClient";
import notificationManager from "@/utils/notificationManager";

// Authentication service with API integration
// Note: This service handles auth-specific logic like token storage and user management
// For general API calls with bearer token, use apiClient directly
class AuthService {
  constructor() {
    this.baseURL = "https://ams-uat.mifix.io/idp/sso";
    this.clientId = "cli-1a1abfd3-05c8-4e28-b2aa-6c597b77163c";
    this.secretKey = "Zn6WlZiewaBMJCydrqm8TdlgKOX/+MoAXP+D/gG8mTo=";
    this.productCode = "MIFIX-AI";
  }

  // Login API call
  async login(username, password) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Store access token in localStorage
        localStorage.setItem("accessToken", data.data.access_token);
        localStorage.setItem(
          "accessTokenExpiry",
          data.data.access_token_expiry
        );

        // Store refresh token in localStorage (persists across sessions)
        localStorage.setItem("refreshToken", data.data.refresh_token);

        // Store user info from user_data if available
        if (data.data.user_data) {
          const userData = data.data.user_data;
          localStorage.setItem("userInfo", JSON.stringify(userData));
          localStorage.setItem("userId", userData.userId);
          localStorage.setItem("username", userData.username);

          // Store roles array
          if (userData.roles && userData.roles.length > 0) {
            localStorage.setItem("roles", JSON.stringify(userData.roles));

            // Store primary roleCode (first role)
            const primaryRole = userData.roles[0];
            localStorage.setItem("roleCode", primaryRole.roleCode);
            localStorage.setItem("roleName", primaryRole.roleName);
            localStorage.setItem("roleId", primaryRole.roleId);
          }

          // Show success notification
          notificationManager.success("Login successful");

          return {
            success: true,
            data: {
              ...data.data,
              userInfo: userData,
            },
            message: data.message,
          };
        } else {
          // Fallback: user_data not in response, store basic info
          localStorage.setItem("username", username);
          localStorage.setItem("userId", data.data.user_id);

          // Show success notification
          notificationManager.success("Login successful");

          return {
            success: true,
            data: data.data,
            message: data.message,
          };
        }
      } else {
        // Show error notification
        notificationManager.error(data.message || "Login failed");
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      notificationManager.error("Network error. Please try again.");
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Verify token and get user info
  async verifyToken(token = null) {
    try {
      const tokenToVerify = token || localStorage.getItem("accessToken");

      if (!tokenToVerify) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: tokenToVerify }),
        }
      );

      const data = await response.json();

      if (data.status === 200 && data.data) {
        // Store user info
        const userData = data.data.data;
        localStorage.setItem("userInfo", JSON.stringify(userData));
        localStorage.setItem("userId", userData.userId);
        localStorage.setItem("username", userData.username);

        // Store roles array
        if (userData.roles && userData.roles.length > 0) {
          localStorage.setItem("roles", JSON.stringify(userData.roles));

          // Store primary roleCode (first role)
          const primaryRole = userData.roles[0];
          localStorage.setItem("roleCode", primaryRole.roleCode);
          localStorage.setItem("roleName", primaryRole.roleName);
          localStorage.setItem("roleId", primaryRole.roleId);
        }

        return {
          success: true,
          data: userData,
          message: data.data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || "Token verification failed",
        };
      }
    } catch (error) {
      console.error("Token verification error:", error);
      return {
        success: false,
        message: "Network error during token verification",
      };
    }
  }

  // Refresh token
  async refreshToken() {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found in localStorage");
        return { success: false, message: "No refresh token found" };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/refresh`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );

      // Check if response is ok
      if (!response.ok) {
        console.error("Token refresh failed with status:", response.status);
        // If 401, refresh token is invalid, clear it
        if (response.status === 401) {
          localStorage.removeItem("refreshToken");
        }
        return {
          success: false,
          message: `Token refresh failed with status ${response.status}`,
        };
      }

      const data = await response.json();

      if (data.success) {
        // Update access token in localStorage
        localStorage.setItem("accessToken", data.data.access_token);
        localStorage.setItem(
          "accessTokenExpiry",
          data.data.access_token_expiry
        );

        // Update refresh token in localStorage
        localStorage.setItem("refreshToken", data.data.refresh_token);

        // Update userId if provided
        if (data.data.user_id) {
          localStorage.setItem("userId", data.data.user_id);
        }

        console.log("✅ Token refreshed successfully");
        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } else {
        console.error("Token refresh failed:", data.message);
        // Clear invalid refresh token
        localStorage.removeItem("refreshToken");
        return {
          success: false,
          message: data.message || "Token refresh failed",
        };
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return {
        success: false,
        message: "Network error during token refresh",
      };
    }
  }

  // Check if token is expired
  isTokenExpired() {
    if (!this.isClient()) return true;
    const expiry = localStorage.getItem("accessTokenExpiry");
    if (!expiry) return true;

    return Date.now() >= parseInt(expiry);
  }

  // Get current user info
  getCurrentUser() {
    if (!this.isClient()) return null;
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Get user roles from localStorage
  getUserRoles() {
    if (!this.isClient()) return [];
    const rolesJson = localStorage.getItem("roles");
    return rolesJson ? JSON.parse(rolesJson) : [];
  }

  // Check if user has specific role by roleCode
  hasRole(roleCode) {
    const roles = this.getUserRoles();
    return roles.some((role) => role.roleCode === roleCode);
  }

  // Check if user has specific role by roleName
  hasRoleName(roleName) {
    const roles = this.getUserRoles();
    return roles.some((role) => role.roleName === roleName);
  }

  // Get all role codes
  getRoleCodes() {
    const roles = this.getUserRoles();
    return roles.map((role) => role.roleCode);
  }

  // Get primary role (first role)
  getPrimaryRole() {
    const roles = this.getUserRoles();
    return roles.length > 0 ? roles[0] : null;
  }

  // Check if user is Super Admin
  isSuperAdmin() {
    return this.hasRole(ROLES.SUPER_ADMIN);
  }

  // Check if user is Regular User
  isRegularUser() {
    return (
      this.hasRole(ROLES.RECON_USER) || this.hasRole(ROLES.RECON_CONFIGURATOR)
    );
  }

  // Get access token
  getAccessToken() {
    if (!this.isClient()) return null;
    return localStorage.getItem("accessToken");
  }

  // Get primary roleCode from localStorage
  getRoleCode() {
    if (!this.isClient()) return null;
    return localStorage.getItem("roleCode");
  }

  // Get primary roleName from localStorage
  getRoleName() {
    if (!this.isClient()) return null;
    return localStorage.getItem("roleName");
  }

  // Get primary roleId from localStorage
  getRoleId() {
    if (!this.isClient()) return null;
    return localStorage.getItem("roleId");
  }

  // Get username from localStorage
  getUsername() {
    if (!this.isClient()) return null;
    return localStorage.getItem("username");
  }

  // Helper function to check if we're on the client side
  isClient() {
    return typeof window !== "undefined" && typeof localStorage !== "undefined";
  }

  // Get user ID
  getUserId() {
    if (!this.isClient()) return null;
    return localStorage.getItem("userId");
  }

  // Get refresh token from sessionStorage
  getRefreshToken() {
    if (!this.isClient()) return null;
    return sessionStorage.getItem("refreshToken");
  }

  // Logout
  logout() {
    if (!this.isClient()) return;
    // Clear localStorage
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accessTokenExpiry");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("roles");
    localStorage.removeItem("roleCode");
    localStorage.removeItem("roleName");
    localStorage.removeItem("roleId");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");

    // Clear refresh token from localStorage
    localStorage.removeItem("refreshToken");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    return token && !this.isTokenExpired();
  }

  // Auto refresh token if needed
  async ensureValidToken() {
    // Check if we have a refresh token first
    if (!this.hasRefreshToken()) {
      console.log("No refresh token available, cannot refresh");
      return false;
    }

    if (this.isTokenExpired()) {
      console.log("Token expired, attempting to refresh...");
      const refreshResult = await this.refreshToken();
      if (!refreshResult.success) {
        console.error("Token refresh failed, logging out user");
        this.logout();
        return false;
      }
      console.log("✅ Token refreshed successfully");
    }
    return true;
  }

  // Check if refresh token exists
  hasRefreshToken() {
    if (!this.isClient()) return false;
    return !!localStorage.getItem("refreshToken");
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
