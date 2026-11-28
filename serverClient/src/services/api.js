/**
 * Centralized Resilient API Client for ServerClient Management Portal
 * Connects securely via Bearer JWT to /api/v2/adminaccess with local dev, Render & Firebase Hosting support
 */

/**
 * Dynamic Server Connection Endpoint Resolution for serverClient
 * Strictly derived from the active .env file (VITE_API_BASE_URL / REACT_APP_API_BASE_URL).
 * Absolutely no server addresses or hostnames are hardcoded in the application code.
 */

export const DEFAULT_PRODUCTION_BACKEND = '/api/v2/adminaccess';

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
  // 1. Strictly prioritize the .env file configuration first
  const envUrl =
    (typeof process !== 'undefined' && process.env
      ? process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : '') || '';

  const normalizedEnv = normalizeAdminApiBase(envUrl);
  if (normalizedEnv) return normalizedEnv;

  // 2. Runtime override via window.__STRIVERS_API_URL__ (if explicitly injected at runtime)
  const runtimeOverride =
    typeof window !== 'undefined' ? window.__STRIVERS_API_URL__ : '';
  if (runtimeOverride) {
    const normalizedRuntime = normalizeAdminApiBase(runtimeOverride);
    if (normalizedRuntime) return normalizedRuntime;
  }

  // 3. Fallback to relative default if no environment variable is provided
  return DEFAULT_PRODUCTION_BACKEND;
}

export function getActiveApiBase() {
  return cachedWorkingBase || getConfiguredApiBase();
}

export function getBackendBase() {
  const base = getActiveApiBase();
  return base.replace(/\/api\/v2\/adminaccess\/?$/, '');
}

export function setCustomApiBase(customUrl) {
  const norm = normalizeAdminApiBase(customUrl);
  if (typeof localStorage !== 'undefined') {
    if (norm) {
      localStorage.setItem('strivers_admin_api_url', norm);
    } else {
      localStorage.removeItem('strivers_admin_api_url');
    }
  }
  cachedWorkingBase = norm || null;
  return norm;
}

export const getCandidateBases = () => {
  const candidates = [];
  const configuredRemote = getConfiguredApiBase();

  // Primary: Strictly use the endpoint configured in .env
  if (configuredRemote) {
    candidates.push(configuredRemote);
  }

  // Relative path fallback for reverse proxies or same-origin deployments
  candidates.push(DEFAULT_PRODUCTION_BACKEND);

  return Array.from(new Set(candidates.filter(Boolean)));
};

export function getAdminToken() {
  let token = '';
  if (typeof sessionStorage !== 'undefined') {
    try {
      token = sessionStorage.getItem('strivers_admin_token') || sessionStorage.getItem('admin_token') || '';
    } catch (_) {}
  }
  if (!token && typeof localStorage !== 'undefined') {
    try {
      token =
        localStorage.getItem('strivers_admin_token') ||
        localStorage.getItem('admin_token') ||
        '';
    } catch (_) {}
  }
  if (!token && typeof document !== 'undefined') {
    try {
      const match = document.cookie.match(/(?:^|;\s*)strivers_admin_token=([^;]+)/);
      if (match) token = decodeURIComponent(match[1]);
    } catch (_) {}
  }
  return token;
}

export function setAdminSession(token, user) {
  if (token) {
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('strivers_admin_token', token);
        sessionStorage.setItem('admin_token', token);
        sessionStorage.setItem('strivers_admin_session_key', `sess_${Date.now()}`);
      } catch (_) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('strivers_admin_token', token);
        localStorage.setItem('admin_token', token);
      } catch (_) {}
    }
    if (typeof document !== 'undefined') {
      try {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        document.cookie = `strivers_admin_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax${isHttps ? '; Secure' : ''}`;
      } catch (_) {}
    }
  }
  if (user) {
    const serialized = JSON.stringify(user);
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.setItem('strivers_admin_user', serialized);
        sessionStorage.setItem('strivers_admin_email', user.email || '');
      } catch (_) {}
    }
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('strivers_admin_user', serialized);
        localStorage.setItem('strivers_admin_email', user.email || '');
      } catch (_) {}
    }
  }
}

export function clearAdminSession() {
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('strivers_admin_token');
      sessionStorage.removeItem('admin_token');
      sessionStorage.removeItem('strivers_admin_user');
      sessionStorage.removeItem('strivers_admin_email');
      sessionStorage.removeItem('strivers_admin_session_key');
    } catch (_) {}
  }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('strivers_admin_token');
      localStorage.removeItem('strivers_admin_user');
      localStorage.removeItem('strivers_admin_email');
      localStorage.removeItem('admin_token');
    } catch (_) {}
  }
  if (typeof document !== 'undefined') {
    try {
      document.cookie = 'strivers_admin_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (_) {}
  }
}

/**
 * Safely parses response JSON while guarding against static HTML SPA fallbacks
 */
async function extractJsonSafe(res) {
  const contentType = (res.headers && res.headers.get('content-type')) || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') return parsed;
    } catch {
      return null;
    }
    return null;
  }
  return await res.json().catch(() => null);
}

/**
 * Pings backend health check to verify connectivity
 */
export async function pingBackend(customBase = null) {
  const baseToTest = customBase ? normalizeAdminApiBase(customBase) : getActiveApiBase();
  const root = baseToTest.replace(/\/api\/v2\/adminaccess$/, '');
  const pingUrl = `${root}/ping`;
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), 9000);
    const res = await fetch(pingUrl, { signal: controller.signal });
    clearTimeout(tid);
    const data = await extractJsonSafe(res);
    if (res.ok && data && (data.ok || data.status === 'UP')) {
      return { ok: true, status: 'UP', service: data.service || 'Strivers Backend', url: baseToTest };
    }
    return { ok: false, status: 'UNEXPECTED_RESPONSE', url: baseToTest };
  } catch (err) {
    return { ok: false, status: 'OFFLINE', error: err.message, url: baseToTest };
  }
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
    const data = await extractJsonSafe(res);
    if (!data || typeof data !== 'object') {
      const err = new Error(
        'Server returned a non-JSON response (e.g. static HTML). The backend API route is unreachable at this URL.'
      );
      err.status = res.status;
      err.isNonJson = true;
      throw err;
    }

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

  // Check cached working base first if already resolved
  if (cachedWorkingBase) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 15000);
      const url = `${cachedWorkingBase}${cleanEndpoint}`;
      const res = await fetch(url, { ...options, headers, signal: controller.signal });
      clearTimeout(tid);

      const data = await extractJsonSafe(res);
      if (data && typeof data === 'object') {
        if (res.ok) {
          return data;
        }
        if (res.status >= 400 && res.status < 500 && res.status !== 404) {
          const err = new Error(data.message || data.error || `HTTP ${res.status}`);
          err.status = res.status;
          throw err;
        }
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
  const attemptTimeout = isHostedOrigin ? 20000 : 3500;
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

      const data = await extractJsonSafe(res);
      if (!data || typeof data !== 'object') {
        // Response was HTML (e.g. Firebase Hosting or Webpack dev fallback index.html), continue
        continue;
      }

      if (res.ok) {
        cachedWorkingBase = base;
        return data;
      }

      if (res.status >= 400 && res.status < 500 && res.status !== 404) {
        const err = new Error(data.message || data.error || `HTTP ${res.status}`);
        err.status = res.status;
        throw err;
      }
    } catch (err) {
      if (
        err &&
        (err.status === 401 ||
          err.status === 403 ||
          (err.message && !err.message.includes('fetch') && err.name !== 'AbortError' && !err.isNonJson))
      ) {
        throw err;
      }
      lastError = err;
    }
  }

  throw new Error(
    lastError?.message?.includes('AbortError') || lastError?.name === 'AbortError'
      ? 'Connection timed out while contacting Strivers Server. Please check your network or backend status.'
      : lastError?.message ||
        'Unable to connect to Strivers backend server. Please verify backend status or configure the Backend API URL.'
  );
}
