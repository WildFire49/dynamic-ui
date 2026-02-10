"use client";

import { getAuthHeaders } from "@/services/apiClient";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://supervisory-dev.mifix.io";

/**
 * Dashboard Service - Handles all dashboard and widget API operations
 *
 * API Endpoints:
 * 1. GET    /user/{username}                          - Get all user dashboards
 * 2. POST   /                                         - Create dashboard
 * 3. PUT    /{dashboardId}                            - Update dashboard
 * 4. DELETE /{dashboardId}                            - Delete dashboard
 * 5. GET    /{dashboardId}/widgets                    - Get dashboard widgets (metadata only)
 * 6. POST   /{dashboardId}/widget                     - Save widget to dashboard
 * 7. PUT    /{dashboardId}/widget/{wid}               - Update widget
 * 8. DELETE /{dashboardId}/widget/{wid}               - Delete widget
 * 9. POST   /widget/move                              - Move widget between dashboards
 * 10. PUT   /{dashboardId}/widgets/reorder            - Reorder widgets
 * 11. PUT   /active                                   - Set active dashboard
 * 12. POST  /sync                                     - Bulk sync dashboards & widgets
 * 13. POST  /{dashboardId}/widget/{wid}/refresh       - Refresh single widget data
 * 14. POST  /{dashboardId}/refresh                    - Refresh all dashboard widgets
 * 15. POST  /widgets/data                             - Get widget data (single or multiple)
 * 16. GET   /health                                   - Health check
 * 17. POST  /edit                                     - Create widget/card via NL prompt
 * 18. POST  /summary-cards/{dashboardId}/generate-from-query - Generate custom summary card from NL query
 */
class DashboardService {
  /**
   * 1. Get all dashboards for a user
   * @param {string} username - User's username
   * @returns {Promise<Object>} Dashboard state with activeDashboardId and dashboards array
   */
  async getUserDashboards(username) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/user/${username}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.status === 200 && data.data) {
        // Response: { activeDashboardId, dashboards: [...] }
        return {
          success: true,
          data: data.data.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to fetch dashboards",
      };
    } catch (error) {
      console.error("Error fetching dashboards:", error);
      return {
        success: false,
        message: "Network error fetching dashboards",
      };
    }
  }

  /**
   * 12. Bulk Sync - Save/Sync entire dashboard state for a user
   * Supports two formats: visualizationsByDashboard or flat widgets array
   * @param {string} username - User's username
   * @param {Object} dashboardState - Full dashboard state
   * @returns {Promise<Object>} Result with dashboardCount, widgetCount, syncedAt
   */
  async saveDashboardState(username, dashboardState) {
    try {
      // Build payload - supports both visualizationsByDashboard and widgets array
      const payload = {
        username,
        activeDashboardId: dashboardState.activeDashboardId,
        dashboards: dashboardState.dashboards.map((d, index) => ({
          id: d.id,
          name: d.name,
          icon: d.icon || "Dashboard",
          color: d.color || "#1976d2",
          order: d.order ?? index,
          isDefault: d.isDefault ?? index === 0,
        })),
      };

      // Use visualizationsByDashboard format (preferred for localStorage migration)
      if (dashboardState.visualizationsByDashboard) {
        payload.visualizationsByDashboard = {};
        for (const [dashboardId, widgets] of Object.entries(
          dashboardState.visualizationsByDashboard
        )) {
          payload.visualizationsByDashboard[dashboardId] = (widgets || []).map(
            (w, idx) => ({
              id: w.id,
              title: w.title,
              originalPrompt: w.originalPrompt || w.prompt,
              timestamp: w.timestamp || w.createdAt || new Date().toISOString(),
              type: w.type || "analysis_widget",
              question: w.question || w.title || w.prompt,
              supportingData: w.supportingData,
              pipelineData: w.pipelineData,
              charts: w.charts,
              dataGrid: w.dataGrid,
              data: w.data,
              order: w.order ?? idx,
              width: w.width || 12,
              height: w.height || 400,
              viewMode: w.viewMode || "auto",
              chartType: w.chartType,
              source: w.source,
              conversationId: w.conversationId,
            })
          );
        }
      }

      console.log("📤 Syncing dashboard state:", {
        username,
        dashboardCount: payload.dashboards?.length,
        activeDashboardId: payload.activeDashboardId,
        widgetCounts: payload.visualizationsByDashboard
          ? Object.entries(payload.visualizationsByDashboard).map(
              ([id, viz]) => `${id}: ${viz?.length || 0}`
            )
          : [],
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/sync`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        console.log("✅ Dashboard state synced successfully:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
          message: "Dashboard state synced successfully",
        };
      }

      return {
        success: false,
        message:
          data.data?.message ||
          data.message ||
          "Failed to sync dashboard state",
      };
    } catch (error) {
      console.error("Error syncing dashboard state:", error);
      return {
        success: false,
        message: "Network error syncing dashboard state",
      };
    }
  }

  /**
   * 2. Create a new dashboard
   * @param {string} username - User's username
   * @param {Object} dashboard - Dashboard object { name, icon, color }
   * @returns {Promise<Object>} Created dashboard with id, name, icon, color, order, isDefault, createdAt
   */
  async createDashboard(username, dashboard) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          name: dashboard.name,
          icon: dashboard.icon || "Dashboard",
          color: dashboard.color || "#1976d2",
        }),
      });

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        console.log("✅ Dashboard created:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to create dashboard",
      };
    } catch (error) {
      console.error("Error creating dashboard:", error);
      return {
        success: false,
        message: "Network error creating dashboard",
      };
    }
  }

  /**
   * 3. Update a dashboard
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @param {Object} updates - Updates { name, icon, color }
   * @returns {Promise<Object>} Updated dashboard
   */
  async updateDashboard(username, dashboardId, updates) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            name: updates.name,
            icon: updates.icon,
            color: updates.color,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Dashboard updated:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to update dashboard",
      };
    } catch (error) {
      console.error("Error updating dashboard:", error);
      return {
        success: false,
        message: "Network error updating dashboard",
      };
    }
  }

  /**
   * 4. Delete a dashboard (soft delete)
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @returns {Promise<Object>} Result with deletedDashboardId and deletedWidgetCount
   */
  async deleteDashboard(username, dashboardId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Dashboard deleted:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to delete dashboard",
      };
    } catch (error) {
      console.error("Error deleting dashboard:", error);
      return {
        success: false,
        message: "Network error deleting dashboard",
      };
    }
  }

  /**
   * 5. Get widgets for a specific dashboard
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @returns {Promise<Object>} Result with dashboardId and widgets array
   */
  async getWidgets(username, dashboardId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widgets?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "GET",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to fetch widgets",
      };
    } catch (error) {
      console.error("Error fetching widgets:", error);
      return {
        success: false,
        message: "Network error fetching widgets",
      };
    }
  }

  /**
   * 6. Save a widget to a dashboard
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @param {Object} widget - Widget object with all fields
   * @returns {Promise<Object>} Saved widget with id, dashboardId, etc.
   */
  async saveWidget(username, dashboardId, widget) {
    try {
      // Only include documentKey when explicitly in Excel mode
      // dataSourceMode === 'excel' indicates Excel mode
      // dataSourceMode === 'database' or no dataSourceMode indicates database mode
      const isExcelMode =
        widget.dataSourceMode === "excel" || widget.source === "excel";

      // Build widget payload - store SQL query, minimal data (actual data cached in Redis)
      const widgetPayload = {
        username,
        type: widget.type || "analysis_widget",
        title: widget.title,
        prompt: widget.prompt || widget.originalPrompt || widget.question,
        sqlQuery: widget.sqlQuery || widget.sql_query || widget.query || "",
        width: widget.width || 12,
        height: widget.height || 400,
        viewMode: widget.viewMode || "auto",
        chartType: widget.chartType,
        data: {},
        source: widget.source || "buddi_agent",
        conversationId: widget.conversationId,
        connectionId: widget.connectionId,
      };

      // Only add documentKey for Excel mode queries
      if (isExcelMode && (widget.documentKey || widget.document_key)) {
        widgetPayload.documentKey = widget.documentKey || widget.document_key;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widget`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(widgetPayload),
        }
      );

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        console.log("✅ Widget saved:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message: data.data?.message || data.message || "Failed to save widget",
      };
    } catch (error) {
      console.error("Error saving widget:", error);
      return {
        success: false,
        message: "Network error saving widget",
      };
    }
  }

  /**
   * 7. Update a widget
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @param {Object} updates - Updates { title, width, height, viewMode, order }
   * @returns {Promise<Object>} Updated widget
   */
  async updateWidget(username, dashboardId, widgetId, updates) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widget/${widgetId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            title: updates.title,
            width: updates.width,
            height: updates.height,
            viewMode: updates.viewMode,
            order: updates.order,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widget updated:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to update widget",
      };
    } catch (error) {
      console.error("Error updating widget:", error);
      return {
        success: false,
        message: "Network error updating widget",
      };
    }
  }

  /**
   * 8. Delete a widget (soft delete)
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @returns {Promise<Object>} Result with deletedWidgetId
   */
  async deleteWidget(username, dashboardId, widgetId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widget/${widgetId}?username=${encodeURIComponent(
          username
        )}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widget deleted:", widgetId);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to delete widget",
      };
    } catch (error) {
      console.error("Error deleting widget:", error);
      return {
        success: false,
        message: "Network error deleting widget",
      };
    }
  }

  /**
   * 9. Move widget between dashboards
   * @param {string} username - User's username
   * @param {string} widgetId - Widget ID
   * @param {string} fromDashboardId - Source dashboard ID
   * @param {string} toDashboardId - Target dashboard ID
   * @returns {Promise<Object>} Result with widgetId, fromDashboardId, toDashboardId, newOrder
   */
  async moveWidget(username, widgetId, fromDashboardId, toDashboardId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/widget/move`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            widgetId,
            fromDashboardId,
            toDashboardId,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widget moved:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message: data.data?.message || data.message || "Failed to move widget",
      };
    } catch (error) {
      console.error("Error moving widget:", error);
      return {
        success: false,
        message: "Network error moving widget",
      };
    }
  }

  /**
   * 10. Reorder widgets within a dashboard
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID
   * @param {Array} widgetOrder - Array of { widgetId, order }
   * @returns {Promise<Object>} Result with dashboardId and updatedCount
   */
  async reorderWidgets(username, dashboardId, widgetOrder) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widgets/reorder`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            widgetOrder,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widgets reordered:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to reorder widgets",
      };
    } catch (error) {
      console.error("Error reordering widgets:", error);
      return {
        success: false,
        message: "Network error reordering widgets",
      };
    }
  }

  /**
   * 11. Set active dashboard
   * @param {string} username - User's username
   * @param {string} dashboardId - Dashboard ID to set as active
   * @returns {Promise<Object>} Result with activeDashboardId
   */
  async setActiveDashboard(username, dashboardId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/active`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          username,
          dashboardId,
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Active dashboard set:", dashboardId);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message ||
          data.message ||
          "Failed to set active dashboard",
      };
    } catch (error) {
      console.error("Error setting active dashboard:", error);
      return {
        success: false,
        message: "Network error setting active dashboard",
      };
    }
  }

  /**
   * 13. Refresh a single widget
   * Re-executes the widget's stored SQL query and returns fresh data
   * @param {string} dashboardId - Dashboard ID
   * @param {string} widgetId - Widget ID
   * @param {string} username - User's username
   * @param {string} connectionId - Database connection ID
   * @returns {Promise<Object>} Refreshed widget data with pipelineData, supportingData, dataGrid
   */
  async refreshWidget(dashboardId, widgetId, username, connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/widget/${widgetId}/refresh`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            connectionId,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200 && data.data?.data?.success) {
        console.log("✅ Widget refreshed:", widgetId);
        return {
          success: true,
          data: data.data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.data?.error ||
          data.data?.message ||
          data.message ||
          "Failed to refresh widget",
      };
    } catch (error) {
      console.error("Error refreshing widget:", error);
      return {
        success: false,
        message: "Network error refreshing widget",
      };
    }
  }

  /**
   * 14. Refresh all widgets in a dashboard (bulk)
   * Re-executes all widgets' stored SQL queries and returns fresh data
   * @param {string} dashboardId - Dashboard ID
   * @param {string} username - User's username
   * @param {string} connectionId - Database connection ID
   * @returns {Promise<Object>} Results with refreshedCount, failedCount, and individual results
   */
  async refreshAllWidgets(dashboardId, username, connectionId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/${dashboardId}/refresh`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            connectionId,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Dashboard widgets refreshed:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message ||
          data.message ||
          "Failed to refresh dashboard widgets",
      };
    } catch (error) {
      console.error("Error refreshing dashboard widgets:", error);
      return {
        success: false,
        message: "Network error refreshing dashboard widgets",
      };
    }
  }

  /**
   * 15. Get Widget Data (Single or Multiple)
   * Fetches data for one or more widgets by executing their stored SQL queries
   * @param {string} username - User's username
   * @param {string} connectionId - Database connection ID
   * @param {string[]} widgetIds - Array of widget IDs to fetch data for
   * @returns {Promise<Object>} Results with successCount, failedCount, and individual widget data
   */
  async getWidgetsData(username, connectionId, widgetIds) {
    try {
      console.log("📊 Fetching widget data for:", widgetIds);
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/widgets/data`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            connectionId,
            widgetIds,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widget data fetched:", data.data?.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to fetch widget data",
      };
    } catch (error) {
      console.error("Error fetching widget data:", error);
      return {
        success: false,
        message: "Network error fetching widget data",
      };
    }
  }

  /**
   * 16. Create Summary Card from Question
   * Creates a summary card using natural language question
   * @param {string} dashboardId - Dashboard ID
   * @param {string} username - User's username
   * @param {string} question - Natural language question
   * @param {string} connectionId - Optional database connection ID
   * @param {string} documentKey - Optional document key for Excel/CSV
   * @param {boolean} autoApprove - Auto approve the card (default: true)
   * @param {string} cardType - Card type hint: metric, alert, comparison, insight, info
   * @param {string} urgency - Urgency hint: critical, high, medium, low, info
   * @returns {Promise<Object>} Created card data
   */
  async createSummaryCardFromQuestion(
    dashboardId,
    username,
    question,
    {
      connectionId = null,
      documentKey = null,
      autoApprove = true,
      cardType = null,
      urgency = null,
    } = {}
  ) {
    try {
      console.log("🎯 Creating summary card from question:", {
        dashboardId,
        question,
      });
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/create-from-question`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            question,
            ...(connectionId && { connectionId }),
            ...(documentKey && { documentKey }),
            autoApprove,
            ...(cardType && { cardType }),
            ...(urgency && { urgency }),
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200 || data.status === 201) {
        console.log("✅ Summary card created from question:", data.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to create summary card",
      };
    } catch (error) {
      console.error("Error creating summary card from question:", error);
      return {
        success: false,
        message: "Network error creating summary card",
      };
    }
  }

  /**
   * 17. Edit Summary Card (PATCH)
   * Updates an existing approved summary card
   * @param {string} dashboardId - Dashboard ID
   * @param {string} cardId - Card ID to edit
   * @param {string} username - User's username
   * @param {Object} updates - Fields to update (title, description, color, urgency, etc.)
   * @returns {Promise<Object>} Updated card data
   */
  async editSummaryCard(dashboardId, cardId, username, updates) {
    try {
      console.log("✏️ Editing summary card:", { dashboardId, cardId, updates });
      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/${cardId}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            username,
            ...updates,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Summary card updated:", data.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to update summary card",
      };
    } catch (error) {
      console.error("Error editing summary card:", error);
      return {
        success: false,
        message: "Network error updating summary card",
      };
    }
  }

  /**
   * 18. Edit Dashboard via Natural Language
`   * Creates widgets and/or summary cards using natural language prompts`
   * @param {string} dashboardId - Dashboard ID
   * @param {string} username - User's username
   * @param {string} connectionId - Connection ID
   * @param {string} prompt - Natural language prompt
   * @param {Object} options - Additional options
   * @param {string} options.outputType - "widget", "card", or "both" (default: "widget")
   * @param {boolean} options.autoApproveCard - Auto-save card (default: true)
   * @param {string} options.cardType - Card type hint: metric, alert, comparison, insight, info
   * @param {string} options.cardUrgency - Urgency hint: critical, high, medium, low, info
   * @param {string} options.documentKey - Document key for Excel/CSV queries
   * @param {string} options.sourceCardId - Optional summary card ID that triggered this
   * @returns {Promise<Object>} Created widget/card data
   */
  async editDashboardWithPrompt(
    dashboardId,
    username,
    connectionId,
    prompt,
    options = {}
  ) {
    const {
      outputType = "widget",
      autoApproveCard = true,
      cardType = null,
      cardUrgency = null,
      documentKey = null,
      sourceCardId = null,
    } = options;

    try {
      console.log("🎯 Edit dashboard with prompt:", {
        dashboardId,
        prompt,
        outputType,
      });
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/edit`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          dashboardId,
          username,
          connectionId,
          prompt,
          outputType,
          autoApproveCard,
          ...(cardType && { cardType }),
          ...(cardUrgency && { cardUrgency }),
          ...(documentKey && { documentKey }),
          ...(sourceCardId && { sourceCardId }),
        }),
      });

      const data = await response.json();

      if (data.status === 200) {
        console.log("✅ Widget created via natural language:", data.data);
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message:
          data.data?.message || data.message || "Failed to create widget",
      };
    } catch (error) {
      console.error("Error editing dashboard with prompt:", error);
      return {
        success: false,
        message: "Network error creating widget",
      };
    }
  }

  /**
   * 19. Generate Summary Card from Natural Language Query
   * Creates a custom summary card based on user's natural language query
   * @param {string} dashboardId - Dashboard ID
   * @param {string} query - Natural language query
   * @param {string} username - User's username
   * @param {string} connectionId - Database connection ID
   * @param {Object} options - Additional options
   * @param {string} options.cardType - Override card type (metric, alert, comparison, info, table_summary)
   * @param {string} options.urgency - Override urgency (critical, high, medium, low, info)
   * @param {boolean} options.autoApprove - Auto-save or require approval (default: true)
   * @returns {Promise<Object>} Generated summary card
   */
  async generateSummaryCardFromQuery(
    dashboardId,
    query,
    username,
    connectionId,
    options = {}
  ) {
    const { cardType = null, urgency = null, autoApprove = true } = options;

    try {
      console.log("🎯 Generate summary card from query:", {
        dashboardId,
        query,
        autoApprove,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/v1/dashboard/summary-cards/${dashboardId}/generate-from-query`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            query,
            dashboardId,
            connectionId,
            username,
            ...(cardType && { cardType }),
            ...(urgency && { urgency }),
            autoApprove,
          }),
        }
      );

      const data = await response.json();

      if (data.status === 200 && data.data) {
        console.log("✅ Summary card generated:", data.data);
        return {
          success: true,
          data: data.data,
          card: data.data.card,
          dataSource: data.data.data_source,
          metadata: data.data.metadata,
        };
      }

      return {
        success: false,
        message:
          data.data?.message ||
          data.message ||
          "Failed to generate summary card",
      };
    } catch (error) {
      console.error("Error generating summary card from query:", error);
      return {
        success: false,
        message: "Network error generating summary card",
      };
    }
  }

  /**
   * 17. Health check
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/dashboard/health`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (data.status === 200) {
        return {
          success: true,
          data: data.data?.data || data.data,
        };
      }

      return {
        success: false,
        message: "Dashboard service unhealthy",
      };
    } catch (error) {
      console.error("Error checking dashboard health:", error);
      return {
        success: false,
        message: "Network error checking health",
      };
    }
  }

}

const dashboardService = new DashboardService();
export default dashboardService;
