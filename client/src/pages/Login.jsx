import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import './Auth.css';

export default function Login() {
  const [params] = useSearchParams();
  const plan = params.get('plan') || '';
  const redirect = params.get('redirect') || '';
  const isLoggedOut = params.get('logged_out') === '1';
  const [form, setForm] = useState({ email: params.get('email') || '', password: '' });
  const [error, setError] = useState('');
  const [notFoundEmail, setNotFoundEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [noticeMsg, setNoticeMsg] = useState(
    params.get('paid') === '1'
      ? '✓ You have already purchased this course. Sign in to access your classroom.'
      : isLoggedOut
      ? '✓ You have been signed out successfully.'
      : ''
  );
  const navigate = useNavigate();

  // If user is already authenticated, check session
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');
    if (storedUser && storedToken && !isLoggedOut) {
      try {
        const u = JSON.parse(storedUser);
        if (u && u.email) {
          setNoticeMsg(`Signed in as ${u.name || u.email}. Click "Open Classroom" to continue.`);
        }
      } catch (_) {}
    }
  }, [isLoggedOut]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setNotFoundEmail('');
    setBusy(true);

    try {
      const res = await api.post('/auth/login', { ...form, plan });
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }

      // Notify entire app of authentication change
      window.dispatchEvent(new Event('auth_state_change'));

      // Check if user already owns access to the opted course
      if (res.data?.alreadyPaid) {
        setNoticeMsg('✓ You have permanent access to this course! Opening classroom...');
        setTimeout(() => {
          navigate(res.data.accessUrl || `/courses/${plan || 'masterclass'}/access`);
        }, 700);
        return;
      }

      // If user came to buy a course and hasn't paid yet, proceed to payment
      if (plan) {
        navigate(`/courses?checkout=${encodeURIComponent(plan)}`);
        return;
      }

      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/courses');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.notFound) {
        setNotFoundEmail(form.email);
        setError(data.message || 'No account registered with this email.');
      } else if (data?.message || data?.error) {
        setError(data.message || data.error);
      } else if (err.message && (err.message.includes('Network Error') || err.code === 'ERR_NETWORK')) {
        setError('Cannot reach server at http://localhost:8080. Please ensure the backend server is running.');
      } else {
        setError('Login failed. Please verify your email and password.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-page-root">
      <Header />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 420, margin: '60px auto', width: '100%', padding: '0 16px' }}>
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
            {noticeMsg.includes('Signed in as') && (
              <div style={{ marginTop: '8px' }}>
                <Link to="/courses" className="btn btn-primary btn-sm" style={{ display: 'inline-block', textDecoration: 'none' }}>
                  Open Classroom →
                </Link>
              </div>
            )}
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
              style={{ marginTop: 4, width: '100%' }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: '#2563EB', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Your password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{ marginTop: 4, width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#b91c1c', fontSize: '0.9rem' }}>
              ⚠️ {error}
              {notFoundEmail && (
                <div style={{ marginTop: '8px' }}>
                  <Link
                    to={`/register?email=${encodeURIComponent(notFoundEmail)}${plan ? `&plan=${encodeURIComponent(plan)}` : ''}`}
                    style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'underline' }}
                  >
                    Click here to create your account now →
                  </Link>
                </div>
              )}
            </div>
          )}

          <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="muted" style={{ marginTop: '20px', fontSize: '0.95rem' }}>
          Don&apos;t have an account? <Link to={`/register${plan ? `?plan=${encodeURIComponent(plan)}` : ''}`}>Create one here</Link> or{' '}
          <Link to="/courses">explore all courses</Link>.
        </p>
      </main>
      <Footer />
    </div>
  );
}
