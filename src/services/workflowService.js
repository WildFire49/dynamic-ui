/**
 * Workflow UI API Service
 * Handles workflow-based form rendering and navigation
 */

import notificationManager from "@/utils/notificationManager";

const WORKFLOW_API_BASE_URL = process.env.NEXT_PUBLIC_WORKFLOW_API_BASE_URL;

const workflowService = {
  /**
   * Call workflow UI endpoint
   * @param {Object} payload - Request payload
   * @returns {Promise<Object>} API response
   */
  async callWorkflow(payload) {
    try {
      const response = await fetch(`${WORKFLOW_API_BASE_URL}/workflow-ui`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Workflow API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Workflow API call failed:", error);
      notificationManager.error("Workflow action failed");
      throw error;
    }
  },

  /**
   * Submit category selection
   * @param {string} userId - User ID
   * @param {string} category - Selected category
   * @returns {Promise<Object>} Next UI schema
   */
  async selectCategory(userId, category) {
    return this.callWorkflow({
      action: "select_category",
      user_id: userId,
      category: category,
      selected_product: "",
      application_id: "",
      input: {},
    });
  },

  /**
   * Submit product selection
   * @param {string} userId - User ID
   * @param {string} category - Selected category
   * @param {string} product - Selected product
   * @returns {Promise<Object>} Next UI schema
   */
  async selectProduct(userId, category, product) {
    return this.callWorkflow({
      action: "select_product",
      user_id: userId,
      category: category,
      selected_product: product,
      application_id: "",
      input: {},
    });
  },

  /**
   * Generic workflow action call
   * @param {string} action - Action name
   * @param {Object} params - Action parameters
   * @returns {Promise<Object>} Next UI schema
   */
  async executeAction(action, params) {
    const payload = {
      action: action,
      user_id: params.user_id || "test_user_001",
      category: params.category || "",
      selected_product: params.selected_product || "",
      application_id: params.application_id || "",
      input: params.input || {},
    };

    return this.callWorkflow(payload);
  },
};

export default workflowService;
