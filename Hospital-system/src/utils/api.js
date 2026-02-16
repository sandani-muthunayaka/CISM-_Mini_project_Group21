/**
 * API Request Utility with JWT Authentication
 * 
 * This utility handles all API requests with automatic JWT token inclusion
 * and handles token expiration/errors gracefully.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Get the JWT token from localStorage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Handle logout - clear all auth data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Main API request function
 * Automatically includes JWT token in Authorization header
 * 
 * @param {string} endpoint - API endpoint (e.g., '/patients' or '/patient/123')
 * @param {object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} - Fetch response
 */
export const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  // Build full URL
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_BASE_URL}${endpoint}`;
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // Add Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // Handle authentication errors
    if (response.status === 401) {
      const data = await response.json().catch(() => ({}));
      
      if (data.error === 'TOKEN_EXPIRED' || data.error === 'INVALID_TOKEN' || data.error === 'UNAUTHORIZED') {
        console.error('Authentication error:', data.message);
        logout(); // Clear auth data and redirect to login
        throw new Error('Session expired. Please login again.');
      }
    }
    
    // Handle permission errors
    if (response.status === 403) {
      const data = await response.json().catch(() => ({}));
      console.error('Permission denied:', data.message);
      // You can show a notification here
      throw new Error(data.message || 'You do not have permission to perform this action.');
    }
    
    return response;
  } catch (error) {
    // Network errors or other fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error. Please check your connection.');
    }
    throw error;
  }
};

/**
 * Convenience method for GET requests
 */
export const apiGet = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'GET' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `GET ${endpoint} failed`);
  }
  
  return response.json();
};

/**
 * Convenience method for POST requests
 */
export const apiPost = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `POST ${endpoint} failed`);
  }
  
  return response.json();
};

/**
 * Convenience method for PUT requests
 */
export const apiPut = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `PUT ${endpoint} failed`);
  }
  
  return response.json();
};

/**
 * Convenience method for PATCH requests
 */
export const apiPatch = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `PATCH ${endpoint} failed`);
  }
  
  return response.json();
};

/**
 * Convenience method for DELETE requests
 */
export const apiDelete = async (endpoint) => {
  const response = await apiRequest(endpoint, { method: 'DELETE' });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `DELETE ${endpoint} failed`);
  }
  
  return response.json();
};

/**
 * Login function - stores token and user data
 * 
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<object>} User data and token info
 */
export const login = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  
  // Store token and user data
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.staff));
  
  return data;
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Check if current user has a specific role
 */
export const hasRole = (role) => {
  const user = getCurrentUser();
  if (!user) return false;
  
  return user.position.toLowerCase().includes(role.toLowerCase());
};

/**
 * Check if current user is admin
 */
export const isAdmin = () => {
  const user = getCurrentUser();
  return user?.isAdmin === true;
};

/**
 * Check if current user can edit patient records (doctor or nurse)
 */
export const canEditPatientRecords = () => {
  return hasRole('doctor') || hasRole('nurse');
};

// Export for backward compatibility if needed
export default {
  apiRequest,
  apiGet,
  apiPost,
  apiPut,
  apiPatch,
  apiDelete,
  login,
  logout,
  isAuthenticated,
  getCurrentUser,
  hasRole,
  isAdmin,
  canEditPatientRecords,
};
