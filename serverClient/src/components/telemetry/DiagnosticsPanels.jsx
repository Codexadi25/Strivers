import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import './DiagnosticsPanels.css';

function formatUptime(sec) {
  const sNum = Number(sec) || 0;
  const h = Math.floor(sNum / 3600);
  const m = Math.floor((sNum % 3600) / 60);
  const s = sNum % 60;
  return `${h}h ${m}m ${s}s`;
}

export default function DiagnosticsPanels({ telemetry }) {
  const t = telemetry || {};
  return (
    <div className="sc-diag-grid">
      <Card variant="outlined" className="sc-diag-card">
        <h3 className="sc-diag-title">Server Runtime Diagnostics</h3>
        <div className="sc-diag-rows">
          <div className="sc-diag-row">
            <span>Node.js Version</span>
            <strong>{t.nodeVersion || 'N/A'}</strong>
          </div>
          <div className="sc-diag-row">
            <span>Platform / Arch</span>
            <strong>{t.platform || 'win32 (x64)'}</strong>
          </div>
          <div className="sc-diag-row">
            <span>Process Uptime</span>
            <strong>{formatUptime(t.uptimeSeconds)}</strong>
          </div>
          <div className="sc-diag-row">
            <span>Heap Memory</span>
            <strong>{t.memory?.heapUsedMB || '0.0'} MB</strong>
          </div>
          <div className="sc-diag-row">
            <span>Resident Set (RSS)</span>
            <strong>{t.memory?.rssMB || '0.0'} MB</strong>
          </div>
          <div className="sc-diag-row">
            <span>Environment</span>
            <Chip size="small" label={t.environment || 'development'} color="primary" variant="outlined" />
          </div>
        </div>
      </Card>

      <Card variant="outlined" className="sc-diag-card">
        <h3 className="sc-diag-title">Gateway &amp; Database Credentials</h3>
        <div className="sc-diag-rows">
          <div className="sc-diag-row">
            <span>Razorpay Mode</span>
            <Chip size="small" label={t.gateway?.mode || 'Razorpay Sandbox'} color="success" variant="outlined" />
          </div>
          <div className="sc-diag-row">
            <span>Key ID</span>
            <code>{t.gateway?.keyId || 'rzp_live_...'}</code>
          </div>
          <div className="sc-diag-row">
            <span>Webhook Signature</span>
            <strong>{t.gateway?.webhookSignature || 'Active HMAC-SHA256'}</strong>
          </div>
          <div className="sc-diag-row">
            <span>Database Connection</span>
            <Chip
              size="small"
              color="info"
              variant="outlined"
              label={t.gateway?.databaseConnection || t.database?.label || 'Connected'}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
