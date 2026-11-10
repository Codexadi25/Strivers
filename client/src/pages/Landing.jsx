import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CheckoutModal from '../components/checkout/CheckoutModal';
import ShareAds from '../components/checkout/ShareAds';
import CompanyMarquee from '../components/common/CompanyMarquee';
import PlacementDisclaimer from '../components/common/PlacementDisclaimer';
import './Landing.css';
import {
  PRICES,
  PLANS,
  PILLARS,
  REVIEWS,
  RECEIPT_ITEMS,
  EARLY_BIRD_ENDS_AT,
  nextSessionLabel,
} from '../config/strivers';

function useCountdown(endsAt) {
  const [left, setLeft] = useState(() => (endsAt ? Math.max(0, endsAt - Date.now()) : 0));
  useEffect(() => {
    if (!endsAt) return undefined;
    const t = setInterval(() => setLeft(Math.max(0, endsAt - Date.now())), 1000);
    return () => clearInterval(t);
  }, [endsAt]);
  return left;
}

const pad = (n) => String(n).padStart(2, '0');
function fmt(ms) {
  const s = Math.floor(ms / 1000);
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}

export default function Landing() {
  const navigate = useNavigate();
  const [livePrices, setLivePrices] = useState(PRICES);
  const [courseList, setCourseList] = useState([]);
  const [masterclassProduct, setMasterclassProduct] = useState(null);
  const [channelProduct, setChannelProduct] = useState(null);
  const left = useCountdown(EARLY_BIRD_ENDS_AT);
  const early = left > 0;
  const session = useMemo(() => nextSessionLabel(), []);
  const [user, setUser] = useState(null);
  const [checkout, setCheckout] = useState(null); // { plan, price }

  const isCourseOwned = (courseId) => {
    return Boolean(
      user?.enrolledCourses?.some((c) => c.courseId === courseId) ||
      (user?.hasActiveSubscription && (courseId === 'masterclass' || courseId === 'placement_masterclass'))
    );
  };

  const isMasterclassOwned = isCourseOwned('masterclass');
  const isChannelOwned = isCourseOwned('channel');

  // Dynamic values resolved from live database catalog
  const displayPrice = masterclassProduct?.price !== undefined ? masterclassProduct.price : (livePrices.regular || 21);
  const displaySession = masterclassProduct?.sessionDate || session;

  useEffect(() => {
    const syncData = () => {
      api
        .get('/courses')
        .then((res) => {
          const list = res.data?.courses || res.data?.products;
          if (Array.isArray(list) && list.length > 0) {
            const validCourses = list.filter((p) => p.isActive !== false);
            setCourseList(validCourses);

            const m = list.find((p) => p._id === 'masterclass' || p.productId === 'masterclass' || p.category === 'masterclass');
            const c = list.find((p) => p._id === 'channel' || p.productId === 'channel' || p.category === 'channel');

            if (m) setMasterclassProduct(m);
            if (c) setChannelProduct(c);

            if (m || c) {
              setLivePrices((prev) => ({
                ...prev,
                ...(m ? { regular: m.price, early: m.price } : {}),
                ...(c ? { channel: c.price } : {}),
              }));
            }
          }
        })
        .catch(() => {});

      const token = localStorage.getItem('auth_token');
      if (!token) {
        setUser(null);
      } else {
        api
          .get('/auth/me')
          .then((r) => setUser(r.data.user))
          .catch(() => setUser(null));
      }
    };

    syncData();
    window.addEventListener('auth_state_change', syncData);
    return () => window.removeEventListener('auth_state_change', syncData);
  }, []);

  const open = (planId, p, customPlan) => {
    // 1. If not logged in, route to sign-up process first!
    if (!user) {
      navigate(`/register?plan=${encodeURIComponent(planId)}`);
      return;
    }
    // 2. If already owned, do not proceed to payment; route directly to course!
    if (isCourseOwned(planId)) {
      navigate(`/courses/${planId}/access`);
      return;
    }
    const resolvedPlan = customPlan || PLANS[planId] || { id: planId, title: planId, blurb: '' };
    setCheckout({ plan: resolvedPlan, price: p });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header user={user} />

      <main style={{ flex: 1 }}>
        {/* HERO: The bill receipt with ₹9 next to a pizza */}
        <section className="hero">
          <div className="hero-copy">
            <h1>Get Placement Ready for less than the price of a Pizza</h1>
            <p className="lede">
              A live online masterclass with mentors from top working teams. We start from the basics and take you
              through an ATS-friendly resume, live portfolio, LinkedIn & Naukri algorithms, cold emails, and high-demand
              data skills.
            </p>
            <div className="cta-row">
              {isMasterclassOwned ? (
                <Link
                  className="btn btn-secondary btn-lg"
                  to="/courses/masterclass/access"
                  style={{ background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0', fontWeight: 700 }}
                >
                  ✓ Start Learning →
                </Link>
              ) : (
                <button className="btn btn-primary btn-lg" onClick={() => open('masterclass', displayPrice, masterclassProduct)}>
                  Join for ₹{displayPrice}
                </button>
              )}
              <Link className="btn btn-ghost btn-lg" to="/practice">
                Practice Sheet & Mentorship
              </Link>
            </div>
            <p className="session">
              Live online session: <strong>{displaySession}</strong>
            </p>
            {early && (
              <p className="early" role="timer" aria-live="off">
                Early-bird ₹{PRICES.early} ends in <strong>{fmt(left)}</strong>. Then ₹{displayPrice}.
              </p>
            )}
          </div>

          <div
            className="receipt landing-mobile-hide"
            role="img"
            aria-label={`Price comparison: pizza, burger and coffee cost more than the Strivers masterclass at ₹${displayPrice}`}
          >
            <p className="receipt-head">Strivers · today’s bill</p>
            <ul>
              {RECEIPT_ITEMS.map(([n, p]) => (
                <li key={n}>
                  <span>{n}</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
            <div className="receipt-total">
              <span>Placement masterclass</span>
              <strong>₹{displayPrice}</strong>
            </div>
            <p className="receipt-foot">{masterclassProduct?.badge || (early ? 'Early-bird: first 2 days' : 'This Sunday session')}</p>
          </div>
        </section>

        {/* CONTINUOUS LOOP LOGO MARQUEE RIBBON (Desktop Only) */}
        <div className="landing-mobile-hide">
          <CompanyMarquee title="Mentors from India’s Leading Unicorns & Tech Teams" />
        </div>

        {/* GUIDANCE & PLACEMENT DISCLAIMER (Desktop Only) */}
        <section className="section landing-mobile-hide" style={{ paddingTop: 0, paddingBottom: 16 }}>
          <PlacementDisclaimer />
        </section>

        {/* COURSES */}
        <section id="courses" className="section">
          <h2>Our courses</h2>
          <div className="cards">
            {courseList.length > 0 ? (
              courseList.map((course) => {
                const owned = isCourseOwned(course.productId);
                const points =
                  course.features && course.features.length > 0
                    ? course.features
                    : PLANS[course.productId]?.points || [];

                return (
                  <article
                    key={course.productId}
                    className="course landing-course-card"
                    onClick={() => navigate(`/courses/${encodeURIComponent(course.productId)}`)}
                  >
                    {course.imageUrl && (
                      <div className="landing-course-cover-wrap">
                        <img
                          src={course.imageUrl}
                          alt={course.title}
                          className="landing-course-cover-img"
                        />
                      </div>
                    )}
                    <h3>{course.title}</h3>
                    <p className="muted">{course.description || PLANS[course.productId]?.blurb}</p>
                    <ul className="ticks landing-mobile-hide">
                      {points.slice(0, 3).map((pt, i) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                    <div className="price-row">
                      <span className="price">₹{course.price}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <s className="was">₹{course.originalPrice}</s>
                      )}
                      {course.badge && <span className="off">{course.badge}</span>}
                    </div>
                    {owned ? (
                      <Link
                        className="btn btn-secondary btn-block"
                        to={`/courses/${course.productId}/access`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: '#ecfdf5',
                          color: '#065f46',
                          borderColor: '#a7f3d0',
                          fontWeight: 700,
                          textAlign: 'center',
                        }}
                      >
                        Start Learning →
                      </Link>
                    ) : (
                      <Link
                        className="btn btn-primary btn-block"
                        to={`/courses/${course.productId}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{ textAlign: 'center' }}
                      >
                        View Course & Enroll →
                      </Link>
                    )}
                  </article>
                );
              })
            ) : (
              <>
                <article
                  className="course landing-course-card"
                  onClick={() => navigate('/courses/masterclass')}
                >
                  <h3>{masterclassProduct?.title || PLANS.masterclass.title}</h3>
                  <p className="muted">{masterclassProduct?.description || PLANS.masterclass.blurb}</p>
                  <ul className="ticks landing-mobile-hide">
                    {(masterclassProduct?.features && masterclassProduct.features.length > 0
                      ? masterclassProduct.features
                      : PLANS.masterclass.points
                    ).map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="price-row">
                    <span className="price">₹{displayPrice}</span>
                    {masterclassProduct?.originalPrice ? (
                      <s className="was">₹{masterclassProduct.originalPrice}</s>
                    ) : early ? (
                      <s className="was">₹{PRICES.regular}</s>
                    ) : null}
                    {(masterclassProduct?.badge || (early ? 'Early-bird' : '')) && (
                      <span className="off">{masterclassProduct?.badge || 'Early-bird'}</span>
                    )}
                  </div>
                  {isMasterclassOwned ? (
                    <Link
                      className="btn btn-secondary btn-block"
                      to="/courses/masterclass/access"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        borderColor: '#a7f3d0',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      Start Learning →
                    </Link>
                  ) : (
                    <Link
                      className="btn btn-primary btn-block"
                      to="/courses/masterclass"
                      onClick={(e) => e.stopPropagation()}
                      style={{ textAlign: 'center' }}
                    >
                      View Course & Enroll →
                    </Link>
                  )}
                </article>

                <article
                  className="course landing-course-card"
                  onClick={() => navigate('/courses/channel')}
                >
                  <h3>{channelProduct?.title || PLANS.channel.title}</h3>
                  <p className="muted">{channelProduct?.description || PLANS.channel.blurb}</p>
                  <ul className="ticks landing-mobile-hide">
                    {(channelProduct?.features && channelProduct.features.length > 0
                      ? channelProduct.features
                      : PLANS.channel.points
                    ).map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="price-row">
                    <span className="price">₹{channelProduct?.price !== undefined ? channelProduct.price : livePrices.channel}</span>
                    {channelProduct?.originalPrice && (
                      <s className="was">₹{channelProduct.originalPrice}</s>
                    )}
                    {channelProduct?.badge && <span className="off">{channelProduct.badge}</span>}
                  </div>
                  {isChannelOwned ? (
                    <Link
                      className="btn btn-secondary btn-block"
                      to="/courses/channel/access"
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        background: '#ecfdf5',
                        color: '#065f46',
                        borderColor: '#a7f3d0',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    >
                      Access Job Channel →
                    </Link>
                  ) : (
                    <Link
                      className="btn btn-primary btn-block"
                      to="/courses/channel"
                      onClick={(e) => e.stopPropagation()}
                      style={{ textAlign: 'center' }}
                    >
                      View Course & Enroll →
                    </Link>
                  )}
                </article>
              </>
            )}
          </div>
        </section>

        {/* ABOUT & MISSION */}
        <section className="section split">
          <div>
            <h2>About Strivers</h2>
            <p>
              Strivers helps students and early-career professionals in India turn effort into interviews.
              We teach the unglamorous parts that decide who gets shortlisted: how your resume reads, how your
              profile ranks in a recruiter’s search, and how to write the one email that gets a reply.
            </p>
          </div>
          <div>
            <h2>Our mission</h2>
            <p>
              To make job-ready skills affordable enough that price is never the reason someone skips them,
              and practical enough that you can use them the same week.
            </p>
          </div>
        </section>

        <section className="section">
          <h2>Learn from people who do the job</h2>
          <div className="pillars">
            {PILLARS.map((p) => (
              <article key={p.title}>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        {REVIEWS.length > 0 && (
          <section className="section">
            <h2>Why trust us?</h2>
            <div className="reviews">
              {REVIEWS.map((r) => (
                <blockquote key={r.name}>
                  <p>{r.text}</p>
                  <footer>{r.name}</footer>
                </blockquote>
              ))}
            </div>
          </section>
        )}

        {/* VIRAL SHARE ADS (Desktop Only) */}
        <section id="share" className="section landing-mobile-hide">
          <h2>Share it with a friend</h2>
          <p className="muted">
            Share this masterclass with friends via WhatsApp, Instagram, Facebook, Twitter, or copy the direct course link.
          </p>
          <ShareAds price={displayPrice} early={early} />
        </section>
      </main>

      <Footer />

      {checkout && <CheckoutModal plan={checkout.plan} price={checkout.price} onClose={() => setCheckout(null)} />}
    </div>
  );
}
