import { create } from "zustand";
import { persist } from "zustand/middleware";

// Default dashboards
const DEFAULT_DASHBOARDS = [
  { id: "bm", name: "BM Dashboard", icon: "AccountBalance", color: "#3B82F6" }, // Bank Manager - blue
  { id: "rm", name: "RM Dashboard", icon: "SupportAgent", color: "#10B981" }, // Relationship Manager - green
];

const useDashboardStore = create(
  persist(
    (set, get) => ({
      // List of all dashboards
      dashboards: DEFAULT_DASHBOARDS,

      // Currently active dashboard ID
      activeDashboardId: "bm",

      // Visualizations organized by dashboard ID
      // { dashboardId: [visualization1, visualization2, ...] }
      visualizationsByDashboard: {
        bm: [],
        rm: [],
      },

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

      // Set active dashboard
      setActiveDashboard: (dashboardId) => {
        set({ activeDashboardId: dashboardId });
      },

      // Add a new dashboard
      addDashboard: (dashboard) => {
        set((state) => ({
          dashboards: [
            ...state.dashboards,
            {
              id: dashboard.id || Date.now().toString(),
              name: dashboard.name,
              icon: dashboard.icon || "Dashboard",
              color: dashboard.color || "#1976d2",
            },
          ],
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboard.id || Date.now().toString()]: [],
          },
        }));
      },

      // Rename a dashboard
      renameDashboard: (dashboardId, newName) => {
        set((state) => ({
          dashboards: state.dashboards.map((d) =>
            d.id === dashboardId ? { ...d, name: newName } : d
          ),
        }));
      },

      // Delete a dashboard
      deleteDashboard: (dashboardId) => {
        if (dashboardId === "default") return; // Can't delete default
        set((state) => {
          const { [dashboardId]: removed, ...rest } =
            state.visualizationsByDashboard;
          return {
            dashboards: state.dashboards.filter((d) => d.id !== dashboardId),
            visualizationsByDashboard: rest,
            activeDashboardId:
              state.activeDashboardId === dashboardId
                ? "default"
                : state.activeDashboardId,
          };
        });
      },

      // Add visualization to a specific dashboard
      addVisualization: (dashboardId, visualization) => {
        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: [
              visualization,
              ...(state.visualizationsByDashboard[dashboardId] || []),
            ],
          },
        }));
      },

      // Remove visualization from a dashboard
      removeVisualization: (dashboardId, visualizationId) => {
        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: (
              state.visualizationsByDashboard[dashboardId] || []
            ).filter((v) => v.id !== visualizationId),
          },
        }));
      },

      // Update visualization in a dashboard
      updateVisualization: (dashboardId, visualizationId, updates) => {
        set((state) => ({
          visualizationsByDashboard: {
            ...state.visualizationsByDashboard,
            [dashboardId]: (
              state.visualizationsByDashboard[dashboardId] || []
            ).map((v) => (v.id === visualizationId ? { ...v, ...updates } : v)),
          },
        }));
      },

      // Move visualization between dashboards
      moveVisualization: (fromDashboardId, toDashboardId, visualizationId) => {
        set((state) => {
          const visualization = (
            state.visualizationsByDashboard[fromDashboardId] || []
          ).find((v) => v.id === visualizationId);
          if (!visualization) return state;

          return {
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
          };
        });
      },

      // Migrate from localStorage (for existing data) - only runs once
      migrateFromLocalStorage: () => {
        try {
          const existingViz = JSON.parse(
            localStorage.getItem("dashboardVisualizations") || "[]"
          );
          if (existingViz.length > 0) {
            set((state) => {
              // Get existing IDs in BM dashboard to avoid duplicates
              const existingIds = new Set(
                (state.visualizationsByDashboard.bm || []).map((v) => v.id)
              );

              // Filter out duplicates from localStorage
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
            // Clear old localStorage after migration
            localStorage.removeItem("dashboardVisualizations");
          }
        } catch (error) {
          console.error("Error migrating from localStorage:", error);
        }
      },

      // Get all visualizations across all dashboards (for search)
      getAllVisualizations: () => {
        const state = get();
        return Object.entries(state.visualizationsByDashboard).flatMap(
          ([dashboardId, visualizations]) =>
            visualizations.map((v) => ({ ...v, dashboardId }))
        );
      },

      // Get visualization count for a dashboard
      getVisualizationCount: (dashboardId) => {
        const state = get();
        return (state.visualizationsByDashboard[dashboardId] || []).length;
      },
    }),
    {
      name: "dashboard-storage",
      partialize: (state) => ({
        dashboards: state.dashboards,
        activeDashboardId: state.activeDashboardId,
        visualizationsByDashboard: state.visualizationsByDashboard,
      }),
    }
  )
);

export default useDashboardStore;
