/**
 * Embeddings API Service
 * Handles document embedding, collections management, and ChromaDB operations
 */

import { API_BASE_URL } from '@/lib/config';

const EMBEDDINGS_BASE_URL = `${API_BASE_URL}/api/v1/embeddings`;

class EmbeddingsApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = 'EmbeddingsApiError';
    this.status = status;
    this.response = response;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new EmbeddingsApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData
    );
  }
  return response.json();
};

export const embeddingsApi = {
  /**
   * Embed documents from text content
   * @param {Array<string>} documents - Array of document text content
   * @param {string} agentType - Type of agent (rule_agent, scheduler, supervisory, analysis_agent)
   * @param {string} backend - Backend type (default: "chromadb")
   * @param {number} chunkSize - Text chunk size (default: 1000)
   * @param {number} chunkOverlap - Chunk overlap (default: 200)
   * @param {Object} metadata - Additional metadata
   * @returns {Promise<Object>} Embedding response
   */
  embedDocuments: async (documents, agentType, backend = 'chromadb', chunkSize = 1000, chunkOverlap = 200, metadata = {}) => {
    const response = await fetch(`${EMBEDDINGS_BASE_URL}/embed-documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        documents,
        agent_type: agentType,
        backend,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        metadata
      })
    });

    return handleApiResponse(response);
  },

  /**
   * Embed documents from files (PDF, DOCX, TXT, Excel)
   * @param {FileList|Array<File>} files - Files to upload
   * @param {string} agentType - Type of agent
   * @param {string} backend - Backend type (default: "chromadb")
   * @param {number} chunkSize - Text chunk size (default: 1000)
   * @param {number} chunkOverlap - Chunk overlap (default: 200)
   * @returns {Promise<Object>} Embedding response
   */
  embedFiles: async (files, agentType, backend = 'chromadb', chunkSize = 1000, chunkOverlap = 200) => {
    const formData = new FormData();
    
    // Add files
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    // Add parameters
    formData.append('agent_type', agentType);
    formData.append('backend', backend);
    formData.append('chunk_size', chunkSize.toString());
    formData.append('chunk_overlap', chunkOverlap.toString());

    const response = await fetch(`${EMBEDDINGS_BASE_URL}/embed-files`, {
      method: 'POST',
      body: formData
    });

    return handleApiResponse(response);
  },

  /**
   * List all available collections
   * @returns {Promise<Object>} Collections list
   */
  listCollections: async () => {
    const response = await fetch(`${EMBEDDINGS_BASE_URL}/collections`);
    return handleApiResponse(response);
  },

  /**
   * Get collection details
   * @param {string} collectionName - Name of the collection
   * @returns {Promise<Object>} Collection details
   */
  getCollectionDetails: async (collectionName) => {
    const response = await fetch(`${EMBEDDINGS_BASE_URL}/collections/${collectionName}`);
    return handleApiResponse(response);
  },

  /**
   * Delete a collection
   * @param {string} collectionName - Name of the collection to delete
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteCollection: async (collectionName) => {
    const response = await fetch(`${EMBEDDINGS_BASE_URL}/collections/${collectionName}`, {
      method: 'DELETE'
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
    const url = endpoint.startsWith('http') ? endpoint : `${EMBEDDINGS_BASE_URL}${endpoint}`;
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
  }
};

export default embeddingsApi;
