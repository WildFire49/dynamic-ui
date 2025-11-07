import apiClient from './apiClient';

const BASE_URL = "/api/v1/fast-kg";

const fastKgService = {
  /**
   * List all tables in a schema
   */
  listTables: async (connectionId, schemaName) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/list-tables`, {
        connection_id: connectionId,
        schema_name: schemaName,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to list tables");
    }
  },

  /**
   * Build knowledge graph
   */
  buildKG: async (connectionId, schemaName, options = {}) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/build`, {
        connection_id: connectionId,
        schema_name: schemaName,
        include_enums: options.include_enums !== false,
        table_filter: options.table_filter || undefined,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to build knowledge graph");
    }
  },

  /**
   * Get KG status
   */
  getStatus: async (connectionId) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/status`, {
        connection_id: connectionId,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get KG status");
    }
  },

  /**
   * Get table information
   */
  getTableInfo: async (connectionId, tableName, schemaName) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/table-info`, {
        connection_id: connectionId,
        table_name: tableName,
        schema_name: schemaName,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get table info");
    }
  },

  /**
   * Search enum columns
   */
  searchEnums: async (connectionId, schemaName) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/search-enums`, {
        connection_id: connectionId,
        schema_name: schemaName,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to search enums");
    }
  },

  /**
   * Get related tables
   */
  getRelatedTables: async (connectionId, tableName, schemaName) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/related-tables`, {
        connection_id: connectionId,
        table_name: tableName,
        schema_name: schemaName,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get related tables");
    }
  },

  /**
   * Get statistics
   */
  getStats: async (connectionId) => {
    try {
      const data = await apiClient.get(`${BASE_URL}/stats/${connectionId}`);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get statistics");
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const data = await apiClient.get(`${BASE_URL}/health`);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Health check failed");
    }
  },

  /**
   * Generate SQL from natural language query
   */
  generateSql: async (
    connectionId,
    query,
    schemaName,
    includeReasoning = true
  ) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/generate-sql`, {
        connection_id: connectionId,
        query: query,
        schema_name: schemaName,
        include_reasoning: includeReasoning,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to generate SQL");
    }
  },

  /**
   * Execute SQL query
   */
  executeSql: async (connectionId, sql) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/execute-sql`, {
        connection_id: connectionId,
        sql: sql,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to execute SQL");
    }
  },

  /**
   * Generate and execute SQL in one call
   */
  generateAndExecute: async (
    connectionId,
    query,
    schemaName,
    includeReasoning = true,
    userId = null
  ) => {
    try {
      const requestBody = {
        connection_id: connectionId,
        query: query,
      };

      if (userId) {
        requestBody.user_id = userId;
      }

      const data = await apiClient.post(`${BASE_URL}/generate-and-execute`, requestBody);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to generate and execute SQL");
    }
  },

  /**
   * Check KG status for a connection
   */
  getKgStatus: async (connectionId) => {
    try {
      const data = await apiClient.get(`${BASE_URL}/kg-status/${connectionId}`);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get KG status");
    }
  },

  /**
   * Get table purposes
   */
  getTablePurposes: async (connectionId, schemaName) => {
    try {
      const data = await apiClient.get(
        `${BASE_URL}/table-purposes/${connectionId}?schema_name=${schemaName}`
      );
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get table purposes");
    }
  },

  /**
   * Get query history
   */
  getQueryHistory: async (connectionId, limit = 50, userId = null) => {
    try {
      let url = `${BASE_URL}/query-history/${connectionId}?limit=${limit}`;
      if (userId) {
        url += `&user_id=${userId}`;
      }
      
      const data = await apiClient.get(url);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get query history");
    }
  },

  /**
   * Mark query as correct for training directory
   */
  markQueryCorrect: async (queryId, connectionId, markedBy, notes = "") => {
    try {
      const data = await apiClient.post(`${BASE_URL}/mark-query-correct`, {
        query_id: queryId,
        connection_id: connectionId,
        marked_by: markedBy,
        notes: notes,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to mark query as correct");
    }
  },

  /**
   * Unmark query as correct
   */
  unmarkQueryCorrect: async (queryId) => {
    try {
      const data = await apiClient.delete(`${BASE_URL}/mark-query-correct/${queryId}`);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to unmark query");
    }
  },

  /**
   * Provide corrected SQL for a wrong query
   */
  provideCorrectSql: async (queryId, connectionId, correctedSql, correctedBy, notes = "") => {
    try {
      const data = await apiClient.post(`${BASE_URL}/provide-correct-sql`, {
        query_id: queryId,
        connection_id: connectionId,
        corrected_sql: correctedSql,
        corrected_by: correctedBy,
        correction_notes: notes,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to save corrected SQL");
    }
  },

  /**
   * Test custom SQL before saving as correction
   */
  testCustomSql: async (connectionId, sql, userId, saveToHistory = false) => {
    try {
      const data = await apiClient.post(`${BASE_URL}/test-custom-sql`, {
        connection_id: connectionId,
        sql: sql,
        user_id: userId,
        save_to_history: saveToHistory,
      });
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to execute test SQL");
    }
  },

  /**
   * Get training directory (queries marked as correct)
   */
  getTrainingDirectory: async (connectionId, limit = 100, markedBy = null) => {
    try {
      let url = `${BASE_URL}/training-directory/${connectionId}?limit=${limit}`;
      if (markedBy) {
        url += `&marked_by=${markedBy}`;
      }
      
      const data = await apiClient.get(url);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get training directory");
    }
  },

  /**
   * Get corrected queries (learn from mistakes)
   */
  getCorrectedQueries: async (connectionId, limit = 100, correctedBy = null) => {
    try {
      let url = `${BASE_URL}/corrected-queries/${connectionId}?limit=${limit}`;
      if (correctedBy) {
        url += `&corrected_by=${correctedBy}`;
      }
      
      const data = await apiClient.get(url);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get corrected queries");
    }
  },

  /**
   * Get template versions for a connection
   */
  getTemplateVersions: async (connectionId) => {
    try {
      const data = await apiClient.get(`${BASE_URL}/templates/versions/${connectionId}`);
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to get template versions");
    }
  },
};

export default fastKgService;
