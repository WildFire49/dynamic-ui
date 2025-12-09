"use client";

import { ROLES } from "../config/roleConfig";
import apiClient from "./apiClient";
import notificationManager from "@/utils/notificationManager";

// Parse product codes from environment variable
// Format: CODE|Label|ClientID|SecretKey (pipe-separated, comma between products)
const parseProductCodes = () => {
  const envCodes = process.env.NEXT_PUBLIC_PRODUCT_CODES || "";
  if (!envCodes) {
    // Default fallback
    return [
      {
        code: "MIFIX-AI",
        label: "MiFiX AI",
        clientId: "cli-1a1abfd3-05c8-4e28-b2aa-6c597b77163c",
        secretKey: "Zn6WlZiewaBMJCydrqm8TdlgKOX/+MoAXP+D/gG8mTo=",
      },
    ];
  }

  return envCodes
    .split(",")
    .map((item) => {
      const [code, label, clientId, secretKey] = item.split("|");
      return { code, label, clientId, secretKey };
    })
    .filter((p) => p.code && p.clientId && p.secretKey);
};

// Authentication service with API integration
// Note: This service handles auth-specific logic like token storage and user management
// For general API calls with bearer token, use apiClient directly
class AuthService {
  constructor() {
    // SSO URL from env or fallback
    this.ssoBaseURL =
      process.env.NEXT_PUBLIC_SSO_BASE_URL ||
      "https://ams-uat.mifix.io/idp/sso";
    this.productCodes = parseProductCodes();
    // Default to first product code (MIFIX-AI)
    const defaultProduct = this.productCodes[0];
    this.clientId = defaultProduct?.clientId;
    this.secretKey = defaultProduct?.secretKey;
    this.productCode = defaultProduct?.code;
  }

  // Check if a string is a UUID (contains hyphens in UUID format)
  isUUID(str) {
    if (!str || typeof str !== "string") return false;
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  // Get available product codes for dropdown
  getProductCodes() {
    return this.productCodes;
  }

  // Set active product code
  setProductCode(code) {
    const product = this.productCodes.find((p) => p.code === code);
    if (product) {
      this.clientId = product.clientId;
      this.secretKey = product.secretKey;
      this.productCode = product.code;
      // Store selected product code
      localStorage.setItem("selectedProductCode", code);
    }
  }

  // Get current product code
  getCurrentProductCode() {
    if (typeof window === "undefined") return this.productCode;
    return localStorage.getItem("selectedProductCode") || this.productCode;
  }

  // Login API call
  async login(username, password, productCode = null) {
    // If product code provided, set it
    if (productCode) {
      this.setProductCode(productCode);
    }
    try {
      // Use SSO endpoint for login with product-specific credentials
      const response = await fetch(`${this.ssoBaseURL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          clientId: this.clientId,
          secretKey: this.secretKey,
          productCode: this.productCode,
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      // SSO API returns { status: 200, data: { message, data: { accessToken, refreshToken, ... } } }
      const isSuccess = data.status === 200 || data.success;
      const responseData = data.data?.data || data.data;

      if (isSuccess && responseData) {
        // Handle SSO response format (camelCase) or standard format (snake_case)
        const accessToken =
          responseData.accessToken || responseData.access_token;
        const refreshToken =
          responseData.refreshToken || responseData.refresh_token;
        const accessTokenExpiry =
          responseData.accessTokenExpiry || responseData.access_token_expiry;

        // Store tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessTokenExpiry", accessTokenExpiry);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("username", username);
        localStorage.setItem("selectedProductCode", this.productCode);

        // Call verify API to get user roles and info
        const verifyResult = await this.verifyToken(accessToken);

        if (verifyResult.success) {
          notificationManager.success("Login successful");
          return {
            success: true,
            data: {
              ...responseData,
              userInfo: verifyResult.data,
            },
            message: data.data?.message || "Login successful",
          };
        } else {
          // Verify failed but login succeeded - still allow access with limited info
          console.warn("Token verify failed, using basic user info");
          const basicUserInfo = {
            username: username,
            roles: [{ roleCode: "USER", roleName: "User", roleId: "default" }],
          };
          localStorage.setItem("userInfo", JSON.stringify(basicUserInfo));
          localStorage.setItem("roles", JSON.stringify(basicUserInfo.roles));
          localStorage.setItem("roleCode", "USER");

          notificationManager.success("Login successful");
          return {
            success: true,
            data: {
              ...responseData,
              userInfo: basicUserInfo,
            },
            message: "Login successful",
          };
        }
      } else {
        // Show error notification
        const errorMessage =
          data.data?.message || data.message || "Login failed";
        notificationManager.error(errorMessage);
        return {
          success: false,
          message: errorMessage,
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

  // Verify token and get user info (calls SSO verify endpoint)
  async verifyToken(token = null) {
    try {
      const tokenToVerify = token || localStorage.getItem("accessToken");

      if (!tokenToVerify) {
        return { success: false, message: "No token found" };
      }

      // Call SSO verify endpoint - POST with token in body
      const response = await fetch(`${this.ssoBaseURL}/token/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          clientId: this.clientId,
          secretKey: this.secretKey,
          productCode: this.productCode,
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      // SSO verify returns { status: 200, data: { message, data: { userId, username, roles, ... } } }
      const isSuccess = data.status === 200 || data.success;
      const userData = data.data?.data || data.data;

      if (isSuccess && userData) {
        // Store user info
        localStorage.setItem("userInfo", JSON.stringify(userData));
        if (userData.userId) localStorage.setItem("userId", userData.userId);

        // Only update username if it's a valid username (not a UUID)
        // UUIDs contain hyphens and are 36 characters long
        if (userData.username && !this.isUUID(userData.username)) {
          localStorage.setItem("username", userData.username);
        }

        // Store roles array
        if (userData.roles && userData.roles.length > 0) {
          localStorage.setItem("roles", JSON.stringify(userData.roles));

          // Store primary roleCode (first role)
          const primaryRole = userData.roles[0];
          localStorage.setItem(
            "roleCode",
            primaryRole.roleCode || primaryRole.code
          );
          localStorage.setItem(
            "roleName",
            primaryRole.roleName || primaryRole.name
          );
          localStorage.setItem("roleId", primaryRole.roleId || primaryRole.id);
        }

        return {
          success: true,
          data: userData,
          message: data.data?.message || "Token verified",
        };
      } else {
        return {
          success: false,
          message:
            data.data?.message || data.message || "Token verification failed",
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

  // Refresh token (uses SSO refresh endpoint)
  async refreshToken() {
    try {
      // Get refresh token from localStorage
      const refreshTokenValue = localStorage.getItem("refreshToken");

      if (!refreshTokenValue) {
        console.error("No refresh token found in localStorage");
        return { success: false, message: "No refresh token found" };
      }

      const response = await fetch(`${this.ssoBaseURL}/token/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          clientId: this.clientId,
          secretKey: this.secretKey,
          productCode: this.productCode,
        },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

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
      const isSuccess = data.status === 200 || data.success;
      const responseData = data.data?.data || data.data;

      if (isSuccess && responseData) {
        // Handle SSO response format (camelCase) or standard format (snake_case)
        const accessToken =
          responseData.accessToken || responseData.access_token;
        const newRefreshToken =
          responseData.refreshToken || responseData.refresh_token;
        const accessTokenExpiry =
          responseData.accessTokenExpiry || responseData.access_token_expiry;

        // Update tokens in localStorage
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("accessTokenExpiry", accessTokenExpiry);
        localStorage.setItem("refreshToken", newRefreshToken);

        console.log("✅ Token refreshed successfully");
        return {
          success: true,
          data: responseData,
          message: data.data?.message || "Token refreshed",
        };
      } else {
        console.error("Token refresh failed:", data.message);
        // Clear invalid refresh token
        localStorage.removeItem("refreshToken");
        return {
          success: false,
          message: data.data?.message || data.message || "Token refresh failed",
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
  // Returns null if the stored value is a UUID (invalid username)
  getUsername() {
    if (!this.isClient()) return null;
    const username = localStorage.getItem("username");
    // Don't return UUID as username
    if (username && this.isUUID(username)) {
      console.warn("Username in localStorage is a UUID, this is invalid");
      return null;
    }
    return username;
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

  // Change password API call
  async changePassword(oldPassword, newPassword, confirmPassword) {
    try {
      const token = this.getAccessToken();

      if (!token) {
        return {
          success: false,
          message: "No authentication token found. Please login again.",
        };
      }

      const response = await fetch(`${this.baseURL}/change/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          clientId: this.clientId,
          secretKey: this.secretKey,
          productCode: this.productCode,
        },
        body: JSON.stringify({
          token,
          oldPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success !== false) {
        notificationManager.success("Password changed successfully");
        return {
          success: true,
          message: data.message || "Password changed successfully",
        };
      } else {
        notificationManager.error(data.message || "Failed to change password");
        return {
          success: false,
          message: data.message || "Failed to change password",
        };
      }
    } catch (error) {
      console.error("Change password error:", error);
      notificationManager.error("Network error. Please try again.");
      return {
        success: false,
        message: "Network error. Please try again.",
      };
    }
  }

  // Logout
  logout() {
    if (!this.isClient()) return;

    // Clear ALL localStorage data to ensure clean state for new login
    localStorage.clear();

    // Also clear sessionStorage
    sessionStorage.clear();

    console.log("✅ Logged out - all local data cleared");
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

  // Clean up invalid username (UUID) from localStorage
  // Call this on app initialization to fix corrupted data
  cleanupInvalidUsername() {
    if (!this.isClient()) return;
    const username = localStorage.getItem("username");
    if (username && this.isUUID(username)) {
      console.warn(
        "Removing invalid UUID username from localStorage:",
        username
      );
      localStorage.removeItem("username");

      // Try to get username from userInfo if available
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (userInfo.username && !this.isUUID(userInfo.username)) {
          localStorage.setItem("username", userInfo.username);
          console.log("Restored username from userInfo:", userInfo.username);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }
}

// Export singleton instance
const authService = new AuthService();

// Run cleanup on module load (client-side only)
if (typeof window !== "undefined") {
  authService.cleanupInvalidUsername();
}

export default authService;
