import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHealthData } from '../../context/HealthDataContext';

/**
 * Route Guard for Authenticated Users
 * Redirects unauthenticated requests to /login
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, userProfile } = useHealthData();
  const hasToken = Boolean(localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  // Redirect users who haven't completed onboarding yet to profile setup
  if (userProfile && userProfile.profileCompleted === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
};
