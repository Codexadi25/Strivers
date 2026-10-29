/**
 * Centralized API Client Service for Strivers Admin GUI
 */

import { showToast } from '../utils/formatters.js';

export const API_BASE = '/api/v1';

export function getAuthToken() {
  return localStorage.getItem('strivers_admin_token') || '';
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('strivers_admin_token', token);
  } else {
    localStorage.removeItem('strivers_admin_token');
  }
}

export function clearAuthToken() {
  localStorage.removeItem('strivers_admin_token');
  localStorage.removeItem('strivers_admin_user');
}

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        // Auth session invalidated
        if (!endpoint.includes('/auth/login')) {
          clearAuthToken();
          window.location.reload();
        }
      }
      throw new Error(data.message || data.error || `HTTP ${response.status}: Failed request`);
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}
