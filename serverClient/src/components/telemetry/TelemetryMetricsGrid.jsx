import React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import './TelemetryMetricsGrid.css';

export default function TelemetryMetricsGrid({ metrics = {}, activitiesCount = 0, onSelectMetric }) {
  const cards = [
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: metrics.totalRevenue || '₹0',
      sub: 'Captured in production',
      subColor: '#059669',
      iconClass: 'green',
      Icon: AttachMoneyIcon,
    },
    {
      key: 'transactions',
      label: 'Successful Transactions',
      value: metrics.successfulTxns ?? 0,
      sub: 'Verified payments',
      iconClass: 'blue',
      Icon: PaymentIcon,
    },
    {
      key: 'subscribers',
      label: 'Active Subscribers',
      value: metrics.activeSubscribers ?? 0,
      sub: 'Permanent & 30-day access',
      iconClass: 'purple',
      Icon: SchoolIcon,
    },
    {
      key: 'logs',
      label: 'Audit Logs Recorded',
      value: metrics.auditLogsRecorded ?? activitiesCount,
      sub: 'Security & payment events',
      iconClass: 'indigo',
      Icon: SecurityIcon,
    },
  ];

  return (
    <div className="sc-telem-metrics-grid">
      {cards.map((c) => {
        const IconComp = c.Icon;
        return (
          <Card
            key={c.key}
            variant="outlined"
            className="sc-telem-metric-card interactive"
            onClick={() => onSelectMetric && onSelectMetric(c.key)}
            role="button"
            tabIndex={0}
            title={`Click to view live ${c.label} data`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectMetric && onSelectMetric(c.key);
              }
            }}
          >
            <div className={`sc-telem-icon-box ${c.iconClass}`}>
              <IconComp />
            </div>
            <div style={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {c.label}
              </Typography>
              <div className="sc-telem-val">{c.value}</div>
              <Typography variant="caption" sx={{ color: c.subColor || 'text.secondary', fontWeight: 600 }}>
                {c.sub}
              </Typography>
              <div className="sc-telem-click-hint">
                View data list &rarr;
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
