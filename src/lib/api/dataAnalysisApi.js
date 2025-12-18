/**
 * Data Analysis API Service
 * Provides functions to interact with the data analysis endpoints
 */

const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/data-analysis`;

/**
 * Get authentication headers with bearer token
 * @returns {Object} Headers object with authorization
 */
const getAuthHeaders = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

class DataAnalysisApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "DataAnalysisApiError";
    this.status = status;
    this.response = response;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
    throw new DataAnalysisApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }
  return response.json();
};

export const dataAnalysisApi = {
  /**
   * Upload a document for analysis
   * @param {string} connectionId - The connection ID to associate the document with
   * @param {File} file - The Excel or CSV file to upload
   * @param {string} userId - The user ID for document ownership
   * @param {string} context - Optional additional context for the document
   * @returns {Promise<Object>} Upload response with document details
   */
  uploadDocument: async (connectionId, file, userId, context = "") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("user_id", userId);
    if (context) {
      formData.append("context", context);
    }

    const response = await fetch(`${BASE_URL}/upload/${connectionId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse(response);
  },

  /**
   * List all documents for a connection
   * @param {string} connectionId - The connection ID
   * @param {string} userId - The user ID to filter documents
   * @returns {Promise<Object>} List of documents
   */
  listDocuments: async (connectionId, userId) => {
    const url = new URL(`${BASE_URL}/documents/${connectionId}`);
    if (userId) {
      url.searchParams.append("user_id", userId);
    }
    const response = await fetch(url.toString(), {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Analyze data with AI
   * @param {string} connectionId - The connection ID
   * @param {string} documentKey - The document key to analyze
   * @param {string} question - The analysis question
   * @param {string} context - Optional additional context
   * @returns {Promise<Object>} Analysis results optimized for graph rendering
   */
  analyzeData: async (connectionId, documentKey, question, context = "") => {
    const response = await fetch(`${BASE_URL}/analyze/${connectionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        document_key: documentKey,
        question,
        context,
      }),
    });

    return handleApiResponse(response);
  },

  /**
   * Delete a document
   * @param {string} connectionId - The connection ID
   * @param {string} documentKey - The document key to delete
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteDocument: async (connectionId, documentKey) => {
    const response = await fetch(
      `${BASE_URL}/api/v1pa${connectionId}/${documentKey}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    return handleApiResponse(response);
  },

  /**
   * Check health status of the service
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    const response = await fetch(`${BASE_URL}/health`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Test connection with curl-like functionality
   * @param {string} endpoint - The endpoint to test
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  testConnection: async (endpoint, options = {}) => {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json().catch(() => null),
    };
  },

  // ============ Cache Management APIs ============

  /**
   * Query cached document with SQL
   * @param {string} documentKey - The document key (format: userId_connId_filename)
   * @param {string} sql - SQL query to execute
   * @param {number} limit - Max rows to return (default 100)
   * @returns {Promise<Object>} Query results
   */
  queryCachedDocument: async (documentKey, sql, limit = 100) => {
    const response = await fetch(`${BASE_URL}/cache/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        document_key: documentKey,
        sql,
        limit,
      }),
    });

    return handleApiResponse(response);
  },

  /**
   * Get tables from cached document
   * @param {string} documentKey - The document key
   * @returns {Promise<Object>} List of tables/sheets in the document
   */
  getDocumentTables: async (documentKey) => {
    const response = await fetch(`${BASE_URL}/cache/tables/${documentKey}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Get cache status
   * @returns {Promise<Object>} Cache statistics and status
   */
  getCacheStatus: async () => {
    const response = await fetch(`${BASE_URL}/cache/status`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Get all documents for a user
   * @param {string} userId - The user ID
   * @returns {Promise<Object>} List of user's cached documents
   */
  getUserDocuments: async (userId) => {
    const response = await fetch(`${BASE_URL}/cache/documents/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Reload document from PostgreSQL into cache
   * @param {string} documentKey - The document key to reload
   * @returns {Promise<Object>} Reload confirmation
   */
  reloadDocument: async (documentKey) => {
    const response = await fetch(`${BASE_URL}/cache/reload/${documentKey}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Evict document from cache
   * @param {string} documentKey - The document key to evict
   * @returns {Promise<Object>} Eviction confirmation
   */
  evictFromCache: async (documentKey) => {
    const response = await fetch(`${BASE_URL}/cache/evict/${documentKey}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },

  /**
   * Cleanup expired documents from cache
   * @returns {Promise<Object>} Cleanup results
   */
  cleanupExpiredCache: async () => {
    const response = await fetch(`${BASE_URL}/cache/cleanup`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleApiResponse(response);
  },
};

export default dataAnalysisApi;
