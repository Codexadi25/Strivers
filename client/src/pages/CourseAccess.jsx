import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
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
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
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
          setIsEnrolled(Boolean(res.data.isEnrolled));
          if (res.data.enrollmentDetails) {
            setEnrollmentDetails(res.data.enrollmentDetails);
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

  const renderMaterialIcon = (fileType) => {
    if (fileType === 'pdf') return <PictureAsPdfOutlinedIcon sx={{ fontSize: 28, color: '#DC2626' }} />;
    if (fileType === 'cheatsheet') return <BoltOutlinedIcon sx={{ fontSize: 28, color: '#D97706' }} />;
    if (fileType === 'document') return <MenuBookOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />;
    return <DescriptionOutlinedIcon sx={{ fontSize: 28, color: '#2563EB' }} />;
  };

  const isLive = courseData?.sessionStatus === 'live';
  const timingSlots = courseData?.timingSlots || [];
  const materials = courseData?.notesAndPdfs || [];

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
              <span className="product-access-summary-price">₹{courseData?.price || 21}</span>
            </div>

            <div className="product-access-actions-row">
              <Button
                component={Link}
                to={`/courses/${courseId}`}
                variant="contained"
                color="primary"
              >
                View Course & Enroll
              </Button>
              <Button component={Link} to="/" variant="outlined">
                Back to Home
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

            {/* RECEIPT SUMMARY BAR (Desktop Only) */}
            {enrollmentDetails && (
              <div className="product-access-receipt-bar">
                <div className="product-access-receipt-left">
                  <ReceiptLongOutlinedIcon fontSize="small" />
                  <span><strong>Enrollment Receipt:</strong></span>
                  <span>Txn ID: <code>{enrollmentDetails.txnId || 'verified'}</code></span>
                  <span>•</span>
                  <span>Ref. ID: <code>{enrollmentDetails.refId || 'receipt'}</code></span>
                </div>
                <span className="product-access-receipt-status">Active Enrollment</span>
              </div>
            )}

            {/* LIVE SESSION / MEETING ROOM BANNER */}
            <div className={`product-access-meeting-box ${isLive ? 'is-live' : ''}`}>
              <div style={{ maxWidth: 640 }}>
                <div className="product-access-session-pill">
                  <CalendarTodayOutlinedIcon sx={{ fontSize: 15 }} />
                  <span>{isLive ? 'LIVE SESSION ACTIVE' : 'UPCOMING SCHEDULED SESSION'}</span>
                </div>

                <h2 className="product-access-meeting-title">
                  {isLive
                    ? 'Live Session Is Active Right Now'
                    : timingSlots[0]
                    ? `Next Session: ${timingSlots[0].title}`
                    : 'Live Interactive Session Room'}
                </h2>

                <p className="product-access-meeting-desc">
                  {isLive
                    ? 'Mentors and learners are active inside the session room.'
                    : timingSlots[0]
                    ? `${timingSlots[0].date} · ${timingSlots[0].startTime} ${timingSlots[0].timezone || 'IST'}`
                    : 'Join your live session directly via the meeting room link below.'}
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
                    {isLive ? 'Join Live Room' : 'Open Session Room'}
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
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                  Student Access Verified
                </div>
              </div>
            </div>

            {/* TIMING SLOTS */}
            <div className="product-access-section-block">
              <div className="product-access-section-head">
                <h3 className="product-access-section-title">
                  <ScheduleOutlinedIcon sx={{ color: '#2563EB' }} />
                  <span>Session Schedule & Agenda</span>
                </h3>
                <span className="product-access-section-sub">
                  {timingSlots.length} slot{timingSlots.length === 1 ? '' : 's'} scheduled
                </span>
              </div>

              {timingSlots.length === 0 ? (
                <div className="product-access-empty-card">
                  No upcoming timing slots scheduled currently. Check back soon.
                </div>
              ) : (
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
              )}
            </div>

            {/* STUDY MATERIALS & CHEATSHEETS */}
            <div>
              <div className="product-access-section-head">
                <div>
                  <h3 className="product-access-section-title">
                    <FolderOutlinedIcon sx={{ color: '#2563EB' }} />
                    <span>Study Materials, Notes & Cheatsheets</span>
                  </h3>
                  <span className="product-access-section-sub product-access-mobile-hide">
                    Interactive reading workspace with candidate watermark
                  </span>
                </div>
              </div>

              {materials.length === 0 ? (
                <div className="product-access-empty-card">
                  No study materials added for this course yet.
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
                              {mat.fileType} · {sizeFormatted}
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

            {activeMaterial && (
              <ProtectedDocumentModal
                material={activeMaterial}
                userEmail={user?.email || 'STUDENT'}
                onClose={() => setActiveMaterial(null)}
              />
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
