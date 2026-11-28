import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import './PracticeSheetCard.css';

export default function PracticeSheetCard({ sheet, onEdit, onManageCurriculum, onDelete }) {
  const s = sheet;
  const isFree = s.price === 0 || s.isFree;
  const topicsCount = Array.isArray(s.topics) ? s.topics.length : 0;
  const problemsCount = Array.isArray(s.topics)
    ? s.topics.reduce((acc, t) => acc + (t.problems?.length || 0), 0)
    : s.totalProblems || 0;

  return (
    <Card variant="outlined" className="sc-practice-card" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div className="sc-practice-card-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Chip size="small" color="primary" variant="outlined" label={s.category || 'Engineering'} sx={{ fontWeight: 700 }} />
            <Chip
              size="small"
              label={isFree ? '₹0 Free' : `₹${s.price} Paid`}
              sx={{
                bgcolor: isFree ? '#DCFCE7' : '#FEF3C7',
                color: isFree ? '#16A34A' : '#D97706',
                fontWeight: 700,
              }}
            />
          </div>
          <Chip size="small" label={s.roleTag || s.targetRole || 'All Roles'} sx={{ maxWidth: 180 }} />
        </div>

        <h3 className="sc-practice-card-title" style={{ marginTop: 8, marginBottom: 6 }}>{s.title}</h3>
        {s.description && (
          <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 10px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {s.description}
          </p>
        )}

        <div className="sc-practice-meta" style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', color: '#475569', marginBottom: 10 }}>
          <span>Modules: <strong>{topicsCount}</strong></span>
          <span>•</span>
          <span>Questions: <strong>{problemsCount}</strong></span>
          <span>•</span>
          <span>Level: <strong>{s.difficultyLevel || s.difficulty || 'Intermediate'}</strong></span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Top Hiring Companies:</span>
          <div className="sc-practice-companies" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {(s.companyTags || s.targetCompanies || []).map((c, i) => (
              <Chip key={i} size="small" variant="outlined" label={c} sx={{ fontSize: '0.7rem' }} />
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<MenuBookIcon sx={{ fontSize: 16 }} />}
            fullWidth
            onClick={() => onManageCurriculum && onManageCurriculum(s)}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
          >
            Curriculum ({topicsCount})
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
            fullWidth
            onClick={() => onEdit && onEdit(s)}
            sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem', bgcolor: '#2563EB' }}
          >
            Edit Track
          </Button>
        </div>

        <div className="sc-practice-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
          <span className="sc-practice-live-status" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10B981', fontSize: '0.78rem', fontWeight: 700 }}>
            <CheckCircleIcon fontSize="small" />
            <span>Live on /practice</span>
          </span>
          {onDelete && (
            <Tooltip title="Delete Track">
              <IconButton size="small" color="error" onClick={() => onDelete(s.sheetId || s.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </div>
    </Card>
  );
}
