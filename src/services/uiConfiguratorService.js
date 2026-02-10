"use client";

/**
 * UI Configurator API Service
 * Handles all API calls for the UI Component Builder
 */

import apiClient from './apiClient';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const UI_CONFIGURATOR_BASE = `${API_BASE_URL}/api/v1/configurator/ui-configurator`;

class UIConfiguratorService {
  /**
   * Generate or update a form using AI
   * @param {Object} params - Generation parameters
   * @param {string} params.prompt - User's prompt
   * @param {string} params.userId - User ID
   * @param {string} [params.conversationId] - Optional conversation ID for continuation
   * @param {string} [params.formId] - Optional form ID for editing
   * @returns {Promise<Object>} API response
   */
  async generateForm({ prompt, userId, conversationId, formId }) {
    try {
      const requestBody = {
        prompt,
        user_id: userId,
      };

      if (conversationId) {
        requestBody.conversation_id = conversationId;
      }

      if (formId) {
        requestBody.form_id = formId;
      }

      return await apiClient.post(`${UI_CONFIGURATOR_BASE}/generate`, requestBody);
    } catch (error) {
      console.error("Error generating form:", error);
      throw error;
    }
  }

  /**
   * Get conversation history for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of conversations
   */
  async getConversationHistory(userId) {
    try {
      const data = await apiClient.get(
        `${UI_CONFIGURATOR_BASE}/component-library/${userId}?non_empty_only=true`
      );
      return data.success && data.data ? data.data.conversations || [] : [];
    } catch (error) {
      console.error("Error fetching conversation history:", error);
      throw error;
    }
  }

  /**
   * Load a specific conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object>} Conversation data
   */
  async loadConversation(conversationId) {
    try {
      const data = await apiClient.get(
        `${UI_CONFIGURATOR_BASE}/conversations/${conversationId}`
      );
      return data.success && data.data ? data.data : null;
    } catch (error) {
      console.error("Error loading conversation:", error);
      throw error;
    }
  }

  /**
   * Delete a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteConversation(conversationId) {
    try {
      await apiClient.delete(
        `${UI_CONFIGURATOR_BASE}/conversations/${conversationId}`
      );
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  }

  /**
   * Get component library for a user
   * Returns full library data including conversations, forms, and stats
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Component library data with conversations and forms
   */
  async getComponentLibrary(userId) {
    try {
      const data = await apiClient.get(
        `${UI_CONFIGURATOR_BASE}/component-library/${userId}?non_empty_only=true`
      );
      // Return full data structure with conversations, forms, and stats
      return data.success && data.data
        ? data.data
        : {
            conversations: [],
            forms_without_conversation: [],
            library_stats: {
              total_forms: 0,
              forms_in_conversations: 0,
              orphaned_forms: 0,
            },
          };
    } catch (error) {
      console.error("Error fetching component library:", error);
      throw error;
    }
  }

  /**
   * Save a new workflow
   * @param {Object} workflowData - Workflow data including canvas state
   * @returns {Promise<Object>} API response with workflow_id
   */
  async saveWorkflow(workflowData) {
    try {
      return await apiClient.post(
        `${API_BASE_URL}/api/v1/configurator/workflows/canvas`,
        workflowData
      );
    } catch (error) {
      console.error("Error saving workflow:", error);
      throw error;
    }
  }

  /**
   * Update an existing workflow
   * @param {string} workflowId - Workflow ID
   * @param {Object} workflowData - Updated workflow data
   * @returns {Promise<Object>} API response
   */
  async updateWorkflow(workflowId, workflowData) {
    try {
      return await apiClient.put(
        `${API_BASE_URL}/api/v1/configurator/workflows/canvas/${workflowId}`,
        workflowData
      );
    } catch (error) {
      console.error("Error updating workflow:", error);
      throw error;
    }
  }

  /**
   * Get a specific workflow by ID
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<Object>} Workflow data with canvas state
   */
  async getWorkflow(workflowId) {
    try {
      return await apiClient.get(
        `${API_BASE_URL}/api/v1/configurator/workflows/canvas/${workflowId}`
      );
    } catch (error) {
      console.error("Error fetching workflow:", error);
      throw error;
    }
  }

  /**
   * Get all workflows for a user and product
   * @param {string} userId - User ID
   * @param {string} productId - Product ID (e.g., 'loan_app')
   * @returns {Promise<Object>} Workflows data with statistics
   */
  async getUserWorkflows(userId, productId = "loan_app") {
    try {
      const data = await apiClient.get(
        `${API_BASE_URL}/api/v1/configurator/workflows/canvas?user_id=${userId}&product_id=${productId}`
      );
      return data.success && data.data
        ? data.data
        : { workflows: [], total: 0, statistics: {} };
    } catch (error) {
      console.error("Error fetching user workflows:", error);
      throw error;
    }
  }

  /**
   * Delete a component from the library
   * @param {string} componentId - Component/Form ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteComponent(componentId) {
    try {
      await apiClient.delete(
        `${UI_CONFIGURATOR_BASE}/schemas/${componentId}`
      );
      return true;
    } catch (error) {
      console.error("Error deleting component:", error);
      throw error;
    }
  }

  /**
   * Delete a workflow
   * @param {string} workflowId - Workflow ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteWorkflow(workflowId, userId) {
    try {
      await apiClient.delete(
        `${API_BASE_URL}/api/v1/configurator/workflows/canvas/${workflowId}?user_id=${userId}`
      );
      return true;
    } catch (error) {
      console.error("Error deleting workflow:", error);
      throw error;
    }
  }
}

// Export singleton instance
const uiConfiguratorService = new UIConfiguratorService();
export default uiConfiguratorService;
