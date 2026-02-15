import { useState, useEffect } from 'react';

/**
 * Custom hook to check if the current user has permission to edit patient records
 * Only doctors and nurses can edit/add patient records
 */
const useRoleAccess = () => {
  const [canEdit, setCanEdit] = useState(false);
  const [userPosition, setUserPosition] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        const position = user.position?.toLowerCase() || '';
        setUserPosition(position);
        
        // Check if user is a doctor or nurse
        const allowedRoles = ['doctor', 'nurse'];
        const hasEditAccess = allowedRoles.some(role => position.includes(role));
        setCanEdit(hasEditAccess);
      } else {
        setCanEdit(false);
        setUserPosition('');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setCanEdit(false);
      setUserPosition('');
    } finally {
      setLoading(false);
    }
  };

  return { canEdit, userPosition, loading, checkUserRole };
};

export default useRoleAccess;
