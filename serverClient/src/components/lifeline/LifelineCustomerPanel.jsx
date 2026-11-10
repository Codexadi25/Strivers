import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import VideocamIcon from '@mui/icons-material/Videocam';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import './LifelineCustomerPanel.css';

export function LifelineProfileCard({
  data,
  showPhone,
  onTogglePhone,
  showEmail,
  onToggleEmail,
  copiedId,
  onCopy,
}) {
  const maskPhone = (phone) => {
    if (!phone) return 'Not on file';
    if (showPhone) return phone;
    const clean = String(phone).replace(/[^0-9]/g, '');
    if (clean.length > 4) {
      return `+91 XXXXXXXX${clean.slice(-4)}`;
    }
    return phone;
  };

  const maskEmail = (email) => {
    if (!email) return 'Not on file';
    if (showEmail) return email;
    const [user, domain] = String(email).split('@');
    if (!domain) return email;
    return `${user.slice(0, 2)}****@${domain}`;
  };

  return (
    <Card variant="outlined" className="sc-lifeline-profile-card">
      <CardContent>
        <div className="sc-lifeline-profile-top">
          <Chip
            size="small"
            icon={<VerifiedUserIcon fontSize="small" />}
            label="Customer Profile"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />
          <div className="sc-lifeline-id-row">
            <span>{data.customerId}</span>
            <Tooltip title={copiedId === 'customer_id' ? 'Copied!' : 'Copy Customer ID'}>
              <IconButton size="small" onClick={() => onCopy(data.customerId, 'customer_id')}>
                <ContentCopyIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="sc-lifeline-profile-name-row">
          <h3 className="sc-lifeline-profile-name">{data.name}</h3>
          <Tooltip title={copiedId === 'customer_name' ? 'Copied!' : 'Copy Customer Name'}>
            <IconButton size="small" onClick={() => onCopy(data.name, 'customer_name')}>
              <ContentCopyIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </div>

        <div className="sc-lifeline-contact-row">
          <PhoneIcon fontSize="small" color="action" />
          <span>{maskPhone(data.phone)}</span>
          <Tooltip title={showPhone ? 'Mask phone' : 'Unmask phone'}>
            <IconButton size="small" onClick={onTogglePhone} aria-label="Toggle phone visibility">
              {showPhone ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </div>

        <div className="sc-lifeline-contact-row">
          <EmailIcon fontSize="small" color="action" />
          <span>{maskEmail(data.email)}</span>
          <Tooltip title={showEmail ? 'Mask email' : 'Unmask email'}>
            <IconButton size="small" onClick={onToggleEmail} aria-label="Toggle email visibility">
              {showEmail ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
          {copiedId === 'customer_email' && (
            <Chip size="small" label="Copied" color="success" sx={{ height: 20, fontSize: '0.68rem' }} />
          )}
        </div>

        <div className="sc-lifeline-stats-grid">
          <div>
            <div className="sc-lifeline-stat-label">Orders on File</div>
            <div className="sc-lifeline-stat-value">{data.ordersCount ?? 0}</div>
          </div>
          <div>
            <div className="sc-lifeline-stat-label">Lifetime Volume</div>
            <div className="sc-lifeline-stat-value volume">₹{data.totalLifetimeVolume ?? 0}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LifelineCustomerPanel({
  data,
  materials = [],
  practiceTracks = [],
  copiedId,
  onCopy,
}) {
  const hasEnrolledCourses = (data.enrolledCourses || []).length > 0;
  const activeBatch = data.activeBatch;

  return (
    <div className="sc-lifeline-col">
      {/* 1. Enrolled Batch & Live Room Access */}
      <Card variant="outlined" className="sc-lifeline-live-card">
        <CardContent>
          <div className="sc-lifeline-live-badge-row">
            <Chip
              size="small"
              color={data.hasActiveSubscription || hasEnrolledCourses ? 'error' : 'default'}
              label="LIVE ROOM ACCESS"
              sx={{ fontWeight: 800, fontSize: '0.7rem' }}
            />
            {activeBatch?.sessionDate && (
              <Chip
                size="small"
                variant="outlined"
                label={activeBatch.sessionDate}
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />
            )}
          </div>

          <h3 className="sc-lifeline-live-title">
            {activeBatch?.title || 'No Active Live Batch Assigned'}
          </h3>
          {activeBatch?.description && (
            <p className="sc-lifeline-live-desc">{activeBatch.description}</p>
          )}

          {Array.isArray(activeBatch?.mentors) && activeBatch.mentors.length > 0 && (
            <div className="sc-lifeline-mentors-wrap">
              {activeBatch.mentors.map((m, idx) => (
                <Chip
                  key={`${m.name}-${idx}`}
                  size="small"
                  icon={<PersonIcon />}
                  label={m.company ? `${m.name} • ${m.company}` : m.name}
                  variant="outlined"
                />
              ))}
            </div>
          )}

          {activeBatch?.meetingLink && (
            <div className="sc-lifeline-live-actions">
              <Button
                variant="contained"
                size="small"
                startIcon={<VideocamIcon />}
                onClick={() => window.open(activeBatch.meetingLink, '_blank', 'noopener,noreferrer')}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                Join Live Mentorship Room
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => onCopy(activeBatch.meetingLink, 'meet_link')}
                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
              >
                {copiedId === 'meet_link' ? 'Copied Link!' : 'Copy Meet Link'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Enrolled Courses & Access Status */}
      <Card variant="outlined" className="sc-lifeline-panel-card">
        <CardContent>
          <div className="sc-lifeline-panel-header">
            <h4 className="sc-lifeline-panel-title">
              <SchoolIcon fontSize="small" color="primary" />
              <span>Enrolled Courses &amp; Access Status</span>
            </h4>
            <Chip
              size="small"
              color={hasEnrolledCourses ? 'success' : 'default'}
              label={hasEnrolledCourses ? `${data.enrolledCourses.length} Active` : 'None Active'}
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
          </div>
          <p className="sc-lifeline-panel-desc">
            Active database course entitlements synced with the Student Portal. Click any ID chip to copy.
          </p>

          {hasEnrolledCourses ? (
            <div className="sc-lifeline-list">
              {data.enrolledCourses.map((c, idx) => (
                <div key={c.courseId || idx} className="sc-lifeline-item-row">
                  <div>
                    <div className="sc-lifeline-item-title">{c.title}</div>
                    <div className="sc-lifeline-item-sub">Course ID: {c.courseId}</div>
                  </div>
                  <div className="sc-lifeline-course-actions">
                    <Chip
                      size="small"
                      label={copiedId === `course_${c.courseId}` ? 'Copied' : c.courseId}
                      variant="outlined"
                      clickable
                      onClick={() => onCopy(c.courseId, `course_${c.courseId}`)}
                      sx={{ fontFamily: 'monospace', fontSize: '0.72rem' }}
                    />
                    <Chip
                      size="small"
                      color="success"
                      label={c.status || 'Active Access'}
                      sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="sc-lifeline-empty-note">
              No enrolled courses found for this student in the database.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Dynamic Study Materials & Practice Tracks */}
      <Card variant="outlined" className="sc-lifeline-panel-card">
        <CardContent>
          <div className="sc-lifeline-panel-header">
            <h4 className="sc-lifeline-panel-title">
              <MenuBookIcon fontSize="small" color="primary" />
              <span>Study Materials &amp; Practice Tracks</span>
            </h4>
            <Chip
              size="small"
              color="info"
              variant="outlined"
              label={`${materials.length} Docs • ${practiceTracks.length} Sheets`}
              sx={{ fontWeight: 700, fontSize: '0.72rem' }}
            />
          </div>
          <p className="sc-lifeline-panel-desc">
            Live DRM study materials and practice tracks pulled from Masterclasses &amp; Practice Sheets collections.
          </p>

          {materials.length === 0 && practiceTracks.length === 0 ? (
            <div className="sc-lifeline-empty-note">
              No materials or practice sheets currently published in the database.
            </div>
          ) : (
            <div className="sc-lifeline-list">
              {materials.map((m, idx) => (
                <div key={m.materialId || m._id || idx} className="sc-lifeline-item-row">
                  <div>
                    <div className="sc-lifeline-item-title">{m.title}</div>
                    <div className="sc-lifeline-item-sub">
                      {m.courseTitle} • DRM Protected Canvas Viewer
                    </div>
                  </div>
                  <Chip
                    size="small"
                    color={hasEnrolledCourses || data.hasActiveSubscription ? 'success' : 'default'}
                    variant="outlined"
                    label={hasEnrolledCourses || data.hasActiveSubscription ? 'Unlocked' : 'Locked'}
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </div>
              ))}

              {practiceTracks.map((sheet, idx) => (
                <div key={sheet.sheetId || sheet._id || idx} className="sc-lifeline-item-row">
                  <div>
                    <div className="sc-lifeline-item-title">{sheet.title}</div>
                    <div className="sc-lifeline-item-sub">
                      {sheet.category} • {sheet.totalProblems ?? (sheet.topics?.length || 0)} Problems
                    </div>
                  </div>
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    label={sheet.roleTag || 'Practice Track'}
                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
