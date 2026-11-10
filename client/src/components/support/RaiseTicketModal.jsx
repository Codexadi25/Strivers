import React, { useState } from 'react';
import api from '../../utils/api';
import './RaiseTicketModal.css';

export default function RaiseTicketModal({ initialData = {}, onClose, onSuccess }) {
  const [form, setForm] = useState({
    userEmail: initialData.email || '',
    userPhone: initialData.phone || '',
    customerName: initialData.name || '',
    razorpayOrderId: initialData.orderId || '',
    razorpayPaymentId: initialData.paymentId || '',
    bankRrn: '',
    amount: initialData.amount || 21,
    issueType: 'amount_debited_payment_failed',
    description: initialData.description || 'Payment failed during risk check, please verify auto-refund status.',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const email = form.userEmail.trim().toLowerCase();
    const phone = form.userPhone.replace(/\D/g, '').slice(-10);

    if (!email) return setError('Email address is required.');
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Please enter a valid 10-digit mobile number.');
    if (!form.razorpayOrderId) return setError('Order ID is required.');

    setBusy(true);
    try {
      const res = await api.post('/tickets/raise', {
        ...form,
        userEmail: email,
        userPhone: phone,
      });

      setResult(res.data);
      if (onSuccess) onSuccess(res.data.ticket);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to submit support ticket.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-back rtm-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className="modal rtm-dialog" role="dialog" aria-modal="true">
        <button
          type="button"
          onClick={onClose}
          className="rtm-close-btn"
          aria-label="Close"
        >
          ×
        </button>

        {result ? (
          <div>
            <div className="rtm-success-header">
              <div className="rtm-success-icon">✓</div>
              <h3 className="rtm-success-title">Dispute Ticket Registered</h3>
              <p className="rtm-success-subtitle">
                Ticket ID: <strong className="rtm-ticket-id">{result.ticket.ticketId}</strong>
              </p>
            </div>

            <div className="rtm-sla-card">
              <div className="rtm-sla-heading">
                <strong>What happens next?</strong>
              </div>
              <div>• If ₹{form.amount} was debited, an automatic reversal is initiated back to your source account.</div>
              <div>• Standard Refund Timeline: <strong>5-7 business days</strong>.</div>
              <div>• Target Resolution Date: <strong>{new Date(result.ticket.slaDeadline).toLocaleDateString('en-IN')}</strong>.</div>
              <div className="rtm-sla-note">
                If you do not receive the refund by this date, our support desk will follow up directly with your payment bank.
              </div>
            </div>

            <button type="button" className="btn btn-primary btn-block rtm-done-btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="rtm-form-header">
              <h3 className="rtm-form-title">Raise Payment & Refund Ticket</h3>
              <p className="rtm-form-desc">
                Amount deducted during an incomplete checkout? Submit a ticket for priority tracking.
              </p>
            </div>

            {error && <div className="rtm-error-box">{error}</div>}

            <div className="rtm-grid-row">
              <div>
                <label className="rtm-label">Your Email *</label>
                <input
                  type="email"
                  required
                  value={form.userEmail}
                  onChange={set('userEmail')}
                  className="input-control rtm-input"
                />
              </div>

              <div>
                <label className="rtm-label">Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={form.userPhone}
                  onChange={set('userPhone')}
                  placeholder="10-digit number"
                  className="input-control rtm-input"
                />
              </div>
            </div>

            <div className="rtm-grid-row">
              <div>
                <label className="rtm-label">Order Reference ID *</label>
                <input
                  type="text"
                  required
                  value={form.razorpayOrderId}
                  onChange={set('razorpayOrderId')}
                  placeholder="order_xxxxxxxxxxxxxx"
                  className="input-control rtm-input rtm-input-mono"
                />
              </div>

              <div>
                <label className="rtm-label">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={form.razorpayPaymentId}
                  onChange={set('razorpayPaymentId')}
                  placeholder="pay_xxxxxxxxxxxxxx"
                  className="input-control rtm-input rtm-input-mono"
                />
              </div>
            </div>

            <div className="rtm-grid-row">
              <div>
                <label className="rtm-label">Bank UTR / RRN (from SMS/UPI app)</label>
                <input
                  type="text"
                  value={form.bankRrn}
                  onChange={set('bankRrn')}
                  placeholder="e.g. 2026080321..."
                  className="input-control rtm-input"
                />
              </div>

              <div>
                <label className="rtm-label">Debited Amount (₹)</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={set('amount')}
                  className="input-control rtm-input"
                />
              </div>
            </div>

            <div className="rtm-field-wrap">
              <label className="rtm-label">Issue Description</label>
              <textarea
                rows="2"
                value={form.description}
                onChange={set('description')}
                placeholder="Mention payment method (GPay/PhonePe/Card) and any details..."
                className="rtm-input"
              />
            </div>

            <div className="rtm-warning-box">
              <strong>Refund Timeline:</strong> Any amount debited during an incomplete checkout is automatically reversed to your source account within 5-7 business days.
            </div>

            <div className="rtm-actions-row">
              <button
                type="button"
                className="btn btn-secondary rtm-cancel-btn"
                onClick={onClose}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary rtm-submit-btn"
                disabled={busy}
              >
                {busy ? 'Registering Ticket...' : 'Submit Dispute Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

