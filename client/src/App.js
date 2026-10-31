import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Products from './pages/Products';
import ProductAccess from './pages/ProductAccess';
import Login from './pages/Login';
import Register from './pages/Register';
import SetupAccount from './pages/SetupAccount';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { ViewerPage } from './pages/ViewerPage';
import PracticeDashboard from './pages/PracticeDashboard';

function App() {
  return (
    <Routes>
      {/* Strivers Landing page */}
      <Route path="/" element={<Landing />} />
      <Route path="/masterclass" element={<Landing />} />

      {/* Practice Dashboard & Live Mentorship Sessions */}
      <Route path="/practice" element={<PracticeDashboard />} />
      <Route path="/dashboard" element={<PracticeDashboard />} />

      {/* Member Courses & DRM Gated Viewer */}
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id/access" element={<ProductAccess />} />
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
  );
}


export default App;