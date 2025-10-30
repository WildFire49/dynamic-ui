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
        
        // Store refresh token in sessionStorage (persists only for session)
        sessionStorage.setItem("refreshToken", data.data.refresh_token);
        
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
          
          return {
            success: true,
            data: data.data,
            message: data.message,
          };
        }
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
      // Get refresh token from sessionStorage
      const refreshToken = sessionStorage.getItem("refreshToken");

      if (!refreshToken) {
        console.error("No refresh token found in sessionStorage");
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

      const data = await response.json();

      if (data.success) {
        // Update access token in localStorage
        localStorage.setItem("accessToken", data.data.access_token);
        localStorage.setItem(
          "accessTokenExpiry",
          data.data.access_token_expiry
        );
        
        // Update refresh token in sessionStorage
        sessionStorage.setItem("refreshToken", data.data.refresh_token);
        
        // Update userId if provided
        if (data.data.user_id) {
          localStorage.setItem("userId", data.data.user_id);
        }

        console.log("Token refreshed successfully");
        return {
          success: true,
          data: data.data,
          message: data.message,
        };
      } else {
        console.error("Token refresh failed:", data.message);
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

  // Get user roles from localStorage
  getUserRoles() {
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
    return localStorage.getItem("accessToken");
  }

  // Get primary roleCode from localStorage
  getRoleCode() {
    return localStorage.getItem("roleCode");
  }

  // Get primary roleName from localStorage
  getRoleName() {
    return localStorage.getItem("roleName");
  }

  // Get primary roleId from localStorage
  getRoleId() {
    return localStorage.getItem("roleId");
  }

  // Get username from localStorage
  getUsername() {
    return localStorage.getItem("username");
  }

  // Get user ID
  getUserId() {
    return localStorage.getItem("userId");
  }

  // Get refresh token from sessionStorage
  getRefreshToken() {
    return sessionStorage.getItem("refreshToken");
  }

  // Logout
  logout() {
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
    
    // Clear sessionStorage
    sessionStorage.removeItem("refreshToken");
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getAccessToken();
    return token && !this.isTokenExpired();
  }

  // Auto refresh token if needed
  async ensureValidToken() {
    if (this.isTokenExpired()) {
      console.log("Token expired, attempting to refresh...");
      const refreshResult = await this.refreshToken();
      if (!refreshResult.success) {
        console.error("Token refresh failed, logging out user");
        this.logout();
        return false;
      }
      console.log("Token refreshed successfully");
    }
    return true;
  }

  // Check if refresh token exists
  hasRefreshToken() {
    return !!sessionStorage.getItem("refreshToken");
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
