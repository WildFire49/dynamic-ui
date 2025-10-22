const BASE_URL = 'http://localhost:8000/api/v1/configurator';

const connectionService = {
  /**
   * Create a new database connection
   */
  createConnection: async (userId, connectionData) => {
    const response = await fetch(`${BASE_URL}/connections?user_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        connection_name: connectionData.connection_name,
        database_type: connectionData.database_type || 'postgresql',
        host: connectionData.host,
        port: connectionData.port,
        database_name: connectionData.database_name,
        username: connectionData.username,
        password: connectionData.password,
        ssl_enabled: connectionData.ssl_enabled || false,
        connection_params: connectionData.connection_params || {},
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create connection');
    }
    
    return { data: await response.json() };
  },

  /**
   * List all connections for a user
   */
  listConnections: async (userId) => {
    const response = await fetch(`${BASE_URL}/connections?user_id=${userId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch connections');
    }
    
    return { data: await response.json() };
  },

  /**
   * Get a specific connection by ID
   */
  getConnection: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/connections/${connectionId}`, {
      method: 'GET',
      headers: { 'accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch connection');
    }
    
    return { data: await response.json() };
  },

  /**
   * Delete a connection
   */
  deleteConnection: async (connectionId) => {
    const response = await fetch(`${BASE_URL}/connections/${connectionId}`, {
      method: 'DELETE',
      headers: { 'accept': 'application/json' },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete connection');
    }
    
    return { data: await response.json() };
  },
};

export default connectionService;
