import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHealthData } from '../../context/HealthDataContext';

/**
 * Route Guard for Authenticated Users
 * Redirects unauthenticated requests to /login
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useHealthData();
  const hasToken = Boolean(localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
