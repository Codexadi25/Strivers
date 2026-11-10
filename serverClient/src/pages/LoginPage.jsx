import React, { useState } from 'react';
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
import './LoginPage.css';

export default function LoginPage({ onLoginSuccess, isDark = false }) {
  const [email, setEmail] = useState('creedracer111@gmail.com');
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
        setAdminSession(res.token, res.user);
        onLoginSuccess(res.user);
      } else {
        setError('Invalid authentication response from /api/v2/adminaccess/auth/login.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Check credentials and server connection.');
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
          <div>
            <Typography variant="h6" sx={{ lineHeight: 1.15 }}>
              Strivers Server GUI
            </Typography>
            <Chip
              label="API v2 ADMIN ACCESS"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, mt: 0.4 }}
            />
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
            placeholder="Enter your admin email"
          />

          <TextField
            label="Administrator Passkey"
            type="password"
            size="small"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
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

        <div className="sc-login-hint-box">
          <strong>⚠️ Make sure you are an authorized admin</strong>. <br /> Trouble logging in? Reach out to <a href="mailto:adityasahu.dev@gmail.com">System Administrator</a> or the admin team for further info or access.
        </div>
      </Paper>
    </div>
  );
}
