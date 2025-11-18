/**
 * Template Service
 * Handles all API calls related to UI template management
 */

import apiClient from "./apiClient";

const templateService = {
  /**
   * Fetch all templates
   * @param {boolean} activeOnly - Filter for active templates only
   * @returns {Promise<Object>} Templates data
   */
  listTemplates: async (activeOnly = false) => {
    try {
      const data = await apiClient.get(
        `/api/v1/configurator/ui-configurator/templates?active_only=${activeOnly}`
      );
      return data;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  },

  /**
   * Get single template by ID
   * @param {string} templateId - Template ID
   * @param {boolean} activeOnly - Filter for active templates only
   * @returns {Promise<Object>} Template data
   */
  getTemplate: async (templateId, activeOnly = false) => {
    try {
      const data = await apiClient.get(
        `/api/v1/configurator/ui-configurator/templates/${templateId}?active_only=${activeOnly}`
      );
      return data;
    } catch (error) {
      console.error("Error fetching template:", error);
      throw error;
    }
  },

  /**
   * Create new template
   * @param {Object} templateData - Template data
   * @param {string} templateData.name - Template name
   * @param {string} templateData.content - Template content (markdown)
   * @param {string} templateData.description - Template description
   * @param {string} templateData.created_by - Creator user ID
   * @param {string} templateData.base_template_id - Base template ID (optional)
   * @returns {Promise<Object>} Created template data
   */
  createTemplate: async (templateData) => {
    try {
      const data = await apiClient.post(
        "/api/v1/configurator/ui-configurator/templates",
        templateData
      );
      return data;
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  },

  /**
   * Update existing template
   * @param {string} templateId - Template ID
   * @param {Object} updateData - Data to update
   * @param {string} updateData.name - Template name
   * @param {string} updateData.content - Template content
   * @param {string} updateData.description - Template description
   * @returns {Promise<Object>} Updated template data
   */
  updateTemplate: async (templateId, updateData) => {
    try {
      const data = await apiClient.put(
        `/api/v1/configurator/ui-configurator/templates/${templateId}`,
        updateData
      );
      return data;
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  },

  /**
   * Delete (deactivate) template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Deletion response
   */
  deleteTemplate: async (templateId) => {
    try {
      const data = await apiClient.delete(
        `/api/v1/configurator/ui-configurator/templates/${templateId}`
      );
      return data;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  },

  /**
   * Get template versions (if versioning is supported)
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Template versions
   */
  getTemplateVersions: async (templateId) => {
    try {
      const data = await apiClient.get(
        `/api/v1/configurator/ui-configurator/templates/${templateId}/versions`
      );
      return data;
    } catch (error) {
      console.error("Error fetching template versions:", error);
      throw error;
    }
  },

  /**
   * Activate template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Activation response
   */
  activateTemplate: async (templateId) => {
    try {
      const data = await apiClient.post(
        `/api/v1/configurator/ui-configurator/templates/${templateId}/activate`
      );
      return data;
    } catch (error) {
      console.error("Error activating template:", error);
      throw error;
    }
  },

  /**
   * Deactivate template
   * @param {string} templateId - Template ID
   * @returns {Promise<Object>} Deactivation response
   */
  deactivateTemplate: async (templateId) => {
    try {
      const data = await apiClient.post(
        `/api/v1/configurator/ui-configurator/templates/${templateId}/deactivate`
      );
      return data;
    } catch (error) {
      console.error("Error deactivating template:", error);
      throw error;
    }
  },
};

export default templateService;
