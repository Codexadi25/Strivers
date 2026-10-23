import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

export default function SetupAccount() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [who, setWho] = useState(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('This setup link is incomplete. Log in instead.');
      return;
    }
    api
      .get('/auth/setup-account', { params: { token } })
      .then((res) => setWho(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || 'This setup link has expired. Log in or contact support.')
      );
  }, [token]);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (password !== confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const { data } = await api.post('/auth/setup-account', { token, password });
      navigate(data.accessUrl || '/products');
    } catch (err) {
      const d = err.response?.data?.details;
      setError(
        d ? d.map((x) => x.message).join(', ') : err.response?.data?.error || 'Could not set up your account'
      );
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main className="auth-wrap" style={{ flex: 1, maxWidth: 440, margin: '60px auto', width: '100%' }}>
        <h1>Payment Received. Set Your Password</h1>
        {who && (
          <p style={{ margin: '6px 0 20px', color: 'var(--ink-2)' }}>
            Creating member login for: <strong>{who.email}</strong>
          </p>
        )}

        {who && (
          <form onSubmit={submit} className="stack">
            <input
              type="password"
              placeholder="Password (min 8 chars, mixed case + number)"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <input
              type="password"
              placeholder="Confirm password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error && <p className="err">{error}</p>}
            <button className="btn btn-primary" disabled={busy}>
              {busy ? 'Saving account...' : 'Save & Enter Dashboard'}
            </button>
          </form>
        )}

        {!who && error && (
          <div>
            <p className="err">{error}</p>
            <Link className="btn btn-ghost" to="/login" style={{ marginTop: 12 }}>
              Go to login
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
