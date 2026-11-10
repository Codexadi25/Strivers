import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import BarChartIcon from '@mui/icons-material/BarChart';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './OrdersAnalyticsCards.css';

export default function OrdersAnalyticsCards({ distribution, failureBreakdown }) {
  const dist = distribution || {
    total: 0,
    captured: 0,
    capturedPct: 0,
    failed: 0,
    failedPct: 0,
    canceled: 0,
    canceledPct: 0,
    refunded: 0,
    refundedPct: 0,
  };

  const fail = failureBreakdown || {
    riskCheck: 0,
    bankTimeout: 0,
    userCancelled: 0,
    failureRatePct: 0,
  };

  return (
    <div className="sc-orders-analytics-grid">
      <Card variant="outlined" className="sc-orders-analytics-card">
        <div className="sc-orders-card-head">
          <div className="sc-orders-title-row">
            <BarChartIcon color="primary" fontSize="small" />
            <strong>Transaction Status Distribution</strong>
          </div>
          <Chip size="small" color="primary" variant="outlined" label={`${dist.total} TOTAL ATTEMPTS`} />
        </div>

        <div className="sc-orders-dist-list">
          <div>
            <div className="sc-orders-dist-label">
              <span>Captured (Success)</span>
              <strong>{dist.captured} ({dist.capturedPct}%)</strong>
            </div>
            <LinearProgress variant="determinate" value={dist.capturedPct} color="success" sx={{ height: 7, borderRadius: 4 }} />
          </div>

          <div>
            <div className="sc-orders-dist-label">
              <span>Failed (PG / Risk Failure)</span>
              <strong>{dist.failed} ({dist.failedPct}%)</strong>
            </div>
            <LinearProgress variant="determinate" value={dist.failedPct} color="error" sx={{ height: 7, borderRadius: 4 }} />
          </div>

          <div>
            <div className="sc-orders-dist-label">
              <span>Payment Canceled</span>
              <strong>{dist.canceled} ({dist.canceledPct}%)</strong>
            </div>
            <LinearProgress variant="determinate" value={dist.canceledPct} color="inherit" sx={{ height: 7, borderRadius: 4, color: '#64748b' }} />
          </div>

          <div>
            <div className="sc-orders-dist-label">
              <span>Refunded to Source</span>
              <strong>{dist.refunded} ({dist.refundedPct}%)</strong>
            </div>
            <LinearProgress variant="determinate" value={dist.refundedPct} color="warning" sx={{ height: 7, borderRadius: 4 }} />
          </div>
        </div>
      </Card>

      <Card variant="outlined" className="sc-orders-analytics-card">
        <div className="sc-orders-card-head">
          <div className="sc-orders-title-row">
            <WarningAmberIcon color="warning" fontSize="small" />
            <strong>PG Failure Breakdown by Issue Type</strong>
          </div>
          <Chip size="small" color="warning" variant="outlined" label={`${fail.failureRatePct}% FAILURE RATE`} />
        </div>

        <div className="sc-orders-dist-list">
          <div className="sc-orders-fail-item">
            <div className="sc-orders-dist-label">
              <span><strong style={{ color: '#db2777' }}>●</strong> Domain / Risk Check (payment_risk_check_failed)</span>
              <strong>{fail.riskCheck} instances</strong>
            </div>
            <span className="sc-orders-fail-sub">Website domain mismatch in gateway configuration</span>
          </div>

          <div className="sc-orders-fail-item">
            <div className="sc-orders-dist-label">
              <span>🏛️ Bank Network / Acquiring Timeout</span>
              <strong>{fail.bankTimeout} instances</strong>
            </div>
          </div>

          <div className="sc-orders-fail-item">
            <div className="sc-orders-dist-label">
              <span>👤 User Cancelled / Modal Dismissed</span>
              <strong>{fail.userCancelled} instances</strong>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
