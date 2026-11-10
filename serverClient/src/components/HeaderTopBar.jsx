import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import SyncIcon from '@mui/icons-material/Sync';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import './HeaderTopBar.css';

export default function HeaderTopBar({ onSync, isDark, onToggleDark, liveStatus }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istString = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setTimeStr(`${istString} IST`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const dbLabel = liveStatus?.database?.label || 'Connected';
  const gatewayLabel = liveStatus?.gateway?.mode || 'Razorpay Sandbox (Live)';
  const portLabel = liveStatus?.port || '8080 (Express)';

  return (
    <header className="sc-header-bar">
      <div className="sc-header-status-group">
        <Chip
          size="small"
          variant="outlined"
          className="sc-status-pill pill-port"
          icon={<span className="sc-status-dot dot-green" />}
          label={`Server Port: ${portLabel}`}
        />

        <Chip
          size="small"
          variant="outlined"
          className="sc-status-pill pill-db"
          icon={<span className="sc-status-dot dot-blue" />}
          label={`Database: ${dbLabel}`}
        />

        <Chip
          size="small"
          variant="outlined"
          className="sc-status-pill pill-gateway"
          icon={<span className="sc-status-dot dot-purple" />}
          label={`Gateway: ${gatewayLabel}`}
        />
      </div>

      <div className="sc-header-actions-group">
        <Button
          size="small"
          variant="outlined"
          onClick={onToggleDark}
          startIcon={isDark ? <LightModeOutlinedIcon fontSize="small" /> : <DarkModeOutlinedIcon fontSize="small" />}
          className="sc-header-action-btn"
          title="Toggle Dark / Light Theme"
        >
          {isDark ? 'Light' : 'Dark'}
        </Button>

        <Button
          size="small"
          variant="outlined"
          onClick={onSync}
          startIcon={<SyncIcon fontSize="small" />}
          className="sc-header-action-btn"
          title="Synchronize live state with server"
        >
          Sync Live Data
        </Button>

        <div className="sc-header-clock-pill" aria-label="IST Server Clock">
          {timeStr}
        </div>
      </div>
    </header>
  );
}
