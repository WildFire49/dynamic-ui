const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

/**
 * Query Learning Service - Self-Learning System
 * Handles templates, training data, versions, and analytics
 */
const queryLearningService = {
  // ========== TEMPLATE MANAGEMENT ==========

  /**
   * 1. Seed Templates - Initialize with 5 predefined templates
   * POST /templates/seed
   */
  seedTemplates: async (connectionId, createdBy) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/templates/seed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          created_by: createdBy,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to seed templates");
    }
    return response.json();
  },

  /**
   * 2. List Templates
   * GET /templates?connection_id={uuid}&is_active=true
   */
  listTemplates: async (connectionId, isActive = true) => {
    const params = new URLSearchParams({
      connection_id: connectionId,
      is_active: isActive.toString(),
    });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/templates?${params}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list templates");
    }
    return response.json();
  },

  /**
   * 3. Match Query to Template
   * POST /templates/match
   */
  matchTemplate: async (connectionId, query, topK = 1) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/templates/match`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          query: query,
          top_k: topK,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to match template");
    }
    return response.json();
  },

  /**
   * 4. Create Custom Template
   * POST /templates
   */
  createTemplate: async (templateData) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/templates`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateData),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create template");
    }
    return response.json();
  },

  // ========== LEARNED EXAMPLES ==========

  /**
   * 5. List Learned Examples
   * GET /examples?connection_id={uuid}&tags=onboarding&limit=100
   */
  listExamples: async (
    connectionId,
    { tags, businessCategory, complexityLevel, limit = 100, offset = 0 } = {}
  ) => {
    const params = new URLSearchParams({
      connection_id: connectionId,
      limit: limit.toString(),
      offset: offset.toString(),
    });
    if (tags) params.append("tags", tags);
    if (businessCategory) params.append("business_category", businessCategory);
    if (complexityLevel) params.append("complexity_level", complexityLevel);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/examples?${params}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list examples");
    }
    return response.json();
  },

  /**
   * 6. Semantic Search
   * POST /examples/search
   */
  searchExamples: async (connectionId, query, topK = 3, filters = {}) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/examples/search`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          query: query,
          top_k: topK,
          filters: filters,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to search examples");
    }
    return response.json();
  },

  /**
   * 7. Update Example
   * PUT /examples/{example_id}
   */
  updateExample: async (exampleId, updates) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/examples/${exampleId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update example");
    }
    return response.json();
  },

  // ========== TRAINING DATA GENERATION ==========

  /**
   * 8. Generate Training Data (Single Query)
   * POST /training-data/generate
   */
  generateTrainingData: async (
    queryHistoryId,
    connectionId,
    userId,
    regenerateBusinessLogic = true,
    regenerateTags = true
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/training-data/generate`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query_history_id: queryHistoryId,
          connection_id: connectionId,
          user_id: userId,
          regenerate_business_logic: regenerateBusinessLogic,
          regenerate_tags: regenerateTags,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to generate training data");
    }
    return response.json();
  },

  /**
   * 9. Check Training Progress (POLL THIS!)
   * GET /training-data/status/{operation_id}
   */
  getTrainingStatus: async (operationId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/training-data/status/${operationId}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get training status");
    }
    return response.json();
  },

  /**
   * 10. Batch Learn from Correct Queries
   * POST /training-data/batch-learn
   */
  batchLearn: async (
    connectionId,
    userId,
    sinceDate,
    limit = 100,
    createNewVersion = true,
    versionName
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/training-data/batch-learn`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          user_id: userId,
          since_date: sinceDate,
          limit: limit,
          create_new_version: createNewVersion,
          version_name: versionName,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to start batch learning");
    }
    return response.json();
  },

  // ========== VERSION MANAGEMENT ==========

  /**
   * 11. List Versions
   * GET /versions?connection_id={uuid}&status=active
   */
  listVersions: async (connectionId, status) => {
    const params = new URLSearchParams({ connection_id: connectionId });
    if (status) params.append("status", status);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/versions?${params}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to list versions");
    }
    return response.json();
  },

  /**
   * 12. Create New Version
   * POST /versions
   */
  createVersion: async (
    connectionId,
    versionName,
    description,
    createdBy
  ) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/versions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          version_name: versionName,
          description: description,
          created_by: createdBy,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create version");
    }
    return response.json();
  },

  /**
   * 13. Deploy Version
   * POST /versions/{version_id}/deploy
   */
  deployVersion: async (versionId, userId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/versions/${versionId}/deploy?user_id=${userId}`,
      { method: "POST" }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to deploy version");
    }
    return response.json();
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
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/versions/rollback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          target_version_id: targetVersionId,
          user_id: userId,
          rollback_reason: rollbackReason,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to rollback version");
    }
    return response.json();
  },

  /**
   * 15. Compare Versions
   * POST /versions/compare
   */
  compareVersions: async (connectionId, version1Id, version2Id) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/versions/compare`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connection_id: connectionId,
          version1_id: version1Id,
          version2_id: version2Id,
        }),
      }
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to compare versions");
    }
    return response.json();
  },

  // ========== AUDIT & ANALYTICS ==========

  /**
   * 16. Get Changelog
   * GET /changelog?connection_id={uuid}&change_type=example_added
   */
  getChangelog: async (
    connectionId,
    { entityType, changeType, sinceDate, limit = 100 } = {}
  ) => {
    const params = new URLSearchParams({
      connection_id: connectionId,
      limit: limit.toString(),
    });
    if (entityType) params.append("entity_type", entityType);
    if (changeType) params.append("change_type", changeType);
    if (sinceDate) params.append("since_date", sinceDate);

    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/changelog?${params}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get changelog");
    }
    return response.json();
  },

  /**
   * 17. Get Metrics Summary
   * GET /metrics/summary?connection_id={uuid}
   */
  getMetricsSummary: async (connectionId) => {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/metrics/summary?connection_id=${connectionId}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get metrics summary");
    }
    return response.json();
  },

  /**
   * 18. Get Daily Metrics
   * GET /metrics/daily?connection_id={uuid}&start_date={date}&end_date={date}
   */
  getDailyMetrics: async (connectionId, startDate, endDate) => {
    const params = new URLSearchParams({
      connection_id: connectionId,
      start_date: startDate,
      end_date: endDate,
    });
    const response = await fetch(
      `${API_BASE_URL}/api/v1/query-learning/metrics/daily?${params}`
    );
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get daily metrics");
    }
    return response.json();
  },
};

export default queryLearningService;
