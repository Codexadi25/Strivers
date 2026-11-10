import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import { apiCall } from '../../services/api';
import './CatalogMetaDialog.css';

export default function CatalogMetaDialog({ open, onClose, onSaved }) {
  const [badge, setBadge] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [faqsJson, setFaqsJson] = useState('');
  const [companiesCsv, setCompaniesCsv] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!open) return;
    setErr('');
    apiCall('/catalog-meta')
      .then((res) => {
        const meta = res.catalogMeta;
        if (meta) {
          setBadge(meta.hero?.badge || '');
          setTitle(meta.hero?.title || '');
          setSubtitle(meta.hero?.subtitle || '');
          setFaqsJson(JSON.stringify(meta.faqs || [], null, 2));
          setCompaniesCsv((meta.companies || []).join(', '));
        }
      })
      .catch((e) => setErr(e.message));
  }, [open]);

  const handleSave = async (e) => {
    e.preventDefault();
    setErr('');
    let parsedFaqs = [];
    try {
      parsedFaqs = JSON.parse(faqsJson || '[]');
    } catch {
      setErr('FAQs JSON format is invalid.');
      return;
    }

    setSaving(true);
    try {
      await apiCall('/catalog-meta', {
        method: 'PUT',
        body: JSON.stringify({
          hero: { badge, title, subtitle },
          faqs: parsedFaqs,
          companies: companiesCsv.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      onSaved('Courses Hero, FAQs & Catalog Meta synced dynamically to Database & Client!');
      onClose();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Student /courses Hero, FAQs & Dynamic Storefront Content</DialogTitle>
      <form onSubmit={handleSave}>
        <DialogContent className="sc-catalog-dialog-section">
          {err && <Alert severity="error">{err}</Alert>}

          <span className="sc-catalog-subtitle-tag">Course Catalog Hero Section</span>
          <TextField
            label="Hero Pill Badge"
            size="small"
            fullWidth
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
          <TextField
            label="Hero Headline"
            size="small"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Hero Subtitle"
            size="small"
            multiline
            rows={2}
            fullWidth
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />

          <TextField
            label="Hiring Partner Companies (Comma-separated)"
            size="small"
            fullWidth
            value={companiesCsv}
            onChange={(e) => setCompaniesCsv(e.target.value)}
          />

          <span className="sc-catalog-subtitle-tag">Dynamic FAQs JSON Array</span>
          <TextField
            label="FAQs Array (q & a objects)"
            size="small"
            multiline
            rows={7}
            fullWidth
            value={faqsJson}
            onChange={(e) => setFaqsJson(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? 'Syncing to Database...' : 'Save & Publish to /courses'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
