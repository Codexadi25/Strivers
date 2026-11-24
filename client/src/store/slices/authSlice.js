import { createSlice } from '@reduxjs/toolkit';
import {
  getAuthToken,
  getAuthUser,
  setAuthSession,
  syncAuthUser,
  clearAuthSession,
} from '../../utils/authStorage';

const initialToken = getAuthToken();
const initialUser = getAuthUser();

const initialState = {
  token: initialToken,
  user: initialUser,
  isAuthenticated: Boolean(initialToken && initialUser),
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload || {};
      state.token = token || null;
      state.user = user || null;
      state.isAuthenticated = Boolean(token && user);
      state.error = null;
      if (token) {
        setAuthSession(token, user);
      }
    },
    updateUser: (state, action) => {
      const user = action.payload;
      state.user = user;
      state.isAuthenticated = Boolean(state.token && user);
      if (user) {
        syncAuthUser(user);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      clearAuthSession();
    },
    setAuthLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setAuthError: (state, action) => {
      state.error = action.payload || null;
      state.loading = false;
    },
  },
});

export const { setCredentials, updateUser, logout, setAuthLoading, setAuthError } = authSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.auth.user;
export const selectCurrentToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;
export const selectEnrolledCourses = (state) => state.auth.user?.enrolledCourses || [];
export const selectEnrolledPracticeSheets = (state) => state.auth.user?.enrolledPracticeSheets || [];
export const selectHasActiveSubscription = (state) => Boolean(state.auth.user?.hasActiveSubscription);

export default authSlice.reducer;
