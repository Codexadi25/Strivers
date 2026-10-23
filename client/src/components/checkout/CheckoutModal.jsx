import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { wakeServer, useServerStatus } from '../../utils/ping';
import { loadRazorpay } from '../../utils/razorpay';
import { BRAND } from '../../config/strivers';

export default function CheckoutModal({ plan, price, onClose }) {
  const navigate = useNavigate();
  const server = useServerStatus();
  const firstRef = useRef(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    firstRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function pay(e) {
    e.preventDefault();
    setError('');
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(phone)) return setError('Enter a valid 10-digit mobile number');

    setBusy(true);
    try {
      await wakeServer();

      // STEP 1: Backend creates Razorpay order
      let orderData;
      try {
        const res = await api.post(
          '/orders/create',
          { plan: plan.id, name: form.name.trim(), email, phone },
          { timeout: 60000 }
        );
        orderData = res.data;
      } catch (orderErr) {
        // Fallback to /payments/create-order
        const fallbackRes = await api.post(
          '/payments/create-order',
          { amount: price, planId: plan.id, name: form.name.trim(), email, phone },
          { timeout: 60000 }
        );
        orderData = fallbackRes.data;
      }

      if (orderData.alreadyPaid) {
        navigate(orderData.accessUrl || `/login?email=${encodeURIComponent(email)}&paid=1`);
        return;
      }

      const verifyPaymentOnServer = async (r) => {
        try {
          const verifyRes = await api.post('/orders/verify', {
            razorpay_order_id: r.razorpay_order_id,
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_signature: r.razorpay_signature,
          });
          navigate(verifyRes.data.accessUrl || '/products/masterclass/access');
        } catch {
          // Fallback to /payments/verify-payment
          const fbRes = await api.post('/payments/verify-payment', {
            razorpay_order_id: r.razorpay_order_id,
            razorpay_payment_id: r.razorpay_payment_id,
            razorpay_signature: r.razorpay_signature,
          });
          navigate(fbRes.data.accessUrl || '/products/masterclass/access');
        }
      };

      // Local / simulated test checkout
      const isMock =
        orderData.demoMode ||
        orderData.isSimulated ||
        !orderData.keyId ||
        orderData.keyId.includes('mock') ||
        orderData.keyId.includes('XXXX') ||
        orderData.orderId?.startsWith('order_dev_') ||
        orderData.orderId?.startsWith('demo_order_');

      if (isMock || !window.Razorpay) {
        await verifyPaymentOnServer({
          razorpay_order_id: orderData.orderId,
          razorpay_payment_id: `pay_dev_${Date.now()}`,
          razorpay_signature: 'simulated_sig',
        });
        return;
      }

      // STEP 2: Official Razorpay checkout
      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: orderData.keyId || orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        order_id: orderData.orderId,
        name: BRAND.name,
        description: orderData.productTitle || plan.title,
        prefill: { name: form.name.trim(), email, contact: `+91${phone}` },
        theme: { color: '#2F4BFF' },
        handler: async (r) => {
          try {
            await verifyPaymentOnServer(r);
          } catch {
            setBusy(false);
            setError(
              `Payment received but verification failed. Keep payment ID ${r.razorpay_payment_id} and contact support.`
            );
          }
        },
        modal: { ondismiss: () => setBusy(false) },
      });

      rzp.on('payment.failed', (r) => {
        setBusy(false);
        setError(r.error?.description || 'Payment failed. Please try again.');
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
    <div
      className="modal-back"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
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

        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
        {server === 'waking' && (
          <p className="muted small">Connecting to a secure server. Payment opens as soon as it is ready.</p>
        )}
        {server === 'failed' && <p className="muted small">Server is slow to respond. We will retry when you pay.</p>}

        <button className="btn btn-primary btn-block" disabled={busy}>
          {busy ? 'Processing payment...' : `Pay ₹${price}`}
        </button>
        <p className="muted small" style={{ textAlign: 'center' }}>
          Secured by Razorpay. UPI, Cards and Netbanking supported.
        </p>
      </form>
    </div>
  );
}
