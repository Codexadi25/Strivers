import React from 'react';
import UpcomingMasterclassBanner from './UpcomingMasterclassBanner';
import CompanyMarquee from '../common/CompanyMarquee';
import PlacementDisclaimer from '../common/PlacementDisclaimer';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { LIVE_MENTORSHIP } from '../../data/mentorshipData';

export default function MentorshipView({
  activeMentorshipClass,
  isUserEnrolledInClass,
  userAuthData,
  liveMentorshipData,
  onNavigateToNotes,
  onUnlock,
}) {
  const currentMentorship = liveMentorshipData || LIVE_MENTORSHIP;
  const agendaItems =
    activeMentorshipClass?.timingSlots?.[0]?.agenda?.length > 0
      ? activeMentorshipClass.timingSlots[0].agenda
      : currentMentorship.nextSession?.agenda?.length > 0
      ? currentMentorship.nextSession.agenda
      : LIVE_MENTORSHIP.nextSession.agenda;

  const weeklyScheduleItems =
    activeMentorshipClass?.timingSlots?.length > 0
      ? activeMentorshipClass.timingSlots.map((slot) => ({
          day: slot.date || slot.dateTime || 'Live Session',
          time: slot.startTime ? `${slot.startTime} - ${slot.endTime || ''}` : 'IST',
          title: slot.title || activeMentorshipClass.title,
          mentor: slot.mentorName || 'Unicorn Mentors',
        }))
      : currentMentorship.weeklySchedule?.length > 0
      ? currentMentorship.weeklySchedule
      : LIVE_MENTORSHIP.weeklySchedule;

  const recordedSessions =
    currentMentorship.recordedSessions?.length > 0
      ? currentMentorship.recordedSessions
      : LIVE_MENTORSHIP.recordedSessions;

  return (
    <div className="mentorship-container">
      {/* 1. Dynamic Masterclass Hero Banner */}
      <UpcomingMasterclassBanner
        masterclass={activeMentorshipClass}
        isEnrolled={isUserEnrolledInClass}
        user={userAuthData}
        onNavigateToNotes={onNavigateToNotes}
        onUnlock={onUnlock}
      />

      {/* 2. Continuous Loop Company Logo Marquee Ribbon */}
      <CompanyMarquee title="Organizations Where Our Online Session Mentors Have Worked" />

      {/* 3. Placement Guidance Disclaimer */}
      <PlacementDisclaimer />

      {/* 4. Agenda & Schedule Grid */}
      <div className="mentorship-schedule-grid">
        {/* Agenda */}
        <div className="agenda-card">
          <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem' }}>Masterclass Live Agenda</h3>
          <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
            Every minute is engineered to maximize your placement conversion rate.
          </p>

          <div className="timeline-list">
            {agendaItems.map((item, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-time-badge">{item.time}</div>
                <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5 }}>
                  {item.topic}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Schedule & 1-on-1 Mock Booking */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="agenda-card">
            <h3 style={{ margin: '0 0 14px', fontSize: '1.15rem' }}>Weekly Live Timetable</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weeklyScheduleItems.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px',
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 8,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <strong style={{ fontSize: '0.9rem', color: '#0E1B3D' }}>{s.day}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#2563EB', fontWeight: 600 }}>
                      {s.time}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>{s.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: 4 }}>
                    Mentor: {s.mentor}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
              border: '1px solid #F59E0B',
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h4 style={{ margin: '0 0 6px', color: '#92400E' }}>
              Need 1-on-1 Personalized Mentorship?
            </h4>
            <p
              style={{
                margin: '0 0 14px',
                fontSize: '0.88rem',
                color: '#78350F',
                lineHeight: 1.5,
              }}
            >
              Book an exclusive 30-minute resume roast and mock interview with a unicorn team lead.
            </p>
            <button
              className="sheet-btn primary"
              style={{
                background: '#D97706',
                borderColor: '#D97706',
                width: '100%',
                justifyContent: 'center',
              }}
              onClick={() =>
                alert(
                  '1-on-1 Personalized Sessions are reserved for Masterclass attendees. Please join this Sunday live cohort to schedule your slot with the mentors.'
                )
              }
            >
              Request 1-on-1 Mock Session
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recorded Sessions & Masterclass Archives */}
      {recordedSessions && recordedSessions.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: '1.35rem', color: '#0F172A' }}>
              Recorded Mentorship Cohorts &amp; Masterclass Archives
            </h3>
            <p className="muted" style={{ margin: 0, fontSize: '0.9rem' }}>
              Replay past high-yield sessions with unicorn engineers and dark store operators.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}
          >
            {recordedSessions.map((rec) => (
              <div
                key={rec.id}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                }}
              >
                <div>
                  <div style={{ position: 'relative', height: 140, background: '#1E293B' }}>
                    <img
                      src={rec.thumbnail}
                      alt={rec.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        background: 'rgba(0,0,0,0.75)',
                        color: '#FFF',
                        padding: '2px 8px',
                        borderRadius: 4,
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {rec.duration}
                    </span>
                  </div>

                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: 4 }}>
                      {rec.recordedDate} • {rec.mentor}
                    </div>
                    <strong style={{ fontSize: '0.94rem', color: '#0F172A', lineHeight: 1.35, display: 'block' }}>
                      {rec.title}
                    </strong>
                  </div>
                </div>

                <div
                  style={{
                    padding: '10px 14px 14px',
                    display: 'flex',
                    gap: 8,
                    borderTop: '1px solid #F1F5F9',
                  }}
                >
                  <a
                    href={rec.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="sheet-btn primary"
                    style={{ flex: 1, justifyContent: 'center', fontSize: '0.82rem', padding: '6px 10px', textDecoration: 'none' }}
                  >
                    <PlayCircleOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Watch Session</span>
                  </a>
                  <button
                    className="sheet-btn"
                    style={{ fontSize: '0.82rem', padding: '6px 10px' }}
                    onClick={onNavigateToNotes}
                  >
                    <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Notes</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
