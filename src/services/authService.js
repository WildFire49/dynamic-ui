"use client";

import { ROLES } from "../config/roleConfig";

// Authentication service with API integration
class AuthService {
  constructor() {
    this.baseURL = "https://ams-uat.mifix.io/idp/sso";
    this.clientId = "cli-1a1abfd3-05c8-4e28-b2aa-6c597b77163c";
    this.secretKey = "Zn6WlZiewaBMJCydrqm8TdlgKOX/+MoAXP+D/gG8mTo=";
    this.productCode = "MIFIX-AI";
  }

  // Default headers for API calls
  getHeaders() {
    return {
      "Content-Type": "application/json",
      clientId: this.clientId,
      secretKey: this.secretKey,
      productCode: this.productCode,
    };
  }

  // Login API call
  async login(username, password) {
    try {
      const response = await fetch(`${this.baseURL}/login`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        // Store tokens and username in localStorage
        localStorage.setItem("accessToken", data.data.data.accessToken);
        localStorage.setItem("refreshToken", data.data.data.refreshToken);
        localStorage.setItem(
          "accessTokenExpiry",
          data.data.data.accessTokenExpiry
        );
        localStorage.setItem("username", username); // Store the username used for login

        return {
          success: true,
          data: data.data.data,
          message: data.data.message,
        };
      } else {
        return {
          success: false,
          message: data.message || "Login failed",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
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

      const response = await fetch(`${this.baseURL}/token/verify`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ token: tokenToVerify }),
      });

      const data = await response.json();

      if (data.status === 200) {
        // Store user info
        localStorage.setItem("userInfo", JSON.stringify(data.data.data));

        // Store roleCode from the first role in roles array
        if (data.data.data.roles && data.data.data.roles.length > 0) {
          const roleCode = data.data.data.roles[0].roleCode;
          localStorage.setItem("roleCode", roleCode);
        }

        return {
          success: true,
          data: data.data.data,
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
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        return { success: false, message: "No refresh token found" };
      }

      const response = await fetch(`${this.baseURL}/token/refresh`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.status === 200) {
        // Update access token
        localStorage.setItem("accessToken", data.data.data.accessToken);

        return {
          success: true,
          data: data.data.data,
          message: data.data.message,
        };
      } else {
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
    const expiry = localStorage.getItem("accessTokenExpiry");
    if (!expiry) return true;

    return Date.now() >= parseInt(expiry);
  }

  // Get current user info
  getCurrentUser() {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
  }

  // Get user roles
  getUserRoles() {
    const user = this.getCurrentUser();
    return user?.roles || [];
  }

  // Check if user has specific role
  hasRole(roleCode) {
    const roles = this.getUserRoles();
    return roles.some((role) => role.roleCode === roleCode);
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
    return localStorage.getItem("accessToken");
  }

  // Get roleCode from localStorage
  getRoleCode() {
    return localStorage.getItem("roleCode");
  }

  // Get username from localStorage
  getUsername() {
    return localStorage.getItem("username");
  }

  // Logout
  logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("accessTokenExpiry");
    localStorage.removeItem("userInfo");
    localStorage.removeItem("roleCode");
    localStorage.removeItem("username");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    return token && !this.isTokenExpired();
  }

  // Auto refresh token if needed
  async ensureValidToken() {
    if (this.isTokenExpired()) {
      const refreshResult = await this.refreshToken();
      if (!refreshResult.success) {
        this.logout();
        return false;
      }
    }
    return true;
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
