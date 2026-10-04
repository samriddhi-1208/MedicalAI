/**
 * MedGuardian AI — Custom Hook: useAuth
 * Exposes authentication state and methods
 */

import { useHealthData } from '../context/HealthDataContext';

export const useAuth = () => {
  const { isAuthenticated, token, userProfile, login, signup, logout } = useHealthData();
  return {
    isAuthenticated,
    token,
    user: userProfile,
    login,
    signup,
    logout
  };
};
