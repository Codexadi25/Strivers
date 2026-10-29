import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import Navbar from '../components/common/Navbar';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import '../assets/styles/adminDashboard.css';

export const AdminDashboardPage = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get('/admin/metrics');
        if (res.data.success) {
          setDashboardData(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Access denied or server error.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

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

  const { metrics, recentPayments, recentActivities } = dashboardData;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <div className="admin-dashboard-container" style={{ flex: 1 }}>
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>Sales & User Activity Portal</h1>
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
          <div className="metric-card-value">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title">Completed Orders</div>
          <div className="metric-card-value">{metrics.totalTransactions}</div>
        </div>
        <div className="metric-card">
          <div className="metric-card-title">Active Gated Users</div>
          <div className="metric-card-value">{metrics.activeSubscribers}</div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="data-section-card">
        <h3 style={{ marginBottom: '16px' }}>Recent Razorpay Transactions</h3>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User Email</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p._id}>
                  <td>{p.razorpayOrderId}</td>
                  <td>{p.userEmail}</td>
                  <td>₹{p.amount}</td>
                  <td>
                    <span className={`status-badge status-${p.status}`}>{p.status}</span>
                  </td>
                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
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
                  <td style={{ color: a.action === 'SECURITY_BREACH_ATTEMPT' ? 'var(--danger)' : 'inherit' }}>
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
  </div>
);
};
