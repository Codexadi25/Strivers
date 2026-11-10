import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import CourseAccess from './pages/CourseAccess';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupAccount from './pages/SetupAccount';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ViewerPage } from './pages/ViewerPage';
import PracticeDashboard from './pages/PracticeDashboard';
import { trackPageView, setupGlobalActivityTracking } from './utils/analytics';

/**
 * Route Tracker Component: automatically logs page_view to GA4 on every SPA navigation
 */
function AnalyticsRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    setupGlobalActivityTracking();
  }, []);

  return (
    <>
      <AnalyticsRouteTracker />
      <Routes>
        {/* Strivers Landing page */}
        <Route path="/" element={<Landing />} />
        <Route path="/masterclass" element={<Landing />} />

        {/* Practice Dashboard & Live Mentorship Sessions */}
        <Route path="/practice" element={<PracticeDashboard />} />
        <Route path="/dashboard" element={<PracticeDashboard />} />

        {/* Member Courses, Course Details & Classroom Viewer */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:id" element={<CourseDetail />} />
        <Route path="/courses/:id/access" element={<CourseAccess />} />
        <Route path="/viewer" element={<ViewerPage />} />

        {/* Auth & Member Onboarding */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-account" element={<SetupAccount />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;