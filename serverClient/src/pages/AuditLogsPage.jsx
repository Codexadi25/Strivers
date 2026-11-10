import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../services/api';
import AuditTable from '../components/audit/AuditTable';
import './AuditLogsPage.css';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/audit-logs');
      if (res.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const s = search.toLowerCase();
    return (
      !s ||
      (l.event || l.action || '').toLowerCase().includes(s) ||
      (l.userEmail || '').toLowerCase().includes(s) ||
      (l.ip || l.ipAddress || '').toLowerCase().includes(s)
    );
  });

  return (
    <div className="audit-page-root">
      <div className="audit-header">
        <div>
          <h2 className="audit-title">Audit &amp; Security Logs</h2>
          <p className="audit-desc">
            Immutable system audit trail of authentication events, price modifications, DRM canvas accesses, and admin interventions.
          </p>
        </div>

        <TextField
          size="small"
          placeholder="Search by event, admin email, IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 260 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <CircularProgress size={24} />
          <span>Loading audit stream...</span>
        </div>
      ) : (
        <AuditTable logs={filtered} />
      )}
    </div>
  );
}
