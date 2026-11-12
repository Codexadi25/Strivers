import {
  normalizeAdminApiBase,
  getCandidateBases,
  getConfiguredApiBase,
  DEFAULT_PRODUCTION_BACKEND,
  getActiveApiBase,
  setCustomApiBase,
} from '../services/api';

describe('serverClient Hosting & API Base Resolution', () => {
  const prevViteUrl = process.env.VITE_API_BASE_URL;
  const prevCraUrl = process.env.REACT_APP_API_BASE_URL;

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    if (prevViteUrl === undefined) delete process.env.VITE_API_BASE_URL;
    else process.env.VITE_API_BASE_URL = prevViteUrl;

    if (prevCraUrl === undefined) delete process.env.REACT_APP_API_BASE_URL;
    else process.env.REACT_APP_API_BASE_URL = prevCraUrl;

    localStorage.clear();
  });

  test('normalizeAdminApiBase normalizes root, /api, and full admin URLs cleanly', () => {
    expect(normalizeAdminApiBase('https://strivers-api.onrender.com')).toBe(
      'https://strivers-api.onrender.com/api/v2/adminaccess'
    );
    expect(normalizeAdminApiBase('https://strivers-api.onrender.com/api/')).toBe(
      'https://strivers-api.onrender.com/api/v2/adminaccess'
    );
    expect(normalizeAdminApiBase('https://strivers-api.onrender.com/api/v2/adminaccess/')).toBe(
      'https://strivers-api.onrender.com/api/v2/adminaccess'
    );
    expect(normalizeAdminApiBase('https://your-strivers-backend.onrender.com/api/v2/adminaccess')).toBe('');
  });

  test('getConfiguredApiBase falls back to DEFAULT_PRODUCTION_BACKEND if no environment is set', () => {
    delete process.env.VITE_API_BASE_URL;
    delete process.env.REACT_APP_API_BASE_URL;
    expect(getConfiguredApiBase()).toBe(DEFAULT_PRODUCTION_BACKEND);
  });

  test('getCandidateBases prioritizes configured Render backend URL in hosted environments', () => {
    process.env.VITE_API_BASE_URL = 'https://strivers-api.onrender.com';
    expect(getConfiguredApiBase()).toBe('https://strivers-api.onrender.com/api/v2/adminaccess');
    const bases = getCandidateBases();
    expect(bases).toContain('https://strivers-api.onrender.com/api/v2/adminaccess');
  });

  test('setCustomApiBase allows runtime admin override of the target backend', () => {
    setCustomApiBase('http://localhost:8080');
    expect(getActiveApiBase()).toBe('http://localhost:8080/api/v2/adminaccess');
    setCustomApiBase('');
  });
});
