import axios from 'axios';
import { auth } from '../services/firebase';

const getApiBase = () => {
  // 1. In browser running on localhost/127.0.0.1, prioritize local backend server (/api)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      const envBase = process.env.REACT_APP_API_BASE_URL;
      if (envBase && (envBase.includes('localhost') || envBase.includes('127.0.0.1'))) {
        return envBase.replace(/\/api\/v1$/, '/api').replace(/\/$/, '');
      }
      return 'http://localhost:8080/api';
    }
  }

  // 2. Production or custom environment URL (standardized to /api)
  let base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

  if (base.includes('.onrender.com:8080')) {
    base = base.replace('.onrender.com:8080', '.onrender.com');
  }

  return base.replace(/\/api\/v1$/, '/api').replace(/\/$/, '');
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
  // 1. Prioritize explicit local session token from Strivers login/register
  const storedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('auth_token') : null;
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
        // If refresh fails, clean up local tokens so UI stays consistent
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          window.dispatchEvent(new Event('auth_state_change'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
