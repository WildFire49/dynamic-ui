import apiClient from "./apiClient";

const BASE_URL = "/api/v1/query-learning";
const FAST_KG_BASE_URL = "/api/v1/fast-kg";

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
      if (businessCategory)
        params.append("business_category", businessCategory);
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
      return await apiClient.get(
        `${BASE_URL}/training-data/status/${operationId}`
      );
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
  createVersion: async (connectionId, versionName, description, createdBy) => {
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

  // ========== TEMPLATE MANAGEMENT (NEW FAST-KG APIs) ==========

  /**
   * Get examples summary with template associations
   * GET /fast-kg/templates/examples-summary/{connection_id}
   */
  getExamplesSummary: async (connectionId) => {
    try {
      return await apiClient.get(
        `${FAST_KG_BASE_URL}/templates/examples-summary/${connectionId}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get examples summary");
    }
  },

  /**
   * Get pending examples (not yet embedded)
   * GET /fast-kg/templates/pending-examples/{connection_id}
   */
  getPendingExamples: async (connectionId) => {
    try {
      return await apiClient.get(
        `${FAST_KG_BASE_URL}/templates/pending-examples/${connectionId}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get pending examples");
    }
  },

  /**
   * Preview Commit - Preview what will be embedded before committing
   * POST /fast-kg/templates/preview-commit
   */
  previewCommit: async (connectionId, businessDomain) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        business_domain: businessDomain,
      });
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/templates/preview-commit?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to preview commit");
    }
  },

  /**
   * Commit & Embed - One-click workflow
   * POST /fast-kg/templates/commit-and-embed
   */
  commitAndEmbed: async (
    connectionId,
    templateName,
    businessDomain,
    createdBy,
    confirmed = false
  ) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        template_name: templateName,
        business_domain: businessDomain,
        created_by: createdBy,
        confirmed: confirmed.toString(),
      });
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/templates/commit-and-embed-custom?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to commit and embed");
    }
  },

  /**
   * Get template versions
   * GET /fast-kg/templates/versions/{connection_id}
   */
  getTemplateVersions: async (connectionId, businessDomain = null) => {
    try {
      const params = new URLSearchParams({ connection_id: connectionId });
      if (businessDomain) {
        params.append("business_domain", businessDomain);
      }
      return await apiClient.get(
        `${FAST_KG_BASE_URL}/templates/versions/${connectionId}?${params}`
      );
    } catch (error) {
      console.warn("Template versions API error:", error.message);
      // Return empty array instead of throwing to prevent UI errors
      return { versions: [], count: 0 };
    }
  },

  /**
   * Activate template version
   * POST /fast-kg/templates/activate/{template_id}
   */
  activateTemplate: async (templateId, connectionId, createdBy) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        created_by: createdBy,
      });
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/templates/activate/${templateId}?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to activate template");
    }
  },

  /**
   * Get template changelog
   * GET /fast-kg/templates/changelog
   */
  getTemplateChangelog: async (connectionId, templateId = null) => {
    try {
      const params = new URLSearchParams({ connection_id: connectionId });
      if (templateId) {
        params.append("template_id", templateId);
      }
      return await apiClient.get(
        `${FAST_KG_BASE_URL}/templates/changelog?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get changelog");
    }
  },

  // ========== QUERY EXECUTION & LEARNING ==========

  /**
   * Ask Query - Generate and execute SQL with validation
   * POST /fast-kg/ask
   */
  askQuery: async (
    connectionId,
    query,
    userId,
    version = null,
    executionSource = "duckdb"
  ) => {
    try {
      const payload = {
        connection_id: connectionId,
        query: query,
        user_id: userId,
        execution_source: executionSource,
      };

      // Add version if specified
      if (version) {
        payload.version = version;
      }

      return await apiClient.post(`${FAST_KG_BASE_URL}/ask`, payload);
    } catch (error) {
      // Return error details for handling in component
      throw error;
    }
  },

  /**
   * Provide Correct SQL and Embed for Learning
   * POST /fast-kg/provide-correct-sql-and-embed
   */
  provideCorrectSql: async (
    queryId,
    connectionId,
    correctedSql,
    naturalLanguageQuery,
    businessDomain,
    explanation,
    correctedBy,
    executionSource = "duckdb"
  ) => {
    try {
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/provide-correct-sql-and-embed`,
        {
          connection_id: connectionId,
          query_id: queryId,
          corrected_sql: correctedSql,
          natural_language_query: naturalLanguageQuery,
          business_domain: businessDomain,
          explanation: explanation,
          corrected_by: correctedBy,
          execution_source: executionSource,
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to provide correct SQL");
    }
  },

  // ========== EMBEDDING VERSION MANAGEMENT ==========

  /**
   * Create new embedding version
   * POST /fast-kg/embeddings/create-version
   */
  createEmbeddingVersion: async (connectionId, description, createdBy) => {
    try {
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/embeddings/create-version`,
        {
          connection_id: connectionId,
          description: description,
          created_by: createdBy,
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to create embedding version");
    }
  },

  /**
   * List embedding versions
   * GET /fast-kg/embeddings/versions/{connection_id}
   */
  listEmbeddingVersions: async (connectionId) => {
    try {
      return await apiClient.get(
        `${FAST_KG_BASE_URL}/embeddings/versions/${connectionId}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to list embedding versions");
    }
  },

  /**
   * Switch embedding version
   * POST /fast-kg/embeddings/switch-version
   */
  switchEmbeddingVersion: async (connectionId, versionNumber) => {
    try {
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/embeddings/switch-version`,
        {
          connection_id: connectionId,
          version_number: versionNumber,
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to switch embedding version");
    }
  },

  /**
   * Export template
   * POST /fast-kg/embeddings/export-template
   */
  exportTemplate: async (
    connectionId,
    versionNumber,
    templateName,
    description,
    tags
  ) => {
    try {
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/embeddings/export-template`,
        {
          connection_id: connectionId,
          version_number: versionNumber,
          template_name: templateName,
          description: description,
          tags: tags,
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to export template");
    }
  },

  /**
   * Import template
   * POST /fast-kg/embeddings/import-template
   */
  importTemplate: async (
    connectionId,
    templateFile,
    createNewVersion,
    description
  ) => {
    try {
      const formData = new FormData();
      formData.append("connection_id", connectionId);
      formData.append("template_file", templateFile);
      formData.append("create_new_version", createNewVersion.toString());
      formData.append("description", description);

      return await apiClient.post(
        `${FAST_KG_BASE_URL}/embeddings/import-template`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to import template");
    }
  },

  /**
   * Compare versions
   * POST /fast-kg/embeddings/compare-versions
   */
  compareVersions: async (connectionId, version1, version2) => {
    try {
      return await apiClient.post(
        `${FAST_KG_BASE_URL}/embeddings/compare-versions`,
        {
          connection_id: connectionId,
          version_1: version1,
          version_2: version2,
        }
      );
    } catch (error) {
      throw new Error(error.message || "Failed to compare versions");
    }
  },

  // ========== REGRESSION TESTING ==========

  /**
   * Run Bulk Test
   * POST /fast-kg/test-queries/bulk
   */
  runBulkTest: async (
    connectionId,
    userId,
    limit = 10,
    businessDomain = null,
    onlyLatestEmbedding = true
  ) => {
    try {
      return await apiClient.post(`${FAST_KG_BASE_URL}/test-queries/bulk`, {
        connection_id: connectionId,
        user_id: userId,
        limit: limit,
        business_domain: businessDomain,
        only_latest_embedding: onlyLatestEmbedding,
      });
    } catch (error) {
      throw new Error(error.message || "Failed to run bulk test");
    }
  },

  /**
   * Get Test Sessions
   * GET /fast-kg/test-queries/sessions
   */
  getTestSessions: async (connectionId, limit = 10, testSessionId = null) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        limit: limit.toString(),
      });

      if (testSessionId) {
        params.append("test_session_id", testSessionId);
      }

      return await apiClient.get(
        `${FAST_KG_BASE_URL}/test-queries/sessions?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get test sessions");
    }
  },

  /**
   * Get Failed Queries
   * GET /fast-kg/test-queries/failed
   */
  getFailedQueries: async (connectionId, limit = 20) => {
    try {
      const params = new URLSearchParams({
        connection_id: connectionId,
        limit: limit.toString(),
      });

      return await apiClient.get(
        `${FAST_KG_BASE_URL}/test-queries/failed?${params}`
      );
    } catch (error) {
      throw new Error(error.message || "Failed to get failed queries");
    }
  },
};

export default queryLearningService;
