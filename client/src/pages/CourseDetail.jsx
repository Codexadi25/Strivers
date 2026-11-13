import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SignalCellularAltOutlinedIcon from '@mui/icons-material/SignalCellularAltOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import api from '../utils/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CheckoutModal from '../components/checkout/CheckoutModal';
import { BASELINE_COURSES } from '../config/courseDefaults';
import { PLANS, nextSessionLabel } from '../config/strivers';
import './CourseDetail.css';

function normalizeCourse(raw, id) {
  const baseline =
    BASELINE_COURSES.find((c) => c.productId === id) || BASELINE_COURSES[0];
  const merged = { ...baseline, ...(raw || {}) };
  if (!merged.imageUrl && baseline.imageUrl) merged.imageUrl = baseline.imageUrl;
  if (!merged.whatYouWillLearn || merged.whatYouWillLearn.length === 0) {
    merged.whatYouWillLearn =
      merged.features && merged.features.length > 0
        ? merged.features
        : baseline.whatYouWillLearn || [];
  }
  if (!merged.curriculum || merged.curriculum.length === 0) {
    merged.curriculum =
      baseline.curriculum && baseline.productId === merged.productId
        ? baseline.curriculum
        : (merged.features || []).map((feat, idx) => ({
            moduleTitle: `Module ${idx + 1}: ${feat.slice(0, 48)}`,
            duration: 'Self-paced',
            lessons: [feat],
          }));
  }
  return merged;
}

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const courseId = id || 'masterclass';

  const [course, setCourse] = useState(() => normalizeCourse(null, courseId));
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [checkout, setCheckout] = useState(null);
  const [imgError, setImgError] = useState(false);

  const fallbackSession = useMemo(() => nextSessionLabel(), []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setImgError(false);

    const token = localStorage.getItem('auth_token');
    if (token) {
      api
        .get('/auth/me')
        .then((res) => {
          if (res.data?.user) setUser(res.data.user);
        })
        .catch(() => setUser(null));
    }

    api
      .get(`/courses/${encodeURIComponent(courseId)}`)
      .then((res) => {
        if (res.data?.course) {
          setCourse(normalizeCourse(res.data.course, courseId));
        }
      })
      .catch(() => {
        setCourse(normalizeCourse(null, courseId));
      })
      .finally(() => setLoading(false));
  }, [courseId]);

  const owned = useMemo(() => {
    if (!user) return false;
    if (user.role === 'admin' || user.isAdmin) return true;
    const cid = String(course.productId || courseId).toLowerCase();
    return Boolean(
      user.enrolledCourses?.some((c) => String(c.courseId).toLowerCase() === cid)
    );
  }, [user, course.productId, courseId]);

  const handleEnrollClick = () => {
    const targetId = course.productId || courseId;
    if (!user) {
      navigate(`/register?plan=${encodeURIComponent(targetId)}`);
      return;
    }
    if (owned) {
      navigate(`/courses/${targetId}/access`);
      return;
    }
    setCheckout({
      plan: {
        id: targetId,
        title: course.title,
        blurb: course.description,
        points: course.features || [],
      },
      price: course.price,
    });
  };

  const renderEnrollButton = (testId, fullWidthMobile = false) =>
    owned ? (
      <Button
        variant="contained"
        data-testid={testId}
        onClick={handleEnrollClick}
        endIcon={<ArrowForwardIcon />}
        className="course-detail-owned-btn"
        sx={fullWidthMobile ? { width: { xs: '100%', sm: 'auto' } } : undefined}
      >
        Start Learning Now
      </Button>
    ) : (
      <Button
        variant="contained"
        color="primary"
        data-testid={testId}
        onClick={handleEnrollClick}
        endIcon={<ArrowForwardIcon />}
        className="course-detail-enroll-btn"
        sx={fullWidthMobile ? { width: { xs: '100%', sm: 'auto' } } : undefined}
      >
        Enroll Now for ₹{course.price}
      </Button>
    );

  const sessionText =
    course.sessionDate ||
    (course.category === 'masterclass' || course.isMasterclass ? fallbackSession : 'Flexible Schedule');

  const outcomes = course.whatYouWillLearn || course.features || PLANS[courseId]?.points || [];
  const curriculumModules = course.curriculum || [];
  const discountPercent =
    course.originalPrice && course.originalPrice > course.price
      ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
      : null;

  return (
    <div className="course-detail-root">
      <Header user={user} />

      <main className="course-detail-main">
        {loading ? (
          <div className="course-detail-loading">
            <CircularProgress size={32} />
            <Typography variant="body2">Loading program curriculum...</Typography>
          </div>
        ) : (
          <>
            {/* COURSE HEADING SECTION WITH ENROLLMENT BUTTON #1 */}
            <section className="course-detail-hero-band">
              <Container maxWidth="lg">
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={() => navigate('/courses')}
                  className="course-detail-back-btn"
                >
                  All Courses
                </Button>

                <div className="course-detail-hero-grid">
                  <div>
                    <div className="course-detail-chips">
                      <Chip
                        size="small"
                        label={course.badge || (course.category || 'COURSE').toUpperCase()}
                        className="course-detail-cat-chip"
                      />
                      {course.duration && (
                        <Chip
                          size="small"
                          icon={<ScheduleOutlinedIcon sx={{ fontSize: 16 }} />}
                          label={course.duration}
                          className="course-detail-meta-chip"
                        />
                      )}
                      {course.level && (
                        <Chip
                          size="small"
                          icon={<SignalCellularAltOutlinedIcon sx={{ fontSize: 16 }} />}
                          label={course.level}
                          className="course-detail-meta-chip"
                        />
                      )}
                    </div>

                    <Typography variant="h1" className="course-detail-title">
                      {course.title}
                    </Typography>

                    <Typography variant="body1" className="course-detail-subtitle">
                      {course.description}
                    </Typography>

                    <div className="course-detail-schedule">
                      <ScheduleOutlinedIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                      <span>Schedule: {sessionText}</span>
                    </div>

                    {/* ENROLLMENT BUTTON AT BOTTOM OF COURSE HEADING */}
                    <div className="course-detail-heading-cta">
                      <div className="course-detail-price-wrap">
                        <span className="course-detail-price-current">₹{course.price}</span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="course-detail-price-original">₹{course.originalPrice}</span>
                        )}
                        {discountPercent && (
                          <Chip
                            size="small"
                            label={`${discountPercent}% OFF`}
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </div>

                      {renderEnrollButton('enroll-heading-btn', true)}
                    </div>
                  </div>

                  {/* COURSE PHOTO */}
                  <Paper elevation={0} className="course-detail-image-card">
                    {course.imageUrl && !imgError ? (
                      <img
                        src={course.imageUrl}
                        alt={course.title}
                        className="course-detail-cover-img"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="course-detail-image-fallback">
                        <SchoolOutlinedIcon sx={{ fontSize: 56 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {course.title}
                        </Typography>
                      </div>
                    )}
                  </Paper>
                </div>
              </Container>
            </section>

            {/* MAIN CONTENT BODY */}
            <Container maxWidth="lg" className="course-detail-body">
              {/* WHAT YOU WILL LEARN */}
              {outcomes.length > 0 && (
                <section className="course-detail-section">
                  <Typography variant="h2" className="course-detail-section-title">
                    What You Will Learn
                  </Typography>
                  <Typography className="course-detail-section-sub">
                    Practical outcomes and core competencies covered in this program.
                  </Typography>

                  <div className="course-detail-outcomes-grid">
                    {outcomes.map((item, idx) => (
                      <Paper key={idx} elevation={0} className="course-detail-outcome-card">
                        <CheckCircleOutlineIcon fontSize="small" className="course-detail-outcome-icon" />
                        <Typography variant="body2" sx={{ color: '#1E293B', fontWeight: 500, lineHeight: 1.55 }}>
                          {item}
                        </Typography>
                      </Paper>
                    ))}
                  </div>
                </section>
              )}

              {/* COURSE CURRICULUM / COURSE STRUCTURE */}
              <section className="course-detail-section">
                <Typography variant="h2" className="course-detail-section-title">
                  Course Curriculum & Structure
                </Typography>
                <Typography className="course-detail-section-sub">
                  Module-by-module breakdown of sessions, frameworks, and hands-on topics.
                </Typography>

                <div className="course-detail-accordion-list">
                  {curriculumModules.map((mod, idx) => (
                    <Accordion
                      key={idx}
                      defaultExpanded={idx === 0}
                      elevation={0}
                      className="course-detail-module-accordion"
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div className="course-detail-module-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <MenuBookOutlinedIcon sx={{ color: '#2563EB', fontSize: 20 }} />
                            <Typography className="course-detail-module-title">
                              {mod.moduleTitle}
                            </Typography>
                          </div>
                          {mod.duration && (
                            <Chip
                              size="small"
                              label={mod.duration}
                              variant="outlined"
                              sx={{ fontWeight: 600 }}
                            />
                          )}
                        </div>
                      </AccordionSummary>
                      <AccordionDetails sx={{ borderTop: '1px solid #F1F5F9', pt: 2 }}>
                        <ul className="course-detail-lesson-list">
                          {(mod.lessons || []).map((lesson, lIdx) => (
                            <li key={lIdx} className="course-detail-lesson-item">
                              <PlayCircleOutlineIcon sx={{ color: '#2563EB', fontSize: 18, mt: '2px', flexShrink: 0 }} />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </div>
              </section>

              {/* MENTORS (Condensed & hidden on smaller screens for minimal mobile view) */}
              {course.mentors && course.mentors.length > 0 && (
                <section className="course-detail-section course-detail-mentors-section-mobile-hide">
                  <Typography variant="h2" className="course-detail-section-title">
                    Program Mentors
                  </Typography>
                  <div className="course-detail-mentors-grid">
                    {course.mentors.map((mentor, idx) => (
                      <Paper key={idx} elevation={0} className="course-detail-mentor-card">
                        <Avatar sx={{ bgcolor: '#2563EB', fontWeight: 700 }}>
                          {(mentor.name || 'M').slice(0, 1).toUpperCase()}
                        </Avatar>
                        <div>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0F172A' }}>
                            {mentor.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
                            {mentor.role || mentor.company}
                          </Typography>
                        </div>
                      </Paper>
                    ))}
                  </div>
                </section>
              )}

              {/* ENROLLMENT BUTTON #2 AT END OF CURRICULUM */}
              <Paper elevation={0} className="course-detail-bottom-cta">
                <div>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                    Ready to start {course.title}?
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#475569' }}>
                    Instant enrollment access for ₹{course.price} · {sessionText}
                  </Typography>
                </div>

                {renderEnrollButton('enroll-bottom-btn', true)}
              </Paper>
            </Container>
          </>
        )}
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

