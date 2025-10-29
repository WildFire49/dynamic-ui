import { create } from "zustand";
import { persist } from "zustand/middleware";

const useRetrieverStore = create(
  persist(
    (set, get) => ({
      // Cached table lists by connection ID
      tableListCache: {},

      // Saved connections list
      savedConnections: [],

      // Current connection (full object with ID)
      currentConnection: null,

      // Selected tables
      selectedTables: [],

      // KG Status
      kgStatus: null,

      // User ID
      userId: "vaishakhsk",

      /**
       * Get connection key for caching
       */
      getConnectionKey: (connectionData) => {
        if (!connectionData) return null;
        return `${connectionData.host}:${connectionData.port}/${connectionData.database}/${connectionData.schema}`;
      },

      /**
       * Get cached table list for a connection
       */
      getCachedTableList: (connectionData) => {
        const key = get().getConnectionKey(connectionData);
        if (!key) return null;

        const cached = get().tableListCache[key];
        if (!cached) return null;

        // Check if cache is still valid (optional: add expiry)
        return cached;
      },

      /**
       * Set table list cache for a connection
       */
      setCachedTableList: (connectionData, tableList) => {
        const key = get().getConnectionKey(connectionData);
        if (!key) return;

        set((state) => ({
          tableListCache: {
            ...state.tableListCache,
            [key]: {
              tables: tableList,
              timestamp: new Date().toISOString(),
            },
          },
        }));
      },

      /**
       * Clear cache for a specific connection
       */
      clearTableListCache: (connectionData) => {
        const key = get().getConnectionKey(connectionData);
        if (!key) return;

        set((state) => {
          const newCache = { ...state.tableListCache };
          delete newCache[key];
          return { tableListCache: newCache };
        });
      },

      /**
       * Clear all cache
       */
      clearAllCache: () => {
        set({ tableListCache: {} });
      },

      /**
       * Set current connection
       */
      setCurrentConnection: (connectionData) => {
        set({ currentConnection: connectionData });
      },

      /**
       * Set selected tables
       */
      setSelectedTables: (tables) => {
        set({ selectedTables: tables });
      },

      /**
       * Set KG status
       */
      setKGStatus: (status) => {
        set({ kgStatus: status });
      },

      /**
       * Set saved connections
       */
      setSavedConnections: (connections) => {
        set({ savedConnections: connections });
      },

      /**
       * Add a saved connection
       */
      addSavedConnection: (connection) => {
        set((state) => ({
          savedConnections: [...state.savedConnections, connection],
        }));
      },

      /**
       * Remove a saved connection
       */
      removeSavedConnection: (connectionId) => {
        set((state) => ({
          savedConnections: state.savedConnections.filter(
            (c) => c.id !== connectionId
          ),
        }));
      },

      /**
       * Set user ID
       */
      setUserId: (userId) => {
        set({ userId });
      },

      /**
       * Reset all state
       */
      reset: () => {
        set({
          currentConnection: null,
          selectedTables: [],
          kgStatus: null,
        });
      },
    }),
    {
      name: "retriever-storage",
      partialize: (state) => ({
        // Only persist table cache, not other state
        tableListCache: state.tableListCache,
      }),
    }
  )
);

export { useRetrieverStore };
export default useRetrieverStore;
