import { createSlice } from '@reduxjs/toolkit';
import { BASELINE_COURSES } from '../../config/courseDefaults';

const initialState = {
  courses: BASELINE_COURSES,
  catalogMeta: null,
  selectedCourseId: 'masterclass',
  loading: false,
  error: null,
};

export const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setCourses: (state, action) => {
      state.courses = action.payload || BASELINE_COURSES;
      state.loading = false;
      state.error = null;
    },
    setCatalogMeta: (state, action) => {
      state.catalogMeta = action.payload;
    },
    setSelectedCourseId: (state, action) => {
      state.selectedCourseId = action.payload;
    },
    setCoursesLoading: (state, action) => {
      state.loading = Boolean(action.payload);
    },
    setCoursesError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const {
  setCourses,
  setCatalogMeta,
  setSelectedCourseId,
  setCoursesLoading,
  setCoursesError,
} = coursesSlice.actions;

export const selectCourses = (state) => state.courses.courses;
export const selectCatalogMeta = (state) => state.courses.catalogMeta;
export const selectSelectedCourseId = (state) => state.courses.selectedCourseId;
export const selectCoursesLoading = (state) => state.courses.loading;

export default coursesSlice.reducer;
