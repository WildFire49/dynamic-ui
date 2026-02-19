/**
 * Workflow API Service
 * Provides configurable API endpoints for workflow management
 * Supports both Alpha and Beta API versions
 */

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
  beta: {
    baseUrl: process.env.NEXT_PUBLIC_BETA_API_URL || 'http://139.84.131.54:5000',
    endpoints: {
      workflows: '/workflows',
      workflowSteps: '/workflow/:workflowId/steps',
      stepUI: '/workflow/step/:stepId/ui',
    },
    headers: {
      'Content-Type': 'application/json',
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
 * Build fetch headers based on API version
 */
const getHeaders = (version) => {
  const config = API_CONFIG[version];
  const headers = { ...config.headers };

  if (version === 'alpha') {
    const token = getAuthToken();
    if (token) {
      headers['authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Replace path parameters in endpoint
 * @param {string} endpoint - Endpoint with :param placeholders
 * @param {object} params - Parameters to replace
 */
const replacePathParams = (endpoint, params = {}) => {
  let url = endpoint;
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  return url;
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
    headers: getHeaders('alpha'),
    cache: 'no-cache',
  });

  if (!response.ok) {
    throw new Error(`Alpha API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch workflows (Beta API)
 */
const fetchWorkflowsBeta = async () => {
  const config = API_CONFIG.beta;
  const url = `${config.baseUrl}${config.endpoints.workflows}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders('beta'),
  });

  if (!response.ok) {
    throw new Error(`Beta API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch workflow steps (Beta API only)
 * @param {string} workflowId - Workflow ID
 */
export const fetchWorkflowSteps = async (workflowId) => {
  const version = getApiVersion();

  if (version !== 'beta') {
    throw new Error('fetchWorkflowSteps is only available in Beta API');
  }

  const config = API_CONFIG.beta;
  const endpoint = replacePathParams(config.endpoints.workflowSteps, { workflowId });
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders('beta'),
  });

  if (!response.ok) {
    throw new Error(`Beta API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Fetch step UI configuration (Beta API only)
 * @param {string} stepId - Step ID
 */
export const fetchStepUI = async (stepId) => {
  const version = getApiVersion();

  if (version !== 'beta') {
    throw new Error('fetchStepUI is only available in Beta API');
  }

  const config = API_CONFIG.beta;
  const endpoint = replacePathParams(config.endpoints.stepUI, { stepId });
  const url = `${config.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders('beta'),
  });

  if (!response.ok) {
    throw new Error(`Beta API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
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
  return API_CONFIG[version].baseUrl;
};

/**
 * Check if current version is Beta
 */
export const isBetaVersion = () => {
  return getApiVersion() === 'beta';
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
};
