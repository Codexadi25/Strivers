import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import KeyIcon from '@mui/icons-material/Key';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import './MasterclassCard.css';

export default function MasterclassCard({
  masterclass,
  onEditMeeting,
  onManageSlots,
  onManageMaterials,
  onEditDetails,
  onDelete,
}) {
  const m = masterclass;
  const rawPaise = m.priceInPaise || Math.round(Number(m.price || 0) * 100);
  const mentors =
    m.mentors && m.mentors.length > 0
      ? m.mentors
      : [
          { name: 'Alex Morgan', role: 'SDE-2 @ Blinkit' },
          { name: 'Priya Sharma', role: 'Staff Engineer @ Zomato' },
        ];

  return (
    <Card variant="outlined" className="sc-mc-card">
      <div>
        <div className="sc-mc-card-top">
          <div className="sc-mc-chips">
            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label="MASTERCLASS (SCHEMA: MASTERCLASS)"
              sx={{ fontWeight: 700, fontSize: '0.68rem' }}
            />
            <Chip
              size="small"
              color={m.sessionStatus === 'live' ? 'error' : m.sessionStatus === 'ended' ? 'warning' : 'info'}
              label={(m.sessionStatus || 'UPCOMING').toUpperCase()}
              sx={{ fontWeight: 800, fontSize: '0.68rem' }}
            />
          </div>
          <span className="sc-mc-slug">ID: {m.productId}</span>
        </div>

        <h3 className="sc-mc-title">{m.title}</h3>
        <p className="sc-mc-desc">{m.description}</p>
      </div>

      <div className="sc-mc-meta-strip">
        <div className="sc-mc-meta-item">
          <CalendarMonthIcon fontSize="small" color="primary" />
          <span><strong>Schedule:</strong> {m.sessionDate || 'Sunday, 11:00 AM IST'}</span>
        </div>
        <div className="sc-mc-meta-item">
          <KeyIcon fontSize="small" color="warning" />
          <span>Passcode: <code>{m.secretPasscode || 'STRIVERS2026'}</code></span>
        </div>
        {m.whatsappGroupLink && (
          <div className="sc-mc-meta-item">
            <span style={{ color: '#25D366', fontWeight: 800 }}>●</span>
            <span>WhatsApp: <a href={m.whatsappGroupLink} target="_blank" rel="noopener noreferrer" style={{ color: '#059669', fontWeight: 600 }}>Official Community</a></span>
          </div>
        )}
      </div>

      <div className="sc-mc-meta-strip" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
        <strong style={{ fontSize: '0.72rem', letterSpacing: '0.4px', color: '#64748b' }}>
          LIVE INSTRUCTORS &amp; MENTORS
        </strong>
        {mentors.map((men, idx) => (
          <div key={idx} className="sc-mc-meta-item">
            <PersonOutlineIcon fontSize="small" color="action" />
            <span><strong>{men.name}</strong> ({men.role || men.company})</span>
          </div>
        ))}
      </div>

      <div className="sc-mc-action-box">
        <div>
          <div className="sc-mc-action-title">
            <VideocamIcon fontSize="small" color="primary" />
            <strong>Meeting Link (Google Meet)</strong>
          </div>
          <a href={m.activeMeetingLink || '#'} target="_blank" rel="noopener noreferrer" className="sc-mc-meet-link">
            {m.activeMeetingLink || 'https://meet.google.com/ups-ovgu-qnr'}
          </a>
        </div>
        <Button variant="outlined" size="small" onClick={() => onEditMeeting(m)}>
          Edit Link
        </Button>
      </div>

      <div className="sc-mc-action-box">
        <div>
          <div className="sc-mc-action-title">
            <CalendarMonthIcon fontSize="small" color="success" />
            <strong>Timing Slots ({(m.timingSlots || []).length})</strong>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            {m.timingSlots?.[0]?.title || m.timingSlots?.[0]?.dateTime || m.sessionDate || 'Configure batch slots'}
          </span>
        </div>
        <Button variant="outlined" size="small" onClick={() => onManageSlots(m)}>
          Manage Slots
        </Button>
      </div>

      <div className="sc-mc-action-box">
        <div>
          <div className="sc-mc-action-title">
            <MenuBookIcon fontSize="small" color="warning" />
            <strong>Notes &amp; PDFs ({(m.notesAndPdfs || []).length})</strong>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Stored in MongoDB · Anti-Download DRM
          </span>
        </div>
        <Button variant="outlined" size="small" onClick={() => onManageMaterials(m)}>
          Manage Materials
        </Button>
      </div>

      <div className="sc-mc-footer">
        <div>
          <span className="sc-mc-price-val">₹{m.price}</span>
          {m.originalPrice && <s className="sc-mc-price-was">₹{m.originalPrice}</s>}
          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 2 }}>
            Raw: {rawPaise} paise · Status:{' '}
            <strong style={{ color: m.isActive !== false ? '#059669' : '#DC2626' }}>
              {m.isActive !== false ? 'Active' : 'Inactive'}
            </strong>
          </div>
        </div>

        <div className="sc-mc-footer-btns">
          <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => onEditDetails(m)}>
            Edit Details
          </Button>
          <Button variant="contained" color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={() => onDelete(m)}>
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
