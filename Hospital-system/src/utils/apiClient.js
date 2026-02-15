/**
 * API Client - Handles all API requests with token management and session timeout
 */

const API_BASE_URL = 'http://localhost:3000';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Handle 401 responses (token expired or session timeout)
const handle401 = () => {
  // Clear auth data
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
  localStorage.removeItem('needsPasswordChange');
  
  // Redirect to login
  window.location.href = '/loginScreen';
};

/**
 * Generic fetch wrapper with token handling
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    // Handle session timeout or invalid token
    if (response.status === 401) {
      const data = await response.json();
      console.warn('Session timeout or invalid token:', data);
      handle401();
      throw new Error(data.message || 'Session expired. Please log in again.');
    }

    // Handle other errors
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'GET',
  });
};

/**
 * POST request
 */
export const apiPost = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = (endpoint) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
  });
};

/**
 * Patch request
 */
export const apiPatch = (endpoint, data = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
  API_BASE_URL,
};
