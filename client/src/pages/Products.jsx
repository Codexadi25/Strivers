import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';
import { loadRazorpay } from '../utils/razorpay';
import { BRAND } from '../config/strivers';

export default function Products() {
  const [params] = useSearchParams();
  const autoCheckoutPlan = params.get('checkout');
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);
  const navigate = useNavigate();

  function isProductOwned(product) {
    if (!user) return false;
    const pid = product._id || product.productId;
    return (
      user.enrolledCourses?.some((c) => c.courseId === pid) ||
      (user.hasActiveSubscription && pid === 'masterclass')
    );
  }

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setProducts(res.data.products || []))
      .catch(() => {
        // Fallback default course list
        setProducts([
          {
            _id: 'masterclass',
            title: 'Strivers Placement Masterclass',
            description: 'Live Sunday interactive workshop on resume, portfolio, LinkedIn/Naukri & cold emails.',
            priceInPaise: 2100,
            currency: 'INR',
          },
          {
            _id: 'channel',
            title: 'Strivers Paid Job Channel',
            description: 'Curated vacancy channel with direct HR interview meeting links.',
            priceInPaise: 17400,
            currency: 'INR',
          },
        ]);
      });

    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (autoCheckoutPlan && products.length > 0 && user) {
      const targetProduct = products.find((p) => (p._id || p.productId) === autoCheckoutPlan);
      if (targetProduct && !isProductOwned(targetProduct)) {
        handleBuy(targetProduct);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoCheckoutPlan, products, user]);

  async function handleBuy(product) {
    setError('');
    const pid = product._id || product.productId;

    // 1. If user is not logged in, route to sign-up process first!
    if (!user) {
      navigate(`/register?plan=${encodeURIComponent(pid)}`);
      return;
    }

    // 2. If already owned, do not proceed to payment; route directly to the course!
    if (isProductOwned(product)) {
      navigate(`/products/${pid}/access`);
      return;
    }

    setPayingId(pid);
    try {
      await loadRazorpay();
      if (!window.Razorpay) {
        throw new Error('Razorpay SDK could not be loaded. Check your internet connection.');
      }

      const amountInPaise = product.priceInPaise || Math.round((product.price || 21) * 100);

      let orderData;
      try {
        const res = await api.post('/create-order', {
          amount: amountInPaise,
          currency: 'INR',
          productId: pid,
          plan: pid,
          planId: pid,
        });
        orderData = res.data;
      } catch {
        const fbRes = await api.post('/orders/create', {
          amount: amountInPaise,
          currency: 'INR',
          productId: pid,
          plan: pid,
          planId: pid,
        });
        orderData = fbRes.data;
      }

      if (orderData.alreadyPaid || orderData.accessUrl) {
        navigate(orderData.accessUrl || `/products/${pid}/access`);
        return;
      }

      const orderId = orderData.order_id || orderData.orderId;
      const keyId =
        orderData.key_id ||
        orderData.keyId ||
        orderData.key ||
        process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!orderId) {
        throw new Error('Order creation failed: No order ID returned from server.');
      }

      const verifyPaymentOnServer = async (r) => {
        const verifyPayload = {
          razorpay_order_id: r.razorpay_order_id,
          razorpay_payment_id: r.razorpay_payment_id,
          razorpay_signature: r.razorpay_signature,
        };
        try {
          const verifyRes = await api.post('/verify-payment', verifyPayload);
          navigate(verifyRes.data.accessUrl || `/products/${product._id}/access`);
        } catch {
          const fbVerify = await api.post('/orders/verify', verifyPayload);
          navigate(fbVerify.data.accessUrl || `/products/${product._id}/access`);
        }
      };

      const options = {
        key: keyId,
        amount: orderData.amount || amountInPaise,
        currency: orderData.currency || 'INR',
        order_id: orderId,
        name: BRAND.name || 'Strivers',
        description: product.title,
        prefill: {
          name: user?.name || 'Student',
          email: user?.email || 'student@example.com',
        },
        theme: { color: '#2F4BFF' },
        handler: async (response) => {
          try {
            await verifyPaymentOnServer(response);
          } catch (err) {
            setError(err.response?.data?.error || err.message || 'Payment verification failed on server.');
          } finally {
            setPayingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setPayingId(null);
            setError('Payment was cancelled by the user.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        setPayingId(null);
        setError(response.error?.description || 'Payment failed. Please try again.');
      });

      rzp.open();
    } catch (err) {
      setPayingId(null);
      setError(err.response?.data?.error || err.response?.data?.message || err.message || 'Could not start payment');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar user={user} />

      <main style={{ flex: 1, maxWidth: 840, margin: '40px auto', padding: '0 20px', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', margin: '0 0 6px' }}>Available Courses & Programs</h1>
            <p className="muted" style={{ margin: 0 }}>
              Unlock access to live sessions, placement toolkits, and interview channels.
            </p>
          </div>
          {user && (
            <span style={{ fontSize: '0.95rem', color: 'var(--ink-2)', background: 'var(--card)', padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--line)' }}>
              Logged in: <strong>{user.email}</strong>
            </span>
          )}
        </div>

        {error && (
          <p className="err" style={{ background: '#FEE2E2', padding: '10px 14px', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {/* Practice Sheet & Live Mentorship Dashboard Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            color: '#FFFFFF',
            borderRadius: '14px',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 700, marginBottom: '6px' }}>
              <span>🚀</span>
              <span>PRACTICE & LIVE MENTORSHIP</span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#FFFFFF' }}>DSA Sheet & Live Sunday Mentorship</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#BFDBFE' }}>
              Solve 190+ curated interview questions, attend live Google Meet sessions with unicorn mentors, and track streaks.
            </p>
          </div>
          <button
            className="btn"
            style={{ background: '#FFFFFF', color: '#1E3A8A', fontWeight: 700, border: 'none', whiteSpace: 'nowrap' }}
            onClick={() => navigate('/practice')}
          >
            Open Dashboard →
          </button>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          {products.map((p) => (
            <article
              key={p._id}
              style={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                padding: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ maxWidth: '520px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '1.3rem' }}>{p.title}</h3>
                <p className="muted" style={{ margin: '0 0 12px' }}>
                  {p.description}
                </p>
                <div style={{ font: "800 1.6rem var(--display, 'Bricolage Grotesque')", color: 'var(--ink)' }}>
                  ₹{p.price !== undefined ? p.price : ((p.priceInPaise || 2100) / 100).toFixed(0)}
                </div>
              </div>

              <div>
                {isProductOwned(p) ? (
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate(`/products/${p._id || p.productId}/access`)}
                    style={{
                      minWidth: '150px',
                      background: '#ecfdf5',
                      color: '#065f46',
                      borderColor: '#6ee7b7',
                      fontWeight: 700,
                    }}
                  >
                    ✓ Start Learning →
                  </button>
                ) : (
                  <button
                    className="btn btn-primary"
                    onClick={() => handleBuy(p)}
                    disabled={payingId === (p._id || p.productId)}
                    style={{ minWidth: '150px' }}
                  >
                    {payingId === (p._id || p.productId) ? 'Opening...' : 'Unlock Now →'}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
