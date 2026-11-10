import React, { useState, useEffect, useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Sidebar from './components/Sidebar';
import HeaderTopBar from './components/HeaderTopBar';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import MasterclassesPage from './pages/MasterclassesPage';
import TelemetryPage from './pages/TelemetryPage';
import OrdersPage from './pages/OrdersPage';
import LifelinePage from './pages/LifelinePage';
import TicketsPage from './pages/TicketsPage';
import UsersPage from './pages/UsersPage';
import PracticePage from './pages/PracticePage';
import RefundsPage from './pages/RefundsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import { buildServerClientTheme } from './theme/muiTheme';
import { apiCall, getAdminToken, clearAdminSession } from './services/api';
import './App.css';

export default function App() {
  const [authChecking, setAuthChecking] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [activeTab, setActiveTab] = useState('pricing');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [liveStatus, setLiveStatus] = useState(null);

  const muiTheme = useMemo(() => buildServerClientTheme(isDark), [isDark]);

  const checkSession = async () => {
    const token = getAdminToken();
    if (!token) {
      setAdminUser(null);
      setAuthChecking(false);
      return;
    }

    try {
      const res = await apiCall('/auth/me');
      if (res && res.success && res.user) {
        setAdminUser(res.user);
      } else {
        clearAdminSession();
        setAdminUser(null);
      }
    } catch {
      clearAdminSession();
      setAdminUser(null);
    } finally {
      setAuthChecking(false);
    }
  };

  useEffect(() => {
    checkSession();
    const handleExpired = () => {
      clearAdminSession();
      setAdminUser(null);
    };
    window.addEventListener('admin_auth_expired', handleExpired);
    return () => window.removeEventListener('admin_auth_expired', handleExpired);
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    apiCall('/telemetry')
      .then((res) => {
        if (res && res.telemetry) {
          setLiveStatus(res.telemetry);
        }
      })
      .catch(() => {});
  }, [adminUser, refreshKey]);

  const handleLogout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (_) {}
    clearAdminSession();
    setAdminUser(null);
  };

  const handleSync = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleToggleDark = () => {
    setIsDark((prev) => !prev);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pricing':
        return <PricingPage key={refreshKey} />;
      case 'masterclasses':
        return <MasterclassesPage key={refreshKey} />;
      case 'telemetry':
        return <TelemetryPage key={refreshKey} />;
      case 'orders':
        return <OrdersPage key={refreshKey} />;
      case 'lifeline':
        return <LifelinePage key={refreshKey} />;
      case 'tickets':
        return <TicketsPage key={refreshKey} />;
      case 'users':
        return <UsersPage key={refreshKey} />;
      case 'practice':
        return <PracticePage key={refreshKey} />;
      case 'refunds':
        return <RefundsPage key={refreshKey} />;
      case 'audit':
        return <AuditLogsPage key={refreshKey} />;
      default:
        return <PricingPage key={refreshKey} />;
    }
  };

  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      {authChecking ? (
        <div className="sc-auth-loader">
          <CircularProgress size={34} />
          <span>Verifying ServerClient Admin Session...</span>
        </div>
      ) : !adminUser ? (
        <LoginPage
          isDark={isDark}
          onLoginSuccess={(u) => {
            setAdminUser(u);
            setRefreshKey((k) => k + 1);
          }}
        />
      ) : (
        <div className={`sc-layout ${isDark ? 'sc-dark-theme' : ''}`}>
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            user={adminUser}
            onLogout={handleLogout}
          />

          <main className="sc-content">
            <HeaderTopBar
              onSync={handleSync}
              isDark={isDark}
              onToggleDark={handleToggleDark}
              liveStatus={liveStatus}
            />

            <div className="sc-view-container">
              {renderActiveView()}
            </div>
          </main>
        </div>
      )}
    </ThemeProvider>
  );
}
