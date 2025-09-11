/**
 * Data Analysis API Service
 * Provides functions to interact with the data analysis endpoints
 */

const BASE_URL = '/api/v1/data-analysis';

class DataAnalysisApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'DataAnalysisApiError';
    this.status = status;
    this.response = response;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
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
   * @param {string} context - Optional additional context for the document
   * @returns {Promise<Object>} Upload response with document details
   */
  uploadDocument: async (connectionId, file, context = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (context) {
      formData.append('context', context);
    }

    const response = await fetch(`${BASE_URL}/upload/${connectionId}`, {
      method: 'POST',
      body: formData,
    });

    return handleApiResponse(response);
  },

  /**
   * List all documents for a connection
   * @param {string} connectionId - The connection ID
   * @returns {Promise<Object>} List of documents
   */
  listDocuments: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/documents/${connectionId}`);
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
  analyzeData: async (connectionId, documentKey, question, context = '') => {
    const response = await fetch(`${BASE_URL}/analyze/${connectionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
    const response = await fetch(`${BASE_URL}/documents/${connectionId}/${documentKey}`, {
      method: 'DELETE',
    });

    return handleApiResponse(response);
  },

  /**
   * Check health status of the service
   * @returns {Promise<Object>} Health status
   */
  healthCheck: async () => {
    const response = await fetch(`${BASE_URL}/health`);
    return handleApiResponse(response);
  },

  /**
   * Test connection with curl-like functionality
   * @param {string} endpoint - The endpoint to test
   * @param {Object} options - Request options
   * @returns {Promise<Object>} Response data
   */
  testConnection: async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
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
};

export default dataAnalysisApi;
