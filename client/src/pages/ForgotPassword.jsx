import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessData(null);
    setCopied(false);
    setBusy(true);

    try {
      const res = await api.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setSuccessData(res.data);
      } else {
        setError(res.data?.message || 'Failed to generate password reset link.');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      if (serverMsg) {
        setError(serverMsg);
      } else if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        setError('Cannot reach server. Please ensure the backend is running.');
      } else {
        setError('Failed to process password reset request. Please check your email.');
      }
    } finally {
      setBusy(false);
    }
  }

  function handleCopyLink() {
    if (!successData?.resetUrl) return;
    const fullUrl = window.location.origin + successData.resetUrl;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 460, margin: '60px auto', width: '100%', padding: '0 16px' }}>
        <h2>Reset Your Password</h2>
        <p className="muted" style={{ marginBottom: '22px' }}>
          Enter the email address registered with your Strivers account to receive a secure password reset link.
        </p>

        {successData ? (
          <div
            style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 10,
              padding: '20px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#15803D', fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>
              <span>✓</span>
              <span>Reset Link Ready</span>
            </div>
            <p style={{ color: '#166534', fontSize: '0.92rem', marginBottom: 16 }}>
              A one-time password reset token was generated for <strong>{email}</strong>. Use the button below to set your new password immediately.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate(successData.resetUrl)}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Proceed to Reset Password →
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #CBD5E1',
                  borderRadius: 8,
                  padding: '9px 14px',
                  color: '#334155',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                {copied ? '✓ Link Copied to Clipboard!' : '📋 Copy Password Reset Link'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Email Address</label>
              <input
                type="email"
                placeholder="e.g. student@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ marginTop: 4 }}
                autoFocus
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
              {busy ? 'Generating Link...' : 'Send Password Reset Link'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
          <Link to="/login" style={{ color: '#2563EB', textDecoration: 'none', fontWeight: 500 }}>
            ← Back to Sign In
          </Link>
          <Link to="/register" style={{ color: '#64748B', textDecoration: 'none' }}>
            Create New Account
          </Link>
        </div>
      </main>
    </div>
  );
}

