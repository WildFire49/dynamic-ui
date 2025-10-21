'use client';

import { useState, useCallback, useEffect } from 'react';
import uiConfiguratorService from '@/services/uiConfiguratorService';
import authService from '@/services/authService';

/**
 * Custom hook for managing conversation history
 * @returns {Object} Conversation history state and methods
 */
export const useConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Load conversation history for current user
   */
  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const username = authService.getUsername();
      if (!username) {
        console.warn('No username found, skipping history load');
        return;
      }

      const history = await uiConfiguratorService.getConversationHistory(username);
      setConversations(history);
    } catch (err) {
      setError(err.message);
      console.error('Failed to load conversation history:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Delete a conversation
   * @param {string} conversationId - ID of conversation to delete
   */
  const deleteConversation = useCallback(async (conversationId) => {
    try {
      await uiConfiguratorService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete conversation:', err);
      throw err;
    }
  }, []);

  /**
   * Load initial history on mount
   */
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return {
    conversations,
    loading,
    error,
    loadHistory,
    deleteConversation,
  };
};
