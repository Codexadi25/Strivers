import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SchoolIcon from '@mui/icons-material/School';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';
import { loadRazorpay } from '../utils/razorpay';
import { BRAND, PLANS } from '../config/strivers';

// Rich features & metadata per program
const PROGRAM_METADATA = {
  masterclass: {
    category: 'LIVE WORKSHOP & MENTORSHIP',
    categoryColor: '#2563EB',
    categoryBg: '#EFF6FF',
    icon: SchoolIcon,
    features: [
      'Live Sunday Google Meet interactive session with unicorn mentors',
      'ATS-parsed resume template & portfolio hosting blueprint',
      'Cold email outreach formulas & Naukri profile optimization',
      'DRM-protected study notes, cheatsheets & interview question banks',
    ],
    scheduleInfo: 'Next Session: Sunday, 11:00 AM IST',
    classroomHighlights: ['Google Meet Live Room', 'DRM Study Notes', 'Curriculum Agenda'],
  },
  channel: {
    category: 'JOB PLACEMENT NETWORK',
    categoryColor: '#059669',
    categoryBg: '#ECFDF5',
    icon: WorkOutlineIcon,
    features: [
      'Curated job vacancies with direct HR interview meeting links',
      'Targeted case studies & unit economics question prep',
      'Direct mentor Q&A and 1-on-1 guidance for shortlists',
      'Early-bird notification feed for high-intent applications',
    ],
    scheduleInfo: 'Active Job Feed Updated Daily',
    classroomHighlights: ['Direct HR Links', 'Interview Prep Vault', 'Mentor Q&A'],
  },
};

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

    // 1. If user is not logged in, route to sign-up process first
    if (!user) {
      navigate(`/register?plan=${encodeURIComponent(pid)}`);
      return;
    }

    // 2. If already owned, do not proceed to payment; route directly to the course classroom
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
          navigate(verifyRes.data.accessUrl || `/products/${pid}/access`);
        } catch {
          const fbVerify = await api.post('/orders/verify', verifyPayload);
          navigate(fbVerify.data.accessUrl || `/products/${pid}/access`);
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

  // Partition products into owned vs available
  const ownedProducts = products.filter((p) => isProductOwned(p));
  const availableProducts = products.filter((p) => !isProductOwned(p));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
      <Navbar user={user} />

      <main className="products-main-wrapper">
        {/* Responsive Header Bar */}
        <div
          className="products-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ flex: '1 1 320px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Chip
                icon={<SchoolIcon style={{ fontSize: '0.95rem', color: '#2F4BFF' }} />}
                label="PROGRAMS & CLASSROOM ACCESS"
                size="small"
                style={{
                  background: '#EEF2FF',
                  color: '#2F4BFF',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.4px',
                }}
              />
              {user && (
                <Chip
                  label={ownedProducts.length > 0 ? `${ownedProducts.length} Active Pass` : 'Free Tier'}
                  size="small"
                  style={{
                    background: ownedProducts.length > 0 ? '#ECFDF5' : '#F1F5F9',
                    color: ownedProducts.length > 0 ? '#059669' : '#64748B',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                  }}
                />
              )}
            </div>
            <h1
              style={{
                fontSize: 'clamp(1.35rem, 4vw, 1.95rem)',
                fontWeight: 800,
                color: '#0F172A',
                margin: '0 0 6px',
                lineHeight: 1.25,
              }}
            >
              {ownedProducts.length > 0 ? 'My Courses & Available Upgrades' : 'Available Courses & Programs'}
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(0.84rem, 2.5vw, 0.95rem)',
                color: '#64748B',
                lineHeight: 1.5,
              }}
            >
              Interactive Sunday workshops, verified DRM study materials, and direct HR vacancy channels.
            </p>
          </div>

          {/* User Account / Login Pill */}
          <div style={{ flexShrink: 0, maxWidth: '100%' }}>
            {user ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  maxWidth: '100%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <PersonOutlineIcon style={{ fontSize: '1.1rem', color: '#2F4BFF', flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: '0.84rem',
                    color: '#334155',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '220px',
                  }}
                >
                  {user.email}
                </span>
              </div>
            ) : (
              <div style={{ display: 'inline-flex', gap: '8px' }}>
                <Link to="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="small"
                    style={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      borderColor: '#CBD5E1',
                      color: '#334155',
                    }}
                  >
                    Log In
                  </Button>
                </Link>
                <Link to="/register" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="small"
                    style={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.84rem',
                      fontWeight: 700,
                      backgroundColor: '#2F4BFF',
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Error notification banner */}
        {error && (
          <Alert
            severity="error"
            onClose={() => setError('')}
            style={{ marginBottom: '18px', borderRadius: '10px' }}
          >
            {error}
          </Alert>
        )}

        {/* Practice Sheet & Live Mentorship Dashboard Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.18)',
          }}
        >
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '3px 10px',
                borderRadius: '99px',
                fontSize: '0.74rem',
                fontWeight: 700,
                marginBottom: '8px',
                letterSpacing: '0.3px',
              }}
            >
              <RocketLaunchIcon style={{ fontSize: '0.85rem' }} />
              <span>DSA PRACTICE & LIVE MENTORSHIP</span>
            </div>
            <h3
              style={{
                margin: '0 0 4px',
                fontSize: 'clamp(1.05rem, 3.2vw, 1.25rem)',
                fontWeight: 700,
                color: '#FFFFFF',
              }}
            >
              Interactive DSA Sheet & Sunday Live Sessions
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(0.8rem, 2.2vw, 0.88rem)',
                color: '#DBEAFE',
                lineHeight: 1.45,
              }}
            >
              190+ curated questions, streak calendar, Google Meet sessions with unicorn mentors & protected notes vault.
            </p>
          </div>

          <div className="product-action-btn-wrap" style={{ flexShrink: 0 }}>
            <Button
              variant="contained"
              onClick={() => navigate('/practice')}
              endIcon={<ArrowForwardIcon style={{ fontSize: '1rem' }} />}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1E3A8A',
                fontWeight: 700,
                fontSize: '0.88rem',
                textTransform: 'none',
                borderRadius: '10px',
                padding: '10px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
              }}
            >
              Open Practice Hub
            </Button>
          </div>
        </div>

        {/* SECTION 1: ENROLLED PROGRAMS (If user has access to any) */}
        {ownedProducts.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircleIcon style={{ color: '#059669', fontSize: '1.25rem' }} />
              <h2
                style={{
                  margin: 0,
                  fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
                  fontWeight: 700,
                  color: '#0F172A',
                }}
              >
                My Enrolled Courses & Classroom Access
              </h2>
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              {ownedProducts.map((p) => {
                const pid = p._id || p.productId;
                const meta = PROGRAM_METADATA[pid] || {
                  category: 'ENROLLED PROGRAM',
                  categoryColor: '#2563EB',
                  categoryBg: '#EFF6FF',
                  icon: SchoolIcon,
                  features: [],
                  classroomHighlights: ['Classroom Access', 'Study Notes'],
                };
                const IconComponent = meta.icon;

                return (
                  <div
                    key={pid}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #A7F3D0',
                      borderRadius: '14px',
                      padding: '18px 20px',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.08)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={{ flex: '1 1 280px', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <Chip
                            icon={<CheckCircleIcon style={{ fontSize: '0.85rem', color: '#059669' }} />}
                            label="PERMANENT ACCESS ACTIVE"
                            size="small"
                            style={{
                              backgroundColor: '#ECFDF5',
                              color: '#059669',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                            }}
                          />
                          <Chip
                            label="VERIFIED ENROLLMENT"
                            size="small"
                            style={{
                              backgroundColor: '#F0FDF4',
                              color: '#166534',
                              fontWeight: 600,
                              fontSize: '0.7rem',
                            }}
                          />
                        </div>

                        <h3
                          style={{
                            margin: '0 0 6px',
                            fontSize: 'clamp(1.1rem, 3.2vw, 1.3rem)',
                            fontWeight: 700,
                            color: '#0F172A',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <IconComponent style={{ color: '#2563EB', fontSize: '1.25rem' }} />
                          <span>{p.title}</span>
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                          {p.description}
                        </p>
                      </div>

                      {/* Classroom Launch Button */}
                      <div className="product-action-btn-wrap" style={{ flexShrink: 0 }}>
                        <Button
                          variant="contained"
                          onClick={() => navigate(`/products/${pid}/access`)}
                          endIcon={<ArrowForwardIcon style={{ fontSize: '1rem' }} />}
                          style={{
                            backgroundColor: '#059669',
                            color: '#FFFFFF',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            textTransform: 'none',
                            borderRadius: '10px',
                            padding: '10px 20px',
                            boxShadow: '0 2px 8px rgba(5, 150, 105, 0.25)',
                          }}
                        >
                          Launch Classroom →
                        </Button>
                      </div>
                    </div>

                    {/* Quick Access Badges */}
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px',
                        paddingTop: '10px',
                        borderTop: '1px dashed #E2E8F0',
                      }}
                    >
                      {meta.classroomHighlights?.map((item, i) => (
                        <span
                          key={i}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.76rem',
                            color: '#334155',
                            backgroundColor: '#F8FAFC',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            border: '1px solid #E2E8F0',
                          }}
                        >
                          {item.includes('Meet') ? (
                            <LiveTvIcon style={{ fontSize: '0.85rem', color: '#2563EB' }} />
                          ) : item.includes('Notes') ? (
                            <MenuBookIcon style={{ fontSize: '0.85rem', color: '#D97706' }} />
                          ) : (
                            <CheckCircleIcon style={{ fontSize: '0.85rem', color: '#059669' }} />
                          )}
                          <span>{item}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2: AVAILABLE COURSES & UPGRADES */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <BoltIcon style={{ color: '#2563EB', fontSize: '1.25rem' }} />
            <h2
              style={{
                margin: 0,
                fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
                fontWeight: 700,
                color: '#0F172A',
              }}
            >
              {ownedProducts.length > 0 ? 'Explore More Programs & Upgrades' : 'All Courses & Career Toolkits'}
            </h2>
          </div>

          <div style={{ display: 'grid', gap: '16px' }}>
            {availableProducts.map((p) => {
              const pid = p._id || p.productId;
              const meta = PROGRAM_METADATA[pid] || {
                category: 'CAREER PROGRAM',
                categoryColor: '#2563EB',
                categoryBg: '#EFF6FF',
                icon: SchoolIcon,
                features: PLANS[pid]?.points || [
                  'Full live session & masterclass access',
                  'Verified study guides and question banks',
                  'Placement assistance and mentor support',
                ],
                scheduleInfo: 'Flexible schedule',
              };
              const IconComponent = meta.icon;
              const priceDisplay = p.price !== undefined ? p.price : ((p.priceInPaise || 2100) / 100).toFixed(0);
              const isProcessing = payingId === pid;

              return (
                <div
                  key={pid}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  {/* Top Category and Schedule Info */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span
                        style={{
                          backgroundColor: meta.categoryBg,
                          color: meta.categoryColor,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '99px',
                          letterSpacing: '0.4px',
                        }}
                      >
                        {meta.category}
                      </span>
                      <span
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: '99px',
                        }}
                      >
                        {meta.scheduleInfo}
                      </span>
                    </div>

                    <Chip
                      label="LIFETIME ACCESS"
                      size="small"
                      style={{
                        backgroundColor: '#FEF3C7',
                        color: '#92400E',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3
                      style={{
                        margin: '0 0 6px',
                        fontSize: 'clamp(1.15rem, 3.4vw, 1.4rem)',
                        fontWeight: 800,
                        color: '#0F172A',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <IconComponent style={{ color: '#2563EB', fontSize: '1.35rem' }} />
                      <span>{p.title}</span>
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748B', lineHeight: 1.5 }}>
                      {p.description}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #EDF2F7',
                      borderRadius: '12px',
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '0.76rem',
                        fontWeight: 700,
                        color: '#475569',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                      }}
                    >
                      What's Included in This Pass
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 0,
                        listStyle: 'none',
                        display: 'grid',
                        gap: '8px',
                      }}
                    >
                      {meta.features.map((feat, i) => (
                        <li
                          key={i}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            fontSize: '0.84rem',
                            color: '#334155',
                            lineHeight: 1.4,
                          }}
                        >
                          <CheckCircleIcon
                            style={{
                              fontSize: '0.95rem',
                              color: '#059669',
                              marginTop: '2px',
                              flexShrink: 0,
                            }}
                          />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Bottom Row: Pricing & 1-Tap Checkout */}
                  <div
                    className="product-card-bottom-row"
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      paddingTop: '6px',
                      borderTop: '1px solid #F1F5F9',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                        <span
                          style={{
                            fontSize: 'clamp(1.5rem, 4vw, 1.95rem)',
                            fontWeight: 900,
                            color: '#0F172A',
                            fontFamily: 'var(--display, sans-serif)',
                          }}
                        >
                          ₹{priceDisplay}
                        </span>
                        <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                          INR / one-time
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                        No monthly recurring charges · 100% money-back satisfaction
                      </div>
                    </div>

                    <div className="product-action-btn-wrap" style={{ flexShrink: 0 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleBuy(p)}
                        disabled={isProcessing}
                        endIcon={<ArrowForwardIcon style={{ fontSize: '1rem' }} />}
                        style={{
                          backgroundColor: '#2F4BFF',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          textTransform: 'none',
                          borderRadius: '10px',
                          padding: '11px 24px',
                          minWidth: '160px',
                          boxShadow: '0 4px 14px rgba(47, 75, 255, 0.28)',
                        }}
                      >
                        {isProcessing ? 'Opening Gateway...' : 'Unlock Access Now →'}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}

            {availableProducts.length === 0 && (
              <div
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <CheckCircleIcon style={{ color: '#059669', fontSize: '2.5rem', marginBottom: '8px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', color: '#0F172A' }}>
                  You have full active access to all Strivers programs!
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: '0.88rem', color: '#64748B' }}>
                  All masterclasses, live meet links, and job networks are ready in your classroom.
                </p>
                <Button
                  variant="contained"
                  onClick={() => navigate('/practice')}
                  style={{
                    backgroundColor: '#2F4BFF',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: '8px',
                  }}
                >
                  Go to Practice Dashboard
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Trust Badges Footer Strip */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            padding: '16px 12px',
            borderTop: '1px solid #E2E8F0',
            marginTop: '16px',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
            <ShieldOutlinedIcon style={{ fontSize: '1rem', color: '#059669' }} />
            <span>256-Bit SSL Encrypted Razorpay Checkout</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
            <BoltIcon style={{ fontSize: '1rem', color: '#2563EB' }} />
            <span>Instant Classroom & Notes Activation</span>
          </div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#64748B' }}>
            <CheckCircleIcon style={{ fontSize: '1rem', color: '#059669' }} />
            <span>Permanent Lifetime Validity</span>
          </div>
        </div>
      </main>
    </div>
  );
}
