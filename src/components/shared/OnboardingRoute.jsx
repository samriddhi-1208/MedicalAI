import React from 'react';
import { Navigate } from 'react-router-dom';
import { useHealthData } from '../../context/HealthDataContext';

/**
 * Route Guard for Onboarding Setup (/complete-profile)
 * Redirects completed profiles directly to /app/dashboard
 */
export const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, userProfile } = useHealthData();
  const hasToken = Boolean(localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token'));

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (userProfile && userProfile.profileCompleted) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children;
};
