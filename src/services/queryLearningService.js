import apiClient from './apiClient';

const BASE_URL = "/api/v1/query-learning";

/**
 * Query Learning Service - Self-Learning System
 * Handles templates, training data, versions, and analytics
 * All methods now use apiClient for bearer token authentication
 */
const queryLearningService = {
  // ========== TEMPLATE MANAGEMENT ==========

  /**
   * 1. Seed Templates - Initialize with 5 predefined templates
   * POST /templates/seed
   */
  seedTemplates: async (connectionId, createdBy) => {
    try {
      return await apiClient.post(`${BASE_URL}/templates/seed`, {
        connection_id: connectionId,
        created_by: createdBy,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to seed templates");
    }
  },

  /**
   * 2. List Templates
   * GET /templates?connection_id={uuid}&is_active=true
   */
  listTemplates: async (connectionId, isActive = true) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        is_active: isActive.toString(),
      });
      return await apiClient.get(`${BASE_URL}/templates?${params}`);
    } catch (error) {
      throw new Error(error.message || "Failed to list templates");
    }
  },

  /**
   * 3. Match Template
   * POST /templates/match
   */
  matchTemplate: async (connectionId, query, topK = 1) => {
    try {
      return await apiClient.post(`${BASE_URL}/templates/match`, {
        connection_id: connectionId,
        query: query,
        top_k: topK,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to match template");
    }
  },

  /**
   * 4. Create Template
   * POST /templates
   */
  createTemplate: async (templateData) => {
    try {
      return await apiClient.post(`${BASE_URL}/templates`, templateData);
    } catch (error) {
      throw new Error(error.message || "Failed to create template");
    }
  },

  // ========== LEARNED EXAMPLES ==========

  /**
   * 5. List Examples
   * GET /examples?connection_id={uuid}&limit=100
   */
  listExamples: async (
    connectionId,
    limit = 100,
    businessCategory = null,
    complexityLevel = null
  ) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        limit: limit.toString(),
      });
      if (businessCategory) params.append("business_category", businessCategory);
      if (complexityLevel) params.append("complexity_level", complexityLevel);

      return await apiClient.get(`${BASE_URL}/examples?${params}`);
    } catch (error) {
      throw new Error(error.message || "Failed to list examples");
    }
  },

  /**
   * 6. Search Examples
   * POST /examples/search
   */
  searchExamples: async (connectionId, query, topK = 3, filters = {}) => {
    try {
      return await apiClient.post(`${BASE_URL}/examples/search`, {
        connection_id: connectionId,
        query: query,
        top_k: topK,
        ...filters,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to search examples");
    }
  },

  /**
   * 7. Update Example
   * PUT /examples/{example_id}
   */
  updateExample: async (exampleId, updates) => {
    try {
      return await apiClient.put(`${BASE_URL}/examples/${exampleId}`, updates);
    } catch (error) {
      throw new Error(error.message || "Failed to update example");
    }
  },

  // ========== TRAINING DATA ==========

  /**
   * 8. Generate Training Data
   * POST /training-data/generate
   */
  generateTrainingData: async (
    queryHistoryId,
    connectionId,
    createdBy,
    regenerateBusinessLogic = true,
    regenerateTags = true
  ) => {
    try {
      return await apiClient.post(`${BASE_URL}/training-data/generate`, {
        query_history_id: queryHistoryId,
        connection_id: connectionId,
        created_by: createdBy,
        regenerate_business_logic: regenerateBusinessLogic,
        regenerate_tags: regenerateTags,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to generate training data");
    }
  },

  /**
   * 9. Get Training Status
   * GET /training-data/status/{operation_id}
   */
  getTrainingStatus: async (operationId) => {
    try {
      return await apiClient.get(`${BASE_URL}/training-data/status/${operationId}`);
    } catch (error) {
      throw new Error(error.message || "Failed to get training status");
    }
  },

  /**
   * 10. Batch Learn
   * POST /training-data/batch-learn
   */
  batchLearn: async (
    connectionId,
    createdBy,
    startDate,
    endDate,
    limit = 100,
    createNewVersion = true,
    versionName
  ) => {
    try {
      return await apiClient.post(`${BASE_URL}/training-data/batch-learn`, {
        connection_id: connectionId,
        created_by: createdBy,
        start_date: startDate,
        end_date: endDate,
        limit: limit,
        create_new_version: createNewVersion,
        version_name: versionName,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to batch learn");
    }
  },

  // ========== VERSION MANAGEMENT ==========

  /**
   * 11. List Versions
   * GET /versions?connection_id={uuid}&status=active
   */
  listVersions: async (connectionId, status = null) => {
    try {
      const params = new URLSearchParams({ connection_id: connectionId });
      if (status) params.append("status", status);

      return await apiClient.get(`${BASE_URL}/versions?${params}`);
    } catch (error) {
      throw new Error(error.message || "Failed to list versions");
    }
  },

  /**
   * 12. Create Version
   * POST /versions
   */
  createVersion: async (
    connectionId,
    versionName,
    description,
    createdBy
  ) => {
    try {
      return await apiClient.post(`${BASE_URL}/versions`, {
        connection_id: connectionId,
        version_name: versionName,
        description: description,
        created_by: createdBy,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to create version");
    }
  },

  /**
   * 13. Deploy Version
   * POST /versions/{version_id}/deploy
   */
  deployVersion: async (versionId, userId) => {
    try {
      return await apiClient.post(
        `${BASE_URL}/versions/${versionId}/deploy?user_id=${userId}`,
        {}
      );
    } catch (error) {
      throw new Error(error.message || "Failed to deploy version");
    }
  },

  /**
   * 14. Rollback Version
   * POST /versions/rollback
   */
  rollbackVersion: async (
    connectionId,
    targetVersionId,
    userId,
    rollbackReason
  ) => {
    try {
      return await apiClient.post(`${BASE_URL}/versions/rollback`, {
        connection_id: connectionId,
        target_version_id: targetVersionId,
        user_id: userId,
        rollback_reason: rollbackReason,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to rollback version");
    }
  },

  /**
   * 15. Compare Versions
   * POST /versions/compare
   */
  compareVersions: async (connectionId, version1Id, version2Id) => {
    try {
      return await apiClient.post(`${BASE_URL}/versions/compare`, {
        connection_id: connectionId,
        version1_id: version1Id,
        version2_id: version2Id,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to compare versions");
    }
  },

  // ========== ANALYTICS ==========

  /**
   * 16. Get Changelog
   * GET /changelog?connection_id={uuid}&entity_type=example&limit=50
   */
  getChangelog: async (
    connectionId,
    entityType = null,
    changeType = null,
    sinceDate = null,
    limit = 50
  ) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        limit: limit.toString(),
      });
      if (entityType) params.append("entity_type", entityType);
      if (changeType) params.append("change_type", changeType);
      if (sinceDate) params.append("since_date", sinceDate);

      return await apiClient.get(`${BASE_URL}/changelog?${params}`);
    } catch (error) {
      throw new Error(error.message || "Failed to get changelog");
    }
  },

  /**
   * 17. Get Metrics Summary
   * GET /metrics/summary?connection_id={uuid}
   */
  getMetricsSummary: async (connectionId) => {
    try {
      return await apiClient.get(
        `${BASE_URL}/metrics/summary?connection_id=${connectionId}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get metrics summary");
    }
  },

  /**
   * 18. Get Daily Metrics
   * GET /metrics/daily?connection_id={uuid}&start_date=2025-01-01&end_date=2025-01-31
   */
  getDailyMetrics: async (connectionId, startDate, endDate) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        start_date: startDate,
        end_date: endDate,
      });
      return await apiClient.get(`${BASE_URL}/metrics/daily?${params}`);
    } catch (error) {
      throw new Error(error.message || "Failed to get daily metrics");
    }
  },
};

export default queryLearningService;
