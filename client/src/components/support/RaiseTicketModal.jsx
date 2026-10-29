import React, { useState } from 'react';
import api from '../../utils/api';

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
    if (!form.razorpayOrderId) return setError('Razorpay Order ID is required.');

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
      className="modal-back"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          maxWidth: '560px',
          width: '100%',
          borderRadius: '16px',
          padding: '28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          position: 'relative',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: '#64748b',
          }}
          aria-label="Close"
        >
          ×
        </button>

        {result ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  background: '#ECFDF5',
                  color: '#10B981',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  marginBottom: '12px',
                }}
              >
                ✓
              </div>
              <h3 style={{ margin: '0 0 6px', fontSize: '1.4rem', color: '#0F172A' }}>
                Dispute Ticket Registered
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
                Ticket ID: <strong style={{ color: '#2563eb' }}>{result.ticket.ticketId}</strong>
              </p>
            </div>

            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '10px',
                padding: '16px 18px',
                fontSize: '0.9rem',
                color: '#334155',
                lineHeight: '1.5',
                marginBottom: '20px',
              }}
            >
              <div style={{ marginBottom: '8px' }}>
                <strong>What happens next?</strong>
              </div>
              <div>• If ₹{form.amount} was debited, Razorpay automatically pushes a reversal to your source account.</div>
              <div>• Bank Standard SLA: <strong>5-7 business days</strong>.</div>
              <div>• SLA Deadline: <strong>{new Date(result.ticket.slaDeadline).toLocaleDateString('en-IN')}</strong>.</div>
              <div style={{ marginTop: '8px', color: '#64748b' }}>
                If you do not receive the refund by this date, our finance desk will directly verify with the acquiring bank.
              </div>
            </div>

            <button className="btn btn-primary btn-block" onClick={onClose} style={{ width: '100%', padding: '12px' }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#0F172A' }}>
                Raise PG Failure / Refund Ticket
              </h3>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.88rem' }}>
                Money deducted but payment failed? Register a ticket for automated bank tracking.
              </p>
            </div>

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  fontSize: '0.88rem',
                }}
              >
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.userEmail}
                  onChange={set('userEmail')}
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Mobile / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={form.userPhone}
                  onChange={set('userPhone')}
                  placeholder="10-digit number"
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Razorpay Order ID *
                </label>
                <input
                  type="text"
                  required
                  value={form.razorpayOrderId}
                  onChange={set('razorpayOrderId')}
                  placeholder="order_xxxxxxxxxxxxxx"
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Razorpay Payment ID (Optional)
                </label>
                <input
                  type="text"
                  value={form.razorpayPaymentId}
                  onChange={set('razorpayPaymentId')}
                  placeholder="pay_xxxxxxxxxxxxxx"
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Bank UTR / RRN (from SMS/UPI app)
                </label>
                <input
                  type="text"
                  value={form.bankRrn}
                  onChange={set('bankRrn')}
                  placeholder="e.g. 2026080321..."
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                  Debited Amount (₹)
                </label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={set('amount')}
                  className="input-control"
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '4px' }}>
                Issue Description
              </label>
              <textarea
                rows="2"
                value={form.description}
                onChange={set('description')}
                placeholder="Mention payment method (GPay/PhonePe/Card) and any details..."
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
            </div>

            <div
              style={{
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '16px',
              }}
            >
              ⏱️ <strong>Refund Timeline Guarantee:</strong> Under RBI and Razorpay acquiring guidelines, money deducted on failed transactions reverses to source within 5-7 working days automatically.
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={busy}
                style={{ padding: '10px 18px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={busy}
                style={{ padding: '10px 22px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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

