import React from 'react';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';

import StudentWatermarkOverlay from '../secureViewer/StudentWatermarkOverlay';

export default function DashboardModals({
  // Modal 1: Streak
  isStreakModalOpen,
  setIsStreakModalOpen,
  streakData,

  // Modal 2: Problem Note
  activeNoteProblem,
  setActiveNoteProblem,
  currentNoteText,
  setCurrentNoteText,
  saveNote,

  // Modal 3: Note File
  selectedNoteFile,
  setSelectedNoteFile,

  // Modal 4: Plan DSA Journey
  isPlanModalOpen,
  setIsPlanModalOpen,

  // Modal 5: Group Study
  isGroupStudyModalOpen,
  setIsGroupStudyModalOpen,

  // Modal 6: Operational Scenario
  activeScenarioModal,
  setActiveScenarioModal,

  // Security Toast
  screenshotWarningNotice,
  setScreenshotWarningNotice,

  // Modal 8: Secret Passcode
  activeSecretCodeNote,
  setActiveSecretCodeNote,
  inputSecretCode,
  setInputSecretCode,
  secretCodeError,
  secretCodeSuccess,
  isRedeemingCode,
  handleRedeemSecretCode,

  // Modal 9: DRM Viewer
  drmActiveNote,
  setDrmActiveNote,
  isDocumentObfuscated,
  drmContent,
  isDrmLoading,
  userAuthData,
  userProfile,
}) {
  return (
    <>
      {/* ====================================================================
          MODAL 1: Streak Details (Image 4)
          ==================================================================== */}
      {isStreakModalOpen && (
        <div className="modal-overlay" onClick={() => setIsStreakModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Streak Details</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Your daily consistency overview
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsStreakModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              {/* Quad stats */}
              <div className="streak-metrics-quad">
                <div className="quad-card">
                  <div className="quad-card-title">
                    <LocalFireDepartmentIcon sx={{ fontSize: 16, color: '#D97706' }} />
                    <span>Current Week</span>
                  </div>
                  <div className="quad-card-value">
                    {
                      Array.from(streakData.activeDaysSet).filter(
                        (d) => Math.abs(d - streakData.todayDateNum) <= 6
                      ).length
                    }{' '}
                    days
                  </div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <EmojiEventsOutlinedIcon sx={{ fontSize: 16, color: '#2563EB' }} />
                    <span>Best Streak</span>
                  </div>
                  <div className="quad-card-value">{streakData.bestStreak || 0} days</div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: '#059669' }} />
                    <span>Current Month</span>
                  </div>
                  <div className="quad-card-value">{streakData.activeDaysSet.size} days</div>
                </div>

                <div className="quad-card">
                  <div className="quad-card-title">
                    <TrendingUpIcon sx={{ fontSize: 16, color: '#7C3AED' }} />
                    <span>Total Active Days</span>
                  </div>
                  <div className="quad-card-value">{streakData.totalActiveDays || 0} days</div>
                </div>
              </div>

              {/* Total Active Banner */}
              <div
                style={{
                  background: '#EFF6FF',
                  border: '1px solid #BFDBFE',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
                    Days Active This Month
                  </div>
                  <strong style={{ fontSize: '1.25rem', color: '#1E3A8A' }}>
                    {streakData.activeDaysSet.size} Active Learning Days
                  </strong>
                </div>
                <div style={{ fontSize: '1.8rem' }}>🔥</div>
              </div>

              {/* Streak Info Paragraph */}
              <p
                style={{
                  fontSize: '0.88rem',
                  color: '#475569',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                }}
              >
                Consistency is key to cracking technical and operational interviews. Solve at least
                one interview scenario or technical challenge daily to extend your learning streak.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="sheet-btn primary"
                  onClick={() => setIsStreakModalOpen(false)}
                >
                  Close &amp; Continue Practice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: Personal Problem Note Editor
          ==================================================================== */}
      {activeNoteProblem && (
        <div className="modal-overlay" onClick={() => setActiveNoteProblem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Personal Problem Note</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {activeNoteProblem.title}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveNoteProblem(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ margin: '0 0 12px', fontSize: '0.9rem', color: '#475569' }}>
                Save your personal key takeaways, edge cases, time/space complexities, or custom
                tips for revision.
              </p>
              <textarea
                rows={6}
                value={currentNoteText}
                onChange={(e) => setCurrentNoteText(e.target.value)}
                placeholder="e.g. Remember to handle negative numbers in Kadane's algorithm. Edge case: all elements negative..."
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  fontFamily: 'var(--body)',
                  fontSize: '0.92rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 16,
                }}
              >
                <button
                  className="sheet-btn"
                  onClick={() => setActiveNoteProblem(null)}
                >
                  Cancel
                </button>
                <button className="sheet-btn primary" onClick={saveNote}>
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: Note File Preview / Download Modal
          ==================================================================== */}
      {selectedNoteFile && (
        <div className="modal-overlay" onClick={() => setSelectedNoteFile(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>{selectedNoteFile.title}</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  {selectedNoteFile.tag}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedNoteFile(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: '#334155' }}>
                {selectedNoteFile.previewText}
              </p>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px dashed #CBD5E1',
                  borderRadius: 10,
                  padding: 16,
                  margin: '16px 0',
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    marginBottom: 6,
                  }}
                >
                  Included Resources:
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 20,
                    fontSize: '0.85rem',
                    color: '#475569',
                  }}
                >
                  <li>Complete handwritten high-yield summary PDF</li>
                  <li>Interview Q&amp;A bank with solutions &amp; code snippets</li>
                  <li>Diagrammatic architectures &amp; mental models</li>
                </ul>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  className="sheet-btn"
                  onClick={() => setSelectedNoteFile(null)}
                >
                  Close
                </button>
                <button
                  className="sheet-btn primary"
                  onClick={() => {
                    alert(`Starting download for ${selectedNoteFile.title} PDF notes!`);
                    setSelectedNoteFile(null);
                  }}
                >
                  Download PDF Notes 📥
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 4: Plan Your DSA Journey Creator
          ==================================================================== */}
      {isPlanModalOpen && (
        <div className="modal-overlay" onClick={() => setIsPlanModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Create Your DSA Roadmap</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Custom timeline generator
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsPlanModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 16px' }}>
                Choose your target interview preparation window. We will automatically calculate the daily
                problem target for you:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    weeks: 4,
                    label: 'Fast-Track (4 Weeks)',
                    desc: '6-7 problems daily · For immediate upcoming interviews',
                  },
                  {
                    weeks: 8,
                    label: 'Standard Master (8 Weeks)',
                    desc: '3-4 problems daily · Recommended for placement season',
                  },
                  {
                    weeks: 12,
                    label: 'Deep Mastery (12 Weeks)',
                    desc: '2 problems daily · In-depth foundational mastery',
                  },
                ].map((plan) => (
                  <div
                    key={plan.weeks}
                    style={{
                      padding: 14,
                      border: '1.5px solid #E2E8F0',
                      borderRadius: 10,
                      cursor: 'pointer',
                      background: '#F8FAFC',
                    }}
                    onClick={() => {
                      alert(`Personalized ${plan.label} plan activated! Daily goal set.`);
                      setIsPlanModalOpen(false);
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: '#0E1B3D' }}>
                      {plan.label}
                    </strong>
                    <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 4 }}>
                      {plan.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 5: Group Study & CodeBuddies
          ==================================================================== */}
      {isGroupStudyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsGroupStudyModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Find a Group Study Partner</h3>
                <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                  Pair programming &amp; peer mock interviews
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsGroupStudyModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 16px' }}>
                Connect with active strivers preparing for the same target companies. Compare problem
                approaches, share live code, and conduct peer mocks.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  {
                    name: 'Kavya R.',
                    target: 'Amazon SDE-1',
                    solved: '124 Qs solved',
                    active: 'Active now',
                  },
                  {
                    name: 'Rohan M.',
                    target: 'Google SWE',
                    solved: '148 Qs solved',
                    active: 'Active 10m ago',
                  },
                  {
                    name: 'Sameer K.',
                    target: 'Blinkit / Zomato',
                    solved: '92 Qs solved',
                    active: 'Active now',
                  },
                ].map((buddy, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 10,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>
                        {buddy.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                        Target: {buddy.target} • {buddy.solved}
                      </div>
                    </div>
                    <button
                      className="sheet-btn primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => {
                        alert(`Study partner request sent to ${buddy.name}!`);
                        setIsGroupStudyModalOpen(false);
                      }}
                    >
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 6: Operational Business Scenario & Case Study Modal (Non-Tech)
          ==================================================================== */}
      {activeScenarioModal && (
        <div className="modal-overlay" onClick={() => setActiveScenarioModal(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 680, width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <span className="company-badge" style={{ fontWeight: 800 }}>
                    {activeScenarioModal.company}
                  </span>
                  <span
                    className={`diff-pill ${activeScenarioModal.difficulty.toLowerCase()}`}
                  >
                    {activeScenarioModal.difficulty}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 600 }}>
                    {activeScenarioModal.type}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0E1B3D' }}>
                  {activeScenarioModal.title}
                </h3>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveScenarioModal(null)}
              >
                ✕
              </button>
            </div>

            <div
              className="modal-body"
              style={{ maxHeight: '72vh', overflowY: 'auto' }}
            >
              {/* Scenario Context */}
              <div style={{ marginBottom: 16 }}>
                <h4
                  style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B' }}
                >
                  📦 Real-World Operational Scenario:
                </h4>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderLeft: '4px solid #2563EB',
                    borderRadius: 8,
                    padding: '12px 16px',
                    fontSize: '0.92rem',
                    lineHeight: 1.6,
                    color: '#334155',
                  }}
                >
                  {activeScenarioModal.scenario}
                </div>
              </div>

              {/* Recommended Framework & Solution */}
              {activeScenarioModal.framework && (
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B' }}
                  >
                    🎯 Recommended Interview Framework &amp; Trade-offs:
                  </h4>
                  <div
                    style={{
                      background: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      color: '#065F46',
                    }}
                  >
                    {activeScenarioModal.framework}
                  </div>
                </div>
              )}

              {/* Mentorship Tips & KPIs */}
              {activeScenarioModal.tips && (
                <div style={{ marginBottom: 16 }}>
                  <h4
                    style={{ margin: '0 0 6px', fontSize: '0.95rem', color: '#1E293B' }}
                  >
                    💡 Unicorn Mentorship Tips &amp; Metrics:
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '0.88rem',
                      color: '#64748B',
                      lineHeight: 1.5,
                    }}
                  >
                    {activeScenarioModal.tips}
                  </p>
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 10,
                  marginTop: 20,
                }}
              >
                <button
                  className="sheet-btn primary"
                  onClick={() => setActiveScenarioModal(null)}
                >
                  Close Scenario
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          SECURITY BANNER: Mandatory Screen Capture & Print Warning
          ==================================================================== */}
      {screenshotWarningNotice && (
        <div className="drm-security-toast" role="alert">
          <span style={{ fontSize: '1.4rem' }}>🛑</span>
          <span>You can not take Screenshot or Print this page</span>
        </div>
      )}

      {/* ====================================================================
          MODAL: Masterclass Attendee Secret Passcode Redemption
          ==================================================================== */}
      {activeSecretCodeNote && (
        <div className="modal-overlay" onClick={() => setActiveSecretCodeNote(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 520, width: '92%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.6rem' }}>🔑</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.18rem', color: '#0E1B3D' }}>
                    Unlock Paid Note
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748B' }}>
                    Masterclass Attendee Privilege
                  </span>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setActiveSecretCodeNote(null)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div
                style={{
                  background: '#F5F3FF',
                  border: '1px solid #DDD6FE',
                  borderRadius: 10,
                  padding: '14px 16px',
                  marginBottom: 16,
                }}
              >
                <strong
                  style={{
                    color: '#5B21B6',
                    fontSize: '0.92rem',
                    display: 'block',
                    marginBottom: 4,
                  }}
                >
                  {activeSecretCodeNote.title}
                </strong>
                <p
                  style={{
                    margin: 0,
                    fontSize: '0.84rem',
                    color: '#6D28D9',
                    lineHeight: 1.5,
                  }}
                >
                  This is a <strong>Paid Note</strong>. All attending students currently
                  enrolled in the live Masterclass receive a secret attendee passcode from the
                  mentor in Google Meet to unlock this document for free.
                </p>
              </div>

              {secretCodeError && (
                <div
                  style={{
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#DC2626',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    marginBottom: 14,
                  }}
                >
                  ⚠️ {secretCodeError}
                </div>
              )}

              {secretCodeSuccess && (
                <div
                  style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    padding: '10px 14px',
                    borderRadius: 8,
                    fontSize: '0.85rem',
                    marginBottom: 14,
                    fontWeight: 600,
                  }}
                >
                  {secretCodeSuccess}
                </div>
              )}

              <form onSubmit={handleRedeemSecretCode}>
                <div style={{ marginBottom: 16 }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#334155',
                      marginBottom: 6,
                    }}
                  >
                    Enter Masterclass Secret Code:
                  </label>
                  <input
                    type="text"
                    className="input-control"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      fontSize: '1rem',
                      fontFamily: 'var(--mono, monospace)',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      border: '1.5px solid #CBD5E1',
                      borderRadius: 8,
                    }}
                    placeholder="e.g. STRIVERS2026"
                    value={inputSecretCode}
                    onChange={(e) => setInputSecretCode(e.target.value)}
                    required
                    autoFocus
                  />
                  <span
                    style={{
                      fontSize: '0.76rem',
                      color: '#94A3B8',
                      marginTop: 4,
                      display: 'block',
                    }}
                  >
                    * Code is announced during the live Sunday masterclass session.
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    className="sheet-btn"
                    onClick={() => setActiveSecretCodeNote(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="sheet-btn primary"
                    style={{
                      padding: '8px 20px',
                      background: '#7C3AED',
                      borderColor: '#7C3AED',
                    }}
                    disabled={isRedeemingCode}
                  >
                    {isRedeemingCode ? 'Verifying...' : 'Verify & Unlock Note'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: Secure DRM View-Only Document Viewer (PDF & HTML)
          ==================================================================== */}
      {drmActiveNote && (
        <div
          className="modal-overlay"
          style={{ background: 'rgba(10, 15, 29, 0.92)', zIndex: 99990 }}
          onClick={() => setDrmActiveNote(null)}
        >
          <div
            className={`drm-protected-viewer ${
              isDocumentObfuscated ? 'obfuscated' : ''
            }`}
            style={{
              width: 'min(1100px, 95vw)',
              height: 'min(92vh, 880px)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)',
              border: '1px solid #334155',
            }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => {
              e.preventDefault();
              setScreenshotWarningNotice(true);
              setTimeout(() => setScreenshotWarningNotice(false), 3000);
            }}
          >
            {/* Viewer Topbar */}
            <div
              className="drm-reader-toolbar"
              style={{
                background: '#0F172A',
                color: '#F8FAFC',
                borderBottom: '1px solid #1E293B',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  minWidth: 0,
                  flex: 1,
                }}
              >
                <MenuBookIcon sx={{ color: '#38BDF8', fontSize: 22 }} />
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: '0.96rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {drmContent?.title || drmActiveNote.title}
                    </span>
                    <span
                      className="drm-mobile-hide"
                      style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: 4,
                        background:
                          drmActiveNote.type === 'paid' ? '#7C3AED' : '#10B981',
                        color: '#FFF',
                        textTransform: 'uppercase',
                        fontWeight: 700,
                      }}
                    >
                      {drmActiveNote.type === 'paid'
                        ? 'Member Access'
                        : 'Open Resource'}
                    </span>
                  </div>
                  <span
                    className="drm-mobile-hide"
                    style={{ fontSize: '0.76rem', color: '#94A3B8' }}
                  >
                    In-App Reading Mode
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  className="drm-mobile-hide"
                  style={{
                    fontSize: '0.74rem',
                    color: '#38BDF8',
                    fontFamily: 'var(--mono, monospace)',
                    background: 'rgba(56, 189, 248, 0.1)',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  Student:{' '}
                  {userAuthData?.email || userProfile?.email || 'Authenticated'}
                </span>
                <IconButton
                  size="small"
                  aria-label="Close document viewer"
                  sx={{ color: '#F8FAFC' }}
                  onClick={() => setDrmActiveNote(null)}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </div>
            </div>

            {/* Viewer Body & Document Canvas */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 auto',
                overflow: 'hidden',
                background: '#FFFFFF',
              }}
            >
              {/* Default Irremovable Student Watermark Matrix */}
              <StudentWatermarkOverlay
                studentLabel={
                  userAuthData?.email || userProfile?.email || 'STUDENT'
                }
                theme="light"
              />

              {/* Obfuscation Shield */}
              {isDocumentObfuscated && (
                <div className="drm-blocker-shield">
                  <ShieldOutlinedIcon sx={{ fontSize: 44, color: '#EF4444', mb: 1 }} />
                  <h3
                    style={{
                      margin: '0 0 8px',
                      fontSize: '1.2rem',
                      color: '#EF4444',
                    }}
                  >
                    Content Hidden While Window Unfocused
                  </h3>
                  <p
                    style={{
                      maxWidth: 420,
                      fontSize: '0.88rem',
                      color: '#CBD5E1',
                      margin: 0,
                    }}
                  >
                    Return focus to the reading window to continue viewing your study
                    notes.
                  </p>
                </div>
              )}

              {/* Document Rendering Frame */}
              <div
                className="drm-document-frame"
                style={{
                  width: '100%',
                  height: '100%',
                  overflowY: 'auto',
                  padding: '20px 24px',
                }}
              >
                {isDrmLoading ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '72px 20px',
                      color: '#64748B',
                    }}
                  >
                    <div>Loading study document...</div>
                  </div>
                ) : drmContent?.fileType === 'pdf' ? (
                  <iframe
                    title="Study Document Viewer"
                    src={`data:application/pdf;base64,${drmContent.fileData}#toolbar=0&navpanes=0&scrollbar=0`}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: drmContent?.fileData
                        ? atob(drmContent.fileData)
                        : `<p style="padding: 24px; color: #64748b;">Loading document preview...</p>`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Viewer Bottom Footer Bar */}
            <div
              style={{
                padding: '8px 18px',
                background: '#F8FAFC',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
                fontSize: '0.78rem',
                color: '#64748B',
              }}
            >
              <span>
                Student Watermark:{' '}
                {userAuthData?.email || userProfile?.email || 'Authenticated'}
              </span>
              <button
                className="sheet-btn drm-mobile-hide"
                style={{ padding: '4px 14px', fontSize: '0.8rem' }}
                onClick={() => setDrmActiveNote(null)}
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
