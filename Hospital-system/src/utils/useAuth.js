import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      const authToken = localStorage.getItem('authToken');

      if (isLoggedIn === 'true' && userData && authToken) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setToken(authToken);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.isAdmin === true || userRole === 'admin');
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
        setToken(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
      setToken(null);
    }
    setLoading(false);
  };

  const login = (userData, authToken, role = null) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', authToken);
    if (role) {
      localStorage.setItem('userRole', role);
    }
    setUser(userData);
    setToken(authToken);
    setIsAuthenticated(true);
    setIsAdmin(userData.isAdmin === true || role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('authToken');
    localStorage.removeItem('needsPasswordChange');
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    token,
    loading,
    login,
    logout,
    checkAuthStatus
  };
};

export default useAuth;