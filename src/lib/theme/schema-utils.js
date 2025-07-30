// Enhanced Schema Utilities for Backend-Driven Dynamic UI
// This file provides utilities to work with the enhanced mock-schema structure

import { getActionSchema, getUiSchema } from './mock-schema';

/**
 * Get a specific action by ID
 * @param {string} actionId - The action ID to find
 * @returns {Object|null} The action object or null if not found
 */
export const getActionById = (actionId) => {
  const actions = getActionSchema();
  return actions.find(action => action.id === actionId) || null;
};

/**
 * Get UI schema for a specific action
 * @param {string} actionId - The action ID
 * @returns {Object|null} The corresponding UI schema or null
 */
export const getUiSchemaForAction = (actionId) => {
  const action = getActionById(actionId);
  if (!action || !action.ui_id) return null;
  
  const uiSchemas = getUiSchema();
  return uiSchemas.find(schema => schema.id === action.ui_id) || null;
};

/**
 * Get the next action ID based on current action and success/error state
 * @param {string} currentActionId - Current action ID
 * @param {boolean} isSuccess - Whether the action was successful
 * @param {string} flowType - Optional flow type for conditional navigation
 * @returns {string|null} Next action ID or null
 */
export const getNextActionId = (currentActionId, isSuccess = true, flowType = null) => {
  const action = getActionById(currentActionId);
  if (!action) return null;
  
  if (isSuccess) {
    // Check for conditional navigation based on flow type
    if (action.conditional_next && flowType && action.conditional_next[flowType]) {
      return action.conditional_next[flowType];
    }
    return action.next_success_action_id;
  } else {
    return action.next_err_action_id;
  }
};

/**
 * Get actions by flow type
 * @param {string} flowType - The flow type (onboarding, collections, both)
 * @returns {Array} Array of actions for the specified flow type
 */
export const getActionsByFlowType = (flowType) => {
  const actions = getActionSchema();
  return actions.filter(action => 
    action.flow_type === flowType || action.flow_type === 'both'
  );
};

/**
 * Get mandatory actions for a flow
 * @param {string} flowType - The flow type
 * @returns {Array} Array of mandatory actions
 */
export const getMandatoryActions = (flowType = null) => {
  const actions = flowType ? getActionsByFlowType(flowType) : getActionSchema();
  return actions.filter(action => action.is_mandatory === true);
};

/**
 * Validate if an action can be skipped
 * @param {string} actionId - The action ID to check
 * @returns {boolean} Whether the action can be skipped
 */
export const canSkipAction = (actionId) => {
  const action = getActionById(actionId);
  return action ? !action.is_mandatory : false;
};

/**
 * Get actions sorted by priority
 * @param {string} flowType - Optional flow type filter
 * @returns {Array} Array of actions sorted by priority
 */
export const getActionsByPriority = (flowType = null) => {
  const actions = flowType ? getActionsByFlowType(flowType) : getActionSchema();
  return actions.sort((a, b) => (a.priority || 999) - (b.priority || 999));
};

/**
 * Create a backend API response structure for a specific action
 * @param {string} actionId - The action ID
 * @param {Object} additionalData - Additional data to include
 * @returns {Object} Backend API response structure
 */
export const createApiResponse = (actionId, additionalData = {}) => {
  const action = getActionById(actionId);
  const uiSchema = getUiSchemaForAction(actionId);
  
  if (!action) {
    return {
      success: false,
      error: `Action with ID '${actionId}' not found`,
      action_id: actionId
    };
  }
  
  return {
    success: true,
    current_action: {
      action_id: action.id,
      stage_name: action.stage_name,
      action_type: action.action_type,
      priority: action.priority,
      is_mandatory: action.is_mandatory,
      flow_type: action.flow_type,
      validation_required: action.validation_required || false
    },
    ui_schema: uiSchema,
    navigation: {
      next_success_action_id: action.next_success_action_id,
      next_err_action_id: action.next_err_action_id,
      conditional_next: action.conditional_next || null,
      can_skip: !action.is_mandatory
    },
    api_detail_id: action.api_detail_id,
    ...additionalData
  };
};

/**
 * Create a flow completion response
 * @param {string} flowType - The completed flow type
 * @param {Object} completionData - Data about the completion
 * @returns {Object} Flow completion response
 */
export const createFlowCompletionResponse = (flowType, completionData = {}) => {
  return {
    success: true,
    flow_completed: true,
    flow_type: flowType,
    completion_data: completionData,
    next_steps: completionData.next_steps || null,
    timestamp: new Date().toISOString()
  };
};

/**
 * Create an error response for failed actions
 * @param {string} actionId - The action ID that failed
 * @param {string} errorMessage - The error message
 * @param {Object} errorDetails - Additional error details
 * @returns {Object} Error response structure
 */
export const createErrorResponse = (actionId, errorMessage, errorDetails = {}) => {
  const action = getActionById(actionId);
  
  return {
    success: false,
    error: errorMessage,
    action_id: actionId,
    retry_action_id: action?.next_err_action_id || actionId,
    error_details: errorDetails,
    timestamp: new Date().toISOString()
  };
};

/**
 * Validate action transition
 * @param {string} fromActionId - Current action ID
 * @param {string} toActionId - Target action ID
 * @param {boolean} isSuccess - Whether transition is due to success
 * @returns {Object} Validation result
 */
export const validateActionTransition = (fromActionId, toActionId, isSuccess = true) => {
  const fromAction = getActionById(fromActionId);
  const toAction = getActionById(toActionId);
  
  if (!fromAction) {
    return { valid: false, reason: `Source action '${fromActionId}' not found` };
  }
  
  if (!toAction) {
    return { valid: false, reason: `Target action '${toActionId}' not found` };
  }
  
  const expectedNextId = isSuccess ? fromAction.next_success_action_id : fromAction.next_err_action_id;
  
  // Check conditional navigation
  if (fromAction.conditional_next && isSuccess) {
    const conditionalIds = Object.values(fromAction.conditional_next);
    if (conditionalIds.includes(toActionId)) {
      return { valid: true, reason: 'Valid conditional transition' };
    }
  }
  
  if (expectedNextId === toActionId) {
    return { valid: true, reason: 'Valid transition' };
  }
  
  return { 
    valid: false, 
    reason: `Invalid transition. Expected '${expectedNextId}', got '${toActionId}'` 
  };
};

export default {
  getActionById,
  getUiSchemaForAction,
  getNextActionId,
  getActionsByFlowType,
  getMandatoryActions,
  canSkipAction,
  getActionsByPriority,
  createApiResponse,
  createFlowCompletionResponse,
  createErrorResponse,
  validateActionTransition
};
