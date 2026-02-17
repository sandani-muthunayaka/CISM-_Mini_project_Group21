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
  return localStorage.getItem('authToken');
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
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userRole');
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
  
  // Debug logging
  console.log('API Request Debug:', {
    endpoint,
    hasToken: !!token,
    token: token ? `${token.substring(0, 20)}...` : 'No token',
    localStorage: {
      authToken: localStorage.getItem('authToken') ? 'exists' : 'missing',
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      user: localStorage.getItem('user') ? 'exists' : 'missing'
    }
  });
  
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
      
      console.error('401 Error received:', data);
      
      // Check both 'code' (backend uses this) and 'error' fields for compatibility
      const errorCode = data.code || data.error;
      if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN' || errorCode === 'UNAUTHORIZED' || errorCode === 'NO_TOKEN' || errorCode === 'SESSION_TIMEOUT') {
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

// ========== AUDIT LOG API FUNCTIONS ==========

/**
 * Get all audit logs with filtering
 * Admin only
 */
export const getAuditLogs = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  
  if (filters.page) queryParams.append('page', filters.page);
  if (filters.limit) queryParams.append('limit', filters.limit);
  if (filters.userId) queryParams.append('userId', filters.userId);
  if (filters.action) queryParams.append('action', filters.action);
  if (filters.resourceType) queryParams.append('resourceType', filters.resourceType);
  if (filters.result) queryParams.append('result', filters.result);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  
  return apiGet(`/audit/logs?${queryParams.toString()}`);
};

/**
 * Get audit logs for a specific user
 */
export const getUserAuditLogs = async (userId, page = 1, limit = 50) => {
  return apiGet(`/audit/user/${userId}?page=${page}&limit=${limit}`);
};

/**
 * Get audit logs for a specific patient
 * Admin only
 */
export const getPatientAuditLogs = async (patientId, page = 1, limit = 50) => {
  return apiGet(`/audit/patient/${patientId}?page=${page}&limit=${limit}`);
};

/**
 * Get failed login attempts
 * Admin only
 */
export const getFailedLoginAttempts = async (hours = 24) => {
  return apiGet(`/audit/failed-logins?hours=${hours}`);
};

/**
 * Get suspicious activity summary
 * Admin only
 */
export const getSuspiciousActivity = async (hours = 24) => {
  return apiGet(`/audit/suspicious?hours=${hours}`);
};

/**
 * Get audit statistics
 * Admin only
 */
export const getAuditStats = async (hours = 24) => {
  return apiGet(`/audit/stats?hours=${hours}`);
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
  getAuditLogs,
  getUserAuditLogs,
  getPatientAuditLogs,
  getFailedLoginAttempts,
  getSuspiciousActivity,
  getAuditStats,
};
