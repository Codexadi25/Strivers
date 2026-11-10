import React from 'react';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import './PracticeSheetCard.css';

export default function PracticeSheetCard({ sheet, onDelete }) {
  const s = sheet;
  return (
    <Card variant="outlined" className="sc-practice-card">
      <div>
        <div className="sc-practice-card-top">
          <Chip size="small" color="primary" variant="outlined" label={s.category || 'Engineering'} sx={{ fontWeight: 700 }} />
          <Chip size="small" label={s.roleTag || s.targetRole || 'All Roles'} />
        </div>

        <h3 className="sc-practice-card-title">{s.title}</h3>

        <div className="sc-practice-meta">
          <span>Questions: <strong>{s.totalProblems}</strong></span>
          <span>•</span>
          <span>Difficulty: <strong>{s.difficultyLevel || s.difficulty || 'Intermediate'}</strong></span>
        </div>

        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>Top Hiring Companies:</span>
          <div className="sc-practice-companies">
            {(s.companyTags || s.targetCompanies || []).map((c, i) => (
              <Chip key={i} size="small" variant="outlined" label={c} sx={{ fontSize: '0.7rem' }} />
            ))}
          </div>
        </div>
      </div>

      <div className="sc-practice-footer">
        <span className="sc-practice-live-status">
          <CheckCircleIcon fontSize="small" />
          <span>Live on /practice</span>
        </span>
        {onDelete && (
          <IconButton size="small" color="error" title="Remove Track" onClick={() => onDelete(s.sheetId || s.id)}>
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        )}
      </div>
    </Card>
  );
}
