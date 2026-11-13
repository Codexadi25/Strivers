import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import WorkOutlineIcon from '@mui/icons-material/WorkOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import BoltIcon from '@mui/icons-material/Bolt';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import api from '../utils/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CheckoutModal from '../components/checkout/CheckoutModal';
import CompanyMarquee from '../components/common/CompanyMarquee';
import PlacementDisclaimer from '../components/common/PlacementDisclaimer';
import {
  BASELINE_COURSES,
  BASELINE_FAQS,
  BASELINE_COMPARE_ROWS,
} from '../config/courseDefaults';
import { PLANS, nextSessionLabel } from '../config/strivers';
import './Courses.css';

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState(BASELINE_COURSES);
  const [catalogMeta, setCatalogMeta] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [user, setUser] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const fallbackSessionLabel = useMemo(() => nextSessionLabel(), []);

  const isCourseOwned = (courseId) => {
    if (!user) return false;
    if (user.role === 'admin' || user.isAdmin) return true;
    const cid = String(courseId).toLowerCase();
    return Boolean(
      user.enrolledCourses?.some((c) => String(c.courseId).toLowerCase() === cid)
    );
  };

  useEffect(() => {
    let isMounted = true;

    const loadCatalogAndAuth = () => {
      api
        .get('/courses')
        .then((res) => {
          if (!isMounted) return;
          const rawCourses = res.data?.courses || res.data?.products;
          if (Array.isArray(rawCourses) && rawCourses.length > 0) {
            const activeCourses = rawCourses.filter((c) => c.isActive !== false);
            if (activeCourses.length > 0) {
              setCourses(activeCourses);
            }
          }
          if (res.data?.catalogMeta) {
            setCatalogMeta(res.data.catalogMeta);
          }
        })
        .catch(() => {});

      const token = localStorage.getItem('auth_token');
      if (!token) {
        if (isMounted) setUser(null);
      } else {
        api
          .get('/auth/me')
          .then((res) => {
            if (isMounted) setUser(res.data.user);
          })
          .catch(() => {
            if (isMounted) setUser(null);
          });
      }
    };

    loadCatalogAndAuth();
    window.addEventListener('auth_state_change', loadCatalogAndAuth);

    return () => {
      isMounted = false;
      window.removeEventListener('auth_state_change', loadCatalogAndAuth);
    };
  }, []);

  // Listen to tab / filter query params (e.g. /courses?tab=my-access)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('filter');
    if (tabParam === 'my-access' || tabParam === 'access') {
      setActiveTab('my-access');
    }
  }, []);

  // Auto-open checkout if returning from /login?plan=... or /register?plan=...
  useEffect(() => {
    if (typeof window === 'undefined' || !user || courses.length === 0) return;
    const params = new URLSearchParams(window.location.search);
    const checkoutParam = params.get('checkout') || params.get('enroll');
    if (!checkoutParam) return;
    const target = courses.find((c) => (c.productId || c._id) === checkoutParam);
    if (!target) return;
    const cid = target.productId || target._id;
    const owned = isCourseOwned(cid);
    if (owned) {
      navigate(`/courses/${cid}/access`);
    } else {
      setCheckout({
        plan: {
          id: cid,
          title: target.title,
          blurb: target.description,
          points: target.features || [],
        },
        price: target.price,
      });
    }
  }, [user, courses, navigate]);

  const openCourseDetail = (courseId) => {
    navigate(`/courses/${encodeURIComponent(courseId)}`);
  };

  const filteredCourses = useMemo(() => {
    if (activeTab === 'my-access') {
      return courses.filter((c) => isCourseOwned(c.productId || c._id));
    }
    if (activeTab === 'all') return courses;
    if (activeTab === 'masterclass') {
      return courses.filter((c) => c.category === 'masterclass' || c.isMasterclass);
    }
    if (activeTab === 'channel') {
      return courses.filter((c) => c.category === 'channel' || c.productId === 'channel');
    }
    if (activeTab === 'self_paced') {
      return courses.filter((c) => c.category === 'course' || !c.isMasterclass);
    }
    return courses;
  }, [courses, activeTab, user]);

  const heroData = catalogMeta?.hero || {
    badge: 'LIVE INDUSTRY PROGRAMS & PLACEMENT TRACKS',
    title: 'Level Up Your Career with Unicorn Mentors',
    subtitle:
      'Focused, practical programs designed around real industry hiring expectations, live feedback, and hands-on portfolio building.',
    stats: [
      { label: 'Candidate Rating', value: '4.9/5', icon: 'star' },
      { label: 'Interactive Live Sessions', value: 'Weekly', icon: 'livetv' },
      { label: 'Continued Account Access', value: 'Lifetime', icon: 'shield' },
    ],
  };

  const faqs =
    catalogMeta?.faqs && catalogMeta.faqs.length > 0 ? catalogMeta.faqs : BASELINE_FAQS;

  const compareData = catalogMeta?.compareTable || {
    title: 'Compare Strivers Programs',
    subtitle: 'Choose the program that fits your career stage.',
    headers: ['Curriculum & Benefits', 'Strivers Masterclass', 'Paid Job Channel', 'Full-Stack Track'],
    rows: BASELINE_COMPARE_ROWS,
  };

  return (
    <div className="courses-page-root">
      <Header user={user} />

      <main className="courses-main">
        {/* MINIMAL HERO SECTION */}
        <section className="courses-hero-section">
          <div className="courses-hero-container">
            <div className="courses-hero-pill">
              <BoltIcon sx={{ fontSize: 16 }} />
              <span>{heroData.badge}</span>
            </div>

            <h1 className="courses-hero-title">{heroData.title}</h1>

            <p className="courses-hero-subtitle">{heroData.subtitle}</p>

            <div className="courses-trust-bar">
              {(heroData.stats || []).map((st, sIdx) => (
                <div key={sIdx} className="courses-trust-item">
                  {st.icon === 'star' ? (
                    <StarIcon className="courses-trust-icon-star" />
                  ) : st.icon === 'livetv' ? (
                    <LiveTvIcon className="courses-trust-icon-live" />
                  ) : (
                    <VerifiedUserOutlinedIcon className="courses-trust-icon-shield" />
                  )}
                  <span>
                    {st.value ? <strong>{st.value} </strong> : null}
                    {st.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMPANY MARQUEE (Desktop Only) */}
        <div className="courses-marquee-mobile-hide">
          <CompanyMarquee title="Learn Directly with Engineering & Operations Leaders From" />
        </div>

        {/* MAIN COURSES CATALOG */}
        <section className="courses-catalog-container">
          {/* FILTER TABS */}
          <div className="courses-filter-tabs">
            {[
              ...(user ? [{ id: 'my-access', label: 'My Enrolled Access', icon: CheckCircleOutlineIcon }] : []),
              { id: 'all', label: 'All Programs', icon: SchoolIcon },
              { id: 'masterclass', label: 'Live Masterclasses', icon: LiveTvIcon },
              { id: 'channel', label: 'Job Placement Channels', icon: WorkOutlineIcon },
              { id: 'self_paced', label: 'Self-Paced Tracks', icon: MenuBookIcon },
            ].map((tab) => {
              const active = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <Button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  startIcon={<Icon sx={{ fontSize: 18 }} />}
                  className={`courses-tab-button ${active ? 'active' : ''}`}
                >
                  {tab.label}
                </Button>
              );
            })}
          </div>

          {/* COURSE CARDS GRID */}
          <div className="courses-grid">
            {activeTab === 'my-access' && filteredCourses.length === 0 ? (
              <div
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '48px 24px',
                  borderRadius: 16,
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                }}
              >
                <SchoolIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 1 }} />
                <h3 style={{ margin: '8px 0', color: '#1E293B', fontSize: '1.2rem' }}>
                  No Enrolled Programs Yet
                </h3>
                <p style={{ color: '#64748B', maxWidth: 440, margin: '0 auto 18px', fontSize: '0.92rem' }}>
                  You have not enrolled in any programs yet. Browse our masterclasses and placement programs below to get started.
                </p>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab('all')}
                  sx={{ borderRadius: 2 }}
                >
                  Explore All Programs
                </Button>
              </div>
            ) : (
              filteredCourses.map((course) => {
              const courseId = course.productId || course._id;
              const owned = isCourseOwned(courseId);
              const isMasterclass = course.category === 'masterclass' || course.isMasterclass;
              const isChannel = course.category === 'channel' || course.productId === 'channel';
              const sessionText =
                course.sessionDate || (isMasterclass ? fallbackSessionLabel : 'Active Schedule');
              const baselineMatch = BASELINE_COURSES.find((b) => b.productId === courseId);
              const imageUrl = course.imageUrl || baselineMatch?.imageUrl || '';
              const discountPercent =
                course.originalPrice && course.originalPrice > course.price
                  ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                  : null;
              const chipClass = isMasterclass
                ? 'chip-masterclass'
                : isChannel
                ? 'chip-channel'
                : 'chip-course';
              const features =
                course.features && course.features.length > 0
                  ? course.features
                  : PLANS[courseId]?.points || [];

              return (
                <article
                  key={courseId}
                  className="courses-card"
                  data-testid={`course-card-${courseId}`}
                  onClick={() => openCourseDetail(courseId)}
                >
                  <div>
                    {/* COURSE COVER PHOTO */}
                    <div className="courses-card-media-wrap">
                      {imageUrl && !brokenImages[courseId] ? (
                        <img
                          src={imageUrl}
                          alt={course.title}
                          className="courses-card-cover"
                          onError={() =>
                            setBrokenImages((prev) => ({ ...prev, [courseId]: true }))
                          }
                        />
                      ) : (
                        <div className="courses-card-cover-fallback">
                          <SchoolIcon sx={{ fontSize: 44 }} />
                        </div>
                      )}
                    </div>

                    <div className="courses-card-content">
                      <div className="courses-badge-row">
                        <Chip
                          label={
                            course.badge ||
                            (isMasterclass
                              ? 'LIVE WORKSHOP'
                              : isChannel
                              ? 'JOB NETWORK'
                              : 'PROGRAM')
                          }
                          size="small"
                          className={`courses-category-chip ${chipClass}`}
                        />
                        {course.duration && (
                          <span className="courses-duration-text">
                            <ScheduleOutlinedIcon sx={{ fontSize: 14 }} />
                            {course.duration}
                          </span>
                        )}
                      </div>

                      <h3 className="courses-card-title">{course.title}</h3>

                      <p className="courses-card-desc">
                        {course.description || PLANS[courseId]?.blurb}
                      </p>

                      <div className="courses-meta-line">
                        <LiveTvIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                        <span>{sessionText}</span>
                      </div>

                      {course.mentors && course.mentors.length > 0 && (
                        <div className="courses-mentors-section courses-mentors-mobile-hide">
                          <div className="courses-mentors-title">Mentors</div>
                          <div className="courses-mentors-list">
                            {course.mentors.map((m, idx) => (
                              <span key={idx} className="courses-mentor-tag">
                                {m.name} {m.company ? `(${m.company})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {features.length > 0 && (
                        <ul className="courses-features-list courses-features-mobile-hide">
                          {features.slice(0, 3).map((feat, fIdx) => (
                            <li key={fIdx} className="courses-feature-item">
                              <CheckCircleOutlineIcon className="courses-check-icon" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* CARD FOOTER */}
                  <div className="courses-price-section">
                    <div className="courses-price-row">
                      <span className="courses-price-main">₹{course.price}</span>
                      {course.originalPrice && course.originalPrice > course.price && (
                        <s className="courses-price-was">₹{course.originalPrice}</s>
                      )}
                      {discountPercent && (
                        <span className="courses-discount-badge">{discountPercent}% OFF</span>
                      )}
                    </div>

                    {owned ? (
                      <Button
                        component={Link}
                        to={`/courses/${courseId}/access`}
                        onClick={(e) => e.stopPropagation()}
                        variant="contained"
                        fullWidth
                        endIcon={<ArrowForwardIcon />}
                        className="courses-btn-owned"
                      >
                        Start Learning Now
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          openCourseDetail(courseId);
                        }}
                        endIcon={<ArrowForwardIcon />}
                        className="courses-btn-enroll"
                      >
                        View Course & Curriculum
                      </Button>
                    )}
                  </div>
                </article>
              );
            }))}
          </div>
        </section>

        {/* COMPARISON TABLE (Desktop Only) */}
        <section className="courses-compare-section">
          <div className="courses-compare-container">
            <div className="courses-compare-header">
              <h2 className="courses-compare-title">{compareData.title}</h2>
              <p className="courses-compare-subtitle">{compareData.subtitle}</p>
            </div>

            <div className="courses-compare-table-wrapper">
              <table className="courses-compare-table">
                <thead>
                  <tr>
                    {(compareData.headers || [
                      'Curriculum & Benefits',
                      'Strivers Masterclass',
                      'Paid Job Channel',
                      'Full-Stack Track',
                    ]).map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(compareData.rows || BASELINE_COMPARE_ROWS).map((row, idx) => {
                    const rowFeature = row.feature || (Array.isArray(row) ? row[0] : '');
                    const rowValues = row.values || (Array.isArray(row) ? row.slice(1) : []);
                    return (
                      <tr key={idx}>
                        <td>{rowFeature}</td>
                        {rowValues.map((val, vIdx) => (
                          <td key={vIdx}>{val}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="courses-faq-section">
          <div className="courses-faq-header">
            <h2 className="courses-faq-title">Frequently Asked Questions</h2>
            <p className="courses-faq-subtitle">
              Common questions from students and working professionals.
            </p>
          </div>

          <div className="courses-faq-list">
            {faqs.map((faq, idx) => (
              <Accordion key={idx} elevation={0} className="courses-faq-accordion">
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: '#2563EB' }} />}
                  className="courses-faq-summary"
                >
                  {faq.q}
                </AccordionSummary>
                <AccordionDetails className="courses-faq-details">
                  {faq.a}
                </AccordionDetails>
              </Accordion>
            ))}
          </div>
        </section>

        {/* DISCLAIMER (Desktop Only) */}
        <section className="courses-disclaimer-wrapper">
          <PlacementDisclaimer />
        </section>
      </main>

      <Footer />

      {checkout && (
        <CheckoutModal
          plan={checkout.plan}
          price={checkout.price}
          onClose={() => setCheckout(null)}
        />
      )}
    </div>
  );
}
