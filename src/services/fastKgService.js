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
    includeReasoning = true
  ) => {
    const response = await fetch(`${BASE_URL}/generate-and-execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connection_id: connectionId,
        query: query,
      }),
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
  getQueryHistory: async (connectionId, limit = 20) => {
    const response = await fetch(
      `${BASE_URL}/query-history/${connectionId}?limit=${limit}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || "Failed to get query history");
    }

    return { data: await response.json() };
  },
};

export default fastKgService;
