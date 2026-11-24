import axios from 'axios';
import { auth } from '../services/firebase';
import { getAuthToken, clearAuthSession } from './authStorage';

/**
 * Dynamic Server Connection Endpoint Resolution
 * Strictly derived from the active .env file (REACT_APP_API_BASE_URL / VITE_API_BASE_URL).
 * Absolutely no server addresses or hostnames are hardcoded in the application code.
 */
const getApiBase = () => {
  const envBase = (
    typeof process !== 'undefined' && process.env
      ? process.env.REACT_APP_API_BASE_URL || process.env.VITE_API_BASE_URL
      : ''
  ) || '';

  if (envBase) {
    const clean = String(envBase).trim().replace(/\/+$/, '');
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // Fallback to relative /api when running behind same-origin or reverse proxy
  return '/api';
};

export const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Calls that must never trigger auto-refresh/redirect
const NO_REFRESH = ['/auth/me', '/auth/refresh', '/auth/login', '/auth/register', '/auth/setup-account', '/ping', '/health'];

api.interceptors.request.use(async (config) => {
  // 1. Prioritize multi-tier session token (memory -> sessionStorage -> localStorage -> cookies)
  const storedToken = getAuthToken();
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
    return config;
  }

  // 2. Fall back to Firebase token only if user signed in via Firebase SDK
  try {
    const user = auth?.currentUser;
    if (user && typeof user.getIdToken === 'function') {
      const token = await user.getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        return config;
      }
    }
  } catch (_) {
    // Ignore Firebase error
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // Resilient auto-fallback between localhost:8080 and localhost:5000 if one port is occupied by Windows WinNAT/Hyper-V
    if (
      (!error.response || error.code === 'ERR_NETWORK') &&
      original &&
      !original._retriedPortFallback &&
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ) {
      original._retriedPortFallback = true;
      const currentBase = original.baseURL || API_BASE;
      if (currentBase.includes(':8080')) {
        original.baseURL = currentBase.replace(':8080', ':5000');
        return api(original);
      } else if (currentBase.includes(':5000')) {
        original.baseURL = currentBase.replace(':5000', ':8080');
        return api(original);
      }
    }

    const skip = NO_REFRESH.some((p) => original?.url?.includes(p));
    if (error.response?.status === 401 && original && !original._retry && !skip) {
      original._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(original);
      } catch {
        // If refresh fails, clean up tokens and cookies across all storage layers so UI stays consistent
        clearAuthSession();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
