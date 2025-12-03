// Centralized Role Configuration
// This file contains all role definitions, mappings, and access controls

// ============================
// Role Code Constants
// ============================
export const ROLES = {
  SUPER_ADMIN: "RE-20448",
  RECON_USER: "RE-20612",
  RECON_CONFIGURATOR: "RE-20920",
  ADMIN_CONFIGURATOR: "RE-20769",
};

// ============================
// Role Categories
// ============================
export const ROLE_CATEGORIES = {
  ADMIN_ROLES: [ROLES.SUPER_ADMIN],
  USER_ROLES: [ROLES.RECON_USER, ROLES.RECON_CONFIGURATOR],
  CONFIGURATOR_ROLES: [ROLES.SUPER_ADMIN, ROLES.RECON_CONFIGURATOR],
  ALL_ROLES: Object.values(ROLES),
};

// ============================
// Route Access Configuration
// ============================
export const ROUTE_ACCESS = {
  // Public routes (accessible to all authenticated users)
  PUBLIC_ROUTES: ["chat", "profile"],

  // Admin-only routes
  ADMIN_ROUTES: ["configurator", "accessControl", "settings", "userManagement"],

  // Routes accessible to both admin and regular users
  SHARED_ROUTES: ["dashboard", "chat", "profile"],

  // Specific route permissions
  ROUTE_PERMISSIONS: {
    chat: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.RECON_CONFIGURATOR],
    dashboard: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.RECON_CONFIGURATOR],
    configurator: [ROLES.SUPER_ADMIN, ROLES.ADMIN_CONFIGURATOR], // Admin and Configurator only
    accessControl: [ROLES.SUPER_ADMIN], // Admin only
    settings: [ROLES.SUPER_ADMIN], // Admin only
    userManagement: [ROLES.SUPER_ADMIN], // Admin only
  },
};

// ============================
// Menu Configuration
// ============================
export const MENU_ITEMS = [
  {
    id: "chat",
    label: "Chat",
    icon: "ChatIcon",
    roles: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.RECON_CONFIGURATOR],
    path: "/",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "DashboardIcon",
    roles: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.RECON_CONFIGURATOR],
    path: "/dashboard",
  },
  {
    id: "configurator",
    label: "Configurator",
    icon: "ConfiguratorIcon",
    roles: [ROLES.SUPER_ADMIN, ROLES.RECON_CONFIGURATOR],
    path: "/configurator",
  },
  {
    id: "accessControl",
    label: "Access Control",
    icon: "AccessControlIcon",
    roles: [ROLES.SUPER_ADMIN],
    path: "/access-control",
  },
  {
    id: "settings",
    label: "Settings",
    icon: "SettingsIcon",
    roles: [ROLES.SUPER_ADMIN],
    path: "/settings",
  },
];

// ============================
// Role Display Names
// ============================
export const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.RECON_USER]: "Recon User",
  [ROLES.RECON_CONFIGURATOR]: "Recon Configurator", // Display as "Recon User" instead of "Recon Configurator"
  [ROLES.ADMIN_CONFIGURATOR]: "Admin Configurator", // Display as "Recon User" instead of "Recon Configurator"
};

// ============================
// Permission Helper Functions
// ============================

/**
 * Check if a user has access to a specific route
 * @param {string} routeId - The route identifier
 * @param {Array} userRoles - Array of user role codes
 * @returns {boolean} - Whether user has access
 */
export const hasRouteAccess = (routeId, userRoles = []) => {
  const routePermissions = ROUTE_ACCESS.ROUTE_PERMISSIONS[routeId];
  if (!routePermissions) return false;

  return userRoles.some((role) => routePermissions.includes(role));
};

/**
 * Check if a user has a specific role
 * @param {string} roleCode - The role code to check
 * @param {Array} userRoles - Array of user role codes
 * @returns {boolean} - Whether user has the role
 */
export const hasRole = (roleCode, userRoles = []) => {
  return userRoles.includes(roleCode);
};

/**
 * Check if user is super admin
 * @param {Array} userRoles - Array of user role codes
 * @returns {boolean} - Whether user is super admin
 */
export const isSuperAdmin = (userRoles = []) => {
  return hasRole(ROLES.SUPER_ADMIN, userRoles);
};

/**
 * Check if user is regular user (non-admin)
 * @param {Array} userRoles - Array of user role codes
 * @returns {boolean} - Whether user is regular user
 */
export const isRegularUser = (userRoles = []) => {
  return (
    userRoles.some((role) => ROLE_CATEGORIES.USER_ROLES.includes(role)) &&
    !isSuperAdmin(userRoles)
  );
};

/**
 * Get display name for a role code
 * @param {string} roleCode - The role code
 * @returns {string} - Display name for the role
 */
export const getRoleDisplayName = (roleCode) => {
  return ROLE_DISPLAY_NAMES[roleCode] || roleCode;
};

/**
 * Get filtered menu items based on user roles
 * @param {Array} userRoles - Array of user role codes
 * @returns {Array} - Filtered menu items user has access to
 */
export const getAccessibleMenuItems = (userRoles = []) => {
  // Basic menu items available to all authenticated users
  const basicMenuIds = ["chat", "dashboard"];

  // If user has ANY role (including generic "USER"), show basic items
  const hasAnyRole = userRoles.length > 0;

  return MENU_ITEMS.filter((item) => {
    // Always show basic menu items for any authenticated user with roles
    if (basicMenuIds.includes(item.id) && hasAnyRole) {
      return true;
    }
    // For other items, check specific role requirements
    return item.roles.some((requiredRole) => userRoles.includes(requiredRole));
  });
};

/**
 * Get all role codes as an array
 * @returns {Array} - Array of all role codes
 */
export const getAllRoleCodes = () => {
  return Object.values(ROLES);
};

const roleConfig = {
  ROLES,
  ROLE_CATEGORIES,
  ROUTE_ACCESS,
  MENU_ITEMS,
  ROLE_DISPLAY_NAMES,
  hasRouteAccess,
  hasRole,
  isSuperAdmin,
  isRegularUser,
  getRoleDisplayName,
  getAccessibleMenuItems,
  getAllRoleCodes,
};

export default roleConfig;
