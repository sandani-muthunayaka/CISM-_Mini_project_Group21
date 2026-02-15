/**
 * useSessionMonitor - Monitors session timeout and handles auto-logout
 * Checks session status periodically and alerts user before timeout
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from './useAuth';
import { apiPost } from './apiClient';

const useSessionMonitor = (shouldMonitor = true) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!shouldMonitor || !isAuthenticated) {
      return;
    }

    // Check session every 30 seconds
    const checkSessionInterval = setInterval(checkSessionStatus, 30000);

    return () => clearInterval(checkSessionInterval);
  }, [shouldMonitor, isAuthenticated]);

  const checkSessionStatus = async () => {
    try {
      // Get session info from backend
      const response = await apiPost('/session/validate');

      if (!response.valid) {
        handleSessionTimeout('Session is no longer valid');
        return;
      }

      // Check if session is about to expire (less than 1 minute remaining)
      if (response.session && response.session.timeRemainingMinutes < 1) {
        showExpiryWarning(response.session.timeRemainingMinutes);
      }
    } catch (error) {
      // If 401 error, session has expired
      if (error.message.includes('Session expired')) {
        handleSessionTimeout('Your session has expired due to inactivity.');
      }
    }
  };

  const showExpiryWarning = (minutesRemaining) => {
    // Show warning notification
    console.warn(`Session expiring in ${minutesRemaining} minute(s)`);
    
    // Optional: Show a toast/alert to user
    if (minutesRemaining < 0.5) {
      // Less than 30 seconds
      alert('⚠️ Your session is about to expire. Please save your work.');
    }
  };

  const handleSessionTimeout = (reason) => {
    console.warn('Session timeout:', reason);
    
    // Clear auth data
    logout();
    
    // Redirect to appropriate login page
    const userRole = localStorage.getItem('userRole');
    const loginPage = userRole === 'admin' ? '/admin-login' : '/loginScreen';
    
    navigate(loginPage, { 
      state: { message: 'Your session has expired. Please log in again.' } 
    });
  };

  return {
    checkSessionStatus,
    handleSessionTimeout
  };
};

export default useSessionMonitor;
