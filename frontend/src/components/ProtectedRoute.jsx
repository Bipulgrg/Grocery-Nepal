import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { checkTokenExpiration } from '../utils/auth';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // Check token expiration every minute
    const interval = setInterval(() => {
      checkTokenExpiration();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Check token expiration on initial render
  if (!token || !checkTokenExpiration()) {
    return <Navigate to="/signin" replace />;
  }

  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;