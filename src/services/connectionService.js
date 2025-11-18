import apiClient from "./apiClient";
import notificationManager from "@/utils/notificationManager";

const BASE_URL = "/api/v1/configurator";

const connectionService = {
  /**
   * Create a new database connection
   */
  createConnection: async (userId, connectionData) => {
    try {
      const data = await apiClient.post(
        `${BASE_URL}/connections?user_id=${userId}`,
        {
          connection_name: connectionData.connection_name,
          database_type: connectionData.database_type || "postgresql",
          host: connectionData.host,
          port: connectionData.port,
          database_name: connectionData.database_name,
          username: connectionData.username,
          password: connectionData.password,
          ssl_enabled: connectionData.ssl_enabled || false,
          connection_params: connectionData.connection_params || {},
        }
      );
      notificationManager.success("Connection created successfully");
      return { data };
    } catch (error) {
      notificationManager.error(error.message || "Failed to create connection");
      throw new Error(error.message || "Failed to create connection");
    }
  },

  /**
   * List all connections for a user
   */
  listConnections: async (userId) => {
    try {
      const data = await apiClient.get(
        `${BASE_URL}/connections?user_id=${userId}`
      );
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to fetch connections");
    }
  },

  /**
   * Get a specific connection by ID
   */
  getConnection: async (connectionId) => {
    try {
      const data = await apiClient.get(
        `${BASE_URL}/connections/${connectionId}`
      );
      return { data };
    } catch (error) {
      throw new Error(error.message || "Failed to fetch connection");
    }
  },

  /**
   * Delete a connection
   */
  deleteConnection: async (connectionId) => {
    try {
      const data = await apiClient.delete(
        `${BASE_URL}/connections/${connectionId}`
      );
      notificationManager.success("Connection deleted successfully");
      return { data };
    } catch (error) {
      notificationManager.error(error.message || "Failed to delete connection");
      throw new Error(error.message || "Failed to delete connection");
    }
  },
};

export default connectionService;
