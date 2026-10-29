import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';

const currency = (paise) => `₹${((paise || 0) / 100).toFixed(2)}`;

export default function RefundsAdmin() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [type, setType] = useState('razorpay');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [bankDetails, setBankDetails] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectedOrder = useMemo(
    () => orders.find((order) => order._id === selectedOrderId),
    [orders, selectedOrderId]
  );

  const refundableAmount = selectedOrder ? selectedOrder.amount - (selectedOrder.refundedAmount || 0) : 0;

  async function loadData() {
    setError('');
    try {
      const [meRes, ordersRes, refundsRes] = await Promise.all([
        api.get('/auth/me').catch(() => ({ data: { user: null } })),
        api.get('/refunds/orders').catch(() => ({ data: { orders: [] } })),
        api.get('/refunds').catch(() => ({ data: { refunds: [] } })),
      ]);
      setUser(meRes.data?.user || null);
      setOrders(ordersRes.data.orders || []);
      setRefunds(refundsRes.data.refunds || []);
      setSelectedOrderId((current) => current || ordersRes.data.orders?.[0]?._id || '');
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load refunds');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitRefund(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!selectedOrder) {
      setError('Select an order to refund');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        orderId: selectedOrder._id,
        type,
        reason,
        ...(amount ? { amount: Math.round(Number(amount) * 100) } : {}),
        ...(type === 'bank_manual' ? { bankDetails } : {}),
      };

      await api.post('/refunds', payload);
      setMessage(type === 'razorpay' ? 'Refund sent to Razorpay.' : 'Manual bank refund request recorded.');
      setReason('');
      setAmount('');
      setBankDetails({ accountHolderName: '', accountNumber: '', ifsc: '', bankName: '' });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.error || 'Could not process refund');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} />

      <main style={{ flex: 1, maxWidth: 1040, margin: '32px auto', padding: '0 20px', width: '100%' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem' }}>Refunds Administration</h1>
            <p className="muted" style={{ margin: '6px 0 0' }}>
              Process Razorpay automated reversals or record manual bank transfers.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link className="btn btn-ghost" to="/admin">
              Sales Dashboard
            </Link>
            <Link className="btn btn-ghost" to="/products">
              Products
            </Link>
          </div>
        </header>

        {loading ? (
          <p className="muted">Loading refund history...</p>
        ) : (
          <>
            {error && <p className="err" style={{ background: '#FEE2E2', padding: '10px', borderRadius: 8 }}>{error}</p>}
            {message && <p style={{ background: '#ECFDF5', color: '#047857', padding: '10px', borderRadius: 8 }}>{message}</p>}

            <form
              onSubmit={submitRefund}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: 12,
                padding: 24,
                marginBottom: 28,
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                <label style={{ display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.9rem' }}>
                  Select Order
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)', background: '#fff' }}
                  >
                    {orders.length === 0 ? (
                      <option value="">No completed orders available</option>
                    ) : (
                      orders.map((o) => (
                        <option key={o._id} value={o._id}>
                          {o.product?.title || o.planId} - {o.user?.email || o.userEmail} - {currency(o.amount * 100 || o.amount)}
                        </option>
                      ))
                    )}
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.9rem' }}>
                  Refund Mechanism
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)', background: '#fff' }}
                  >
                    <option value="razorpay">Razorpay Auto Reversal</option>
                    <option value="bank_manual">Manual Bank Transfer</option>
                  </select>
                </label>

                <label style={{ display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.9rem' }}>
                  Refund Amount (₹)
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={selectedOrder ? `Max ${currency(refundableAmount)}` : 'Amount'}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                </label>
              </div>

              <label style={{ display: 'grid', gap: 4, fontWeight: 600, fontSize: '0.9rem', marginTop: 14 }}>
                Refund Reason
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  rows={2}
                  placeholder="e.g. Accidental double payment or session rescheduled"
                  style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)', resize: 'vertical' }}
                />
              </label>

              {type === 'bank_manual' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
                  <input
                    placeholder="Account holder name"
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                  <input
                    placeholder="Account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                  <input
                    placeholder="IFSC Code"
                    value={bankDetails.ifsc}
                    onChange={(e) => setBankDetails({ ...bankDetails, ifsc: e.target.value.toUpperCase() })}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                  <input
                    placeholder="Bank name"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    style={{ padding: 10, borderRadius: 8, border: '1px solid var(--line)' }}
                  />
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || !orders.length}
                style={{ marginTop: 16 }}
              >
                {submitting ? 'Issuing Refund...' : 'Process Refund'}
              </button>
            </form>

            <section>
              <h3>Recent Refunds</h3>
              {refunds.length === 0 ? (
                <p className="muted">No refund records found.</p>
              ) : (
                refunds.map((r) => (
                  <div
                    key={r._id}
                    style={{
                      border: '1px solid var(--line)',
                      backgroundColor: 'var(--card)',
                      borderRadius: 8,
                      padding: 14,
                      marginBottom: 10,
                    }}
                  >
                    <strong>{r.product?.title || r.orderId}</strong>
                    <div className="muted" style={{ marginTop: 4 }}>
                      {r.user?.email || r.userEmail} · {currency(r.amount)} · {r.type} ·{' '}
                      <span style={{ color: 'var(--ok)', fontWeight: 600 }}>{r.status}</span>
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
