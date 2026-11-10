/**
 * Centralized Resilient API Client for ServerClient Management Portal
 * Connects securely via Bearer JWT to /api/v2/adminaccess with local dev & Firebase Hosting support
 */

let cachedWorkingBase = null;

export function normalizeAdminApiBase(rawUrl) {
  const clean = String(rawUrl || '').trim().replace(/\/+$/, '');
  if (!clean || clean.includes('your-strivers-backend.onrender.com')) return '';
  if (clean.endsWith('/api/v2/adminaccess')) return clean;
  if (clean.endsWith('/api/v2')) return `${clean}/adminaccess`;
  if (clean.endsWith('/api')) return `${clean}/v2/adminaccess`;
  return `${clean}/api/v2/adminaccess`;
}

export function getConfiguredApiBase() {
  const runtimeOverride =
    typeof window !== 'undefined' ? window.__STRIVERS_API_URL__ : '';
  const envUrl =
    (typeof process !== 'undefined' && process.env
      ? process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : '') || '';
  return normalizeAdminApiBase(runtimeOverride || envUrl);
}

export const getCandidateBases = () => {
  const candidates = [];
  const configuredRemote = getConfiguredApiBase();

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';

    if (isLocalHost) {
      if (window.location.port === '8080' || window.location.port === '5000') {
        candidates.push(`${window.location.origin}/api/v2/adminaccess`);
      }
      // Prioritize relative /api/v2/adminaccess (handled by webpack devServer proxy on 5173 -> 8080)
      candidates.push('/api/v2/adminaccess');
      if (configuredRemote) candidates.push(configuredRemote);
      candidates.push('http://127.0.0.1:8080/api/v2/adminaccess');
      candidates.push('http://localhost:8080/api/v2/adminaccess');
      candidates.push('http://127.0.0.1:5000/api/v2/adminaccess');
      candidates.push('http://localhost:5000/api/v2/adminaccess');
    } else {
      // Production Firebase Hosting (e.g. externalstrivers.web.app)
      if (configuredRemote) {
        candidates.push(configuredRemote);
      }
      candidates.push('/api/v2/adminaccess');
    }
  } else {
    if (configuredRemote) candidates.push(configuredRemote);
    candidates.push('http://127.0.0.1:8080/api/v2/adminaccess');
    candidates.push('http://localhost:8080/api/v2/adminaccess');
    candidates.push('http://127.0.0.1:5000/api/v2/adminaccess');
  }

  return Array.from(new Set(candidates));
};

export function getAdminToken() {
  if (typeof localStorage === 'undefined') return '';
  return localStorage.getItem('strivers_admin_token') || '';
}

export function setAdminSession(token, user) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem('strivers_admin_token', token);
  }
  if (user) {
    localStorage.setItem('strivers_admin_user', JSON.stringify(user));
    localStorage.setItem('strivers_admin_email', user.email || '');
  }
}

export function clearAdminSession() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('strivers_admin_token');
  localStorage.removeItem('strivers_admin_user');
  localStorage.removeItem('strivers_admin_email');
  localStorage.removeItem('admin_token');
}

export async function apiCall(endpoint, options = {}) {
  const token = getAdminToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const handleHttpResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (res.ok) return data;

    if ((res.status === 401 || res.status === 403) && !cleanEndpoint.includes('/auth/login')) {
      clearAdminSession();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('admin_auth_expired'));
      }
    }
    const err = new Error(data.message || data.error || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  };

  if (endpoint.startsWith('http')) {
    const res = await fetch(endpoint, { ...options, headers });
    return await handleHttpResponse(res);
  }

  if (cachedWorkingBase) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 12000);
      const url = `${cachedWorkingBase}${cleanEndpoint}`;
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(tid);
      if (res.status < 500 && res.status !== 404) {
        return await handleHttpResponse(res);
      }
      cachedWorkingBase = null;
    } catch (err) {
      if (err && (err.status === 401 || err.status === 403)) {
        throw err;
      }
      cachedWorkingBase = null;
    }
  }

  const candidates = getCandidateBases();
  const isHostedOrigin =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';
  const attemptTimeout = isHostedOrigin ? 15000 : 2500;
  let lastError = null;

  for (const base of candidates) {
    const url = `${base}${cleanEndpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), attemptTimeout);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      if (res.ok) {
        cachedWorkingBase = base;
        return await res.json().catch(() => ({}));
      }

      if (res.status >= 400 && res.status < 500 && res.status !== 404) {
        return await handleHttpResponse(res);
      }
    } catch (err) {
      if (err && (err.status === 401 || err.status === 403 || (err.message && !err.message.includes('fetch') && err.name !== 'AbortError'))) {
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message?.includes('AbortError') || lastError?.name === 'AbortError'
      ? 'Connection timed out while contacting Strivers Server.'
      : lastError?.message || 'Unable to connect to backend server (/api/v2/adminaccess).'
  );
}
