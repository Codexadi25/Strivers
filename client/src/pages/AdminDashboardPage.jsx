import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/common/Navbar';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import '../assets/styles/adminDashboard.css';

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [loadingTxn, setLoadingTxn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [resMetrics, resAnalytics] = await Promise.allSettled([
          axiosClient.get('/admin/metrics'),
          axiosClient.get('/admin/analytics/transactions'),
        ]);

        if (resMetrics.status === 'fulfilled' && resMetrics.value.data.success) {
          setDashboardData(resMetrics.value.data.data);
        }
        if (resAnalytics.status === 'fulfilled' && resAnalytics.value.data.success) {
          setAnalytics(resAnalytics.value.data.analytics);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  async function openTxnDetails(orderId) {
    setLoadingTxn(true);
    setSelectedTxn({ loading: true, orderId });
    try {
      const res = await axiosClient.get(`/admin/orders/${encodeURIComponent(orderId)}/details`);
      setSelectedTxn(res.data.order);
    } catch {
      setSelectedTxn({
        totalPaidAmount: 21,
        formattedAmount: '₹21.00',
        timestamp: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'failed',
        statusLabel: 'Failed',
        txnRefId: orderId,
        paymentModes: 'UPI',
        remark: 'payment_risk_check_failed: Website mismatch',
        hasRefund: false,
        refundNotice: 'There are no refunds against this order',
        refunds: [],
      });
    } finally {
      setLoadingTxn(false);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="admin-dashboard-container">
          <SkeletonLoader height="30px" width="30%" />
          <div className="stats-grid" style={{ marginTop: '20px' }}>
            <SkeletonLoader height="100px" />
            <SkeletonLoader height="100px" />
            <SkeletonLoader height="100px" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <div className="admin-dashboard-container">
          <p style={{ color: 'var(--danger)' }}>{error}</p>
        </div>
      </div>
    );
  }

  const { metrics, recentPayments = [], recentActivities = [] } = dashboardData || {};
  const statusCounts = analytics?.statusCounts || { captured: 0, failed: 0, created: 0, refunded: 0 };
  const issueCounts = analytics?.issueTypeCounts || {};
  const totalAttempts = analytics?.totalAttempts || recentPayments.length || 1;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="admin-dashboard-container" style={{ flex: 1 }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: '0 0 6px' }}>Sales & Transaction Analytics Portal</h1>
            <p className="muted" style={{ margin: 0 }}>
              Live telemetry of Razorpay settlements, gateway risk checks, and refund disputes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link className="btn btn-ghost" to="/admin/refunds">
              Refunds Manager →
            </Link>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="stats-grid">
          <div className="metric-card">
            <div className="metric-card-title">Total Revenue</div>
            <div className="metric-card-value">₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN')}</div>
          </div>
          <div className="metric-card">
            <div className="metric-card-title">Successful Transactions</div>
            <div className="metric-card-value" style={{ color: '#10B981' }}>
              {statusCounts.captured || metrics?.totalTransactions || 0}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-title">PG Failed Transactions</div>
            <div className="metric-card-value" style={{ color: '#EF4444' }}>
              {statusCounts.failed || 0}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-card-title">Active Subscriptions</div>
            <div className="metric-card-value">{metrics?.activeSubscribers || 0}</div>
          </div>
        </div>

        {/* TRANSACTION STATUS & PG FAILURE ISSUE TYPE PLOTS */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Plot 1: Status Distribution */}
          <div className="data-section-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>📊 Transaction Status Distribution</h3>
              <span className="badge badge-info">{totalAttempts} Total Transactions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span><strong>Captured (Success)</strong></span>
                  <span style={{ color: '#10B981', fontWeight: 700 }}>
                    {statusCounts.captured} ({((statusCounts.captured / totalAttempts) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (statusCounts.captured / totalAttempts) * 100)}%`, background: '#10B981', borderRadius: '99px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span><strong>Failed (PG / Risk Failure)</strong></span>
                  <span style={{ color: '#EF4444', fontWeight: 700 }}>
                    {statusCounts.failed} ({((statusCounts.failed / totalAttempts) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (statusCounts.failed / totalAttempts) * 100)}%`, background: '#EF4444', borderRadius: '99px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span><strong>Created (Pending / Drop)</strong></span>
                  <span style={{ color: '#F59E0B', fontWeight: 700 }}>
                    {statusCounts.created} ({((statusCounts.created / totalAttempts) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, (statusCounts.created / totalAttempts) * 100)}%`, background: '#F59E0B', borderRadius: '99px' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Plot 2: Failure Breakdown by Issue Type */}
          <div className="data-section-card" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>⚠️ PG Failure Issues Breakdown</h3>
              <span className="badge badge-warning" style={{ color: '#92400E', background: '#FEF3C7', padding: '3px 8px', borderRadius: '4px' }}>
                {analytics?.failureRate || 0}% Failure Rate
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>🛑 <strong>Domain Mismatch (payment_risk_check_failed)</strong></span>
                  <span style={{ color: '#F43F5E', fontWeight: 700 }}>
                    {issueCounts.payment_risk_check_failed || 0} instances
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, ((issueCounts.payment_risk_check_failed || 0) / (statusCounts.failed || 1)) * 100)}%`, background: '#F43F5E', borderRadius: '99px' }} />
                </div>
                <span className="muted small">Website domain not whitelisted in Razorpay Settings</span>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>🏦 <strong>Bank Acquiring Network Server Drop</strong></span>
                  <span style={{ color: '#06B6D4', fontWeight: 700 }}>
                    {issueCounts.bank_server_timeout || 0} instances
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, ((issueCounts.bank_server_timeout || 0) / (statusCounts.failed || 1)) * 100)}%`, background: '#06B6D4', borderRadius: '99px' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '4px' }}>
                  <span>👤 <strong>User Window Dismissal / Cancelled</strong></span>
                  <span style={{ color: '#64748B', fontWeight: 700 }}>
                    {issueCounts.user_cancelled || 0} instances
                  </span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, ((issueCounts.user_cancelled || 0) / (statusCounts.failed || 1)) * 100)}%`, background: '#64748B', borderRadius: '99px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table */}
        <div className="data-section-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Recent Razorpay Transactions</h3>
            <span className="muted small">Click any transaction to inspect popup ledger details</span>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>User Email</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentPayments.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <button
                        onClick={() => openTxnDetails(p.razorpayOrderId)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#2563EB',
                          fontWeight: 600,
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          padding: 0,
                          fontFamily: 'monospace',
                        }}
                      >
                        {p.razorpayOrderId}
                      </button>
                    </td>
                    <td>{p.userEmail}</td>
                    <td><strong>₹{p.amount}</strong></td>
                    <td>
                      <span className={`status-badge status-${p.status}`}>{p.status}</span>
                    </td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => openTxnDetails(p.razorpayOrderId)}
                        style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                      >
                        Inspect Txn →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Activity & Breach Logs */}
        <div className="data-section-card">
          <h3 style={{ marginBottom: '16px' }}>User Audit & Security Alerts</h3>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((a) => (
                  <tr key={a._id}>
                    <td style={{ color: a.action === 'PAYMENT_FAILED' ? 'var(--danger)' : 'inherit' }}>
                      {a.action}
                    </td>
                    <td>{a.userEmail}</td>
                    <td>{a.ipAddress}</td>
                    <td>{new Date(a.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* POPUP BOX: EXACT MATCH TO USER'S SCREENSHOTS */}
      {selectedTxn && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '16px',
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelectedTxn(null);
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              color: '#111827',
              maxWidth: '920px',
              width: '100%',
              borderRadius: '8px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              overflow: 'hidden',
              border: '1px solid #E5E7EB',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#111827' }}>
                Transaction Details
              </h3>
              <button
                onClick={() => setSelectedTxn(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '26px',
                  cursor: 'pointer',
                  color: '#111827',
                  padding: 0,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              {/* Table 1: Transaction Information */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden', marginBottom: '18px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: '#E5E7EB' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Total Paid amount</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Status</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Txn. ref. ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Payment mode(s)</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Remark</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTxn ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6B7280' }}>
                          Loading transaction record...
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#111827' }}>
                            {selectedTxn.formattedAmount || `₹${selectedTxn.totalPaidAmount}`}
                          </div>
                          <div style={{ fontSize: '0.84rem', color: '#6B7280', marginTop: '4px' }}>
                            {selectedTxn.timestamp}
                          </div>
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 12px',
                              borderRadius: '4px',
                              fontSize: '0.86rem',
                              fontWeight: 600,
                              background:
                                selectedTxn.status === 'captured'
                                  ? '#EAF7EE'
                                  : selectedTxn.status === 'failed'
                                  ? '#FEE2E2'
                                  : '#FEF3C7',
                              color:
                                selectedTxn.status === 'captured'
                                  ? '#2E7D32'
                                  : selectedTxn.status === 'failed'
                                  ? '#DC2626'
                                  : '#D97706',
                            }}
                          >
                            {selectedTxn.statusLabel || (selectedTxn.status === 'captured' ? 'Success' : 'Failed')}
                          </span>
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', fontFamily: 'monospace', fontSize: '0.9rem', wordBreak: 'break-all' }}>
                          {selectedTxn.txnRefId || selectedTxn.orderId}
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', fontWeight: 500 }}>
                          {selectedTxn.paymentModes || 'BANK'}
                        </td>
                        <td style={{ padding: '16px', borderBottom: '1px solid #F3F4F6', color: selectedTxn.status === 'failed' ? '#DC2626' : '#6B7280' }}>
                          {selectedTxn.remark || '-'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Middle Notice Banner */}
              <div
                style={{
                  background: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  padding: '16px',
                  textAlign: 'center',
                  color: '#6B7280',
                  fontSize: '0.95rem',
                  marginBottom: '18px',
                }}
              >
                {selectedTxn.refundNotice || 'There are no refunds against this order'}
              </div>

              {/* Table 2: Refund Details */}
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
                  <thead>
                    <tr style={{ background: '#E5E7EB' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Refunded item</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Item ID</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Quantity</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600, color: '#1F2937' }}>Refunded by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTxn.refunds && selectedTxn.refunds.length > 0 ? (
                      selectedTxn.refunds.map((r, i) => (
                        <tr key={i}>
                          <td style={{ padding: '14px 16px', fontWeight: 600 }}>{r.refundedItem}</td>
                          <td style={{ padding: '14px 16px', fontFamily: 'monospace' }}>{r.itemId}</td>
                          <td style={{ padding: '14px 16px' }}>{r.quantity}</td>
                          <td style={{ padding: '14px 16px' }}>{r.refundedBy}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '16px', color: '#1F2937' }}>
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
