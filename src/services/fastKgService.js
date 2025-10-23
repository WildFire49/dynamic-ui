const BASE_URL = "http://localhost:8000/api/v1/fast-kg";

const fastKgService = {
  /**
   * List all tables in a schema
   */
  listTables: async (connectionId, schemaName) => {
    const response = await fetch(`${BASE_URL}/list-tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        schema_name: schemaName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to list tables");
    }

    return { data: await response.json() };
  },

  /**
   * Build knowledge graph
   */
  buildKG: async (connectionId, schemaName, options = {}) => {
    const response = await fetch(`${BASE_URL}/build`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        schema_name: schemaName,
        include_enums: options.include_enums !== false,
        table_filter: options.table_filter || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to build knowledge graph");
    }

    return { data: await response.json() };
  },

  /**
   * Get KG status
   */
  getStatus: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get KG status");
    }

    return { data: await response.json() };
  },

  /**
   * Get table information
   */
  getTableInfo: async (connectionId, tableName, schemaName) => {
    const response = await fetch(`${BASE_URL}/table-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        table_name: tableName,
        schema_name: schemaName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get table info");
    }

    return { data: await response.json() };
  },

  /**
   * Search enum columns
   */
  searchEnums: async (connectionId, schemaName) => {
    const response = await fetch(`${BASE_URL}/search-enums`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        schema_name: schemaName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to search enums");
    }

    return { data: await response.json() };
  },

  /**
   * Get related tables
   */
  getRelatedTables: async (connectionId, tableName, schemaName) => {
    const response = await fetch(`${BASE_URL}/related-tables`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        table_name: tableName,
        schema_name: schemaName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get related tables");
    }

    return { data: await response.json() };
  },

  /**
   * Get statistics
   */
  getStats: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/stats/${connectionId}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Failed to get statistics");
    }

    return { data: await response.json() };
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    const response = await fetch(`${BASE_URL}/health`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return { data: await response.json() };
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
    const response = await fetch(`${BASE_URL}/generate-sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        query: query,
        schema_name: schemaName,
        include_reasoning: includeReasoning,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate SQL");
    }

    return { data: await response.json() };
  },

  /**
   * Execute SQL query
   */
  executeSql: async (connectionId, sql) => {
    const response = await fetch(`${BASE_URL}/execute-sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        sql: sql,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to execute SQL");
    }

    return { data: await response.json() };
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
    const requestBody = {
      connection_id: connectionId,
      query: query,
    };

    // Add user_id if provided
    if (userId) {
      requestBody.user_id = userId;
    }

    const response = await fetch(`${BASE_URL}/generate-and-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to generate and execute SQL");
    }

    return { data: await response.json() };
  },

  /**
   * Check KG status for a connection
   */
  getKgStatus: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/kg-status/${connectionId}`, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get KG status");
    }

    return { data: await response.json() };
  },

  /**
   * Get table purposes
   */
  getTablePurposes: async (connectionId, schemaName) => {
    const response = await fetch(
      `${BASE_URL}/table-purposes/${connectionId}?schema_name=${schemaName}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get table purposes");
    }

    return { data: await response.json() };
  },

  /**
   * Get query history
   */
  getQueryHistory: async (connectionId, limit = 50, userId = null) => {
    let url = `${BASE_URL}/query-history/${connectionId}?limit=${limit}`;
    if (userId) {
      url += `&user_id=${userId}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get query history");
    }

    return { data: await response.json() };
  },

  /**
   * Mark query as correct for training directory
   */
  markQueryCorrect: async (queryId, connectionId, markedBy, notes = "") => {
    const response = await fetch(`${BASE_URL}/mark-query-correct`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_id: queryId,
        connection_id: connectionId,
        marked_by: markedBy,
        notes: notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to mark query as correct");
    }

    return { data: await response.json() };
  },

  /**
   * Unmark query as correct
   */
  unmarkQueryCorrect: async (queryId) => {
    const response = await fetch(`${BASE_URL}/mark-query-correct/${queryId}`, {
      method: "DELETE",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to unmark query");
    }

    return { data: await response.json() };
  },

  /**
   * Provide corrected SQL for a wrong query
   */
  provideCorrectSql: async (queryId, connectionId, correctedSql, correctedBy, notes = "") => {
    const response = await fetch(`${BASE_URL}/provide-correct-sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query_id: queryId,
        connection_id: connectionId,
        corrected_sql: correctedSql,
        corrected_by: correctedBy,
        correction_notes: notes,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to save corrected SQL");
    }

    return { data: await response.json() };
  },

  /**
   * Test custom SQL before saving as correction
   */
  testCustomSql: async (connectionId, sql, userId, saveToHistory = false) => {
    const response = await fetch(`${BASE_URL}/test-custom-sql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        sql: sql,
        user_id: userId,
        save_to_history: saveToHistory,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to execute test SQL");
    }

    return { data: await response.json() };
  },

  /**
   * Get training directory (queries marked as correct)
   */
  getTrainingDirectory: async (connectionId, limit = 100, markedBy = null) => {
    let url = `${BASE_URL}/training-directory/${connectionId}?limit=${limit}`;
    if (markedBy) {
      url += `&marked_by=${markedBy}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get training directory");
    }

    return { data: await response.json() };
  },

  /**
   * Get corrected queries (learn from mistakes)
   */
  getCorrectedQueries: async (connectionId, limit = 100, correctedBy = null) => {
    let url = `${BASE_URL}/corrected-queries/${connectionId}?limit=${limit}`;
    if (correctedBy) {
      url += `&corrected_by=${correctedBy}`;
    }
    
    const response = await fetch(url, {
      method: "GET",
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get corrected queries");
    }

    return { data: await response.json() };
  },
};

export default fastKgService;
