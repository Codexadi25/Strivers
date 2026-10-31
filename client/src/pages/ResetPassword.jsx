import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const isMissingParams = !token || !email;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setBusy(true);

    try {
      const res = await api.post('/auth/reset-password', {
        email,
        token,
        newPassword,
      });

      if (res.data?.success) {
        setSuccess('✓ Your password has been successfully reset! Redirecting to sign in...');
        setTimeout(() => {
          navigate(`/login?email=${encodeURIComponent(email)}`);
        }, 1600);
      } else {
        setError(res.data?.message || 'Password reset failed.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        setError('Cannot reach server. Please ensure the backend is running.');
      } else {
        setError('Password reset failed. The link may have expired or is invalid.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 460, margin: '60px auto', width: '100%', padding: '0 16px' }}>
        <h2>Set New Password</h2>
        <p className="muted" style={{ marginBottom: '22px' }}>
          Choose a strong password to secure your Strivers account.
        </p>

        {isMissingParams ? (
          <div
            style={{
              background: '#FFFBEB',
              border: '1px solid #FCD34D',
              borderRadius: 10,
              padding: '18px 20px',
              color: '#92400E',
              fontSize: '0.92rem',
              lineHeight: 1.5,
            }}
          >
            <strong>⚠️ Invalid or Expired Password Reset Link</strong>
            <p style={{ marginTop: 6, marginBottom: 14 }}>
              The reset token or email address was not found in the URL. Please request a new link to proceed.
            </p>
            <Link
              to="/forgot-password"
              className="btn btn-primary"
              style={{ display: 'inline-flex', padding: '8px 16px', fontSize: '0.88rem', textDecoration: 'none' }}
            >
              Request New Reset Link →
            </Link>
          </div>
        ) : success ? (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 10,
              padding: '20px',
              color: '#15803D',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🎉</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 6 }}>
              Password Changed Successfully
            </div>
            <p style={{ fontSize: '0.92rem', color: '#166534', marginBottom: 16 }}>
              {success}
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              Sign In with New Password Now
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: '0.86rem',
                color: '#475569',
              }}
            >
              Resetting password for: <strong>{email}</strong>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>New Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ marginTop: 4 }}
                autoFocus
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-type your new password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ marginTop: 4 }}
              />
            </div>

            {error && (
              <p
                className="err"
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '10px 12px',
                  borderRadius: 6,
                  color: '#DC2626',
                  fontSize: '0.88rem',
                }}
              >
                {error}
              </p>
            )}

            <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Updating Password...' : 'Save New Password & Sign In'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Sign In
          </Link>
          <Link to="/forgot-password" style={{ color: '#64748B', textDecoration: 'none' }}>
            Request New Link
          </Link>
        </div>
      </main>
    </div>
  );
}

