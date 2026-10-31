import axios from 'axios';
import { auth } from '../services/firebase';

const getApiBase = () => {
  // 1. In browser running on localhost/127.0.0.1, prioritize local backend server
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      const envBase = process.env.REACT_APP_API_BASE_URL;
      if (envBase && (envBase.includes('localhost') || envBase.includes('127.0.0.1'))) {
        return envBase.replace(/\/$/, '');
      }
      return 'http://localhost:8080/api/v1';
    }
  }

  // 2. Production or custom environment URL
  let base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

  // 3. Strip accidental :8080 from Render or external HTTPS domains (Render only serves HTTPS on standard 443)
  if (base.includes('.onrender.com:8080')) {
    base = base.replace('.onrender.com:8080', '.onrender.com');
  }

  return base.replace(/\/$/, '');
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
  try {
    const user = auth?.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    }
  } catch {
    // Ignore firebase token error and fall back to local token
  }

  const storedToken = localStorage.getItem('auth_token');
  if (storedToken) {
    config.headers.Authorization = `Bearer ${storedToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const skip = NO_REFRESH.some((p) => original?.url?.includes(p));
    if (error.response?.status === 401 && original && !original._retry && !skip) {
      original._retry = true;
      try {
        await api.post('/auth/refresh');
        return api(original);
      } catch {
        // Ignored in local testing
      }
    }
    return Promise.reject(error);
  }
);

export default api;
