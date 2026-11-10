import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
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
              <TextField
                label="Meeting Passcode"
                size="small"
                value={editingMeeting.meetingCode || ''}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, meetingCode: e.target.value })}
              />
              <TextField
                select
                label="Live Broadcast Status"
                size="small"
                value={editingMeeting.sessionStatus || 'upcoming'}
                onChange={(e) => setEditingMeeting({ ...editingMeeting, sessionStatus: e.target.value })}
              >
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="live">Live Now (Active Room)</MenuItem>
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
  return (
    <Dialog open={Boolean(editingDetails)} onClose={() => setEditingDetails(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Edit Masterclass Details</DialogTitle>
      <form onSubmit={onSave}>
        <DialogContent dividers className="sc-mc-dialog-stack">
          {editingDetails && (
            <>
              <TextField
                label="Title"
                size="small"
                required
                value={editingDetails.title || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, title: e.target.value })}
              />
              <TextField
                label="Description"
                size="small"
                multiline
                rows={2}
                value={editingDetails.description || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, description: e.target.value })}
              />
              <TextField
                label="Price (₹)"
                type="number"
                size="small"
                required
                value={editingDetails.price ?? 0}
                onChange={(e) => setEditingDetails({ ...editingDetails, price: e.target.value })}
              />
              <TextField
                label="DRM Secret Passcode"
                size="small"
                value={editingDetails.secretPasscode || ''}
                onChange={(e) => setEditingDetails({ ...editingDetails, secretPasscode: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingDetails(null)}>Cancel</Button>
          <Button type="submit" variant="contained">Update Details</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export function ManageSlotsDialog({ masterclass, onClose, onAddSlot, onDeleteSlot }) {
  const [dateTime, setDateTime] = useState('');
  const [mentorName, setMentorName] = useState('Unicorn Mentors');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!dateTime.trim()) return;
    onAddSlot(masterclass.productId, { dateTime: dateTime.trim(), mentorName });
    setDateTime('');
  };

  return (
    <Dialog open={Boolean(masterclass)} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Timing Slots: {masterclass?.title}</DialogTitle>
      <DialogContent dividers className="sc-mc-dialog-stack">
        {(masterclass?.timingSlots || []).map((slot) => (
          <div key={slot.slotId} className="sc-mc-list-row">
            <div>
              <strong>{slot.title || slot.dateTime || slot.date}</strong>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                {slot.startTime ? `${slot.startTime} - ${slot.endTime} IST · ` : ''}{slot.mentorName || 'Unicorn Mentors'}
              </div>
            </div>
            <IconButton size="small" color="error" onClick={() => onDeleteSlot(masterclass.productId, slot.slotId)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </div>
        ))}

        <form onSubmit={handleAdd} className="sc-mc-dialog-stack" style={{ marginTop: 8 }}>
          <TextField
            label="New Slot Title / Date & Time"
            size="small"
            required
            placeholder="e.g. Sunday, 22 Nov 2026 · 11:00 AM IST"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
          <TextField
            label="Host Mentor"
            size="small"
            value={mentorName}
            onChange={(e) => setMentorName(e.target.value)}
          />
          <Button type="submit" variant="contained" size="small">
            + Add Live Timing Slot
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

export function ManageMaterialsDialog({ masterclass, onClose, onAddMaterial, onDeleteMaterial }) {
  const [title, setTitle] = useState('');
  const [fileType, setFileType] = useState('pdf');
  const [content, setContent] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddMaterial(masterclass.productId, { title: title.trim(), fileType, content });
    setTitle('');
    setContent('');
  };

  return (
    <Dialog open={Boolean(masterclass)} onClose={onClose} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>DRM Study Vault: {masterclass?.title}</DialogTitle>
      <DialogContent dividers className="sc-mc-dialog-stack">
        {(masterclass?.notesAndPdfs || []).map((mat) => (
          <div key={mat.materialId} className="sc-mc-list-row">
            <div>
              <strong>{mat.title}</strong>
              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                Format: {(mat.fileType || 'pdf').toUpperCase()} · {mat.drmLevel || 'DRM_ENFORCED'}
              </div>
            </div>
            <IconButton size="small" color="error" onClick={() => onDeleteMaterial(masterclass.productId, mat.materialId)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </div>
        ))}

        <form onSubmit={handleAdd} className="sc-mc-dialog-stack" style={{ marginTop: 8 }}>
          <TextField
            label="Study Material Title"
            size="small"
            required
            placeholder="e.g. ATS Resume Playbook v2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            select
            label="Document Type"
            size="small"
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <MenuItem value="pdf">PDF Document</MenuItem>
            <MenuItem value="notes">Markdown Study Notes</MenuItem>
            <MenuItem value="cheatsheet">High-Yield Cheatsheet</MenuItem>
          </TextField>
          <TextField
            label="Content / Markdown Notes"
            size="small"
            multiline
            rows={3}
            placeholder="Content stored encoded & watermarked inside DRM reader"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button type="submit" variant="contained" size="small">
            + Attach DRM Study Material
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
