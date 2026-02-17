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

      console.log('🔍 useAuth checkAuthStatus:', {
        isLoggedIn,
        hasUserData: !!userData,
        hasAuthToken: !!authToken,
        userRole,
        allLocalStorage: { ...localStorage }
      });

      if (isLoggedIn === 'true' && userData && authToken) {
        const parsedUser = JSON.parse(userData);
        console.log('✅ Authentication successful:', { username: parsedUser.username, isAdmin: parsedUser.isAdmin });
        setUser(parsedUser);
        setToken(authToken);
        setIsAuthenticated(true);
        setIsAdmin(parsedUser.isAdmin === true || userRole === 'admin');
      } else {
        console.log('❌ Authentication failed - missing:', {
          isLoggedIn: isLoggedIn !== 'true',
          userData: !userData,
          authToken: !authToken
        });
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
    console.log('🔐 Login function called with:', {
      username: userData?.username,
      hasToken: !!authToken,
      tokenPreview: authToken ? `${authToken.substring(0, 20)}...` : 'none',
      role
    });
    
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('authToken', authToken);
    if (role) {
      localStorage.setItem('userRole', role);
    }
    
    console.log('✅ LocalStorage updated. Verifying:', {
      isLoggedIn: localStorage.getItem('isLoggedIn'),
      hasUser: !!localStorage.getItem('user'),
      hasAuthToken: !!localStorage.getItem('authToken'),
      userRole: localStorage.getItem('userRole')
    });
    
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
    token,
    loading,
    login,
    logout,
    checkAuthStatus,
    isMedicalStaff: isMedicalStaff()
  };
};

export default useAuth;