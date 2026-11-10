import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../services/api';
import OrdersAnalyticsCards from '../components/orders/OrdersAnalyticsCards';
import OrdersTable from '../components/orders/OrdersTable';
import './OrdersPage.css';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [distribution, setDistribution] = useState(null);
  const [failureBreakdown, setFailureBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiCall(`/orders?q=${encodeURIComponent(search)}`);
      if (res.orders) {
        setOrders(res.orders);
        setDistribution(res.distribution);
        setFailureBreakdown(res.failureBreakdown);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  return (
    <div className="orders-page-root">
      <div className="orders-header">
        <div>
          <h2 className="orders-title">Orders &amp; Payment Transactions</h2>
          <p className="orders-desc">
            Live ledger of Razorpay transactions, PG risk failures, status analytics, and receipts.
          </p>
        </div>

        <div className="orders-controls-group">
          <TextField
            size="small"
            placeholder="Search email, order ID, payment ID..."
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

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 185 }}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            <MenuItem value="CAPTURED">Captured (Success)</MenuItem>
            <MenuItem value="PAYMENT CANCELED">Payment Canceled</MenuItem>
            <MenuItem value="FAILED">Failed</MenuItem>
            <MenuItem value="REFUNDED">Refunded to Source</MenuItem>
          </TextField>
        </div>
      </div>

      <OrdersAnalyticsCards distribution={distribution} failureBreakdown={failureBreakdown} />

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 0' }}>
          <CircularProgress size={24} />
          <span>Loading live transactions ledger...</span>
        </div>
      ) : (
        <OrdersTable orders={filteredOrders} />
      )}
    </div>
  );
}
