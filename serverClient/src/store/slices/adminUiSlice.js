import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeTab: 'pricing',
  isDark: false,
  refreshKey: 0,
  liveStatus: null,
};

export const adminUiSlice = createSlice({
  name: 'adminUi',
  initialState,
  reducers: {
    setActiveTab: (state, action) => {
      state.activeTab = action.payload || 'pricing';
    },
    setIsDark: (state, action) => {
      state.isDark = Boolean(action.payload);
    },
    toggleDarkMode: (state) => {
      state.isDark = !state.isDark;
    },
    triggerRefresh: (state) => {
      state.refreshKey += 1;
    },
    setLiveStatus: (state, action) => {
      state.liveStatus = action.payload || null;
    },
  },
});

export const {
  setActiveTab,
  setIsDark,
  toggleDarkMode,
  triggerRefresh,
  setLiveStatus,
} = adminUiSlice.actions;

export const selectActiveTab = (state) => state.adminUi.activeTab;
export const selectIsDark = (state) => state.adminUi.isDark;
export const selectRefreshKey = (state) => state.adminUi.refreshKey;
export const selectLiveStatus = (state) => state.adminUi.liveStatus;

export default adminUiSlice.reducer;
