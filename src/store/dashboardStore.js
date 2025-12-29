import { create } from "zustand";
import { persist } from "zustand/middleware";
import dashboardService from "@/services/dashboardService";

// Default dashboards (used only if API returns empty)
const DEFAULT_DASHBOARDS = [
  {
    id: "bm",
    name: "Bank Manager",
    icon: "SupervisorAccount",
    color: "#7C3AED",
    order: 0,
    isDefault: true,
  },
  {
    id: "rm",
    name: "Regional Head",
    icon: "Person",
    color: "#059669",
    order: 1,
    isDefault: false,
  },
];

/**
 * Helper to check if a string is a UUID
 */
const isUUID = (str) => {
  if (!str || typeof str !== "string") return false;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Get username from localStorage
 * Priority: username > user.username > userId (fallback only)
 */
const getUsername = () => {
  if (typeof window === "undefined") return null;

  // First try direct username - but validate it's not a UUID
  const username = localStorage.getItem("username");
  if (username && !isUUID(username)) {
    console.log(
      "📛 getUsername (store): using localStorage.username:",
      username
    );
    return username;
  }

  // Then try user object
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.username && !isUUID(user.username)) {
      console.log(
        "📛 getUsername (store): using user.username:",
        user.username
      );
      return user.username;
    }
  } catch (e) {
    // Ignore parse errors
  }

  // Fallback to userId only if it looks like a username (not a UUID)
  const userId = localStorage.getItem("userId");
  if (userId && !isUUID(userId)) {
    console.log("📛 getUsername (store): using userId:", userId);
    return userId;
  }

  console.warn("📛 getUsername (store): No valid username found!");
  return null;
};

const useDashboardStore = create(
  persist(
    (set, get) => ({
      // List of all dashboards
      dashboards: DEFAULT_DASHBOARDS,

      // Currently active dashboard ID
      activeDashboardId: "bm",

      // Visualizations organized by dashboard ID
      visualizationsByDashboard: {
        bm: [],
        rm: [],
      },

      // Summary cards organized by dashboard ID
      summaryCardsByDashboard: {},

      // Loading and error states
      isLoading: false,
      isSyncing: false,
      lastSyncedAt: null,
      error: null,

      // ==========================================
      // GETTERS
      // ==========================================

      // Get active dashboard
      getActiveDashboard: () => {
        const state = get();
        return (
          state.dashboards.find((d) => d.id === state.activeDashboardId) ||
          state.dashboards[0]
        );
      },

      // Get visualizations for active dashboard
      getActiveVisualizations: () => {
        const state = get();
        return state.visualizationsByDashboard[state.activeDashboardId] || [];
      },

      // Get all visualizations across all dashboards (for search)
      getAllVisualizations: () => {
        const state = get();
        return Object.entries(state.visualizationsByDashboard).flatMap(
          ([dashboardId, visualizations]) =>
            (visualizations || []).map((v) => ({ ...v, dashboardId }))
        );
      },

      // Get visualization count for a dashboard
      getVisualizationCount: (dashboardId) => {
        const state = get();
        return (state.visualizationsByDashboard[dashboardId] || []).length;
      },

      // ==========================================
      // API INTEGRATION - LOAD FROM SERVER
      // ==========================================

      /**
       * Load dashboards from API
       * Called on app init or when user logs in
       */
      loadFromServer: async (username) => {
        console.log(`📛 loadFromServer called with username: "${username}"`);

        // Validate username is not a UUID
        let user = username;
        if (!user || isUUID(user)) {
          console.log(
            `📛 Username "${user}" is invalid/UUID, getting from localStorage`
          );
          user = getUsername();
        }

        console.log(`📛 Final user for loadFromServer: "${user}"`);
        if (!user) {
          console.warn("No username available for loading dashboards");
          return { success: false, message: "No username" };
        }

        // Prevent duplicate calls
        const state = get();
        if (state.isLoading) {
          console.log("⏳ Already loading, skipping duplicate call");
          return { success: false, message: "Already loading" };
        }

        // Reset loaded dashboards tracking and set loading state
        set({ isLoading: true, error: null, _loadedDashboards: new Set() });

        try {
          const result = await dashboardService.getUserDashboards(user);

          if (result.success && result.data) {
            const { dashboards, activeDashboardId } = result.data;

            // Build visualizationsByDashboard from dashboard data
            const vizByDashboard = {};
            for (const dashboard of dashboards || []) {
              vizByDashboard[dashboard.id] = [];
            }

            const activeId = activeDashboardId || dashboards?.[0]?.id || "bm";

            set({
              dashboards: dashboards || DEFAULT_DASHBOARDS,
              activeDashboardId: activeId,
              visualizationsByDashboard: vizByDashboard,
              isLoading: false,
              lastSyncedAt: new Date().toISOString(),
            });

            // Only load widgets for the ACTIVE dashboard initially
            // Other dashboards will load when user switches to them
            if (activeId) {
              await get().loadWidgetsForDashboard(user, activeId);
            }

            console.log("✅ Dashboards loaded from server");
            return { success: true };
          }

          // If API fails, keep local state
          set({ isLoading: false });
          return { success: false, message: result.message };
        } catch (error) {
          console.error("Error loading dashboards:", error);
          set({ isLoading: false, error: error.message });
          return { success: false, message: error.message };
        }
      },

      // Track which dashboards have been loaded to prevent duplicate calls
      _loadedDashboards: new Set(),

      /**
       * Load widgets for a specific dashboard
       */
      loadWidgetsForDashboard: async (
        username,
        dashboardId,
        forceReload = false
      ) => {
        console.log(
          `📛 loadWidgetsForDashboard called with username: "${username}", dashboardId: "${dashboardId}"`
        );

        // Validate username is not a UUID (could be dashboard ID passed by mistake)
        let user = username;
        if (!user || isUUID(user)) {
          console.log(
            `📛 Username "${user}" is invalid/UUID, getting from localStorage`
          );
          user = getUsername();
        }

        console.log(`📛 Final user for API call: "${user}"`);
        if (!user || !dashboardId) {
          console.warn(
            `📛 Cannot load widgets: user="${user}", dashboardId="${dashboardId}"`
          );
          return;
        }

        const state = get();

        // Skip if already loaded (unless force reload)
        if (!forceReload && state._loadedDashboards.has(dashboardId)) {
          console.log(`📦 Widgets for ${dashboardId} already loaded, skipping`);
          return;
        }

        try {
          console.log(`📥 Loading widgets for dashboard: ${dashboardId}`);
          const result = await dashboardService.getWidgets(user, dashboardId);
          console.log(`📦 API Response for widgets:`, result);

          if (result.success && result.data?.widgets) {
            console.log(
              `📊 Found ${result.data.widgets.length} widgets, first widget:`,
              result.data.widgets[0]?.title,
              "Widget ID fields:",
              {
                id: result.data.widgets[0]?.id,
                widgetId: result.data.widgets[0]?.widgetId,
                _id: result.data.widgets[0]?._id,
              }
            );

            // Extract summary cards from the response
            const summaryCards = result.data.summary_cards || [];

            set((state) => {
              const newLoadedSet = new Set(state._loadedDashboards);
              newLoadedSet.add(dashboardId);

              // Filter out widgets without valid IDs and map to store format
              const validWidgets = result.data.widgets
                .filter((w) => w.id || w.widgetId || w._id)
                .map((w) => ({
                  id: w.id || w.widgetId || w._id,
                  title: w.title,
                  originalPrompt: w.prompt,
                  timestamp: w.createdAt || w.savedAt,
                  type: w.type,
                  question: w.data?.question || w.title || w.prompt,
                  // Store SQL query and connection for refresh API
                  sqlQuery: w.sqlQuery || w.sql_query || "",
                  connectionId: w.connectionId || "",
                  // Keep data at top level for easy access
                  supportingData:
                    w.data?.supportingData || w.data?.pipelineData,
                  pipelineData: w.data?.pipelineData,
                  charts: w.data?.charts,
                  dataGrid: w.data?.dataGrid,
                  // Also keep full data object for components that need it
                  data: w.data,
                  width: w.width,
                  height: w.height,
                  viewMode: w.viewMode,
                  chartType: w.chartType,
                  order: w.order,
                  source: w.source,
                }));

              return {
                _loadedDashboards: newLoadedSet,
                visualizationsByDashboard: {
                  ...state.visualizationsByDashboard,
                  [dashboardId]: validWidgets,
                },
                summaryCardsByDashboard: {
                  ...state.summaryCardsByDashboard,
                  [dashboardId]: summaryCards,
                },
              };
            });
            console.log(
              `✅ Loaded ${result.data.widgets.length} widgets for ${dashboardId}`
            );
          }
        } catch (error) {
          console.error(`Error loading widgets for ${dashboardId}:`, error);
        }
      },

      // ==========================================
      // API INTEGRATION - SYNC TO SERVER
      // ==========================================

      /**
       * Sync entire dashboard state to server
       * Called after major changes or periodically
       */
      syncToServer: async (username) => {
        const user = username || getUsername();
        if (!user) {
          console.warn("No username available for syncing");
          return { success: false, message: "No username" };
        }

        const state = get();
        set({ isSyncing: true, error: null });

        try {
          const result = await dashboardService.saveDashboardState(user, {
            dashboards: state.dashboards,
            activeDashboardId: state.activeDashboardId,
            visualizationsByDashboard: state.visualizationsByDashboard,
          });

          set({
            isSyncing: false,
            lastSyncedAt: result.success
              ? new Date().toISOString()
              : state.lastSyncedAt,
          });

          return result;
        } catch (error) {
          console.error("Error syncing to server:", error);
          set({ isSyncing: false, error: error.message });
          return { success: false, message: error.message };
        }
      },

      // ==========================================
      // DASHBOARD OPERATIONS (with API calls)
      // ==========================================

      /**
       * Set active dashboard
       * Note: syncToApi is disabled by default - active dashboard is managed locally
       */
      setActiveDashboard: async (dashboardId, syncToApi = false) => {
        set({ activeDashboardId: dashboardId });

        const username = getUsername();

        // Lazy load widgets for this dashboard if not already loaded
        if (username) {
          await get().loadWidgetsForDashboard(username, dashboardId);
        }

        // Only sync to API if explicitly requested (disabled by default)
        if (syncToApi && username) {
          await dashboardService.setActiveDashboard(username, dashboardId);
        }
      },

      /**
       * Add a new dashboard
       */
      addDashboard: async (dashboard, syncToApi = true) => {
        const newId = dashboard.id || `dash-${Date.now()}`;
        const newDashboard = {
          id: newId,
          name: dashboard.name,
          icon: dashboard.icon || "Dashboard",
          color: dashboard.color || "#1976d2",
          order: get().dashboards.length,
          isDefault: false,
        };

        set((state) => ({
          dashboards: [...state.dashboards, newDashboard],
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [newId]: [],
          },
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            const result = await dashboardService.createDashboard(
              username,
              newDashboard
            );
            if (result.success && result.data?.id) {
              // Update with server-generated ID if different
              if (result.data.id !== newId) {
                set((state) => {
                  const { [newId]: widgets, ...rest } =
                    state.visualizationsByDashboard;
                  return {
                    dashboards: state.dashboards.map((d) =>
                      d.id === newId ? { ...d, id: result.data.id } : d
                    ),
                    visualizationsByDashboard: {
                      ...rest,
                      [result.data.id]: widgets || [],
                    },
                  };
                });
              }
            }
            return result;
          }
        }

        return { success: true, data: newDashboard };
      },

      /**
       * Update/Rename a dashboard
       */
      updateDashboard: async (dashboardId, updates, syncToApi = true) => {
        set((state) => ({
          dashboards: state.dashboards.map((d) =>
            d.id === dashboardId ? { ...d, ...updates } : d
          ),
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            return await dashboardService.updateDashboard(
              username,
              dashboardId,
              updates
            );
          }
        }

        return { success: true };
      },

      // Alias for backward compatibility
      renameDashboard: (dashboardId, newName) => {
        return get().updateDashboard(dashboardId, { name: newName });
      },

      /**
       * Delete a dashboard
       */
      deleteDashboard: async (dashboardId, syncToApi = true) => {
        const state = get();

        // Can't delete if only one dashboard
        if (state.dashboards.length <= 1) {
          return {
            success: false,
            message: "Cannot delete the last dashboard",
          };
        }

        // Find next active dashboard
        const nextActive = state.dashboards.find(
          (d) => d.id !== dashboardId
        )?.id;

        set((state) => {
          const { [dashboardId]: removed, ...rest } =
            state.visualizationsByDashboard;

          // Remove from loaded dashboards tracking
          const newLoadedSet = new Set(state._loadedDashboards);
          newLoadedSet.delete(dashboardId);

          return {
            dashboards: state.dashboards.filter((d) => d.id !== dashboardId),
            visualizationsByDashboard: rest,
            _loadedDashboards: newLoadedSet,
            activeDashboardId:
              state.activeDashboardId === dashboardId
                ? nextActive
                : state.activeDashboardId,
          };
        });

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            return await dashboardService.deleteDashboard(
              username,
              dashboardId
            );
          }
        }

        return { success: true };
      },

      // ==========================================
      // WIDGET/VISUALIZATION OPERATIONS (with API calls)
      // ==========================================

      /**
       * Add visualization to a dashboard
       */
      addVisualization: async (
        dashboardId,
        visualization,
        syncToApi = true
      ) => {
        const vizWithId = {
          ...visualization,
          id: visualization.id || `viz-${Date.now()}`,
          timestamp: visualization.timestamp || new Date().toISOString(),
        };

        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: [
              vizWithId,
              ...(state.visualizationsByDashboard[dashboardId] || []),
            ],
          },
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            const result = await dashboardService.saveWidget(
              username,
              dashboardId,
              vizWithId
            );
            if (
              result.success &&
              result.data?.id &&
              result.data.id !== vizWithId.id
            ) {
              // Update with server-generated ID
              set((state) => ({
                visualizationsByDashboard: {
                  ...state.visualizationsByDashboard,
                  [dashboardId]: state.visualizationsByDashboard[
                    dashboardId
                  ].map((v) =>
                    v.id === vizWithId.id ? { ...v, id: result.data.id } : v
                  ),
                },
              }));
            }
            return result;
          }
        }

        return { success: true, data: vizWithId };
      },

      /**
       * Remove visualization from a dashboard
       */
      removeVisualization: async (
        dashboardId,
        visualizationId,
        syncToApi = true
      ) => {
        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: (
              state.visualizationsByDashboard[dashboardId] || []
            ).filter((v) => v.id !== visualizationId),
          },
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            return await dashboardService.deleteWidget(
              username,
              dashboardId,
              visualizationId
            );
          }
        }

        return { success: true };
      },

      /**
       * Update visualization in a dashboard
       */
      updateVisualization: async (
        dashboardId,
        visualizationId,
        updates,
        syncToApi = true
      ) => {
        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: (
              state.visualizationsByDashboard[dashboardId] || []
            ).map((v) => (v.id === visualizationId ? { ...v, ...updates } : v)),
          },
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            return await dashboardService.updateWidget(
              username,
              dashboardId,
              visualizationId,
              updates
            );
          }
        }

        return { success: true };
      },

      /**
       * Move visualization between dashboards
       */
      moveVisualization: async (
        fromDashboardId,
        toDashboardId,
        visualizationId,
        syncToApi = true
      ) => {
        const state = get();
        const visualization = (
          state.visualizationsByDashboard[fromDashboardId] || []
        ).find((v) => v.id === visualizationId);

        if (!visualization) {
          return { success: false, message: "Visualization not found" };
        }

        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [fromDashboardId]: (
              state.visualizationsByDashboard[fromDashboardId] || []
            ).filter((v) => v.id !== visualizationId),
            [toDashboardId]: [
              visualization,
              ...(state.visualizationsByDashboard[toDashboardId] || []),
            ],
          },
        }));

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            return await dashboardService.moveWidget(
              username,
              visualizationId,
              fromDashboardId,
              toDashboardId
            );
          }
        }

        return { success: true };
      },

      /**
       * Reorder visualizations within a dashboard
       */
      reorderVisualizations: async (
        dashboardId,
        orderedIds,
        syncToApi = true
      ) => {
        set((state) => {
          const vizMap = new Map(
            (state.visualizationsByDashboard[dashboardId] || []).map((v) => [
              v.id,
              v,
            ])
          );
          const reordered = orderedIds
            .map((id, index) => {
              const viz = vizMap.get(id);
              return viz ? { ...viz, order: index } : null;
            })
            .filter(Boolean);

          return {
            visualizationsByDashboard: {
              ...state.visualizationsByDashboard,
              [dashboardId]: reordered,
            },
          };
        });

        if (syncToApi) {
          const username = getUsername();
          if (username) {
            const widgetOrder = orderedIds.map((id, index) => ({
              widgetId: id,
              order: index,
            }));
            return await dashboardService.reorderWidgets(
              username,
              dashboardId,
              widgetOrder
            );
          }
        }

        return { success: true };
      },

      // ==========================================
      // MIGRATION & UTILITIES
      // ==========================================

      /**
       * Migrate from localStorage to API
       * Called once when user first uses the new system
       */
      migrateToServer: async (username) => {
        const user = username || getUsername();
        if (!user) return { success: false, message: "No username" };

        const state = get();

        // Check if there's local data to migrate
        const hasLocalData =
          state.dashboards.length > 0 ||
          Object.values(state.visualizationsByDashboard).some(
            (v) => v.length > 0
          );

        if (!hasLocalData) {
          return { success: true, message: "No data to migrate" };
        }

        console.log("📤 Migrating local data to server...");
        const result = await get().syncToServer(user);

        if (result.success) {
          console.log("✅ Migration complete");
        }

        return result;
      },

      /**
       * Migrate from old localStorage format
       */
      migrateFromLocalStorage: () => {
        try {
          const existingViz = JSON.parse(
            localStorage.getItem("dashboardVisualizations") || "[]"
          );
          if (existingViz.length > 0) {
            set((state) => {
              const existingIds = new Set(
                (state.visualizationsByDashboard.bm || []).map((v) => v.id)
              );
              const newViz = existingViz.filter((v) => !existingIds.has(v.id));

              if (newViz.length === 0) return state;

              return {
                visualizationsByDashboard: {
                  ...state.visualizationsByDashboard,
                  bm: [
                    ...newViz,
                    ...(state.visualizationsByDashboard.bm || []),
                  ],
                },
              };
            });
            localStorage.removeItem("dashboardVisualizations");
            console.log("✅ Migrated from old localStorage format");
          }
        } catch (error) {
          console.error("Error migrating from localStorage:", error);
        }
      },

      /**
       * Clear all local data (for logout)
       */
      clearLocalData: () => {
        set({
          dashboards: DEFAULT_DASHBOARDS,
          activeDashboardId: "bm",
          visualizationsByDashboard: { bm: [], rm: [] },
          _loadedDashboards: new Set(),
          lastSyncedAt: null,
          error: null,
        });
      },

      /**
       * Force refresh from server (clears local cache first)
       */
      forceRefreshFromServer: async (username) => {
        const user = username || getUsername();
        if (!user) return { success: false, message: "No username" };

        // Clear local state first
        set({
          dashboards: [],
          visualizationsByDashboard: {},
          _loadedDashboards: new Set(),
          isLoading: false,
        });

        // Then load fresh from server
        return await get().loadFromServer(user);
      },
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
        visualizationsByDashboard: state.visualizationsByDashboard,
        lastSyncedAt: state.lastSyncedAt,
      }),
    }
  )
);

export default useDashboardStore;
