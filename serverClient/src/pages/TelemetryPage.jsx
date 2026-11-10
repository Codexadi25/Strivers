import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { apiCall } from '../services/api';
import TelemetryMetricsGrid from '../components/telemetry/TelemetryMetricsGrid';
import DiagnosticsPanels from '../components/telemetry/DiagnosticsPanels';
import RecentActivitiesTable from '../components/telemetry/RecentActivitiesTable';
import './TelemetryPage.css';

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTelemetry = async () => {
    try {
      const res = await apiCall('/telemetry');
      if (res && res.telemetry) {
        setTelemetry(res.telemetry);
        setError('');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch telemetry data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="telem-page-root">
      <div className="telem-header">
        <h2 className="telem-title">System Telemetry &amp; Platform Overview</h2>
        <p className="telem-desc">
          Real-time server health, live revenue metrics, captured transactions, and system activity stream.
        </p>
      </div>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && !telemetry ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <CircularProgress size={24} />
          <span>Loading live platform telemetry...</span>
        </div>
      ) : (
        <>
          <TelemetryMetricsGrid
            metrics={telemetry?.metrics || {}}
            activitiesCount={(telemetry?.activities || []).length}
          />
          <DiagnosticsPanels telemetry={telemetry} />
          <RecentActivitiesTable activities={telemetry?.activities || []} />
        </>
      )}
    </div>
  );
}
