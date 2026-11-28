import React, { useState, useEffect } from 'react';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SyncIcon from '@mui/icons-material/Sync';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { getBackendBase, getAdminToken } from '../services/api.js';
import './AdityaIntegrationPage.css';

export default function AdityaIntegrationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [copied, setCopied] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const defaultAdityaUrl =
    (typeof process !== 'undefined' && process.env
      ? process.env.REACT_APP_ADITYA_SERVER_URL || process.env.VITE_ADITYA_SERVER_URL
      : '') || 'http://localhost:5000';

  const [config, setConfig] = useState({
    apiKey: '',
    secretTokenMasked: '',
    hasSecretToken: false,
    adityaServerUrl: defaultAdityaUrl,
    status: 'ACTIVE',
    lastHandshakeAt: null,
    configuredAt: null
  });

  const [form, setForm] = useState({
    apiKey: '',
    secretToken: '',
    adityaServerUrl: defaultAdityaUrl
  });

  const getHeaders = (extra = {}) => {
    const token = getAdminToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...extra,
    };
  };

  // Fetch current integration configuration on mount
  const fetchConfig = async () => {
    setLoading(true);
    try {
      const root = getBackendBase();
      const res = await fetch(`${root}/api/v2/integration/config`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data && data.success && data.config) {
        setConfig(data.config);
        setForm((prev) => ({
          ...prev,
          apiKey: data.config.apiKey || '',
          adityaServerUrl: data.config.adityaServerUrl || defaultAdityaUrl
        }));
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Failed to load integration config: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleGenerate = async () => {
    try {
      const root = getBackendBase();
      const res = await fetch(`${root}/api/v2/integration/generate-keys`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setForm({
          ...form,
          apiKey: data.apiKey,
          secretToken: data.secretToken
        });
        setMessage({ type: 'info', text: 'New strong API Key and Secret Token generated. Click Save to apply.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Key generation error: ' + err.message });
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    if (!form.apiKey || !form.secretToken) {
      setMessage({ type: 'error', text: 'Both API Key and Secret Token must be supplied in this GUI form.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const root = getBackendBase();
      const res = await fetch(`${root}/api/v2/integration/config`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          apiKey: form.apiKey,
          secretToken: form.secretToken,
          adityaServerUrl: form.adityaServerUrl,
          configuredBy: 'Strivers serverClient GUI'
        })
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'API Key & Secret Token successfully saved to Strivers Server.' });
        fetchConfig();
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save configuration.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Connection failed: ' + err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleTestHandshake = async () => {
    setTesting(true);
    setMessage({ type: '', text: '' });

    try {
      const root = getBackendBase();
      const testKey = form.apiKey || config.apiKey;
      const testSecret = form.secretToken;

      const headers = { 'X-API-Key': testKey };
      if (testSecret) headers['X-Secret-Token'] = testSecret;

      const res = await fetch(`${root}/api/v2/integration/test-handshake`, {
        headers: getHeaders(headers),
      });

      const data = await res.json();
      if (data.success) {
        setMessage({
          type: 'success',
          text: `Handshake Successful: Strivers server verified credentials. ${data.message}`
        });
      } else {
        setMessage({ type: 'error', text: `Handshake Failed: ${data.error}` });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Handshake Error: ' + err.message });
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="adi-page">
      <div className="adi-header">
        <div>
          <h2 className="adi-title">AdityaTechnDevoops Core OS Integration</h2>
          <p className="adi-subtitle">
            Configure secure API Key and Secret Token handshake to connect Strivers server with Aditya Holdings Business OS.
          </p>
        </div>
        <div className="adi-badge-group">
          <Chip
            icon={<CheckCircleIcon style={{ color: '#2E7D32' }} />}
            label={config.status === 'ACTIVE' ? 'Integration Ready' : 'Pending Config'}
            color={config.status === 'ACTIVE' ? 'success' : 'warning'}
            variant="outlined"
          />
        </div>
      </div>

      {message.text && (
        <Alert severity={message.type || 'info'} style={{ marginBottom: '16px' }} onClose={() => setMessage({ type: '', text: '' })}>
          {message.text}
        </Alert>
      )}

      {loading ? (
        <div className="adi-loading">
          <CircularProgress size={30} />
          <span>Loading integration credentials...</span>
        </div>
      ) : (
        <div className="adi-grid">
          {/* Active Configuration Card */}
          <Paper className="adi-card" elevation={1}>
            <div className="adi-card-header">
              <div className="adi-card-icon"><VpnKeyIcon /></div>
              <div>
                <h3 className="adi-card-title">Live Server Credentials</h3>
                <span className="adi-card-desc">Active credentials stored in Strivers server data store</span>
              </div>
            </div>

            <div className="adi-creds-list">
              <div className="adi-cred-item">
                <span className="adi-cred-label">API Key</span>
                <div className="adi-cred-val-box">
                  <code>{config.apiKey || 'None'}</code>
                  {config.apiKey && (
                    <button
                      className="adi-copy-btn"
                      onClick={() => copyToClipboard(config.apiKey, 'key')}
                      title="Copy API Key"
                    >
                      <ContentCopyIcon fontSize="small" />
                      <span>{copied === 'key' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="adi-cred-item">
                <span className="adi-cred-label">Secret Token</span>
                <div className="adi-cred-val-box">
                  <code>{config.secretTokenMasked}</code>
                  <span className="adi-status-tag">Locked in Server</span>
                </div>
              </div>

              <div className="adi-cred-item">
                <span className="adi-cred-label">Aditya OS Core URL</span>
                <div className="adi-cred-val-box">
                  <code>{config.adityaServerUrl}</code>
                </div>
              </div>

              <div className="adi-meta-row">
                <span>Last Handshake: <strong>{config.lastHandshakeAt ? new Date(config.lastHandshakeAt).toLocaleString() : 'Never'}</strong></span>
                <span>Configured At: <strong>{config.configuredAt ? new Date(config.configuredAt).toLocaleString() : 'System Default'}</strong></span>
              </div>
            </div>

            <div className="adi-actions-row">
              <Button
                variant="outlined"
                startIcon={<SyncIcon />}
                onClick={handleTestHandshake}
                disabled={testing}
              >
                {testing ? 'Testing Handshake...' : 'Verify Local Handshake'}
              </Button>
            </div>
          </Paper>

          {/* Configuration Form Card (Only set by this GUI) */}
          <Paper className="adi-card" elevation={1}>
            <div className="adi-card-header">
              <div className="adi-card-icon"><LinkIcon /></div>
              <div>
                <h3 className="adi-card-title">Update Credentials via GUI</h3>
                <span className="adi-card-desc">Set or rotate the API Key and Secret Token for Aditya OS connection</span>
              </div>
            </div>

            <form onSubmit={handleSave} className="adi-form">
              <div className="adi-form-field">
                <label className="adi-field-label">API Key</label>
                <TextField
                  fullWidth
                  size="small"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  placeholder="e.g. ubos_strivers_live_key_9x9"
                  helperText="Unique identifier for Strivers on AdityaTechnDevoops platform"
                />
              </div>

              <div className="adi-form-field">
                <label className="adi-field-label">Secret Token</label>
                <div className="adi-secret-wrap">
                  <TextField
                    fullWidth
                    size="small"
                    type={showSecret ? 'text' : 'password'}
                    value={form.secretToken}
                    onChange={(e) => setForm({ ...form, secretToken: e.target.value })}
                    placeholder="Enter or generate new Secret Token"
                    helperText="Pre-shared cryptographic secret token for mutual handshake verification"
                  />
                  <button
                    type="button"
                    className="adi-eye-btn"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </button>
                </div>
              </div>

              <div className="adi-form-field">
                <label className="adi-field-label">AdityaTechnDevoops Base URL</label>
                <TextField
                  fullWidth
                  size="small"
                  value={form.adityaServerUrl}
                  onChange={(e) => setForm({ ...form, adityaServerUrl: e.target.value })}
                  placeholder="http://localhost:5000"
                />
              </div>

              <div className="adi-btn-group">
                <Button
                  type="button"
                  variant="outlined"
                  startIcon={<AutorenewIcon />}
                  onClick={handleGenerate}
                >
                  Generate Strong Keys
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? 'Saving to Server...' : 'Save Credentials'}
                </Button>
              </div>
            </form>
          </Paper>
        </div>
      )}

      {/* Architecture & Isolation Notice */}
      <Paper className="adi-notice-card" elevation={0}>
        <div className="adi-notice-header">
          <strong>Security Protocol & Database Isolation Architecture</strong>
        </div>
        <p>
          1. <strong>Strict API & Secret Token Handshake:</strong> AdityaTechnDevoops Server requests data using <code>X-API-Key</code> and <code>X-Secret-Token</code> headers matching these GUI-configured values.
        </p>
        <p>
          2. <strong>Separate & Isolated Database:</strong> AdityaTechnDevoops runs its own private internal database (<code>aditya_internal_hub</code>) for private corporate financial records, founder equity, and operational expenses that <strong>cannot be accessed or fetched by Strivers or any external server</strong>.
        </p>
      </Paper>
    </div>
  );
}
