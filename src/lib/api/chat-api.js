// Chat API Integration Service
// Handles communication with backend chat API and manages conversation state

const CHAT_API_BASE_URL = 'http://localhost:8000';
const CHAT_ENDPOINT = '/chat';

/**
 * Chat API Service for Dynamic UI Workflow
 * Manages conversation_id, session_id, and API communication
 */
class ChatApiService {
  constructor() {
    this.conversationId = null;
    this.sessionId = null;
    this.customerId = null;
    this.userId = 'vaishakh_workflow1'; // Default user ID
  }

  /**
   * Initialize a new chat conversation
   * @param {string} message - Initial message to start the workflow
   * @param {string} userId - User ID (optional, defaults to 'vaishakh_workflow1')
   * @returns {Promise<Object>} API response with UI schema
   */
  async startNewConversation(message, userId = null) {
    try {
      const requestBody = {
        user_id: userId || this.userId,
        message: message
        // No conversation_id for new conversations
      };

      console.log('Starting new conversation:', requestBody);

      const response = await fetch(`${CHAT_API_BASE_URL}${CHAT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Store conversation and session data for future requests
      if (data.conversation_id) {
        this.conversationId = data.conversation_id;
      }
      
      if (data.response?.session_data?.session_id) {
        this.sessionId = data.response.session_data.session_id;
      }
      
      if (data.response?.session_data?.customer_id) {
        this.customerId = data.response.session_data.customer_id;
      }

      console.log('New conversation started:', {
        conversationId: this.conversationId,
        sessionId: this.sessionId,
        customerId: this.customerId
      });

      return data;
    } catch (error) {
      console.error('Error starting new conversation:', error);
      throw error;
    }
  }

  /**
   * Continue existing conversation
   * @param {string} message - Message to send
   * @param {Object} additionalData - Additional data to include in request
   * @returns {Promise<Object>} API response with UI schema
   */
  async continueConversation(message, additionalData = {}) {
    if (!this.conversationId) {
      throw new Error('No active conversation. Start a new conversation first.');
    }

    try {
      const requestBody = {
        user_id: this.userId,
        conversation_id: this.conversationId,
        message: message,
        ...additionalData
      };

      console.log('Continuing conversation:', requestBody);

      const response = await fetch(`${CHAT_API_BASE_URL}${CHAT_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Update session data if provided
      if (data.response?.session_data?.session_id) {
        this.sessionId = data.response.session_data.session_id;
      }

      return data;
    } catch (error) {
      console.error('Error continuing conversation:', error);
      throw error;
    }
  }

  /**
   * Send action-based message (for UI interactions)
   * @param {string} actionId - Current action ID
   * @param {string} actionType - Type of action (navigate_to, submit_form, etc.)
   * @param {Object} formData - Form data collected from UI
   * @param {string} nextActionId - Expected next action ID
   * @returns {Promise<Object>} API response with next UI schema
   */
  async sendActionMessage(actionId, actionType, formData = {}, nextActionId = null) {
    const message = this.formatActionMessage(actionId, actionType, formData, nextActionId);
    
    const additionalData = {
      action_context: {
        current_action_id: actionId,
        action_type: actionType,
        next_action_id: nextActionId,
        form_data: formData,
        session_id: this.sessionId,
        customer_id: this.customerId
      }
    };

    return await this.continueConversation(message, additionalData);
  }

  /**
   * Format action message for backend
   * @param {string} actionId - Current action ID
   * @param {string} actionType - Action type
   * @param {Object} formData - Form data
   * @param {string} nextActionId - Next action ID
   * @returns {string} Formatted message
   */
  formatActionMessage(actionId, actionType, formData, nextActionId) {
    switch (actionType) {
      case 'navigate_to':
        return `User clicked to navigate from ${actionId} to ${nextActionId}`;
      
      case 'submit_form':
        const formFields = Object.keys(formData).join(', ');
        return `User submitted form on ${actionId} with data: ${formFields}. Moving to ${nextActionId}`;
      
      case 'button_click':
        return `User clicked button on ${actionId} screen`;
      
      default:
        return `User performed ${actionType} action on ${actionId}`;
    }
  }

  /**
   * Get current conversation state
   * @returns {Object} Current state
   */
  getCurrentState() {
    return {
      conversationId: this.conversationId,
      sessionId: this.sessionId,
      customerId: this.customerId,
      userId: this.userId,
      hasActiveConversation: !!this.conversationId
    };
  }

  /**
   * Reset conversation state (for new chat)
   */
  resetConversation() {
    this.conversationId = null;
    this.sessionId = null;
    this.customerId = null;
    console.log('Conversation state reset');
  }

  /**
   * Set user ID
   * @param {string} userId - User ID to set
   */
  setUserId(userId) {
    this.userId = userId;
  }
}

// Create singleton instance
const chatApiService = new ChatApiService();

// Export convenience functions
export const startNewChat = async (message, userId = null) => {
  return await chatApiService.startNewConversation(message, userId);
};

export const continueChat = async (message, additionalData = {}) => {
  return await chatApiService.continueConversation(message, additionalData);
};

export const sendActionMessage = async (actionId, actionType, formData = {}, nextActionId = null) => {
  return await chatApiService.sendActionMessage(actionId, actionType, formData, nextActionId);
};

export const getCurrentChatState = () => {
  return chatApiService.getCurrentState();
};

export const resetChat = () => {
  chatApiService.resetConversation();
};

export const setUserId = (userId) => {
  chatApiService.setUserId(userId);
};

// Export the service instance for advanced usage
export { chatApiService };

export default chatApiService;
