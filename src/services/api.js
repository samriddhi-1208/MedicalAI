/**
 * MedGuardian AI — Base API HTTP Request Client
 * Injects Authorization Bearer tokens and handles response parsing & errors
 */

import { API_BASE } from '../constants/apiEndpoints';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('medguardian_jwt_token') || localStorage.getItem('medguardian_token');
  
  const headers = {
    ...options.headers
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `HTTP ${response.status} Request failed`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
