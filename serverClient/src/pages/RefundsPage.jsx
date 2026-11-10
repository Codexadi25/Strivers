import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import RestoreIcon from '@mui/icons-material/Restore';
import { apiCall } from '../services/api';
import RefundsTable from '../components/refunds/RefundsTable';
import './RefundsPage.css';

export default function RefundsPage() {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  const [orderId, setOrderId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [amount, setAmount] = useState(74);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/refunds');
      if (res.refunds) {
        setRefunds(res.refunds);
      }
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const showNotice = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 4000);
  };

  const handleIssueRefund = async (e) => {
    e.preventDefault();
    try {
      await apiCall('/refunds', {
        method: 'POST',
        body: JSON.stringify({
          orderId: orderId.trim(),
          customerEmail: customerEmail.trim(),
          amount: Number(amount),
        }),
      });
      showNotice(`✓ Refund initiated for ${customerEmail} (₹${amount})`);
      setModalOpen(false);
      setOrderId('');
      setCustomerEmail('');
      fetchRefunds();
    } catch (err) {
      showNotice(`Error initiating refund: ${err.message}`, 'error');
    }
  };

  return (
    <div className="refunds-page-root">
      <div className="refunds-header">
        <div>
          <h2 className="refunds-title">Refunds &amp; Payment Reconciliations Console</h2>
          <p className="refunds-desc">
            Monitor Razorpay automatic bank reversals and issue manual dispute refunds with bank ARN logging.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<RestoreIcon />}
          className="refunds-btn-add"
          onClick={() => setModalOpen(true)}
        >
          Issue Manual Refund
        </Button>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <CircularProgress size={24} />
          <span>Loading refund ledger...</span>
        </div>
      ) : (
        <RefundsTable refunds={refunds} />
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Issue Manual Refund</DialogTitle>
        <form id="refund-form" onSubmit={handleIssueRefund}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Target Razorpay Order ID"
              size="small"
              required
              placeholder="order_TyAg..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <TextField
              label="Candidate Email"
              type="email"
              size="small"
              required
              placeholder="student@example.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
            <TextField
              label="Amount to Refund (₹ INR)"
              type="number"
              size="small"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" color="error">
              Confirm &amp; Issue Refund
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
