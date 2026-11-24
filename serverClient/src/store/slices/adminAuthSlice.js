import { createSlice } from '@reduxjs/toolkit';
import { getAdminToken, setAdminSession, clearAdminSession } from '../../services/api';

const getInitialAdminUser = () => {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem('strivers_admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
};

const initialToken = getAdminToken();
const initialUser = getInitialAdminUser();

const initialState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken),
  authChecking: true,
  error: null,
};

export const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminCredentials: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      state.isAuthenticated = Boolean(token);
      state.authChecking = false;
      state.error = null;
      if (token) {
        setAdminSession(token, user);
      }
    },
    adminLogout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.authChecking = false;
      state.error = null;
      clearAdminSession();
    },
    setAuthChecking: (state, action) => {
      state.authChecking = Boolean(action.payload);
    },
    setAdminError: (state, action) => {
      state.error = action.payload || null;
      state.authChecking = false;
    },
  },
});

export const {
  setAdminCredentials,
  adminLogout,
  setAuthChecking,
  setAdminError,
} = adminAuthSlice.actions;

export const selectAdminUser = (state) => state.adminAuth.user;
export const selectAdminToken = (state) => state.adminAuth.token;
export const selectIsAdminAuthenticated = (state) => state.adminAuth.isAuthenticated;
export const selectAdminAuthChecking = (state) => state.adminAuth.authChecking;
export const selectAdminError = (state) => state.adminAuth.error;

export default adminAuthSlice.reducer;
