import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import Navbar from '../components/common/Navbar';
import { ProtectedDocumentModal } from '../components/secureViewer/ProtectedDocumentModal';
import '../assets/styles/secureViewer.css';

export default function ProductAccess() {
  const { id } = useParams();
  const courseId = id || 'masterclass';

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Active Document DRM Viewer State
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');

    // Fetch user details
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => setUser(null));

    // Fetch classroom course access
    api
      .get(`/products/${courseId}/access`)
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

  // Open DRM Protected Document Reader
  async function handleOpenMaterial(mat) {
    setLoadingMaterial(true);
    try {
      const matId = mat.materialId || mat._id;
      const res = await api.get(`/products/${courseId}/materials/${matId}`);
      if (res.data.success && res.data.material) {
        setActiveMaterial(res.data.material);
      } else {
        alert('Failed to load protected study document.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error opening secure study material.');
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

  const isLive = courseData?.sessionStatus === 'live';
  const timingSlots = courseData?.timingSlots || [];
  const materials = courseData?.notesAndPdfs || [];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#F8FAFC' }}>
      <Navbar />

      <main className="product-access-main" style={{ flex: 1, maxWidth: 1060, margin: '32px auto 60px', padding: '0 20px', width: '100%' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
            <p style={{ color: '#64748B', fontSize: '1.05rem' }}>Verifying classroom security credentials...</p>
          </div>
        ) : !isEnrolled ? (
          /* PAYWALL / UNENROLLED SCREEN */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '48px 32px',
              textAlign: 'center',
              maxWidth: 640,
              margin: '40px auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔒</div>
            <h2 style={{ color: '#0F172A', fontSize: '1.6rem', margin: '0 0 10px' }}>
              Enrollment Required
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.98rem', lineHeight: 1.6, margin: '0 0 24px' }}>
              Access to live interactive sessions, meeting links, and protected DRM study material is reserved for enrolled students.
            </p>

            {error && (
              <div
                style={{
                  background: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#B91C1C',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '20px',
                  fontSize: '0.88rem',
                }}
              >
                ⚠️ {error}
              </div>
            )}

            <div
              style={{
                background: '#F1F5F9',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <strong style={{ color: '#0F172A', display: 'block' }}>{courseData?.title || 'Strivers Masterclass'}</strong>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Permanent Lifetime Access Pass</span>
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563EB' }}>
                ₹{courseData?.price || 21}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/products" className="btn btn-primary" style={{ padding: '12px 28px', fontWeight: 700 }}>
                Enroll Now & Unlock Access →
              </Link>
              <Link to="/" className="btn btn-secondary" style={{ padding: '12px 20px' }}>
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* ENROLLED STUDENT CLASSROOM HUB */
          <div>
            {/* Top Verified Header */}
            <div
              style={{
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px',
                padding: '24px 28px',
                marginBottom: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      background: '#DBEAFE',
                      color: '#1D4ED8',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '99px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {courseData?.category || 'Masterclass'}
                  </span>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#15803D',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '99px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>✓</span> Verified Student Access
                  </span>
                </div>
                <h1 style={{ margin: '0 0 6px', fontSize: '1.8rem', color: '#0F172A' }}>
                  {courseData?.title}
                </h1>
                <p style={{ margin: 0, color: '#64748B', fontSize: '0.95rem' }}>
                  {courseData?.description}
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', color: '#94A3B8', display: 'block' }}>Student Account</span>
                <strong style={{ fontSize: '0.95rem', color: '#0F172A' }}>
                  {user?.email || 'Licensed Student'}
                </strong>
              </div>
            </div>

            {/* Verified Payment Transaction Credentials (Txn ID & Ref. ID) */}
            {enrollmentDetails && (
              <div
                style={{
                  background: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px',
                  fontSize: '0.86rem',
                  color: '#166534',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '1.2rem' }}>🧾</span>
                  <span><strong>Verified Payment Receipt:</strong></span>
                  <span>Txn ID: <code style={{ color: '#047857', fontWeight: 700 }}>{enrollmentDetails.txnId || 'pay_verified'}</code></span>
                  <span>•</span>
                  <span>Ref. ID: <code style={{ color: '#2563EB', fontWeight: 700 }}>{enrollmentDetails.refId || 'rcpt_verified'}</code></span>
                </div>
                <span style={{ background: '#DCFCE7', color: '#15803D', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', fontSize: '0.78rem' }}>
                  Status: Captured (Success)
                </span>
              </div>
            )}

            {/* LIVE BROADCAST & MEETING ROOM CARD */}
            <div
              style={{
                background: isLive
                  ? 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 100%)'
                  : 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                padding: '28px',
                marginBottom: '28px',
                boxShadow: isLive
                  ? '0 10px 30px rgba(220, 38, 38, 0.35)'
                  : '0 10px 25px rgba(15, 23, 42, 0.15)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ maxWidth: 640 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '4px 12px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '10px' }}>
                    {isLive ? (
                      <>
                        <span className="pulse-dot red"></span>
                        <span style={{ color: '#FEE2E2' }}>LIVE IN PROGRESS NOW</span>
                      </>
                    ) : (
                      <>
                        <span>📅</span>
                        <span style={{ color: '#E2E8F0' }}>UPCOMING SCHEDULED SESSION</span>
                      </>
                    )}
                  </div>

                  <h2 style={{ margin: '0 0 8px', fontSize: '1.5rem', color: '#FFFFFF' }}>
                    {isLive
                      ? 'Live Online Class is Active Right Now!'
                      : timingSlots[0]
                      ? `Next Session: ${timingSlots[0].title}`
                      : 'Live Interactive Session Room'}
                  </h2>

                  <p style={{ margin: '0 0 16px', color: isLive ? '#FECACA' : '#94A3B8', fontSize: '0.92rem', lineHeight: 1.5 }}>
                    {isLive
                      ? 'Mentors and students are currently online in the Google Meet room. Camera and mic are interactive.'
                      : timingSlots[0]
                      ? `${timingSlots[0].date} · ${timingSlots[0].startTime} ${timingSlots[0].timezone || 'IST'}. Pre-join early to test audio.`
                      : 'Join Google Meet live session using the verified student button below.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <a
                      href={courseData?.activeMeetingLink || 'https://meet.google.com/strivers-placement-live'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn"
                      style={{
                        background: '#FFFFFF',
                        color: isLive ? '#DC2626' : '#0F172A',
                        fontWeight: 800,
                        fontSize: '1rem',
                        padding: '12px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                      }}
                    >
                      <span>🎥</span>
                      <span>{isLive ? 'Join Live Room Now →' : 'Join Google Meet Room →'}</span>
                    </a>

                    {courseData?.meetingCode && (
                      <button
                        onClick={() => handleCopyMeetingCode(courseData.meetingCode)}
                        style={{
                          background: 'rgba(255,255,255,0.12)',
                          color: '#FFFFFF',
                          border: '1px solid rgba(255,255,255,0.25)',
                          borderRadius: '10px',
                          padding: '11px 16px',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {copiedCode ? '✓ Copied Room Code!' : `Code: ${courseData.meetingCode} 📋`}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    textAlign: 'center',
                    minWidth: 200,
                  }}
                >
                  <span style={{ fontSize: '0.78rem', color: '#CBD5E1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Meeting Platform
                  </span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', margin: '4px 0' }}>
                    {courseData?.meetingPlatform || 'Google Meet'}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                    Verified Student Credentials
                  </span>
                </div>
              </div>
            </div>

            {/* TIMING SLOTS & CURRICULUM SCHEDULE */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>⏱️</span>
                  <span>Session Timing Slots & Curriculum Agenda</span>
                </h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {timingSlots.length} slot{timingSlots.length === 1 ? '' : 's'} scheduled
                </span>
              </div>

              {timingSlots.length === 0 ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748B' }}>
                  No upcoming timing slots scheduled currently. Check back soon.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '14px' }}>
                  {timingSlots.map((slot, idx) => (
                    <div
                      key={slot.slotId || idx}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#0F172A' }}>
                          {slot.title}
                        </h4>
                        <span
                          style={{
                            background: '#EFF6FF',
                            color: '#1D4ED8',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            padding: '4px 12px',
                            borderRadius: '99px',
                            border: '1px solid #DBEAFE',
                          }}
                        >
                          📅 {slot.date} · ⏰ {slot.startTime} {slot.timezone || 'IST'}
                        </span>
                      </div>

                      {slot.mentorName && (
                        <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: '#475569' }}>
                          <strong>Mentor:</strong> {slot.mentorName}{' '}
                          {slot.mentorRole ? `(${slot.mentorRole})` : ''}
                        </p>
                      )}

                      {slot.agenda && slot.agenda.length > 0 && (
                        <div style={{ background: '#F8FAFC', borderRadius: '8px', padding: '12px 16px', border: '1px solid #F1F5F9' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Session Agenda & Breakdown
                          </span>
                          <ul style={{ margin: 0, paddingLeft: '18px', color: '#334155', fontSize: '0.88rem' }}>
                            {slot.agenda.map((item, i) => (
                              <li key={i} style={{ marginBottom: '4px' }}>
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

            {/* PROTECTED STUDY MATERIAL & DRM DOCUMENTS (STORED IN MONGODB) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '1.25rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📁</span>
                    <span>Protected Study Materials, Notes & Cheatsheets</span>
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Stored directly in MongoDB · In-App Canvas DRM Reader with Student Watermarks
                  </span>
                </div>

                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>🔒</span>
                  <span>Direct Download & Print Permanently Blocked</span>
                </div>
              </div>

              {materials.length === 0 ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '28px', textAlign: 'center', color: '#64748B' }}>
                  No study materials uploaded for this course yet.
                </div>
              ) : (
                <div className="materials-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '14px' }}>
                  {materials.map((mat) => {
                    const icons = {
                      pdf: '📄',
                      notes: '📝',
                      cheatsheet: '⚡',
                      document: '📑',
                    };
                    const sizeKB = mat.fileSize ? Math.round(mat.fileSize / 1024) : 0;
                    const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

                    return (
                      <div
                        key={mat.materialId || mat._id}
                        className="material-card-item"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid #E2E8F0',
                          borderRadius: '12px',
                          padding: '20px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                          transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '1.8rem' }}>{icons[mat.fileType] || '📄'}</span>
                            <span
                              style={{
                                background: '#EFF6FF',
                                color: '#2563EB',
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '3px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase',
                              }}
                            >
                              {mat.fileType} · {sizeFormatted}
                            </span>
                          </div>

                          <h4 style={{ margin: '0 0 6px', fontSize: '1.05rem', color: '#0F172A' }}>
                            {mat.title}
                          </h4>

                          <p style={{ margin: '0 0 16px', fontSize: '0.86rem', color: '#64748B', lineHeight: 1.5 }}>
                            {mat.description || 'Verified study resource for masterclass session.'}
                          </p>
                        </div>

                        <div>
                          <button
                            onClick={() => handleOpenMaterial(mat)}
                            disabled={loadingMaterial}
                            className="btn btn-primary btn-block"
                            style={{
                              background: '#2563EB',
                              borderColor: '#2563EB',
                              fontWeight: 700,
                              fontSize: '0.88rem',
                              padding: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <span>🔒</span>
                            <span>{loadingMaterial ? 'Decrypting...' : 'Read Document In-App'}</span>
                          </button>
                          <span style={{ display: 'block', textAlign: 'center', fontSize: '0.72rem', color: '#94A3B8', marginTop: '6px' }}>
                            View-Only Mode · No Download
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* DRM PROTECTED DOCUMENT MODAL */}
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
    </div>
  );
}
