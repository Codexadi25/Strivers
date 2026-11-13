import React, { useState, useRef } from 'react';
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
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CodeIcon from '@mui/icons-material/Code';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
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

export function ManageMaterialsDialog({ masterclass, onClose, onAddMaterial, onDeleteMaterial }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState('html');
  const [content, setContent] = useState('');
  const [fileData, setFileData] = useState('');
  const [fileName, setFileName] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

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
      // Markdown or plain text
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

  const handleAdd = (e) => {
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

    onAddMaterial(masterclass.productId, payload);
    setTitle('');
    setDescription('');
    setContent('');
    setFileData('');
    setFileName('');
    setShowPreview(false);
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
            (masterclass?.notesAndPdfs || []).map((mat) => (
              <div key={mat.materialId} className="sc-mc-list-row" style={{ marginBottom: 8 }}>
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
                <IconButton size="small" color="error" onClick={() => onDeleteMaterial(masterclass.productId, mat.materialId)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </div>
            ))
          )}
        </div>

        {/* NEW MATERIAL DESIGNER / UPLOADER FORM */}
        <form onSubmit={handleAdd} className="sc-mc-dialog-stack" style={{ marginTop: 12 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A' }}>
            Create / Upload New Study Material
          </Typography>

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
              {fileName ? `Uploaded: ${fileName}` : 'Click to Upload PDF or HTML Code File'}
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
            + Attach DRM Study Material to Masterclass
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}
