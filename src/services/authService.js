/**
 * MedGuardian AI — Authentication API Service
 */

import { apiRequest } from './api';
import { API_ENDPOINTS } from '../constants/apiEndpoints';

export const authService = {
  login: async (email, password) => {
    return await apiRequest(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  },

  verifyOtp: async (email, otp) => {
    return await apiRequest(API_ENDPOINTS.AUTH.VERIFY_OTP, {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  },

  resendOtp: async (email) => {
    return await apiRequest(API_ENDPOINTS.AUTH.RESEND_OTP, {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  signup: async (userData) => {
    return await apiRequest(API_ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  getProfile: async () => {
    return await apiRequest(API_ENDPOINTS.AUTH.PROFILE);
  },

  updateProfile: async (payload) => {
    return await apiRequest(API_ENDPOINTS.AUTH.PROFILE, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  }
};
