import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from './slices/adminAuthSlice.js';
import adminUiReducer from './slices/adminUiSlice.js';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    adminUi: adminUiReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
