import React, { useState, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import './CourseFormDialogs.css';

function CourseFormFields({ state, onChange, isCreate = false }) {
  const fileInputRef = useRef(null);
  const [photoError, setPhotoError] = useState('');

  const modules = Array.isArray(state.curriculum) ? state.curriculum : [];

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    if (file.size > 4 * 1024 * 1024) {
      setPhotoError('Image file exceeds 4 MB limit. Please upload a smaller cover photo or paste an image URL.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({ ...state, imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddModule = () => {
    const next = [
      ...modules,
      {
        moduleTitle: `Module ${modules.length + 1}: Core Concepts`,
        duration: 'Week 1',
        lessonsText: 'Introduction & core foundations',
      },
    ];
    onChange({ ...state, curriculum: next });
  };

  const handleModuleChange = (idx, field, value) => {
    const next = modules.map((mod, mIdx) => (mIdx === idx ? { ...mod, [field]: value } : mod));
    onChange({ ...state, curriculum: next });
  };

  const handleRemoveModule = (idx) => {
    const next = modules.filter((_, mIdx) => mIdx !== idx);
    onChange({ ...state, curriculum: next });
  };

  return (
    <>
      {isCreate && (
        <div className="sc-dialog-two-col">
          <TextField
            label="Course Slug ID"
            size="small"
            required
            placeholder="e.g. dsa_boot_camp"
            value={state.productId || ''}
            onChange={(e) => onChange({ ...state, productId: e.target.value })}
          />
          <TextField
            select
            label="Category"
            size="small"
            value={state.category || 'course'}
            onChange={(e) => onChange({ ...state, category: e.target.value })}
          >
            <MenuItem value="course">Self-Paced Course</MenuItem>
            <MenuItem value="masterclass">Live Masterclass</MenuItem>
            <MenuItem value="channel">Job Channel</MenuItem>
          </TextField>
        </div>
      )}

      <div className="sc-dialog-two-col">
        <TextField
          label="Selling Price (₹ INR)"
          type="number"
          size="small"
          required
          value={state.price}
          onChange={(e) => onChange({ ...state, price: e.target.value })}
        />
        <TextField
          label="Original Was Price (₹)"
          type="number"
          size="small"
          value={state.originalPrice || ''}
          onChange={(e) => onChange({ ...state, originalPrice: e.target.value })}
        />
      </div>

      <TextField
        label="Course Title"
        size="small"
        fullWidth
        required
        value={state.title || ''}
        onChange={(e) => onChange({ ...state, title: e.target.value })}
      />

      {!isCreate && (
        <div className="sc-dialog-two-col">
          <TextField
            select
            label="Category Schema"
            size="small"
            value={state.category || 'masterclass'}
            onChange={(e) => onChange({ ...state, category: e.target.value })}
          >
            <MenuItem value="masterclass">Masterclass (Live Workshop)</MenuItem>
            <MenuItem value="channel">Job Channel</MenuItem>
            <MenuItem value="course">Self-Paced Course Track</MenuItem>
          </TextField>

          <TextField
            label="Promotional Badge"
            size="small"
            value={state.badge || ''}
            onChange={(e) => onChange({ ...state, badge: e.target.value })}
          />
        </div>
      )}

      {isCreate && (
        <TextField
          label="Promotional Badge"
          size="small"
          fullWidth
          value={state.badge || ''}
          onChange={(e) => onChange({ ...state, badge: e.target.value })}
        />
      )}

      <div className="sc-dialog-two-col">
        <TextField
          label="Duration (e.g. 12 Weeks • Live)"
          size="small"
          value={state.duration || ''}
          onChange={(e) => onChange({ ...state, duration: e.target.value })}
        />
        <TextField
          label="Level / Eligibility"
          size="small"
          value={state.level || ''}
          onChange={(e) => onChange({ ...state, level: e.target.value })}
        />
      </div>

      <TextField
        label="Schedule / Session Date Label"
        size="small"
        fullWidth
        value={state.sessionDate || ''}
        onChange={(e) => onChange({ ...state, sessionDate: e.target.value })}
      />

      {/* Cover Image Link or Upload to DB */}
      <div className="sc-course-photo-panel">
        <TextField
          label="Course Cover Photo URL (or Upload Below to Save in DB)"
          size="small"
          fullWidth
          placeholder="https://images.unsplash.com/..."
          value={state.imageUrl || ''}
          onChange={(e) => onChange({ ...state, imageUrl: e.target.value })}
        />
        <div className="sc-course-photo-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageFileChange}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image File to DB
          </Button>
          {state.imageUrl && (
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() => onChange({ ...state, imageUrl: '' })}
            >
              Remove Photo
            </Button>
          )}
        </div>
        {photoError && <Alert severity="error">{photoError}</Alert>}
        {state.imageUrl && (
          <div className="sc-course-photo-preview-wrap">
            <img src={state.imageUrl} alt="Course Cover Preview" className="sc-course-photo-preview" />
          </div>
        )}
      </div>

      <TextField
        label="Course Overview / Description"
        size="small"
        multiline
        rows={2}
        fullWidth
        value={state.description || ''}
        onChange={(e) => onChange({ ...state, description: e.target.value })}
      />

      <TextField
        label="What You Will Learn (One outcome per line)"
        size="small"
        multiline
        rows={3}
        fullWidth
        value={state.whatYouWillLearnText || ''}
        onChange={(e) => onChange({ ...state, whatYouWillLearnText: e.target.value })}
      />

      {/* Structured Course Curriculum Builder */}
      <div className="sc-curriculum-section">
        <div className="sc-curriculum-header">
          <h4 className="sc-curriculum-title">Course Curriculum &amp; Structure ({modules.length} Modules)</h4>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddModule}>
            Add Module
          </Button>
        </div>

        {modules.map((mod, idx) => {
          const lessonsStr =
            mod.lessonsText !== undefined
              ? mod.lessonsText
              : Array.isArray(mod.lessons)
              ? mod.lessons.join('\n')
              : '';
          return (
            <div key={idx} className="sc-curriculum-module-box">
              <div className="sc-curriculum-module-top">
                <span className="sc-curriculum-module-badge">Module #{idx + 1}</span>
                <IconButton
                  size="small"
                  color="error"
                  aria-label={`Remove Module ${idx + 1}`}
                  onClick={() => handleRemoveModule(idx)}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </div>
              <div className="sc-dialog-two-col">
                <TextField
                  label="Module Title"
                  size="small"
                  value={mod.moduleTitle || ''}
                  onChange={(e) => handleModuleChange(idx, 'moduleTitle', e.target.value)}
                />
                <TextField
                  label="Module Duration"
                  size="small"
                  placeholder="e.g. Week 1 • 45 Mins"
                  value={mod.duration || ''}
                  onChange={(e) => handleModuleChange(idx, 'duration', e.target.value)}
                />
              </div>
              <TextField
                label="Lessons / Topics Covered (One per line)"
                size="small"
                multiline
                rows={2}
                fullWidth
                value={lessonsStr}
                onChange={(e) => handleModuleChange(idx, 'lessonsText', e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <TextField
        label="Key Highlights / Features (One per line)"
        size="small"
        multiline
        rows={3}
        fullWidth
        value={state.featuresText || ''}
        onChange={(e) => onChange({ ...state, featuresText: e.target.value })}
      />

      <TextField
        label="Mentors (Name (Company), one per line)"
        size="small"
        multiline
        rows={2}
        fullWidth
        value={state.mentorsText || ''}
        onChange={(e) => onChange({ ...state, mentorsText: e.target.value })}
      />

      {!isCreate && (
        <FormControlLabel
          control={
            <Switch
              checked={state.isActive !== false}
              onChange={(e) => onChange({ ...state, isActive: e.target.checked })}
            />
          }
          label="Active & Purchasable in Student Catalog"
        />
      )}
    </>
  );
}

export function EditCourseDialog({ editingCourse, setEditingCourse, onSubmit }) {
  return (
    <Dialog
      open={Boolean(editingCourse)}
      onClose={() => setEditingCourse(null)}
      maxWidth="md"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>
        Edit Course Details, Cover Photo &amp; Curriculum: {editingCourse?.title}
      </DialogTitle>
      <form id="edit-pricing-form" onSubmit={onSubmit}>
        <DialogContent dividers className="sc-dialog-stack">
          {editingCourse && (
            <CourseFormFields
              state={editingCourse}
              onChange={setEditingCourse}
              isCreate={false}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingCourse(null)}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save &amp; Sync Live
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

const EMPTY_NEW_COURSE = {
  productId: '',
  title: '',
  price: 99,
  originalPrice: 499,
  category: 'course',
  badge: 'New Launch',
  duration: 'Self-Paced / Live',
  level: 'All Levels',
  imageUrl: '',
  description: '',
  sessionDate: 'Instant Access',
  whatYouWillLearnText: '',
  featuresText: '',
  mentorsText: '',
  curriculum: [],
};

export function AddCourseDialog({ open, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_NEW_COURSE);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm(EMPTY_NEW_COURSE);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth slotProps={{ paper: { sx: { borderRadius: 3, p: 1 } } }}>
      <DialogTitle sx={{ fontWeight: 800 }}>Create New Course Plan</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers className="sc-dialog-stack">
          <CourseFormFields state={form} onChange={setForm} isCreate={true} />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Create Plan
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
