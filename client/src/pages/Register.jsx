import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function Register() {
  const [params] = useSearchParams();
  const plan = params.get('plan') || '';
  const redirect = params.get('redirect') || (plan ? `/products?checkout=${encodeURIComponent(plan)}` : '/products');

  const [form, setForm] = useState({
    name: '',
    email: params.get('email') || '',
    password: '',
  });
  const [error, setError] = useState('');
  const [doneMsg, setDoneMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setDoneMsg('');
    setBusy(true);

    try {
      const res = await api.post('/auth/register', { ...form, plan });
      if (res.data?.token) {
        localStorage.setItem('auth_token', res.data.token);
      }
      if (res.data?.user) {
        localStorage.setItem('auth_user', JSON.stringify(res.data.user));
      }

      setDoneMsg('✓ Account created successfully! Setting up your course...');

      setTimeout(() => {
        if (plan) {
          if (res.data?.alreadyPaid) {
            navigate(`/products/${plan}/access`);
          } else {
            navigate(`/products?checkout=${encodeURIComponent(plan)}`);
          }
        } else {
          navigate(redirect);
        }
      }, 1000);
    } catch (err) {
      if (err.response?.status === 409 && err.response?.data?.exists) {
        setError('An account with this email already exists. Redirecting you to login...');
        const redirectUrl = err.response.data.redirect || `/login?email=${encodeURIComponent(form.email)}&plan=${encodeURIComponent(plan)}`;
        setTimeout(() => {
          navigate(redirectUrl);
        }, 1500);
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check your information.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 420, margin: '60px auto', width: '100%' }}>
        <h2>Create an Account</h2>
        <p className="muted" style={{ marginBottom: '18px' }}>
          Join Strivers to save your progress, materials, and placement recordings.
        </p>
        {plan && (
          <div
            style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '12px 14px',
              marginBottom: '16px',
              color: '#1d4ed8',
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          >
            🎯 Step 1 of 2: Create your account to enroll in <strong>{plan.replace('_', ' ').toUpperCase()}</strong>.
          </div>
        )}

        {doneMsg ? (
          <div
            style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: 8,
              padding: '16px',
              color: '#15803d',
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {doneMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="stack">
            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Full Name</label>
              <input
                placeholder="e.g. Priya Sharma"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--ink)' }}>Email Address</label>
              <input
                type="email"
                placeholder="priya@example.com"
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
                placeholder="Min 8 chars, letters & numbers"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ marginTop: 4 }}
              />
            </div>

            {error && <p className="err">{error}</p>}

            <button className="btn btn-primary" disabled={busy} style={{ marginTop: 8 }}>
              {busy ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="muted" style={{ marginTop: '20px', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login">Sign in here</Link>.
        </p>
      </main>
    </div>
  );
}
