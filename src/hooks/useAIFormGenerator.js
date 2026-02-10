'use client';

import { useState, useCallback } from 'react';
import uiConfiguratorService from '@/services/uiConfiguratorService';
import authService from '@/services/authService';

/**
 * Custom hook for AI form generation
 * @returns {Object} Form generation state and methods
 */
export const useAIFormGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [currentFormId, setCurrentFormId] = useState(null);

  /**
   * Generate or update a form
   * @param {string} prompt - User's prompt
   * @param {Function} onSuccess - Success callback
   * @param {Function} onError - Error callback
   */
  const generateForm = useCallback(async (prompt, onSuccess, onError) => {
    setLoading(true);
    setError(null);

    try {
      const username = authService.getUsername();
      
      const response = await uiConfiguratorService.generateForm({
        prompt,
        userId: username || 'anonymous',
        conversationId,
        formId: currentFormId,
      });

      // Handle both form generation and workflow creation responses
      const isWorkflow = response.action === 'create_workflow' || response.data?.canvas_state;
      const isFormSchema = response.success && response.data?.schema;

      if (isFormSchema || isWorkflow) {
        // Update conversation ID if this is a new conversation
        const convId = response.conversation_id || response.data?.conversation_id;
        if (convId && !conversationId) {
          setConversationId(convId);
        }

        // Update current form ID (only for form responses)
        if (response.data?.form_id) {
          setCurrentFormId(response.data.form_id);
        }

        // Call success callback
        if (onSuccess) {
          onSuccess({ ...response.data, action: response.action, message: response.message });
        }

        return response.data;
      } else {
        throw new Error(response.data?.message || response.message || 'Form generation failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to generate form';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [conversationId, currentFormId]);

  /**
   * Reset conversation state
   */
  const resetConversation = useCallback(() => {
    setConversationId(null);
    setCurrentFormId(null);
    setError(null);
  }, []);

  /**
   * Load an existing conversation
   * @param {string} convId - Conversation ID
   * @param {string} formId - Form ID
   */
  const loadConversation = useCallback((convId, formId) => {
    setConversationId(convId);
    setCurrentFormId(formId);
  }, []);

  return {
    loading,
    error,
    conversationId,
    currentFormId,
    generateForm,
    resetConversation,
    loadConversation,
  };
};
