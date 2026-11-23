import React from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBookIcon from '@mui/icons-material/MenuBook';

export default function NotesResourcesView({
  userAuthData,
  userProfile,
  filteredNotes = [],
  onOpenNote,
}) {
  const navigate = useNavigate();

  if (!userAuthData && !userProfile) {
    return (
      <div
        style={{
          padding: '60px 24px',
          textAlign: 'center',
          background: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          margin: '20px 0',
        }}
      >
        <div style={{ fontSize: '3.6rem', marginBottom: 16 }}>🔒</div>
        <h2
          style={{
            fontSize: '1.7rem',
            color: '#0E1B3D',
            margin: '0 0 10px',
            fontWeight: 800,
          }}
        >
          Sign In Required to Access Downloadable Notes
        </h2>
        <p
          style={{
            maxWidth: 540,
            margin: '0 auto 24px',
            color: '#64748B',
            lineHeight: 1.6,
            fontSize: '0.96rem',
          }}
        >
          A regular user who has not logged in cannot access the Downloadable Notes section.
          Please sign in or register an account to browse free handwritten notes, cheatsheets,
          and unlock VIP Masterclass resources.
        </p>
        <button
          className="sheet-btn primary"
          style={{ padding: '12px 30px', fontSize: '1rem', fontWeight: 700 }}
          onClick={() => navigate('/login')}
        >
          Sign In to Unlock Notes Vault ↗
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="notes-page-header">
        <div className="breadcrumb">
          <span>DSA Sheet</span>
          <span>›</span>
          <span>Study Material Vault</span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 14,
          }}
        >
          <div>
            <h1 style={{ fontFamily: 'var(--display)', fontSize: '2.1rem', margin: '0 0 6px' }}>
              Downloadable Notes &amp; Engineering Vault
            </h1>
            <p className="muted" style={{ margin: 0 }}>
              Curated high-yield engineering notes, dark store playbooks, study guides, and
              cheatsheets.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: 99,
                background: '#DCFCE7',
                color: '#16A34A',
                fontWeight: 700,
              }}
            >
              Free Notes
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                padding: '4px 10px',
                borderRadius: 99,
                background: '#EDE9FE',
                color: '#7C3AED',
                fontWeight: 700,
              }}
            >
              Member Notes
            </span>
          </div>
        </div>
      </div>

      <div className="notes-grid">
        {filteredNotes.map((note) => {
          const isPaid = note.type === 'paid';
          const isUnlocked = note.hasAccess || !isPaid;

          return (
            <div key={note.noteId || note.id} className="note-card">
              <div
                className="note-card-banner"
                style={{
                  background: isPaid
                    ? 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)'
                    : undefined,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '0 12px',
                  }}
                >
                  <span className="note-card-badge">{note.tag}</span>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: 99,
                      background: isPaid ? (isUnlocked ? '#10B981' : '#F59E0B') : '#10B981',
                      color: '#FFFFFF',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isPaid ? (isUnlocked ? 'Unlocked' : 'Member Only') : 'Free'}
                  </span>
                </div>
                <div style={{ textAlign: 'center', marginTop: 8 }}>
                  <MenuBookIcon sx={{ fontSize: 38, color: '#FFFFFF' }} />
                </div>
              </div>

              <div className="note-card-body">
                <h3 className="note-card-title">{note.title}</h3>
                <p className="note-card-subtitle">{note.subtitle}</p>

                <div
                  className="drm-mobile-hide"
                  style={{
                    fontSize: '0.78rem',
                    color: '#64748B',
                    margin: '8px 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>Format:</span>{' '}
                  <span
                    style={{
                      textTransform: 'uppercase',
                      background: '#F1F5F9',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    {note.fileType || 'HTML/PDF'}
                  </span>
                  {note.fileSize && <span>• {(note.fileSize / 1024).toFixed(0)} KB</span>}
                </div>

                <div className="note-card-footer">
                  <span
                    className="note-file-count"
                    style={{
                      color: isPaid && !isUnlocked ? '#D97706' : '#16A34A',
                      fontWeight: 600,
                    }}
                  >
                    {isPaid
                      ? isUnlocked
                        ? '✓ Full Access'
                        : 'Secret Code Required'
                      : 'Free Access'}
                  </span>
                  <button
                    className="sheet-btn primary"
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.85rem',
                      background: isPaid && !isUnlocked ? '#7C3AED' : undefined,
                      borderColor: isPaid && !isUnlocked ? '#7C3AED' : undefined,
                    }}
                    onClick={() => onOpenNote(note)}
                  >
                    {isPaid && !isUnlocked ? (
                      <span>🔑 Enter Secret Code</span>
                    ) : (
                      <span>View Document ↗</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
