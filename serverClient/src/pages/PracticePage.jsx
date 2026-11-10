import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { apiCall } from '../services/api';
import PracticeSheetCard from '../components/practice/PracticeSheetCard';
import './PracticePage.css';

export default function PracticePage() {
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  const [form, setForm] = useState({
    title: '',
    category: 'Engineering',
    roleTag: '',
    totalProblems: 30,
    companies: '',
  });

  const fetchPractice = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/practice');
      if (res.sheets) {
        setSheets(res.sheets);
      }
    } catch (err) {
      setStatusMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPractice();
  }, []);

  const showNotice = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 4000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const companyTags = form.companies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await apiCall('/practice', {
        method: 'POST',
        body: JSON.stringify({
          title: form.title,
          category: form.category,
          roleType: form.category === 'Engineering' ? 'tech' : 'non-tech',
          roleTag: form.roleTag || 'All Roles',
          totalProblems: Number(form.totalProblems) || 20,
          companyTags,
        }),
      });
      showNotice(`✓ Practice sheet "${form.title}" published to Student Portal!`);
      setModalOpen(false);
      setForm({ title: '', category: 'Engineering', roleTag: '', totalProblems: 30, companies: '' });
      fetchPractice();
    } catch (err) {
      showNotice(`Error creating practice sheet: ${err.message}`, 'error');
    }
  };

  const handleDelete = async (sheetId) => {
    if (!window.confirm('Delete this practice track from database?')) return;
    try {
      await apiCall(`/practice/${encodeURIComponent(sheetId)}`, { method: 'DELETE' });
      showNotice('✓ Practice track deleted cleanly.');
      fetchPractice();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  return (
    <div className="practice-page-root">
      <div className="practice-header">
        <div>
          <h2 className="practice-title">Practice Sheets &amp; Job Roles Engine</h2>
          <p className="practice-desc">
            Curate problem sets, link company mock scenarios, and publish role tracks live to /practice.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="practice-btn-add"
          onClick={() => setModalOpen(true)}
        >
          Add Practice Track
        </Button>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '24px 0' }}>
          <CircularProgress size={24} />
          <span>Loading practice curriculum tracks...</span>
        </div>
      ) : (
        <div className="practice-grid">
          {sheets.map((s) => (
            <PracticeSheetCard key={s.sheetId || s.id} sheet={s} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>Create New Practice Track</DialogTitle>
        <form id="practice-form" onSubmit={handleCreate}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Track Title"
              size="small"
              required
              placeholder="e.g. SDE Core DSA 75"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TextField
                select
                label="Category"
                size="small"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <MenuItem value="Engineering">Engineering (SDE)</MenuItem>
                <MenuItem value="Operations">Quick Commerce Operations</MenuItem>
                <MenuItem value="Analytics">Data &amp; SQL Analytics</MenuItem>
              </TextField>

              <TextField
                label="Target Role Tag"
                size="small"
                placeholder="e.g. SDE-1 / SDE-2"
                value={form.roleTag}
                onChange={(e) => setForm({ ...form, roleTag: e.target.value })}
              />
            </div>

            <TextField
              label="Total Questions"
              type="number"
              size="small"
              value={form.totalProblems}
              onChange={(e) => setForm({ ...form, totalProblems: e.target.value })}
            />

            <TextField
              label="Hiring Companies (Comma-separated)"
              size="small"
              placeholder="Blinkit, Zomato, Porter, Amazon"
              value={form.companies}
              onChange={(e) => setForm({ ...form, companies: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create Track
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
