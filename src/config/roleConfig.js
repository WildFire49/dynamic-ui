// Centralized Role Configuration
// This file contains all role definitions, mappings, and access controls

// ============================
// Role Code Constants
// ============================
export const ROLES = {
  SUPER_ADMIN: "RE-20448",
  RECON_USER: "RE-20612",
  MIS: "RE-20920",
  ADMIN_CONFIGURATOR: "RE-20769",
  PRODUCT_LEAD: "RE-231875",
};

// ============================
// Role Categories
// ============================
export const ROLE_CATEGORIES = {
  ADMIN_ROLES: [ROLES.SUPER_ADMIN],
  USER_ROLES: [ROLES.RECON_USER, ROLES.MIS],
  CONFIGURATOR_ROLES: [ROLES.SUPER_ADMIN],
  LEAD_ROLES: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
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
    chat: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.MIS, ROLES.PRODUCT_LEAD],
    dashboard: [
      ROLES.SUPER_ADMIN,
      ROLES.RECON_USER,
      ROLES.MIS,
      ROLES.PRODUCT_LEAD,
    ],
    leads: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD], // Internal CPH - Super Admin and Product Lead only
    configurator: [ROLES.SUPER_ADMIN], // Super Admin only
    productConfigurator: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
    creConfigurator: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
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
    label: "MiFiX.ai Chat",
    icon: "ChatIcon",
    color: "#2196f3",
    roles: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.MIS, ROLES.PRODUCT_LEAD],
    path: "/",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "DashboardIcon",
    color: "#2196f3",
    roles: [ROLES.SUPER_ADMIN, ROLES.RECON_USER, ROLES.MIS, ROLES.PRODUCT_LEAD],
    path: "/dashboard",
  },
  {
    id: "leads",
    label: "Internal CPH",
    icon: "PeopleIcon",
    color: "#9c27b0",
    roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
    path: "/leads",
  },
  {
    id: "configurator",
    label: "Configurator",
    icon: "ConfiguratorIcon",
    color: "#1976d2",
    roles: [ROLES.SUPER_ADMIN],
    path: "/configurator",
  },
  {
    id: "productConfigurator",
    label: "Product Configurator",
    icon: "CategoryIcon",
    color: "#ff9800",
    roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
    path: "/product-configurator",
  },
  {
    id: "creConfigurator",
    label: "CRE Configurator",
    icon: "SettingsIcon",
    color: "#4caf50",
    roles: [ROLES.SUPER_ADMIN, ROLES.PRODUCT_LEAD],
    path: "/configurator/cre",
  },
  {
    id: "accessControl",
    label: "Access Control",
    icon: "AccessControlIcon",
    color: "#f44336",
    roles: [ROLES.SUPER_ADMIN],
    path: "/access-control",
  },
];

// ============================
// Role Display Names
// ============================
export const ROLE_DISPLAY_NAMES = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.RECON_USER]: "Recon User",
  [ROLES.MIS]: "MIS",
  [ROLES.ADMIN_CONFIGURATOR]: "Admin Configurator",
  [ROLES.PRODUCT_LEAD]: "Product Lead",
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
