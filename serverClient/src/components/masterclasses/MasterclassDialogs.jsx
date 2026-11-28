import React, { useState, useRef, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CodeIcon from '@mui/icons-material/Code';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import './MasterclassDialogs.css';

export function CreateMasterclassDialog({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState(99);
  const [sessionDate, setSessionDate] = useState('Sunday, 11:00 AM IST');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/strivers-placement-live');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onCreate({ title: title.trim(), price: Number(price), sessionDate, activeMeetingLink: meetingLink });
    setTitle('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Create New Live Masterclass</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers className="sc-mc-dialog-stack">
          <TextField label="Masterclass Title" size="small" required value={title} onChange={(e) => setTitle(e.target.value)} />
          <TextField label="Price (₹ INR)" type="number" size="small" required value={price} onChange={(e) => setPrice(e.target.value)} />
          <TextField label="Schedule Text" size="small" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
          <TextField label="Google Meet Link" size="small" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">Create Masterclass</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function EditMeetingDialog({ editingMeeting, setEditingMeeting, onSave }) {
  return (
    <Dialog open={Boolean(editingMeeting)} onClose={() => setEditingMeeting(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Update Google Meet &amp; Session Status</DialogTitle>
      <form onSubmit={onSave}>
        <DialogContent dividers className="sc-mc-dialog-stack">
          {editingMeeting && (
            <>
              <TextField
                label="Google Meet / Room URL"
                size="small"
                required
                value={editingMeeting.activeMeetingLink || ''}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, activeMeetingLink: e.target.value })}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField
                  label="Meeting Passcode"
                  size="small"
                  value={editingMeeting.meetingCode || ''}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, meetingCode: e.target.value })}
                />
                <TextField
                  select
                  label="Meeting Platform"
                  size="small"
                  value={editingMeeting.meetingPlatform || 'Google Meet'}
                  onChange={(e) => setEditingMeeting({ ...editingMeeting, meetingPlatform: e.target.value })}
                >
                  <MenuItem value="Google Meet">Google Meet</MenuItem>
                  <MenuItem value="Zoom">Zoom</MenuItem>
                  <MenuItem value="Microsoft Teams">Microsoft Teams</MenuItem>
                  <MenuItem value="YouTube Live">YouTube Live</MenuItem>
                </TextField>
              </div>
              <TextField
                label="Official WhatsApp Group / Channel URL"
                size="small"
                placeholder="https://chat.whatsapp.com/..."
                helperText="Enrolled students will be prompted to join this group for meeting links & study updates"
                value={editingMeeting.whatsappGroupLink || ''}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, whatsappGroupLink: e.target.value })}
              />
              <TextField
                select
                label="Live Broadcast Status"
                size="small"
                value={editingMeeting.sessionStatus || 'upcoming'}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, sessionStatus: e.target.value })}
              >
                <MenuItem value="upcoming">Upcoming (Live Countdown Active)</MenuItem>
                <MenuItem value="live">Live Now (Active Room &amp; Join Button)</MenuItem>
                <MenuItem value="ended">Ended / Concluded (Rearrange Request Active)</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
              <TextField
                label="Session Date Text"
                size="small"
                value={editingMeeting.sessionDate || ''}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, sessionDate: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingMeeting(null)}>Cancel</Button>
          <Button type="submit" variant="contained">Save Meeting Link</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function EditDetailsDialog({ editingDetails, setEditingDetails, onSave }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!editingDetails) return null;

  const mentors = Array.isArray(editingDetails.mentors) ? editingDetails.mentors : [];
  const features = Array.isArray(editingDetails.features) ? editingDetails.features : [];

  const handleAddMentor = () => {
    const next = [...mentors, { name: '', role: '', company: '', avatar: '' }];
    setEditingDetails({ ...editingDetails, mentors: next });
  };

  const handleUpdateMentor = (idx, field, val) => {
    const next = mentors.map((m, i) => (i === idx ? { ...m, [field]: val } : m));
    setEditingDetails({ ...editingDetails, mentors: next });
  };

  const handleRemoveMentor = (idx) => {
    const next = mentors.filter((_, i) => i !== idx);
    setEditingDetails({ ...editingDetails, mentors: next });
  };

  const handleAddFeature = () => {
    const next = [...features, ''];
    setEditingDetails({ ...editingDetails, features: next });
  };

  const handleUpdateFeature = (idx, val) => {
    const next = features.map((f, i) => (i === idx ? val : f));
    setEditingDetails({ ...editingDetails, features: next });
  };

  const handleRemoveFeature = (idx) => {
    const next = features.filter((_, i) => i !== idx);
    setEditingDetails({ ...editingDetails, features: next });
  };

  return (
    <Dialog
      open={Boolean(editingDetails)}
      onClose={() => setEditingDetails(null)}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}
    >
      <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span>Edit Masterclass &amp; Session Properties</span>
          <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b' }}>
            ID: <code>{editingDetails.productId}</code>
          </div>
        </div>
        <FormControlLabel
          control={
            <Switch
              checked={editingDetails.isActive !== false}
              onChange={(e) => setEditingDetails({ ...editingDetails, isActive: e.target.checked })}
              color="success"
            />
          }
          label={<span style={{ fontSize: '0.86rem', fontWeight: 700 }}>{editingDetails.isActive !== false ? 'Active' : 'Inactive'}</span>}
        />
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={activeTab} onChange={(_, val) => setActiveTab(val)} variant="scrollable" scrollButtons="auto">
          <Tab label="1. Core Info &amp; Pricing" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="2. Live Session &amp; Room" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="3. Mentors &amp; Instructors" sx={{ textTransform: 'none', fontWeight: 700 }} />
          <Tab label="4. Features &amp; Media" sx={{ textTransform: 'none', fontWeight: 700 }} />
        </Tabs>
      </Box>

      <form onSubmit={onSave}>
        <DialogContent dividers className="sc-mc-dialog-stack" sx={{ minHeight: 380, maxHeight: 520, overflowY: 'auto' }}>
          {/* TAB 0: Core Info & Pricing */}
          {activeTab === 0 && (
            <div className="sc-mc-dialog-stack">
              <TextField
                label="Masterclass Title"
                size="small"
                required
                fullWidth
                value={editingDetails.title || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, title: e.target.value })}
              />

              <TextField
                label="Detailed Description"
                size="small"
                multiline
                rows={3}
                fullWidth
                value={editingDetails.description || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, description: e.target.value })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <TextField
                  label="Selling Price (₹ INR)"
                  type="number"
                  size="small"
                  required
                  value={editingDetails.price ?? 0}
                  onChange={(e) => setEditingDetails({ ...editingDetails, price: e.target.value })}
                />
                <TextField
                  label="Original / MRP Price (₹ Strikethrough)"
                  type="number"
                  size="small"
                  placeholder="e.g. 399"
                  value={editingDetails.originalPrice ?? ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, originalPrice: e.target.value })}
                />
                <TextField
                  label="Highlight Badge"
                  size="small"
                  placeholder="e.g. Live Session Every Sunday"
                  value={editingDetails.badge || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, badge: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField
                  select
                  label="Category Schema"
                  size="small"
                  value={editingDetails.category || 'masterclass'}
                  onChange={(e) => setEditingDetails({ ...editingDetails, category: e.target.value })}
                >
                  <MenuItem value="masterclass">Masterclass (Live Cohort)</MenuItem>
                  <MenuItem value="course">Self-Paced Course</MenuItem>
                  <MenuItem value="channel">Job Channel</MenuItem>
                  <MenuItem value="workshop">Interactive Workshop</MenuItem>
                </TextField>
                <TextField
                  label="DRM Secret Passcode"
                  size="small"
                  helperText="Required by students for DRM vault authentication"
                  value={editingDetails.secretPasscode || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, secretPasscode: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* TAB 1: Live Session & Room */}
          {activeTab === 1 && (
            <div className="sc-mc-dialog-stack">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField
                  label="Live Session Schedule Text"
                  size="small"
                  placeholder="e.g. Sunday, 22 Nov 2026, 11:00 AM IST"
                  value={editingDetails.sessionDate || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, sessionDate: e.target.value })}
                />
                <TextField
                  select
                  label="Broadcast Status"
                  size="small"
                  value={editingDetails.sessionStatus || 'upcoming'}
                  onChange={(e) => setEditingDetails({ ...editingDetails, sessionStatus: e.target.value })}
                >
                  <MenuItem value="upcoming">Upcoming (Countdown Active)</MenuItem>
                  <MenuItem value="live">Live Now (Active Room &amp; Join Button)</MenuItem>
                  <MenuItem value="ended">Ended / Concluded</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              </div>

              <TextField
                label="Google Meet / Room URL"
                size="small"
                placeholder="https://meet.google.com/..."
                value={editingDetails.activeMeetingLink || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, activeMeetingLink: e.target.value })}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField
                  label="Meeting Code / Passcode"
                  size="small"
                  placeholder="e.g. strivers-live"
                  value={editingDetails.meetingCode || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, meetingCode: e.target.value })}
                />
                <TextField
                  select
                  label="Meeting Platform"
                  size="small"
                  value={editingDetails.meetingPlatform || 'Google Meet'}
                  onChange={(e) => setEditingDetails({ ...editingDetails, meetingPlatform: e.target.value })}
                >
                  <MenuItem value="Google Meet">Google Meet</MenuItem>
                  <MenuItem value="Zoom">Zoom</MenuItem>
                  <MenuItem value="Microsoft Teams">Microsoft Teams</MenuItem>
                  <MenuItem value="YouTube Live">YouTube Live</MenuItem>
                </TextField>
              </div>

              <TextField
                label="Official WhatsApp Community Group Link"
                size="small"
                placeholder="https://chat.whatsapp.com/..."
                helperText="Enrolled students will see a direct Join WhatsApp Community button"
                value={editingDetails.whatsappGroupLink || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, whatsappGroupLink: e.target.value })}
              />
            </div>
          )}

          {/* TAB 2: Mentors & Instructors */}
          {activeTab === 2 && (
            <div className="sc-mc-dialog-stack">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Assigned Instructors &amp; Mentors ({mentors.length})
                </Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddMentor}>
                  Add Mentor
                </Button>
              </div>

              {mentors.length === 0 ? (
                <div style={{ padding: 16, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
                  No custom mentors assigned. Click &ldquo;Add Mentor&rdquo; above to assign session instructors.
                </div>
              ) : (
                mentors.map((mentor, idx) => (
                  <div key={idx} className="sc-mc-list-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.84rem', color: '#334155' }}>Mentor #{idx + 1}</span>
                      <IconButton size="small" color="error" onClick={() => handleRemoveMentor(idx)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
                      <TextField
                        label="Full Name"
                        size="small"
                        required
                        value={mentor.name || ''}
                        onChange={(e) => handleUpdateMentor(idx, 'name', e.target.value)}
                      />
                      <TextField
                        label="Role / Title"
                        size="small"
                        placeholder="e.g. SDE-2"
                        value={mentor.role || ''}
                        onChange={(e) => handleUpdateMentor(idx, 'role', e.target.value)}
                      />
                      <TextField
                        label="Company / Background"
                        size="small"
                        placeholder="e.g. Blinkit / Zomato"
                        value={mentor.company || ''}
                        onChange={(e) => handleUpdateMentor(idx, 'company', e.target.value)}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: Features & Media */}
          {activeTab === 3 && (
            <div className="sc-mc-dialog-stack">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <TextField
                  label="Duration Label"
                  size="small"
                  placeholder="e.g. Ongoing Access / 2.5 Hours Live"
                  value={editingDetails.duration || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, duration: e.target.value })}
                />
                <TextField
                  label="Target Level"
                  size="small"
                  placeholder="e.g. Job Seekers / Final Year Students"
                  value={editingDetails.level || ''}
                  onChange={(e) => setEditingDetails({ ...editingDetails, level: e.target.value })}
                />
              </div>

              <TextField
                label="Cover Image / Banner URL"
                size="small"
                placeholder="https://..."
                value={editingDetails.imageUrl || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, imageUrl: e.target.value })}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Feature Highlights ({features.length})
                </Typography>
                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddFeature}>
                  Add Feature
                </Button>
              </div>

              {features.length === 0 ? (
                <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b' }}>
                  No feature bullet points configured. Click &ldquo;Add Feature&rdquo; to add value propositions.
                </div>
              ) : (
                features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <TextField
                      size="small"
                      fullWidth
                      placeholder={`Feature #${idx + 1}`}
                      value={feat}
                      onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                    />
                    <IconButton size="small" color="error" onClick={() => handleRemoveFeature(idx)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                ))
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setEditingDetails(null)}>Cancel</Button>
          <Button type="submit" variant="contained">Save All Changes</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function ManageSlotsDialog({ masterclass, onClose, onAddSlot, onUpdateSlot, onDeleteSlot }) {
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('11:00 AM');
  const [endTime, setEndTime] = useState('01:30 PM');
  const [timezone, setTimezone] = useState('IST');
  const [mentorName, setMentorName] = useState('Unicorn Mentors');
  const [mentorRole, setMentorRole] = useState('Operations & Engineering');
  const [capacity, setCapacity] = useState(150);
  const [isActive, setIsActive] = useState(true);

  const resetForm = () => {
    setEditingSlotId(null);
    setTitle('');
    setDate('');
    setStartTime('11:00 AM');
    setEndTime('01:30 PM');
    setTimezone('IST');
    setMentorName('Unicorn Mentors');
    setMentorRole('Operations & Engineering');
    setCapacity(150);
    setIsActive(true);
  };

  const handleStartEdit = (slot) => {
    setEditingSlotId(slot.slotId);
    setTitle(slot.title || slot.dateTime || '');
    setDate(slot.date || slot.dateTime || '');
    setStartTime(slot.startTime || '11:00 AM');
    setEndTime(slot.endTime || '01:30 PM');
    setTimezone(slot.timezone || 'IST');
    setMentorName(slot.mentorName || 'Unicorn Mentors');
    setMentorRole(slot.mentorRole || '');
    setCapacity(slot.capacity || 150);
    setIsActive(slot.isActive !== false && slot.active !== false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() && !date.trim()) return;

    const payload = {
      title: title.trim() || `${date} - ${startTime} ${timezone}`,
      date: date.trim() || 'Upcoming Sunday',
      dateTime: `${date.trim() || 'Upcoming Sunday'} · ${startTime} - ${endTime} ${timezone}`,
      startTime,
      endTime,
      timezone,
      mentorName: mentorName.trim() || 'Unicorn Mentors',
      mentorRole: mentorRole.trim(),
      capacity: Number(capacity) || 150,
      isActive,
      active: isActive,
    };

    if (editingSlotId) {
      onUpdateSlot(masterclass.productId, editingSlotId, payload);
    } else {
      onAddSlot(masterclass.productId, payload);
    }
    resetForm();
  };

  return (
    <Dialog open={Boolean(masterclass)} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Live Session Timing Slots: {masterclass?.title}</span>
        <Chip size="small" color="info" label={`${(masterclass?.timingSlots || []).length} Slots Total`} />
      </DialogTitle>
      <DialogContent dividers className="sc-mc-dialog-stack">
        {/* EXISTING SLOTS LIST */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>
          Configured Live Timing Slots
        </Typography>

        {(masterclass?.timingSlots || []).length === 0 ? (
          <div style={{ padding: 14, background: '#f8fafc', borderRadius: 8, textAlign: 'center', color: '#64748b', fontSize: '0.84rem' }}>
            No live timing slots configured yet. Add your first batch slot below.
          </div>
        ) : (
          (masterclass?.timingSlots || []).map((slot) => {
            const isSlotActive = slot.isActive !== false && slot.active !== false;
            const isCurrentEditing = editingSlotId === slot.slotId;
            return (
              <div
                key={slot.slotId}
                className="sc-mc-list-row"
                style={{
                  borderLeft: isSlotActive ? '4px solid #059669' : '4px solid #94a3b8',
                  background: isCurrentEditing ? '#eff6ff' : undefined,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{slot.title || slot.dateTime || slot.date}</strong>
                    <Chip
                      size="small"
                      label={isSlotActive ? 'Active' : 'Inactive'}
                      color={isSlotActive ? 'success' : 'default'}
                      sx={{ fontSize: '0.68rem', height: 20 }}
                    />
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: 2 }}>
                    {slot.date ? `${slot.date} · ` : ''}
                    {slot.startTime || '11:00 AM'} - {slot.endTime || '01:30 PM'} {slot.timezone || 'IST'} · Mentor:{' '}
                    <strong>{slot.mentorName || 'Unicorn Mentors'}</strong> {slot.capacity ? `· Capacity: ${slot.capacity}` : ''}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 4 }}>
                  <Tooltip title="Edit this timing slot">
                    <IconButton size="small" color="primary" onClick={() => handleStartEdit(slot)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Remove timing slot">
                    <IconButton size="small" color="error" onClick={() => onDeleteSlot(masterclass.productId, slot.slotId)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}

        {/* SLOT EDIT / CREATE FORM */}
        <form onSubmit={handleSubmit} className="sc-mc-dialog-stack" style={{ marginTop: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: editingSlotId ? '#1d4ed8' : '#0f172a' }}>
              {editingSlotId ? 'Edit Timing Slot Details' : 'Add New Live Session Timing Slot'}
            </Typography>
            {editingSlotId && (
              <Button size="small" variant="text" color="inherit" onClick={resetForm} sx={{ textTransform: 'none' }}>
                Cancel Edit
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            <TextField
              label="Slot Title"
              size="small"
              required
              placeholder="e.g. Sunday Unicorn Placement Masterclass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Date String"
              size="small"
              required
              placeholder="e.g. Sunday, 22 Nov 2026"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <TextField
              label="Start Time"
              size="small"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <TextField
              label="End Time"
              size="small"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
            <TextField
              label="Timezone"
              size="small"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />
            <TextField
              label="Max Capacity"
              type="number"
              size="small"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <TextField
              label="Host Mentor Name"
              size="small"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
            />
            <TextField
              label="Mentor Role / Company"
              size="small"
              placeholder="e.g. Operations &amp; Engineering"
              value={mentorRole}
              onChange={(e) => setMentorRole(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
            <FormControlLabel
              control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} color="success" />}
              label={<span style={{ fontSize: '0.84rem', fontWeight: 600 }}>Active Slot (Visible to Students)</span>}
            />
            <Button type="submit" variant="contained" size="small">
              {editingSlotId ? 'Save Timing Slot' : '+ Add Live Timing Slot'}
            </Button>
          </div>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

const SAMPLE_HTML_NOTE = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 720px; margin: 0 auto; line-height: 1.6; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #3b82f6; padding-bottom: 8px;">Masterclass Core Study Guide</h1>
  <p style="font-size: 1.05rem; color: #475569;">Key concepts, framework implementations, and production patterns discussed during the cohort.</p>
  
  <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
    <strong style="color: #1e40af;">💡 High-Yield Insight:</strong>
    <p style="margin: 4px 0 0; color: #334155;">Focus on measurable impact and quantitative metrics for all system optimization and operational questions.</p>
  </div>

  <h2 style="color: #0f172a; margin-top: 24px;">1. Operational Architecture & Key Formulas</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.9rem;">
    <thead>
      <tr style="background: #f1f5f9; text-align: left;">
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Metric</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Formula</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Target SLA</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Order Fulfillment Time</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;"><code>T_dispatch - T_created</code></td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">&lt; 7.5 Minutes</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Dark Store Pick Accuracy</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;"><code>(Correct Items / Total) * 100</code></td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">&gt; 99.4%</td>
      </tr>
    </tbody>
  </table>
</div>`;

const SAMPLE_MARKDOWN_NOTE = `# 🚀 Masterclass Placement Cheatsheet

### Core Checklist for Candidate Round 1:
- [x] Clear metric-driven bullet points (Increased dispatch speed by 28%)
- [x] Reverse-chronological single-column ATS resume structure
- [x] Target tech stack keywords: Node.js, Redis, MongoDB, Docker

### High-Frequency Questions to Prepare:
1. Explain how you handled surge order spikes and catalog de-synchronization.
2. What trade-offs exist between eventual consistency and strict ACID transactions?
`;

export function ManageMaterialsDialog({ masterclass, onClose, onAddMaterial, onUpdateMaterial, onDeleteMaterial }) {
  const [editingMaterialId, setEditingMaterialId] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('html');
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setEditingMaterialId(null);
    setTitle('');
    setDescription('');
    setFileType('html');
    setContent('');
    setFileData('');
    setFileName('');
    setShowPreview(false);
  };

  const handleStartEdit = (mat) => {
    setEditingMaterialId(mat.materialId);
    setTitle(mat.title || '');
    setDescription(mat.description || '');
    const detectedType = mat.fileType || 'notes';
    setFileType(detectedType);
    setFileName('');
    setFileData(mat.fileData || '');

    // Extract content if available
    if (mat.htmlContent) {
      setContent(mat.htmlContent);
    } else if (mat.content) {
      setContent(mat.content);
    } else if (mat.fileData && detectedType !== 'pdf') {
      try {
        const decoded = decodeURIComponent(escape(atob(mat.fileData)));
        setContent(decoded);
      } catch (_) {
        try {
          setContent(atob(mat.fileData));
        } catch (e) {
          setContent('');
        }
      }
    } else {
      setContent('');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }

    if (file.name.toLowerCase().endsWith('.pdf')) {
      setFileType('pdf');
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        setFileData(base64);
      };
      reader.readAsDataURL(file);
    } else if (file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm')) {
      setFileType('html');
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        setContent(text);
        try {
          setFileData(btoa(unescape(encodeURIComponent(text))));
        } catch (_) {
          setFileData(btoa(text));
        }
      };
      reader.readAsText(file);
    } else {
      setFileType('notes');
      const reader = new FileReader();
      reader.onload = () => {
        const text = String(reader.result || '');
        setContent(text);
        try {
          setFileData(btoa(unescape(encodeURIComponent(text))));
        } catch (_) {
          setFileData(btoa(text));
        }
      };
      reader.readAsText(file);
    }
  };

  const handleInsertTemplate = () => {
    if (fileType === 'html') {
      setContent(SAMPLE_HTML_NOTE);
      if (!title) setTitle('Masterclass Core Study Guide (HTML)');
    } else {
      setContent(SAMPLE_MARKDOWN_NOTE);
      if (!title) setTitle('Masterclass Placement Cheatsheet');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    let finalData = fileData;
    if (!finalData && content) {
      try {
        finalData = btoa(unescape(encodeURIComponent(content)));
      } catch (_) {
        finalData = btoa(content);
      }
    }

    const payload = {
      title: title.trim(),
      description:
        description.trim() ||
        (fileType === 'html'
          ? 'Rich HTML Study Guide'
          : fileType === 'pdf'
          ? 'DRM Protected PDF Document'
          : 'Study Notes'),
      fileType,
      mimeType: fileType === 'pdf' ? 'application/pdf' : fileType === 'html' ? 'text/html' : 'text/markdown',
      content: content || '# Study Material\n\nDRM Protected Material.',
      htmlContent: fileType === 'html' ? content : undefined,
      fileData: finalData || btoa('Encrypted Study Resource'),
      drmLevel: 'DRM_ENFORCED',
      viewOnly: true,
    };

    if (editingMaterialId) {
      onUpdateMaterial(masterclass.productId, editingMaterialId, payload);
    } else {
      onAddMaterial(masterclass.productId, payload);
    }
    resetForm();
  };

  return (
    <Dialog open={Boolean(masterclass)} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>DRM Study Vault &amp; Notes Designer: {masterclass?.title}</span>
        <Chip size="small" color="primary" label="MongoDB Stored · DRM Watermarked" />
      </DialogTitle>
      <DialogContent dividers className="sc-mc-dialog-stack">
        {/* EXISTING ATTACHED MATERIALS */}
        <div>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1, color: '#334155' }}>
            Attached Study Materials &amp; Notes ({(masterclass?.notesAndPdfs || []).length})
          </Typography>
          {(masterclass?.notesAndPdfs || []).length === 0 ? (
            <div style={{ padding: '12px', background: '#F8FAFC', borderRadius: 8, fontSize: '0.84rem', color: '#64748B', textAlign: 'center' }}>
              No study materials attached yet. Design HTML notes, upload a PDF, or write Markdown below.
            </div>
          ) : (
            (masterclass?.notesAndPdfs || []).map((mat) => {
              const isCurrentEditing = editingMaterialId === mat.materialId;
              return (
                <div
                  key={mat.materialId}
                  className="sc-mc-list-row"
                  style={{
                    marginBottom: 8,
                    background: isCurrentEditing ? '#eff6ff' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {mat.fileType === 'pdf' ? (
                      <PictureAsPdfIcon sx={{ color: '#DC2626' }} />
                    ) : mat.fileType === 'html' ? (
                      <CodeIcon sx={{ color: '#059669' }} />
                    ) : (
                      <DescriptionIcon sx={{ color: '#2563EB' }} />
                    )}
                    <div>
                      <strong>{mat.title}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Format: {(mat.fileType || 'notes').toUpperCase()} · {mat.description || 'DRM Enforced'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 4 }}>
                    <Tooltip title="Edit this study material">
                      <IconButton size="small" color="primary" onClick={() => handleStartEdit(mat)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete study material">
                      <IconButton size="small" color="error" onClick={() => onDeleteMaterial(masterclass.productId, mat.materialId)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MATERIAL DESIGNER / UPLOADER / EDITOR FORM */}
        <form onSubmit={handleSubmit} className="sc-mc-dialog-stack" style={{ marginTop: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: editingMaterialId ? '#1d4ed8' : '#0F172A' }}>
              {editingMaterialId ? `Edit Study Material: ${title || editingMaterialId}` : 'Create / Upload New Study Material'}
            </Typography>
            {editingMaterialId && (
              <Button size="small" variant="text" color="inherit" onClick={resetForm} sx={{ textTransform: 'none' }}>
                Cancel Edit
              </Button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            <TextField
              label="Study Material Title"
              size="small"
              required
              placeholder="e.g. ATS Resume Blueprint &amp; Action Verb Matrix"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <TextField
              select
              label="Document Format"
              size="small"
              value={fileType}
              onChange={(e) => setFileType(e.target.value)}
            >
              <MenuItem value="html">HTML Body Code (Interactive &amp; Styled)</MenuItem>
              <MenuItem value="pdf">PDF Document (Anti-Download DRM)</MenuItem>
              <MenuItem value="notes">Markdown Study Notes</MenuItem>
              <MenuItem value="cheatsheet">High-Yield Cheatsheet</MenuItem>
            </TextField>
          </div>

          <TextField
            label="Brief Description"
            size="small"
            placeholder="e.g. Single-column parsing guide with 50+ metric-driven bullet points."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* FILE UPLOAD DROPZONE / SHORTCUT */}
          <div
            className="sc-mc-upload-box"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".pdf,.html,.htm,.txt,.md"
              onChange={handleFileUpload}
            />
            <UploadFileIcon sx={{ color: '#2563EB', fontSize: 28 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              {fileName
                ? `Uploaded: ${fileName}`
                : editingMaterialId && fileType === 'pdf'
                ? 'PDF File Attached (Click to replace with new PDF)'
                : 'Click to Upload PDF or HTML Code File'}
            </span>
            <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
              Supports .pdf, .html, .htm, .md (Auto-converts to MongoDB Base64 payload)
            </span>
          </div>

          {/* CODE / MARKDOWN DESIGNER HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>
              {fileType === 'html' ? 'HTML Body Code (Direct Design):' : 'Content / Markdown Notes:'}
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button size="small" variant="text" onClick={handleInsertTemplate} sx={{ textTransform: 'none', fontSize: '0.78rem' }}>
                Insert Sample Template
              </Button>
              {fileType === 'html' && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={showPreview ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  onClick={() => setShowPreview(!showPreview)}
                  sx={{ textTransform: 'none', fontSize: '0.78rem' }}
                >
                  {showPreview ? 'Hide Preview' : 'Live Preview'}
                </Button>
              )}
            </div>
          </div>

          <TextField
            label={fileType === 'html' ? 'HTML Code (<div style="...">...</div>)' : 'Markdown / Text Content'}
            size="small"
            multiline
            rows={5}
            placeholder={
              fileType === 'html'
                ? '<h3>Module 1: High Yield Concepts</h3><p>Custom HTML notes rendered watermarked inside reader...</p>'
                : '### High Yield Points\n- Metric 1\n- Metric 2'
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* LIVE HTML PREVIEW BOX */}
          {showPreview && fileType === 'html' && content && (
            <div className="sc-mc-preview-container">
              <div style={{ fontSize: '0.7rem', color: '#64748B', marginBottom: 6, fontWeight: 700 }}>
                LIVE PREVIEW (IN-APP STUDENT READER SIMULATION):
              </div>
              <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          )}

          <Button type="submit" variant="contained" size="medium" sx={{ mt: 1 }}>
            {editingMaterialId ? 'Save Changes to Study Material' : '+ Attach DRM Study Material to Masterclass'}
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
