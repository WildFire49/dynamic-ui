/**
 * Workflow API Service
 * Provides configurable API endpoints for workflow management
 * Supports both Alpha and Beta API versions
 */

import apiClient from '@/services/apiClient';

// Beta proxy base path (routed through our own backend)
const BETA_PROXY_BASE = '/api/v1/configurator/beta';

// API Configuration
const API_CONFIG = {
  alpha: {
    baseUrl: 'https://dashboard-ai-backend.mifix.io/api/v1/configurator',
    endpoints: {
      workflows: '/workflows/canvas',
    },
    headers: {
      'accept': '*/*',
      'content-type': 'application/json',
    },
  },
};

/**
 * Get current API version from localStorage or default to 'alpha'
 */
export const getApiVersion = () => {
  if (typeof window === 'undefined') return 'alpha';
  return localStorage.getItem('api_version') || 'alpha';
};

/**
 * Set API version
 * @param {string} version - 'alpha' or 'beta'
 */
export const setApiVersion = (version) => {
  if (typeof window === 'undefined') return;
  if (!['alpha', 'beta'].includes(version)) {
    throw new Error('Invalid API version. Must be "alpha" or "beta"');
  }
  localStorage.setItem('api_version', version);
};

/**
 * Get authorization token
 */
const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

/**
 * Build fetch headers for Alpha API
 */
const getAlphaHeaders = () => {
  const config = API_CONFIG.alpha;
  const headers = { ...config.headers };

  const token = getAuthToken();
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Fetch workflows (Alpha API)
 */
const fetchWorkflowsAlpha = async (userId, productId) => {
  const config = API_CONFIG.alpha;
  const params = new URLSearchParams({
    user_id: userId,
    product_id: productId,
  });

  const url = `${config.baseUrl}${config.endpoints.workflows}?${params}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAlphaHeaders(),
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Alpha API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch workflows (Beta API) via proxy
 * GET /beta/workflows
 */
const fetchWorkflowsBeta = async () => {
  return apiClient.get(`${BETA_PROXY_BASE}/workflows`);
};

/**
 * Fetch workflow steps (Beta API only) via proxy
 * GET /beta/workflow/{workflowId}/steps
 * @param {string} workflowId - Workflow ID
 */
export const fetchWorkflowSteps = async (workflowId) => {
  const version = getApiVersion();

  if (version !== 'beta') {
    throw new Error('fetchWorkflowSteps is only available in Beta API');
  }

  return apiClient.get(`${BETA_PROXY_BASE}/workflow/${workflowId}/steps`);
};

/**
 * Fetch step UI configuration (Beta API only) via proxy
 * GET /beta/workflow/step/{stepId}/ui
 * @param {string} stepId - Step ID
 */
export const fetchStepUI = async (stepId) => {
  const version = getApiVersion();

  if (version !== 'beta') {
    throw new Error('fetchStepUI is only available in Beta API');
  }

  return apiClient.get(`${BETA_PROXY_BASE}/workflow/step/${stepId}/ui`);
};

/**
 * Fetch workflows based on configured API version
 * @param {object} options - Configuration options
 * @param {string} options.userId - User ID (Alpha only)
 * @param {string} options.productId - Product ID (Alpha only)
 */
export const fetchWorkflows = async (options = {}) => {
  const version = getApiVersion();

  try {
    if (version === 'alpha') {
      const { userId, productId } = options;
      if (!userId || !productId) {
        throw new Error('userId and productId are required for Alpha API');
      }
      return await fetchWorkflowsAlpha(userId, productId);
    } else {
      return await fetchWorkflowsBeta();
    }
  } catch (error) {
    console.error(`Error fetching workflows (${version}):`, error);
    throw error;
  }
};

/**
 * Transform Beta workflow data to match Alpha structure
 * This allows the rest of the application to work with a consistent data structure
 */
export const transformBetaWorkflow = (betaData) => {
  if (!betaData || !betaData.data) return null;

  const { data } = betaData;

  // Transform the workflow structure
  return {
    success: true,
    data: {
      workflow_id: data.workflow_id,
      workflow_name: data.workflow_name,
      description: data.description,
      version: data.version,
      status: data.status,
      product_id: data.product_id,
      canvas_state: data.canvas_state,
      // Add any additional transformations needed
    },
  };
};

/**
 * Get base API URL for current version
 */
export const getBaseUrl = () => {
  const version = getApiVersion();
  if (version === 'beta') {
    return BETA_PROXY_BASE;
  }
  return API_CONFIG.alpha.baseUrl;
};

/**
 * Check if current version is Beta
 */
export const isBetaVersion = () => {
  return getApiVersion() === 'beta';
};

// ==================== Beta Proxy API Functions ====================

/**
 * Create a new workflow (Beta API)
 * POST /beta/workflow/create
 * @param {object} params
 * @param {string} params.userId - User ID (required)
 * @param {string} params.name - Workflow name (required)
 * @param {string} [params.description] - Optional description
 * @param {Array} [params.steps] - Optional initial steps
 * @returns {Promise<{success: boolean, workflow_id: string, data: object}>}
 */
export const createBetaWorkflow = async ({ userId, name, description = '', steps = [] }) => {
  return apiClient.post(`${BETA_PROXY_BASE}/workflow/create`, {
    user_id: userId,
    name,
    description,
    steps,
  });
};

/**
 * Delete a workflow (Beta API)
 * DELETE /beta/workflow/{workflow_id}
 * @param {string} workflowId - Workflow ID to delete
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const deleteBetaWorkflow = async (workflowId) => {
  return apiClient.delete(`${BETA_PROXY_BASE}/workflow/${workflowId}`);
};

/**
 * Save a UI component (Beta API)
 * POST /beta/ui-component/save
 * @param {object} params
 * @param {string} params.userId - User ID (required)
 * @param {string} params.uiId - UI ID from /generate response (required)
 * @param {object} params.uiConfig - UI configuration with forms (required)
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const saveBetaUIComponent = async ({ userId, uiId, uiConfig }) => {
  let sanitizedUiConfig = uiConfig;
  try {
    const raw = JSON.stringify(uiConfig);
    const cleaned = raw.replace(/\\'/g, "'");
    sanitizedUiConfig = JSON.parse(cleaned);
  } catch (e) {
    console.warn('⚠️ saveBetaUIComponent: failed to sanitize uiConfig, using original', e);
  }
  return apiClient.post(`${BETA_PROXY_BASE}/ui-component/save`, {
    user_id: userId,
    ui_id: uiId,
    ui_config: sanitizedUiConfig,
  });
};

/**
 * Get all UI components for a user (Beta API)
 * GET /beta/ui-components/{user_id}
 * @param {string} userId - User ID
 * @returns {Promise<{success: boolean, data: {total: number, ui_configs: Array, user_id: string}}>}
 */
export const getBetaUIComponents = async (userId) => {
  return apiClient.get(`${BETA_PROXY_BASE}/ui-components/${userId}`);
};

/**
 * Attach a UI component to a workflow step (Beta API)
 * POST /beta/workflow/step/{step_id}/attach-ui
 * All body fields are required by the backend:
 *   user_id, workflow_id, ui_id, step_name, ui_config
 * @param {object} params
 * @param {string} params.stepId - Step ID to attach to (required, used in URL)
 * @param {string} params.userId - User ID (required)
 * @param {string} params.workflowId - Workflow ID (required)
 * @param {string} params.uiId - UI ID to attach (required)
 * @param {string} params.stepName - Human-readable step name (required)
 * @param {object} params.uiConfig - UI configuration with forms (required)
 * @param {string} [params.stepDescription] - Step description
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const attachUIToStep = async ({ stepId, userId, workflowId, uiId, stepName, stepDescription, uiConfig }) => {
  // Validate all required fields before calling the API
  const missing = [];
  if (!userId) missing.push('user_id');
  if (!workflowId) missing.push('workflow_id');
  if (!uiId) missing.push('ui_id');
  if (!stepName) missing.push('step_name');
  if (!uiConfig) missing.push('ui_config');
  if (missing.length > 0) {
    console.error(`❌ attachUIToStep: missing required fields: ${missing.join(', ')}`, { stepId, userId, workflowId, uiId, stepName, uiConfig: !!uiConfig });
    throw new Error(`attachUIToStep: missing required fields: ${missing.join(', ')}`);
  }

  // Sanitize uiConfig: round-trip through JSON to strip invalid escapes like \'
  let sanitizedUiConfig = uiConfig;
  try {
    const raw = JSON.stringify(uiConfig);
    // Remove backslash-escaped single quotes (\') which are invalid in JSON
    const cleaned = raw.replace(/\\'/g, "'");
    sanitizedUiConfig = JSON.parse(cleaned);
  } catch (e) {
    console.warn('⚠️ attachUIToStep: failed to sanitize uiConfig, using original', e);
  }

  const body = {
    user_id: userId,
    workflow_id: workflowId,
    ui_id: uiId,
    step_name: stepName,
    step_description: stepDescription || '',
    ui_config: sanitizedUiConfig,
  };
  console.log('📤 attachUIToStep request:', { stepId, body: JSON.stringify(body).substring(0, 500) });
  return apiClient.post(`${BETA_PROXY_BASE}/workflow/step/${stepId}/attach-ui`, body);
};

export default {
  fetchWorkflows,
  fetchWorkflowSteps,
  fetchStepUI,
  getApiVersion,
  setApiVersion,
  transformBetaWorkflow,
  getBaseUrl,
  isBetaVersion,
  createBetaWorkflow,
  deleteBetaWorkflow,
  saveBetaUIComponent,
  getBetaUIComponents,
  attachUIToStep,
};
