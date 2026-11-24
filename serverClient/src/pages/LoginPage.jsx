import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import LoginIcon from '@mui/icons-material/Login';
import appLogo from '../assets/favicon.ico';
import { apiCall, setAdminSession } from '../services/api';
import { setAdminCredentials } from '../store/slices/adminAuthSlice.js';
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess, isDark = false }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

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
        dispatch(setAdminCredentials({ token: res.token, user: res.user }));
        setAdminSession(res.token, res.user);
        if (onLoginSuccess) onLoginSuccess(res.user);
      } else {
        setError(res?.message || 'Invalid authentication response from backend server.');
      }
    } catch (err) {
      const msg = err.message || 'Authentication failed. Check credentials and server connection.';
      setError(msg);
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
          <div className="sc-login-header-text">
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Strivers Server GUI
            </Typography>
            <Chip
              label="API v2 ADMIN ACCESS"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
            />
          </div>
        </div>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Administrator Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, maxWidth: 360, mx: 'auto' }}>
          Authenticate first to manage live course pricing, masterclasses, Lifeline orders, and user access.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
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
            placeholder="Enter admin email (e.g. creedracer111@gmail.com)"
            autoComplete="email"
          />

          <TextField
            label="Administrator Passkey"
            type="password"
            size="small"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password / passkey"
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={busy}
            startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LoginIcon />}
            sx={{ py: 1.2, borderRadius: 2, fontWeight: 700 }}
          >
            {busy ? 'Verifying Admin Credentials...' : 'Authenticate & Launch Console'}
          </Button>
        </form>
      </Paper>
    </div>
  );
}
