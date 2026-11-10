import React from 'react';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PaymentIcon from '@mui/icons-material/Payment';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import './TelemetryMetricsGrid.css';

export default function TelemetryMetricsGrid({ metrics = {}, activitiesCount = 0 }) {
  const cards = [
    {
      label: 'Total Revenue',
      value: metrics.totalRevenue || '₹0',
      sub: 'Captured in production',
      subColor: '#059669',
      iconClass: 'green',
      Icon: AttachMoneyIcon,
    },
    {
      label: 'Successful Transactions',
      value: metrics.successfulTxns ?? 0,
      sub: 'Verified payments',
      iconClass: 'blue',
      Icon: PaymentIcon,
    },
    {
      label: 'Active Subscribers',
      value: metrics.activeSubscribers ?? 0,
      sub: 'Permanent & 30-day access',
      iconClass: 'purple',
      Icon: SchoolIcon,
    },
    {
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
          <Card key={c.label} variant="outlined" className="sc-telem-metric-card">
            <div className={`sc-telem-icon-box ${c.iconClass}`}>
              <IconComp />
            </div>
            <div>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                {c.label}
              </Typography>
              <div className="sc-telem-val">{c.value}</div>
              <Typography variant="caption" sx={{ color: c.subColor || 'text.secondary', fontWeight: 600 }}>
                {c.sub}
              </Typography>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
