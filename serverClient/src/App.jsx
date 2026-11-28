import React, { useEffect, useMemo } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store } from './store/index.js';
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
import AdityaIntegrationPage from './pages/AdityaIntegrationPage';
import { buildServerClientTheme } from './theme/muiTheme';
import { apiCall, getAdminToken, clearAdminSession } from './services/api';
import {
  selectAdminUser,
  selectAdminAuthChecking,
  setAdminCredentials,
  adminLogout,
  setAuthChecking,
} from './store/slices/adminAuthSlice.js';
import {
  selectActiveTab,
  selectIsDark,
  selectRefreshKey,
  selectLiveStatus,
  setActiveTab,
  toggleDarkMode,
  triggerRefresh,
  setLiveStatus,
} from './store/slices/adminUiSlice.js';
import './App.css';

function AppContent() {
  const dispatch = useDispatch();
  const adminUser = useSelector(selectAdminUser);
  const authChecking = useSelector(selectAdminAuthChecking);
  const activeTab = useSelector(selectActiveTab);
  const isDark = useSelector(selectIsDark);
  const refreshKey = useSelector(selectRefreshKey);
  const liveStatus = useSelector(selectLiveStatus);

  const muiTheme = useMemo(() => buildServerClientTheme(isDark), [isDark]);

  const checkSession = async () => {
    const token = getAdminToken();
    if (!token) {
      dispatch(adminLogout());
      return;
    }

    try {
      const res = await apiCall('/auth/me');
      if (res && res.success && res.user) {
        dispatch(setAdminCredentials({ token, user: res.user }));
      } else {
        dispatch(adminLogout());
      }
    } catch {
      dispatch(adminLogout());
    }
  };

  useEffect(() => {
    checkSession();
    const handleExpired = () => {
      dispatch(adminLogout());
    };
    window.addEventListener('admin_auth_expired', handleExpired);
    return () => window.removeEventListener('admin_auth_expired', handleExpired);
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    apiCall('/telemetry')
      .then((res) => {
        if (res && res.telemetry) {
          dispatch(setLiveStatus(res.telemetry));
        }
      })
      .catch(() => {});
  }, [adminUser, refreshKey]);

  const handleLogout = async () => {
    try {
      await apiCall('/auth/logout', { method: 'POST' });
    } catch (_) {}
    dispatch(adminLogout());
  };

  const handleSync = () => {
    dispatch(triggerRefresh());
  };

  const handleToggleDark = () => {
    dispatch(toggleDarkMode());
  };

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'pricing':
        return <PricingPage key={refreshKey} />;
      case 'masterclasses':
        return <MasterclassesPage key={refreshKey} />;
      case 'telemetry':
        return <TelemetryPage key={refreshKey} onTabChange={handleTabChange} />;
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
      case 'aditya-integration':
        return <AdityaIntegrationPage key={refreshKey} />;
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
            dispatch(triggerRefresh());
          }}
        />
      ) : (
        <div className={`sc-layout ${isDark ? 'sc-dark-theme' : ''}`}>
          <Sidebar
            activeTab={activeTab}
            onTabChange={handleTabChange}
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

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
