import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');

      if (isLoggedIn === 'true' && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.isAdmin === true || userRole === 'admin');
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = (userData, role = null) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    if (role) {
      localStorage.setItem('userRole', role);
    }
    setUser(userData);
    setIsAuthenticated(true);
    setIsAdmin(userData.isAdmin === true || role === 'admin');
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  // Check if user is medical staff (Doctor or Nurse)
  const isMedicalStaff = () => {
    if (!user || !user.position) return false;
    const position = user.position.toLowerCase();
    return position === 'doctor' || position === 'nurse';
  };

  return {
    isAuthenticated,
    isAdmin,
    user,
    loading,
    login,
    logout,
    checkAuthStatus,
    isMedicalStaff: isMedicalStaff()
  };
};

export default useAuth;