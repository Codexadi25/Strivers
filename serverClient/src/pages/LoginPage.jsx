import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import LoginIcon from '@mui/icons-material/Login';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import appLogo from '../assets/favicon.ico';
import {
  apiCall,
  setAdminSession,
  getActiveApiBase,
  setCustomApiBase,
  pingBackend,
  DEFAULT_PRODUCTION_BACKEND,
} from '../services/api';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess, isDark = false }) {
  const [email, setEmail] = useState('creedracer111@gmail.com');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const resolveInitialBase = () => {
    try {
      if (typeof getActiveApiBase === 'function') {
        return getActiveApiBase() || DEFAULT_PRODUCTION_BACKEND || 'https://strivers-hr5g.onrender.com/api/v2/adminaccess';
      }
    } catch (_) {}
    return DEFAULT_PRODUCTION_BACKEND || 'https://strivers-hr5g.onrender.com/api/v2/adminaccess';
  };

  // Backend connection settings state
  const [showSettings, setShowSettings] = useState(false);
  const [backendUrl, setBackendUrl] = useState(resolveInitialBase);
  const [pingStatus, setPingStatus] = useState(null);
  const [pinging, setPinging] = useState(false);

  useEffect(() => {
    setBackendUrl(resolveInitialBase());
  }, []);

  const handlePingTest = async (targetBase) => {
    setPinging(true);
    setPingStatus(null);
    try {
      const result = await pingBackend(targetBase || backendUrl);
      setPingStatus(result);
    } catch (err) {
      setPingStatus({ ok: false, status: 'OFFLINE', error: err.message });
    } finally {
      setPinging(false);
    }
  };

  const handleSaveBackendUrl = () => {
    const updated = setCustomApiBase(backendUrl);
    setBackendUrl(updated || DEFAULT_PRODUCTION_BACKEND);
    handlePingTest(updated || DEFAULT_PRODUCTION_BACKEND);
  };

  const handleResetBackendUrl = () => {
    setCustomApiBase('');
    setBackendUrl(DEFAULT_PRODUCTION_BACKEND);
    handlePingTest(DEFAULT_PRODUCTION_BACKEND);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      const res = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (res && res.success && res.token && res.user) {
        setAdminSession(res.token, res.user);
        onLoginSuccess(res.user);
      } else {
        setError(res?.message || 'Invalid authentication response from backend server.');
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Check credentials and server connection.';
      setError(msg);
      // Auto-open server connection details if network / endpoint failure occurs
      if (msg.includes('backend') || msg.includes('connect') || msg.includes('timed out') || msg.includes('non-JSON')) {
        setShowSettings(true);
        handlePingTest(backendUrl);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`sc-login-wrapper ${isDark ? 'dark' : ''}`}>
      <Paper elevation={0} variant="outlined" className="sc-login-card">
        <div className="sc-login-brand">
          <div className="sc-login-logo">
            <img src={appLogo} alt="Strivers logo" className="sc-login-logo-img" />
          </div>
          <div style={{ flex: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
              Strivers Server GUI
            </Typography>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <Chip
                label="API v2 ADMIN ACCESS"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
              />
              <Tooltip title="Configure or test Backend API connection">
                <IconButton
                  size="small"
                  onClick={() => setShowSettings((prev) => !prev)}
                  sx={{ p: 0.25 }}
                  aria-label="Server settings"
                >
                  <SettingsOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>
        </div>

        <Typography variant="h5" gutterBottom>
          Administrator Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Authenticate first to manage live course pricing, masterclasses, Lifeline orders, and user access.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="sc-login-form">
          <TextField
            label="Root Admin Email"
            type="email"
            size="small"
            fullWidth
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="creedracer111@gmail.com"
          />

          <TextField
            label="Administrator Passkey"
            type="password"
            size="small"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password (e.g. admin123)"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
            sx={{ py: 1.2, borderRadius: 2 }}
          >
            {busy ? 'Verifying Admin Credentials...' : 'Authenticate & Launch Console'}
          </Button>
        </form>

        <Collapse in={showSettings} sx={{ mt: 2 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Backend API Connection Target
              </Typography>
              <Button
                size="small"
                variant="text"
                startIcon={pinging ? <CircularProgress size={12} /> : <WifiOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={() => handlePingTest(backendUrl)}
                disabled={pinging}
                sx={{ fontSize: '0.72rem', py: 0 }}
              >
                {pinging ? 'Pinging...' : 'Test Ping'}
              </Button>
            </div>

            <TextField
              size="small"
              fullWidth
              value={backendUrl}
              onChange={(e) => setBackendUrl(e.target.value)}
              placeholder="https://strivers-hr5g.onrender.com/api/v2/adminaccess"
              helperText="Target /api/v2/adminaccess endpoint (Render, local, or custom host)"
              sx={{ mb: 1 }}
            />

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button size="small" variant="outlined" onClick={handleSaveBackendUrl} sx={{ fontSize: '0.72rem' }}>
                Save & Connect
              </Button>
              <Button
                size="small"
                variant="text"
                startIcon={<RefreshOutlinedIcon sx={{ fontSize: 14 }} />}
                onClick={handleResetBackendUrl}
                sx={{ fontSize: '0.72rem' }}
              >
                Reset Default
              </Button>

              {pingStatus && (
                <Chip
                  size="small"
                  icon={
                    pingStatus.ok ? (
                      <CheckCircleOutlinedIcon sx={{ fontSize: '14px !important' }} />
                    ) : (
                      <ErrorOutlinedIcon sx={{ fontSize: '14px !important' }} />
                    )
                  }
                  label={
                    pingStatus.ok
                      ? `Online (${pingStatus.status})`
                      : pingStatus.error?.includes('timeout')
                      ? 'Render Cold Booting (~35s)'
                      : 'Unreachable'
                  }
                  color={pingStatus.ok ? 'success' : 'warning'}
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.68rem', fontWeight: 600 }}
                />
              )}
            </div>
          </Paper>
        </Collapse>

        <div className="sc-login-hint-box">
          <strong>Authorized Admin Access</strong>: Use registered admin credentials (e.g.{' '}
          <code>creedracer111@gmail.com</code> or <code>artisahu6880@gmail.com</code>).
          <br />
          <span>
            Hosted on <strong>ExternalStrivers.web.app</strong> connecting to Render Core API. Click ⚙️ above to view or switch
            target server endpoints.
          </span>
        </div>
      </Paper>
    </div>
  );
}
