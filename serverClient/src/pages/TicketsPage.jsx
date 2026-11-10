import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import { apiCall } from '../services/api';
import TicketsTable from '../components/tickets/TicketsTable';
import './TicketsPage.css';

export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/tickets');
      if (res.tickets) {
        setTickets(res.tickets);
      }
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleResolve = async (ticketId) => {
    try {
      await apiCall(`/tickets/${encodeURIComponent(ticketId)}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'resolved' }),
      });
      setStatusMsg({ text: `✓ Ticket ${ticketId} resolved cleanly.`, type: 'success' });
      fetchTickets();
      setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 4000);
    } catch (err) {
      setStatusMsg({ text: `Error resolving ticket: ${err.message}`, type: 'error' });
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      (t.ticketId || '').toLowerCase().includes(term) ||
      (t.studentContact || '').toLowerCase().includes(term) ||
      (t.orderId || '').toLowerCase().includes(term) ||
      (t.bankRrn || '').toLowerCase().includes(term);

    const matchCategory = categoryFilter === 'ALL' || t.issueCategory === categoryFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;

    return matchSearch && matchCategory && matchStatus;
  });

  return (
    <div className="tickets-page-root">
      <div className="tickets-header">
        <h2 className="tickets-title">PG Failure &amp; Refund Support Tickets</h2>
        <p className="tickets-desc">
          Manage student disputes where money was deducted on payment failure and source refunds are being reconciled.
        </p>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      <div className="tickets-filters-section">
        <TextField
          size="small"
          fullWidth
          placeholder="Search by Ticket ID, email, UTR, order ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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

        <div className="tickets-dropdowns-row">
          <TextField
            select
            size="small"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            sx={{ minWidth: 260 }}
          >
            <MenuItem value="ALL">All Issue Categories</MenuItem>
            <MenuItem value="amount_debited_payment_failed">Amount Debited · Payment Failed</MenuItem>
            <MenuItem value="website_risk_check_blocked">Website Risk Check Blocked</MenuItem>
            <MenuItem value="double_debit">Double Debit</MenuItem>
            <MenuItem value="access_not_granted">Access Not Granted</MenuItem>
          </TextField>

          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: 210 }}
          >
            <MenuItem value="ALL">All Ticket Statuses</MenuItem>
            <MenuItem value="under_investigation">Under Investigation</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="open">Open</MenuItem>
          </TextField>
        </div>
      </div>

      <Alert severity="info" sx={{ mb: 2.5, borderLeft: '4px solid #2563EB' }}>
        <strong>Razorpay Auto-Refund Policy (5-7 Business Days):</strong> When a payment fails with{' '}
        <code>payment_risk_check_failed</code> or bank timeout, Razorpay pushes a reversal automatically to the customer&apos;s UPI or acquiring bank.
      </Alert>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <CircularProgress size={24} />
          <span>Loading dispute tickets...</span>
        </div>
      ) : (
        <TicketsTable tickets={filteredTickets} onResolve={handleResolve} />
      )}
    </div>
  );
}
