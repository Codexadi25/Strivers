/**
 * Centralized Resilient API Client for ServerClient Management Portal
 * Connects securely via Bearer JWT to /api/v2/adminaccess with local dev, Render & Firebase Hosting support
 */

export const DEFAULT_PRODUCTION_BACKEND = 'https://strivers-hr5g.onrender.com/api/v2/adminaccess';

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
  const localStorageOverride =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('strivers_admin_api_url') || ''
      : '';
  const runtimeOverride =
    typeof window !== 'undefined' ? window.__STRIVERS_API_URL__ : '';
  const envUrl =
    (typeof process !== 'undefined' && process.env
      ? process.env.VITE_API_BASE_URL || process.env.REACT_APP_API_BASE_URL
      : '') || '';

  const chosen = localStorageOverride || runtimeOverride || envUrl;
  const normalized = normalizeAdminApiBase(chosen);
  return normalized || DEFAULT_PRODUCTION_BACKEND;
}

export function getActiveApiBase() {
  return cachedWorkingBase || getConfiguredApiBase();
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

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocalHost = host === 'localhost' || host === '127.0.0.1';
    const isFirebaseHosting = host.includes('web.app') || host.includes('firebaseapp.com');

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
      // Production Hosting (e.g. ExternalStrivers.web.app or custom domain)
      if (configuredRemote) {
        candidates.push(configuredRemote);
      }
      candidates.push(DEFAULT_PRODUCTION_BACKEND);

      // Only attempt relative /api path if NOT hosted on Firebase static CDN domain
      if (!isFirebaseHosting) {
        candidates.push('/api/v2/adminaccess');
      }
    }
  } else {
    if (configuredRemote) candidates.push(configuredRemote);
    candidates.push('http://127.0.0.1:8080/api/v2/adminaccess');
    candidates.push('http://localhost:8080/api/v2/adminaccess');
    candidates.push('http://127.0.0.1:5000/api/v2/adminaccess');
  }

  return Array.from(new Set(candidates.filter(Boolean)));
};

export function getAdminToken() {
  if (typeof localStorage === 'undefined') return '';
  return (
    localStorage.getItem('strivers_admin_token') ||
    localStorage.getItem('admin_token') ||
    ''
  );
}

export function setAdminSession(token, user) {
  if (typeof localStorage === 'undefined') return;
  if (token) {
    localStorage.setItem('strivers_admin_token', token);
    localStorage.setItem('admin_token', token);
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
      ? 'Connection timed out while contacting Strivers Server (Render free-tier cold boot takes ~35s; please try again in a moment).'
      : lastError?.message ||
        'Unable to connect to Strivers backend server. Please verify backend status or configure the Backend API URL.'
  );
}
