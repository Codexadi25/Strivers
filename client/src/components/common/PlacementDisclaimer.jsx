import React from 'react';

export const PlacementDisclaimer = ({ compact = false }) => {
  if (compact) {
    return (
      <div
        style={{
          background: '#FFFBEB',
          border: '1px solid #FDE68A',
          borderRadius: 8,
          padding: '10px 14px',
          fontSize: '0.82rem',
          color: '#92400E',
          lineHeight: 1.5,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 10,
        }}
      >
        <span style={{ fontSize: '1rem', flexShrink: 0 }}>ℹ️</span>
        <div>
          <strong>Guidance & Preparation Notice:</strong> Our live masterclasses and practice sheets are designed to help and guide students to sharpen their interview, resume, and technical skills. We do not provide job placement guarantees or selection assurances.
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        border: '1px solid #F59E0B',
        borderRadius: 14,
        padding: '18px 24px',
        margin: '24px 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        boxShadow: '0 2px 8px rgba(245, 158, 11, 0.08)',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: '#FDE68A',
          color: '#B45309',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.2rem',
          flexShrink: 0,
        }}
      >
        ⚖️
      </div>
      <div>
        <h4 style={{ margin: '0 0 4px', fontSize: '1rem', color: '#92400E', fontWeight: 700 }}>
          Placement Guidance & Mentorship Disclaimer
        </h4>
        <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350F', lineHeight: 1.55 }}>
          Please note that Strivers programs, practice questions, and online live mentorship sessions are strictly intended for <strong>helping and guiding candidates</strong> to elevate their interview readiness, ATS resume structuring, and problem-solving abilities. We do not guarantee, assure, or promise employment, job offers, or final selection by any organization. Hiring decisions remain solely at the discretion of the respective recruiters and companies.
        </p>
      </div>
    </div>
  );
};

export default PlacementDisclaimer;
