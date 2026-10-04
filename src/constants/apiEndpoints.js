/**
 * MedGuardian AI — Frontend API Endpoints Configuration
 */

export const API_BASE = import.meta.env.VITE_API_URL || 'https://medicalai-backend-5ycw.onrender.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    VERIFY_OTP: `${API_BASE}/auth/verify-otp`,
    RESEND_OTP: `${API_BASE}/auth/resend-otp`,
    SIGNUP: `${API_BASE}/auth/signup`,
    PROFILE: `${API_BASE}/auth/profile`,
    ME: `${API_BASE}/auth/me`
  },
  REPORTS: {
    UPLOAD: `${API_BASE}/reports/upload`,
    LIST: `${API_BASE}/reports`
  },
  MEDICINES: {
    LIST: `${API_BASE}/medicines`
  },
  SOS: {
    DISPATCH: `${API_BASE}/sos/dispatch`,
    CANCEL: `${API_BASE}/sos/cancel`,
    CONTACTS: `${API_BASE}/sos/contacts`
  },
  HOSPITALS: {
    NEARBY: `${API_BASE}/hospitals/nearby`
  },
  VITALS: {
    OVERVIEW: `${API_BASE}/vitals/overview`,
    TRENDS: `${API_BASE}/vitals/trends`
  }
};
