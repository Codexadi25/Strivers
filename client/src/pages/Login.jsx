import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function Login() {
  const [params] = useSearchParams();
  const plan = params.get('plan') || '';
  const redirect = params.get('redirect') || '';
  const [form, setForm] = useState({ email: params.get('email') || '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState(params.get('paid') === '1' ? '✓ You have already purchased this course. Sign in to access your dashboard.' : '');
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await api.post('/auth/login', { ...form, plan });
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }

      // Check if user already owns access to the opted course
      if (res.data?.alreadyPaid) {
        setNoticeMsg('✓ You already have permanent access to this course! Opening course...');
        setTimeout(() => {
          navigate(res.data.accessUrl || `/products/${plan || 'masterclass'}/access`);
        }, 800);
        return;
      }

      // If user came to buy a course and hasn't paid yet, proceed to payment
      if (plan) {
        navigate(`/products?checkout=${encodeURIComponent(plan)}`);
        return;
      }

      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 420, margin: '60px auto', width: '100%' }}>
        <h2>Sign In to Strivers</h2>
        <p className="muted" style={{ marginBottom: '18px' }}>
          Access your enrolled sessions, materials, and certificates.
        </p>

        {noticeMsg && (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: '16px',
              color: '#15803d',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            {noticeMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="stack">
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Email Address</label>
            <input
              type="email"
              placeholder="e.g. rahul@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Password</label>
            <input
              type="password"
              placeholder="Your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ marginTop: 4 }}
            />
          </div>

          {error && <p className="err">{error}</p>}

          <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div
          style={{
            marginTop: '24px',
            padding: '14px',
            backgroundColor: '#F8FAFC',
            border: '1px dashed #CBD5E1',
            borderRadius: '8px',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '8px' }}>
            Quick Test Accounts:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setForm({ email: 'admin@yourdomain.com', password: 'password123' })}
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #0F172A',
                background: '#0F172A',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Fill Admin (admin@yourdomain.com)
            </button>
            <button
              type="button"
              onClick={() => setForm({ email: 'alex.morgan@example.com', password: 'password123' })}
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid #CBD5E1',
                background: '#fff',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Fill Student (alex.morgan@example.com)
            </button>
          </div>
        </div>

        <p className="muted" style={{ marginTop: '20px', fontSize: '0.95rem' }}>
          Don&apos;t have an account? <Link to="/register">Create one here</Link> or{' '}
          <Link to="/">join the masterclass</Link>.
        </p>
      </main>
    </div>
  );
}
