import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { wakeServer, useServerStatus } from '../../utils/ping';
import { loadRazorpay } from '../../utils/razorpay';
import { BRAND } from '../../config/strivers';
import RaiseTicketModal from '../support/RaiseTicketModal';

export default function CheckoutModal({ plan, price, onClose }) {
  const navigate = useNavigate();
  const server = useServerStatus();
  const firstRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failedTxn, setFailedTxn] = useState(null);
  const [successTxn, setSuccessTxn] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy && !showTicketModal) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, showTicketModal, onClose]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function pay(e) {
    e.preventDefault();
    setError('');
    setFailedTxn(null);
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number');

    setBusy(true);
    try {
      await wakeServer();

      // Ensure Razorpay Checkout SDK is ready
      await loadRazorpay();
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK could not be loaded. Please check your internet connection.');
      }

      // Calculate amount in paise (minimum 100 paise)
      const amountInPaise = Math.max(100, Math.round(Number(price || 21) * 100));
      const receiptId = `rcpt_${Date.now()}`.slice(0, 40);

      // STEP 1: BACKEND - Create Order
      let orderData;
      try {
        const res = await api.post(
          '/create-order',
          {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            plan: plan.id,
            planId: plan.id,
            name: form.name.trim(),
            email,
            phone,
          },
          { timeout: 60000 }
        );
        orderData = res.data;
      } catch (orderErr) {
        // Fallback endpoint if needed
        const fallbackRes = await api.post(
          '/orders/create',
          {
            amount: amountInPaise,
            currency: 'INR',
            receipt: receiptId,
            plan: plan.id,
            planId: plan.id,
            name: form.name.trim(),
            email,
            phone,
          },
          { timeout: 60000 }
        );
        orderData = fallbackRes.data;
      }

      if (orderData.alreadyPaid) {
        navigate(orderData.accessUrl || `/login?email=${encodeURIComponent(email)}&paid=1`);
        return;
      }

      const orderId = orderData.order_id || orderData.orderId;
      const keyId =
        orderData.key_id ||
        orderData.keyId ||
        orderData.key ||
        process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!orderId) {
        throw new Error('Server did not return a valid Razorpay Order ID.');
      }

      // STEP 3: BACKEND - Verify Signature callback
      const verifyPaymentOnServer = async (paymentResponse) => {
        try {
          const verifyPayload = {
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            email,
          };

          let verifyRes;
          try {
            verifyRes = await api.post('/verify-payment', verifyPayload);
          } catch {
            verifyRes = await api.post('/orders/verify', verifyPayload);
          }

          const resData = verifyRes.data || {};
          const txnId = paymentResponse.razorpay_payment_id;
          const refId = resData.ref_id || resData.referenceId || resData.receipt || `rcpt_${Date.now()}`;

          setBusy(false);
          setSuccessTxn({
            txnId,
            refId,
            orderId: paymentResponse.razorpay_order_id,
            amount: price,
            accessUrl: resData.accessUrl || '/products/masterclass/access',
          });
        } catch (verifyErr) {
          setBusy(false);
          const errorMsg =
            verifyErr.response?.data?.error ||
            verifyErr.response?.data?.message ||
            `Payment verification failed. Txn ID: ${paymentResponse.razorpay_payment_id}. Please contact support.`;
          setError(errorMsg);
        }
      };

      // STEP 2: FRONTEND - Open Razorpay Standard Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount || amountInPaise,
        currency: orderData.currency || 'INR',
        name: BRAND.name || 'Strivers',
        description: orderData.productTitle || plan.title || 'Course Access',
        order_id: orderId,
        prefill: {
          name: form.name.trim(),
          email,
          contact: `+91${phone}`,
        },
        theme: {
          color: '#2F4BFF',
        },
        handler: async (response) => {
          // On success: receive razorpay_payment_id, razorpay_order_id, razorpay_signature
          await verifyPaymentOnServer(response);
        },
        modal: {
          // Handle modal dismiss (user cancelled midway)
          ondismiss: async () => {
            setBusy(false);
            const cancelPaymentId = `pay_cancel_${Date.now()}`;
            try {
              await api.post('/payments/log-failure', {
                orderId,
                paymentId: cancelPaymentId,
                errorCode: 'PAYMENT_CANCELLED',
                errorDescription: 'PG Failure: Payment Canceled midway by user',
                errorSource: 'user_action',
                errorStep: 'payment_checkout',
                errorReason: 'payment_canceled_midway',
                paymentMethod: 'UPI',
                userEmail: email,
                userPhone: phone,
                amount: price,
                planId: plan.id,
              });
            } catch (logErr) {
              console.warn('[Log Cancel Notice]:', logErr.message);
            }

            setFailedTxn({
              orderId,
              paymentId: cancelPaymentId,
              status: 'canceled',
              reason: 'Payment Canceled',
              description: 'PG Failure: Payment Canceled midway by user closing the gateway modal.',
              email,
              phone,
              amount: price,
            });

            setError('PG Failure: Payment Canceled midway. No amount was charged.');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // Handle payment.failed event
      rzp.on('payment.failed', async (response) => {
        setBusy(false);
        const errObj = response.error || {};
        const reason = errObj.description || errObj.reason || 'Payment failed.';

        const paymentId = errObj.metadata?.payment_id || null;
        const failedOrderId = errObj.metadata?.order_id || orderId;

        // Automatically log failure to backend telemetry
        try {
          await api.post('/payments/log-failure', {
            orderId: failedOrderId,
            paymentId,
            errorCode: errObj.code || 'BAD_REQUEST_ERROR',
            errorDescription: errObj.description || reason,
            errorSource: errObj.source || 'internal',
            errorStep: errObj.step || 'payment_initiation',
            errorReason: errObj.reason || 'payment_risk_check_failed',
            paymentMethod: 'UPI',
            userEmail: email,
            userPhone: phone,
            amount: price,
            planId: plan.id,
          });
        } catch (logErr) {
          console.warn('[Log Failure Notice]:', logErr.message);
        }

        setFailedTxn({
          orderId: failedOrderId,
          paymentId,
          status: 'failed',
          reason: 'PG Failure',
          description: `PG Failure: ${errObj.description || reason}`,
          email,
          phone,
          amount: price,
        });

        setError(`PG Failure: ${reason}`);
      });

      rzp.open();
    } catch (err) {
      setBusy(false);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          (err.code === 'ECONNABORTED'
            ? 'Server is waking up. Please try again in a few seconds.'
            : err.message || 'Could not start payment')
      );
    }
  }

  return (
    <>
      <div
        className="modal-back"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget && !busy && !showTicketModal) onClose();
        }}
      >
        <form className="modal" role="dialog" aria-modal="true" aria-labelledby="co-title" onSubmit={pay}>
          <button type="button" className="modal-x" onClick={onClose} disabled={busy} aria-label="Close">
            ×
          </button>
          <h2 id="co-title">{plan.title}</h2>
          <p className="muted">You pay ₹{price}. We create your access right after payment.</p>

          <label>
            Full name
            <input ref={firstRef} required value={form.name} onChange={set('name')} autoComplete="name" />
          </label>
          <label>
            Email
            <input type="email" required value={form.email} onChange={set('email')} autoComplete="email" />
          </label>
          <label>
            Mobile (WhatsApp)
            <input
              inputMode="numeric"
              required
              value={form.phone}
              onChange={set('phone')}
              autoComplete="tel-national"
              placeholder="10-digit number"
            />
          </label>

          {/* Detailed Payment Success Card with Txn ID & Ref. ID */}
          {successTxn && (
            <div
              style={{
                background: '#ECFDF5',
                border: '1px solid #A7F3D0',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '14px',
                fontSize: '0.88rem',
                color: '#065F46',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '8px', fontSize: '1rem', color: '#047857' }}>
                <span style={{ fontSize: '1.25rem' }}>✅</span>
                <span>Payment Successful · Access Unlocked!</span>
              </div>
              <p style={{ margin: '0 0 10px', fontSize: '0.85rem', color: '#065F46' }}>
                Your payment has been captured and verified. Permanent access has been granted to your account.
              </p>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  color: '#1F2937',
                  marginBottom: '12px',
                  border: '1px solid #E5E7EB',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                <div>• <strong>Txn ID:</strong> <code style={{ color: '#059669', fontWeight: 700 }}>{successTxn.txnId}</code></div>
                <div>• <strong>Ref. ID:</strong> <code style={{ color: '#2563EB', fontWeight: 700 }}>{successTxn.refId}</code></div>
                <div>• <strong>Order ID:</strong> <code style={{ color: '#4B5563' }}>{successTxn.orderId}</code></div>
                <div>• <strong>Status:</strong> <span style={{ color: '#047857', fontWeight: 700 }}>Captured (Success)</span></div>
                <div>• <strong>Amount:</strong> <strong>₹{successTxn.amount}</strong></div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block"
                onClick={() => navigate(successTxn.accessUrl)}
                style={{ padding: '10px', fontWeight: 700, background: '#059669', borderColor: '#059669' }}
              >
                Proceed to Classroom & Mentorship Room →
              </button>
            </div>
          )}

          {/* Detailed PG Failure Alert Card */}
          {failedTxn && !successTxn && (
            <div
              style={{
                background: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '14px 16px',
                marginTop: '14px',
                fontSize: '0.88rem',
                color: '#991B1B',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <span>{failedTxn.status === 'canceled' ? 'PG Failure: Payment Canceled' : 'PG Failure: Transaction Unsuccessful'}</span>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: '0.84rem', color: '#B91C1C' }}>
                {failedTxn.description}
              </p>
              <div
                style={{
                  background: '#FFFFFF',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  color: '#4B5563',
                  marginBottom: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div>• Order ID: <code style={{ color: '#2563EB' }}>{failedTxn.orderId}</code></div>
                {failedTxn.paymentId && (
                  <div>• Txn ID / Payment ID: <code style={{ color: '#2563EB' }}>{failedTxn.paymentId}</code></div>
                )}
                <div>• Status: <strong style={{ color: failedTxn.status === 'canceled' ? '#D97706' : '#DC2626' }}>{failedTxn.status === 'canceled' ? 'Payment Canceled (Cancelled Midway)' : 'PG Failure'}</strong></div>
                <div>• Money Protection: <strong>Any deducted amount will be refunded to source within 5-7 working days.</strong></div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowTicketModal(true)}
                style={{
                  width: '100%',
                  background: '#FFFFFF',
                  borderColor: '#DC2626',
                  color: '#DC2626',
                  fontWeight: 600,
                  padding: '8px',
                }}
              >
                🎫 Amount Deducted? Raise Refund Ticket →
              </button>
            </div>
          )}

          {error && !failedTxn && (
            <p className="err" role="alert">
              {error}
            </p>
          )}

          {server === 'waking' && (
            <p className="muted small">Connecting to a secure server. Payment opens as soon as it is ready.</p>
          )}
          {server === 'failed' && <p className="muted small">Server is slow to respond. We will retry when you pay.</p>}

          <button className="btn btn-primary btn-block" disabled={busy} style={{ marginTop: '12px' }}>
            {busy ? 'Processing payment...' : `Pay ₹${price}`}
          </button>
          <p className="muted small" style={{ textAlign: 'center' }}>
            Secured by Razorpay. UPI, Cards and Netbanking supported.
          </p>
        </form>
      </div>

      {showTicketModal && (
        <RaiseTicketModal
          initialData={failedTxn || { email: form.email, phone: form.phone, name: form.name, amount: price }}
          onClose={() => setShowTicketModal(false)}
        />
      )}
    </>
  );
}
