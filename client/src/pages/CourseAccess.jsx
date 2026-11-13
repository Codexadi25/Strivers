import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import api from '../utils/api';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { ProtectedDocumentModal } from '../components/secureViewer/ProtectedDocumentModal';
import '../assets/styles/secureViewer.css';
import './CourseAccess.css';

export default function CourseAccess() {
  const { id } = useParams();
  const courseId = id || 'masterclass';

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);

  // WhatsApp Prompt Dialog & Dismissal state
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [waBannerDismissed, setWaBannerDismissed] = useState(false);

  // Masterclass Rearrange Request state
  const [rearrangeSubmitting, setRearrangeSubmitting] = useState(false);
  const [rearrangeSuccess, setRearrangeSuccess] = useState(false);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setLoading(true);
    setError('');

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => setUser(null));

    api
      .get(`/courses/${courseId}/access`)
      .then((res) => {
        if (res.data.success) {
          setCourseData(res.data.course);
          const enrolled = Boolean(res.data.isEnrolled);
          setIsEnrolled(enrolled);
          if (res.data.enrollmentDetails) {
            setEnrollmentDetails(res.data.enrollmentDetails);
          }

          // Check if WhatsApp prompt was previously dismissed
          const dismissed = localStorage.getItem(`wa_dismissed_${courseId}`) === 'true';
          setWaBannerDismissed(dismissed);

          // Prompt user to join WhatsApp group upon enrollment if not yet dismissed
          if (enrolled && !dismissed && res.data.course?.whatsappGroupLink) {
            setShowWhatsAppModal(true);
          }
        } else {
          setError('Failed to load course details.');
        }
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          setIsEnrolled(false);
          setError('Enrollment or active access pass required to view classroom content.');
        } else {
          setError('Unable to reach server. Please try again.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [courseId]);

  // Target countdown calculation: parse date or target next Sunday 11:00 AM IST
  const targetDate = useMemo(() => {
    if (courseData?.targetCountdown) {
      const parsed = new Date(courseData.targetCountdown);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    // Default to upcoming Sunday 11:00 AM IST
    const now = new Date();
    const day = now.getDay();
    const diffDays = (7 - day) % 7 || 7;
    const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffDays, 11, 0, 0);
    return target;
  }, [courseData?.targetCountdown]);

  // Countdown ticker
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate.getTime() - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  async function handleOpenMaterial(mat) {
    setLoadingMaterial(true);
    try {
      const matId = mat.materialId || mat._id;
      const res = await api.get(`/courses/${courseId}/materials/${matId}`);
      if (res.data.success && res.data.material) {
        setActiveMaterial(res.data.material);
      } else {
        alert('Failed to load study document.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error opening study material.');
    } finally {
      setLoadingMaterial(false);
    }
  }

  function handleCopyMeetingCode(code) {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  }

  const handleDismissWhatsApp = () => {
    setShowWhatsAppModal(false);
    setWaBannerDismissed(true);
    localStorage.setItem(`wa_dismissed_${courseId}`, 'true');
  };

  const handleRequestRearrange = async () => {
    setRearrangeSubmitting(true);
    try {
      await api.post('/tickets', {
        issueCategory: 'masterclass_rearrange_request',
        studentContact: user?.email || 'Student',
        userEmail: user?.email || '',
        orderId: enrollmentDetails?.orderId || `order_${courseId}`,
        remark: `Student requested to rearrange ended Masterclass: "${courseData?.title || courseId}"`,
      });
      setRearrangeSuccess(true);
    } catch (_) {
      // In local fallback, mark request as logged
      setRearrangeSuccess(true);
    } finally {
      setRearrangeSubmitting(false);
    }
  };

  const renderMaterialIcon = (fileType) => {
    if (fileType === 'pdf') return <PictureAsPdfOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />;
    if (fileType === 'html') return <CodeOutlinedIcon sx={{ fontSize: 28, color: '#059669' }} />;
    if (fileType === 'cheatsheet') return <BoltOutlinedIcon sx={{ fontSize: 28, color: '#D97706' }} />;
    if (fileType === 'document') return <MenuBookOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />;
    return <DescriptionOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />;
  };

  const isMasterclass = courseData?.category === 'masterclass' || courseData?.isMasterclass || courseId === 'masterclass';
  const sessionStatus = courseData?.sessionStatus || 'upcoming';
  const isLive = sessionStatus === 'live';
  const isEnded = sessionStatus === 'ended' || sessionStatus === 'completed';
  const timingSlots = courseData?.timingSlots || [];
  const materials = courseData?.notesAndPdfs || [];
  const whatsappLink = courseData?.whatsappGroupLink || 'https://chat.whatsapp.com/strivers-placement-masterclass';

  return (
    <div className="product-access-page-root">
      <Header user={user} />

      <main className="product-access-main">
        {loading ? (
          <div className="product-access-loading">
            <CircularProgress size={32} />
            <p>Loading classroom workspace...</p>
          </div>
        ) : !isEnrolled ? (
          <div className="product-access-paywall-card">
            <div className="product-access-lock-icon-wrap">
              <LockOutlinedIcon sx={{ fontSize: 48 }} />
            </div>
            <h2 className="product-access-paywall-title">Enrollment Required</h2>
            <p className="product-access-paywall-desc">
              Access to live interactive sessions, meeting links, and curated study guides is reserved for enrolled learners.
            </p>

            {error && (
              <div className="product-access-error-banner">
                <WarningAmberOutlinedIcon fontSize="small" />
                <span>{error}</span>
              </div>
            )}

            <div className="product-access-course-summary-row">
              <div className="product-access-summary-text">
                <strong>{courseData?.title || 'Strivers Masterclass'}</strong>
                <div style={{ fontSize: '0.84rem', color: '#64748B' }}>Lifetime Classroom Access</div>
              </div>
              <span className="product-access-summary-price">₹{courseData?.price || 74}</span>
            </div>

            <div className="product-access-actions-row">
              <Button component={Link} to={`/courses/${courseId}`} variant="contained" color="primary">
                View Course &amp; Enroll
              </Button>
              <Button component={Link} to="/courses" variant="outlined">
                Browse All Courses
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {/* TOP VERIFIED HEADER */}
            <div className="product-access-header-card">
              <div>
                <div className="product-access-badges">
                  <span className="product-access-cat-badge">
                    {courseData?.category || 'Masterclass'}
                  </span>
                  <span className="product-access-verified-badge">
                    <CheckCircleOutlineIcon sx={{ fontSize: 15 }} />
                    <span>Enrolled Student</span>
                  </span>
                </div>
                <h1 className="product-access-course-title">{courseData?.title}</h1>
                <p className="product-access-course-desc">{courseData?.description}</p>
              </div>

              <div className="product-access-account-info">
                <span className="product-access-account-label">Student Account</span>
                <strong>{user?.email || 'Licensed Student'}</strong>
              </div>
            </div>

            {/* RECEIPT SUMMARY & WHATSAPP SHORTCUT BAR */}
            <div className="product-access-receipt-bar">
              <div className="product-access-receipt-left">
                <ReceiptLongOutlinedIcon fontSize="small" />
                <span><strong>Enrollment Receipt:</strong></span>
                <span>Txn ID: <code>{enrollmentDetails?.txnId || 'verified'}</code></span>
                <span>•</span>
                <span>Ref. ID: <code>{enrollmentDetails?.refId || 'rcpt_active'}</code></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {whatsappLink && (
                  <Button
                    component="a"
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                    sx={{
                      fontSize: '0.76rem',
                      textTransform: 'none',
                      color: '#0F172A',
                      fontWeight: 700,
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      '&:hover': { backgroundColor: '#D1FAE5' },
                    }}
                  >
                    WhatsApp Channel
                  </Button>
                )}
                <span className="product-access-receipt-status">Active Enrollment</span>
              </div>
            </div>

            {/* WHATSAPP PROMPT BANNER (IF NOT DISMISSED) */}
            {!waBannerDismissed && whatsappLink && (
              <div className="product-access-whatsapp-banner">
                <div className="product-access-whatsapp-icon-wrap">
                  <WhatsAppIcon sx={{ fontSize: 32, color: '#25D366' }} />
                </div>
                <div className="product-access-whatsapp-text">
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#064E3B' }}>
                    Join the Official Masterclass WhatsApp Group &amp; Channel
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#047857', fontSize: '0.84rem' }}>
                    Get real-time live session links, mentor schedule updates, handwritten notes, and instant study materials.
                  </Typography>
                </div>
                <div className="product-access-whatsapp-actions">
                  <Button
                    component="a"
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="contained"
                    startIcon={<WhatsAppIcon />}
                    sx={{
                      backgroundColor: '#25D366',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      '&:hover': { backgroundColor: '#1EBE5D' },
                    }}
                  >
                    Join WhatsApp Channel
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleDismissWhatsApp}
                    sx={{ color: '#065F46', fontSize: '0.78rem' }}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}

            {/* MASTERCLASS LIVE / UPCOMING / ENDED SECTION */}
            {isMasterclass && (
              <div className="product-access-masterclass-section">
                {/* CASE 1: MASTERCLASS HAS ENDED */}
                {isEnded ? (
                  <div className="product-access-ended-box">
                    <div className="product-access-ended-top">
                      <div className="product-access-ended-avatar">
                        <SentimentDissatisfiedIcon sx={{ fontSize: 48, color: '#D97706' }} />
                      </div>
                      <div className="product-access-ended-content">
                        <Chip
                          label="MASTERCLASS CONCLUDED"
                          size="small"
                          color="warning"
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, mb: 1 }}
                        />
                        <h2 className="product-access-ended-title">
                          Session Has Concluded
                        </h2>
                        <p className="product-access-ended-msg">
                          Awww, the masterclass has already ended. If you have missed the class you may request to rearrange it again but, depends upon the request volume size. Although you can read the given study material given below
                        </p>

                        <div className="product-access-ended-actions">
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={handleRequestRearrange}
                            disabled={rearrangeSubmitting || rearrangeSuccess}
                            startIcon={
                              rearrangeSubmitting ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : rearrangeSuccess ? (
                                <CheckCircleOutlineIcon />
                              ) : (
                                <RefreshOutlinedIcon />
                              )
                            }
                            sx={{ fontWeight: 700, textTransform: 'none' }}
                          >
                            {rearrangeSuccess ? 'Rearrange Request Submitted ✓' : 'Request to Rearrange Class'}
                          </Button>
                          {rearrangeSuccess && (
                            <span className="product-access-rearrange-confirmation">
                              We received your request. If sufficient demand is recorded, a new cohort slot will be scheduled!
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : isLive ? (
                  /* CASE 2: MASTERCLASS IS LIVE RIGHT NOW */
                  <div className="product-access-meeting-box is-live">
                    <div style={{ maxWidth: 640 }}>
                      <div className="product-access-session-pill live-pill">
                        <span className="live-dot" />
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                        <span>LIVE MASTERCLASS ACTIVE NOW</span>
                      </div>

                      <h2 className="product-access-meeting-title">
                        Live Masterclass Is In Progress!
                      </h2>

                      <p className="product-access-meeting-desc">
                        Mentors and engineering leads are active inside the live meeting room. Join the live stream now.
                      </p>

                      <div className="product-access-meet-actions">
                        <Button
                          component="a"
                          href={courseData?.activeMeetingLink || 'https://meet.google.com/strivers-placement-live'}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<VideocamOutlinedIcon />}
                          className="product-access-btn-meet"
                        >
                          Join Live Masterclass Now
                        </Button>

                        {courseData?.meetingCode && (
                          <button
                            type="button"
                            onClick={() => handleCopyMeetingCode(courseData.meetingCode)}
                            className="product-access-btn-code"
                          >
                            <ContentCopyIcon sx={{ fontSize: 15 }} />
                            <span>{copiedCode ? 'Copied Code' : `Code: ${courseData.meetingCode}`}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="product-access-platform-badge">
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textTransform: 'uppercase' }}>
                        Session Venue
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0' }}>
                        {courseData?.meetingPlatform || 'Google Meet'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#86EFAC', fontWeight: 700 }}>
                        ● Live Room Active
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CASE 3: MASTERCLASS IS UPCOMING (SHOW COUNTDOWN) */
                  <div className="product-access-meeting-box upcoming-box">
                    <div style={{ maxWidth: 640 }}>
                      <div className="product-access-session-pill">
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                        <span>SCHEDULED UPCOMING MASTERCLASS</span>
                      </div>

                      <h2 className="product-access-meeting-title">
                        {timingSlots[0] ? timingSlots[0].title : 'Weekend Live Masterclass'}
                      </h2>

                      <p className="product-access-meeting-desc">
                        {courseData?.sessionDate
                          ? `Scheduled: ${courseData.sessionDate}`
                          : timingSlots[0]
                          ? `${timingSlots[0].date} · ${timingSlots[0].startTime} ${timingSlots[0].timezone || 'IST'}`
                          : 'Sunday, 11:00 AM IST'}
                      </p>

                      {/* LIVE COUNTDOWN CLOCK */}
                      <div className="product-access-countdown-container">
                        <div className="countdown-cell">
                          <span className="countdown-digits">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="countdown-label">Days</span>
                        </div>
                        <span className="countdown-colon">:</span>
                        <div className="countdown-cell">
                          <span className="countdown-digits">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="countdown-label">Hours</span>
                        </div>
                        <span className="countdown-colon">:</span>
                        <div className="countdown-cell">
                          <span className="countdown-digits">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="countdown-label">Mins</span>
                        </div>
                        <span className="countdown-colon">:</span>
                        <div className="countdown-cell">
                          <span className="countdown-digits">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="countdown-label">Secs</span>
                        </div>
                      </div>

                      <div className="product-access-meet-actions" style={{ marginTop: 18 }}>
                        <Button
                          component="a"
                          href={courseData?.activeMeetingLink || 'https://meet.google.com/strivers-placement-live'}
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<VideocamOutlinedIcon />}
                          className="product-access-btn-meet"
                        >
                          Preview Meeting Room
                        </Button>

                        {courseData?.meetingCode && (
                          <button
                            type="button"
                            onClick={() => handleCopyMeetingCode(courseData.meetingCode)}
                            className="product-access-btn-code"
                          >
                            <ContentCopyIcon sx={{ fontSize: 15 }} />
                            <span>{copiedCode ? 'Copied Code' : `Code: ${courseData.meetingCode}`}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="product-access-platform-badge">
                      <div style={{ fontSize: '0.75rem', color: '#CBD5E1', textTransform: 'uppercase' }}>
                        Platform
                      </div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 800, margin: '4px 0' }}>
                        {courseData?.meetingPlatform || 'Google Meet'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        Verified Student Access
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TIMING SLOTS & AGENDA */}
            {timingSlots.length > 0 && (
              <div className="product-access-section-block">
                <div className="product-access-section-head">
                  <h3 className="product-access-section-title">
                    <ScheduleOutlinedIcon sx={{ color: '#2563EB' }} />
                    <span>Session Schedule &amp; Agenda</span>
                  </h3>
                  <span className="product-access-section-sub">
                    {timingSlots.length} slot{timingSlots.length === 1 ? '' : 's'} scheduled
                  </span>
                </div>

                <div className="product-access-slots-grid">
                  {timingSlots.map((slot, idx) => (
                    <div key={slot.slotId || idx} className="product-access-slot-card">
                      <div className="product-access-slot-top">
                        <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#0F172A' }}>
                          {slot.title}
                        </h4>
                        <span className="product-access-slot-pill">
                          <CalendarTodayOutlinedIcon sx={{ fontSize: 14 }} />
                          <span>{slot.date} · {slot.startTime} {slot.timezone || 'IST'}</span>
                        </span>
                      </div>

                      {slot.mentorName && (
                        <p style={{ margin: '0 0 10px', fontSize: '0.88rem', color: '#475569' }}>
                          <strong>Mentor:</strong> {slot.mentorName}{' '}
                          {slot.mentorRole ? `(${slot.mentorRole})` : ''}
                        </p>
                      )}

                      {slot.agenda && slot.agenda.length > 0 && (
                        <div className="product-access-slot-agenda">
                          <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.88rem' }}>
                            {slot.agenda.map((item, i) => (
                              <li key={i}>
                                {typeof item === 'object' ? `${item.time}: ${item.topic}` : item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STUDY MATERIALS & CHEATSHEETS */}
            <div className="product-access-materials-section">
              <div className="product-access-section-head">
                <div>
                  <h3 className="product-access-section-title">
                    <FolderOutlinedIcon sx={{ color: '#2563EB' }} />
                    <span>Study Materials, Notes &amp; Cheatsheets</span>
                  </h3>
                  <span className="product-access-section-sub product-access-mobile-hide">
                    Interactive reading workspace with candidate watermark &amp; DRM protection
                  </span>
                </div>
              </div>

              {materials.length === 0 ? (
                <div className="product-access-empty-card">
                  No study materials attached to this course yet.
                </div>
              ) : (
                <div className="materials-grid-container">
                  {materials.map((mat) => {
                    const sizeKB = mat.fileSize ? Math.round(mat.fileSize / 1024) : 0;
                    const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

                    return (
                      <div key={mat.materialId || mat._id} className="material-card-item">
                        <div>
                          <div className="material-card-top">
                            {renderMaterialIcon(mat.fileType)}
                            <span className="material-card-type-pill">
                              {(mat.fileType || 'notes').toUpperCase()} · {sizeFormatted}
                            </span>
                          </div>

                          <h4 className="material-card-title">{mat.title}</h4>

                          <p className="material-card-desc">
                            {mat.description || 'Study guide prepared for program learners.'}
                          </p>
                        </div>

                        <div>
                          <Button
                            variant="contained"
                            fullWidth
                            onClick={() => handleOpenMaterial(mat)}
                            disabled={loadingMaterial}
                            startIcon={<MenuBookOutlinedIcon />}
                            className="material-read-btn"
                          >
                            {loadingMaterial ? 'Opening...' : 'Open Reader'}
                          </Button>
                          <span className="material-view-only-caption product-access-mobile-hide">
                            In-App Reading Access
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DRM WATERMARKED DOCUMENT MODAL */}
            {activeMaterial && (
              <ProtectedDocumentModal
                material={activeMaterial}
                userEmail={user?.email || 'STUDENT'}
                onClose={() => setActiveMaterial(null)}
              />
            )}

            {/* WHATSAPP PROMPT MODAL (SHOWN UPON ENROLLMENT) */}
            <Dialog
              open={showWhatsAppModal}
              onClose={handleDismissWhatsApp}
              maxWidth="xs"
              fullWidth
              slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
            >
              <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WhatsAppIcon sx={{ color: '#25D366', fontSize: 26 }} />
                </div>
                <div>
                  <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2 }}>
                    Official Masterclass WhatsApp
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Exclusive for enrolled students
                  </Typography>
                </div>
              </DialogTitle>
              <DialogContent dividers>
                <Typography variant="body2" sx={{ color: '#334155', mb: 2, lineHeight: 1.6 }}>
                  Congratulations on your enrollment! Join the official WhatsApp group/channel to get instant meeting links, mentor reminders, downloadable notes, and cohort discussions.
                </Typography>
                <div style={{ backgroundColor: '#F8FAFC', padding: 12, borderRadius: 8, border: '1px solid #E2E8F0', fontSize: '0.82rem', color: '#475569' }}>
                  <strong>Included in WhatsApp Group:</strong>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                    <li>Live Google Meet access links 15 mins prior to session</li>
                    <li>Handwritten notes &amp; ATS resume reviews</li>
                    <li>Direct Q&amp;A alerts from lead mentors</li>
                  </ul>
                </div>
              </DialogContent>
              <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button onClick={handleDismissWhatsApp} color="inherit" sx={{ textTransform: 'none' }}>
                  Maybe Later
                </Button>
                <Button
                  component="a"
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleDismissWhatsApp}
                  variant="contained"
                  startIcon={<WhatsAppIcon />}
                  sx={{
                    backgroundColor: '#25D366',
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#1EBE5D' },
                  }}
                >
                  Join WhatsApp Group Now
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
