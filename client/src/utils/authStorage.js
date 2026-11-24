/**
 * Multi-Tier Resilient Auth Storage Engine
 * Manages user authentication credentials and session keys across 4 tiers:
 * 1. Runtime In-Memory Cache (Active JS heap)
 * 2. Session Cache (Browser sessionStorage - temporary session keys)
 * 3. Persistent Cache (Browser localStorage)
 * 4. Browser Cookies (document.cookie - resilient cross-navigation storage)
 */

let memoryToken = null;
let memoryUser = null;

// Safe cookie read
export function getCookie(name) {
  if (typeof document === 'undefined') return null;
  try {
    const prefix = `${encodeURIComponent(name)}=`;
    const parts = document.cookie.split(';');
    for (let part of parts) {
      let c = part.trim();
      if (c.indexOf(prefix) === 0) {
        return decodeURIComponent(c.substring(prefix.length));
      }
    }
  } catch (_) {}
  return null;
}

// Safe cookie write
export function setCookie(name, value, days = 30) {
  if (typeof document === 'undefined') return;
  try {
    const maxAge = days * 24 * 60 * 60;
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const secureFlag = isHttps ? '; Secure' : '';
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secureFlag}`;
  } catch (_) {}
}

// Safe cookie delete
export function deleteCookie(name) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  } catch (_) {}
}

/**
 * Retrieves the current authentication token from any available layer.
 * Auto-synchronizes other layers if found in one.
 */
export function getAuthToken() {
  let token = null;

  // 1. Session storage (temp session keys)
  if (typeof sessionStorage !== 'undefined') {
    try {
      token = sessionStorage.getItem('auth_token') || sessionStorage.getItem('temp_token');
    } catch (_) {}
  }

  // 2. Local storage (persistent browser cache)
  if (!token && typeof localStorage !== 'undefined') {
    try {
      token = localStorage.getItem('auth_token') || localStorage.getItem('token') || localStorage.getItem('strivers_token');
    } catch (_) {}
  }

  // 3. Browser cookies
  if (!token) {
    token = getCookie('auth_token') || getCookie('strivers_session');
  }

  // 4. In-memory cache fallback (used when browser storage APIs are restricted)
  if (!token && memoryToken) {
    token = memoryToken;
  }

  if (token) {
    memoryToken = token;
    // Resilient backfill
    try {
      if (typeof localStorage !== 'undefined' && !localStorage.getItem('auth_token')) {
        localStorage.setItem('auth_token', token);
      }
      if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('auth_token')) {
        sessionStorage.setItem('auth_token', token);
      }
    } catch (_) {}
  } else {
    memoryToken = null;
  }

  return token;
}

/**
 * Retrieves the authenticated user object from any available layer.
 * Auto-synchronizes other layers if found in one.
 */
export function getAuthUser() {
  let raw = null;

  // 1. Session storage
  if (typeof sessionStorage !== 'undefined') {
    try {
      raw = sessionStorage.getItem('auth_user') || sessionStorage.getItem('temp_user');
    } catch (_) {}
  }

  // 2. Local storage
  if (!raw && typeof localStorage !== 'undefined') {
    try {
      raw = localStorage.getItem('auth_user') || localStorage.getItem('user') || localStorage.getItem('strivers_user');
    } catch (_) {}
  }

  // 3. Browser cookies
  if (!raw) {
    raw = getCookie('auth_user');
  }

  // 4. In-memory cache fallback
  if (!raw && memoryUser) {
    return memoryUser;
  }

  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (parsed && typeof parsed === 'object') {
        memoryUser = parsed;
        // Resilient backfill
        try {
          if (typeof localStorage !== 'undefined' && !localStorage.getItem('auth_user')) {
            localStorage.setItem('auth_user', JSON.stringify(parsed));
          }
          if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('auth_user')) {
            sessionStorage.setItem('auth_user', JSON.stringify(parsed));
          }
        } catch (_) {}
        return parsed;
      }
    } catch (_) {}
  }

  memoryUser = null;
  return null;
}

/**
 * Stores authentication credentials, temporary session keys, and cookies.
 */
export function setAuthSession(token, user) {
  if (!token) return;

  memoryToken = token;
  memoryUser = user || null;

  const serializedUser = user ? JSON.stringify(user) : '';
  const now = Date.now();
  const tempSessionKey = `sess_${now}_${Math.random().toString(36).slice(2, 9)}`;

  // 1. Session Storage (temporary session keys in browser memory)
  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem('auth_token', token);
      if (serializedUser) sessionStorage.setItem('auth_user', serializedUser);
      sessionStorage.setItem('temp_session_key', tempSessionKey);
      sessionStorage.setItem(
        'session_keys',
        JSON.stringify({
          token,
          uid: user?._id || user?.id,
          email: user?.email,
          timestamp: now,
        })
      );
    } catch (_) {}
  }

  // 2. Local Storage (persistent browser cache)
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('auth_token', token);
      if (serializedUser) localStorage.setItem('auth_user', serializedUser);
    } catch (_) {}
  }

  // 3. Browser Cookies (first-party cookies with 30-day lifecycle)
  setCookie('auth_token', token, 30);
  setCookie('strivers_session', token, 30);
  if (serializedUser) {
    setCookie('auth_user', serializedUser, 30);
  }

  // 4. Notify all components and tabs of auth update
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth_state_change'));
  }
}

/**
 * Synchronizes updated user data (such as newly purchased courses, enrolled sheets, or profile updates)
 * across all storage tiers without modifying the existing auth token.
 */
export function syncAuthUser(user) {
  if (!user || typeof user !== 'object') return;
  memoryUser = user;

  const serializedUser = JSON.stringify(user);

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.setItem('auth_user', serializedUser);
    } catch (_) {}
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('auth_user', serializedUser);
    } catch (_) {}
  }

  setCookie('auth_user', serializedUser, 30);
}

/**
 * Completely clears all session credentials, cache memory, and cookies upon sign-out.
 */
export function clearAuthSession() {
  memoryToken = null;
  memoryUser = null;

  if (typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem('auth_token');
      sessionStorage.removeItem('auth_user');
      sessionStorage.removeItem('temp_session_key');
      sessionStorage.removeItem('session_keys');
      sessionStorage.clear();
    } catch (_) {}
  }

  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('strivers_token');
      localStorage.removeItem('strivers_user');
    } catch (_) {}
  }

  deleteCookie('auth_token');
  deleteCookie('strivers_session');
  deleteCookie('auth_user');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth_state_change'));
  }
}
