/**
 * Embeddings API Service
 * Handles document embedding, collections management, and ChromaDB operations
 */

import { API_BASE_URL, CHROMA_BASE_URL } from "@/lib/config";

const EMBEDDINGS_BASE_URL = `${API_BASE_URL}/api/v1/embeddings`;
const CHROMA_API_URL = CHROMA_BASE_URL; // Direct connection to Chroma DB

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

class EmbeddingsApiError extends Error {
  constructor(message, status, response) {
    super(message);
    this.name = "EmbeddingsApiError";
    this.status = status;
    this.response = response;
  }
}

const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ message: "Unknown error" }));
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
  embedDocuments: async (
    documents,
    agentType,
    backend = "chromadb",
    chunkSize = 1000,
    chunkOverlap = 200,
    metadata = {}
  ) => {
    const response = await fetch(`${EMBEDDINGS_BASE_URL}/embed-documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        documents,
        agent_type: agentType,
        backend,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        metadata,
      }),
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
  embedFiles: async (
    files,
    agentType,
    backend = "chromadb",
    chunkSize = 1000,
    chunkOverlap = 200
  ) => {
    const formData = new FormData();

    // Add files
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    // Add parameters
    formData.append("agent_type", agentType);
    formData.append("backend", backend);
    formData.append("chunk_size", chunkSize.toString());
    formData.append("chunk_overlap", chunkOverlap.toString());

    const response = await fetch(`${EMBEDDINGS_BASE_URL}/embed-files`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    return handleApiResponse(response);
  },

  /**
   * List all available collections from Chroma DB
   * @returns {Promise<Object>} Collections list
   */
  listCollections: async () => {
    try {
      console.log(
        `Fetching collections from Chroma DB: ${CHROMA_API_URL}/api/v1/collections`
      );
      const response = await fetch(`${CHROMA_API_URL}/api/v1/collections`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        console.warn(
          `Chroma DB API returned ${response.status}, returning empty list`
        );
        return { collections: [], count: 0 };
      }

      const data = await response.json();
      console.log("Chroma DB collections:", data);

      // Transform Chroma DB response to our format
      // Chroma returns array of collection objects
      const collections = Array.isArray(data) ? data : [];

      return {
        collections: collections.map((col) => ({
          name: col.name || col.id,
          count: col.count || 0,
          metadata: col.metadata || {},
        })),
        count: collections.length,
      };
    } catch (error) {
      console.error("Error fetching collections from Chroma DB:", error);
      // Return empty collections instead of throwing
      return { collections: [], count: 0 };
    }
  },

  /**
   * Get collection details
   * @param {string} collectionName - Name of the collection
   * @returns {Promise<Object>} Collection details
   */
  getCollectionDetails: async (collectionName) => {
    const response = await fetch(
      `${EMBEDDINGS_BASE_URL}/collections/${collectionName}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleApiResponse(response);
  },

  /**
   * Delete a collection
   * @param {string} collectionName - Name of the collection to delete
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteCollection: async (collectionName) => {
    const response = await fetch(
      `${EMBEDDINGS_BASE_URL}/collections/${collectionName}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
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
      : `${EMBEDDINGS_BASE_URL}${endpoint}`;
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
};

export default embeddingsApi;
