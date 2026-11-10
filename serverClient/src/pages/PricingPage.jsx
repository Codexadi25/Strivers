import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import TuneIcon from '@mui/icons-material/Tune';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import { apiCall } from '../services/api';
import CoursePlanCard from '../components/pricing/CoursePlanCard';
import { EditCourseDialog, AddCourseDialog } from '../components/pricing/CourseFormDialogs';
import CatalogMetaDialog from '../components/pricing/CatalogMetaDialog';
import './PricingPage.css';

export default function PricingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState(null);
  const [addingCourse, setAddingCourse] = useState(false);
  const [editingCatalogMeta, setEditingCatalogMeta] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: '' });

  const loadCourses = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/courses');
      if (res.courses && Array.isArray(res.courses)) {
        setCourses(res.courses);
      }
    } catch (err) {
      setStatusMsg({ text: `Failed to load courses: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const showTempStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: '' }), 4500);
  };

  const parseLines = (str) =>
    (str || '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

  const parseMentors = (str) =>
    parseLines(str).map((line) => {
      const match = line.match(/^([^(]+?)(?:\s*\(([^)]+)\)|\s*-\s*(.+))?$/);
      if (match) {
        return {
          name: (match[1] || '').trim(),
          company: (match[2] || match[3] || '').trim(),
          role: (match[3] || match[2] || '').trim(),
        };
      }
      return { name: line.trim() };
    });

  const normalizeCurriculum = (mods) =>
    (Array.isArray(mods) ? mods : []).map((m) => ({
      moduleTitle: (m.moduleTitle || '').trim(),
      duration: (m.duration || '').trim(),
      lessons: m.lessonsText !== undefined ? parseLines(m.lessonsText) : (Array.isArray(m.lessons) ? m.lessons : []),
    })).filter((m) => m.moduleTitle);

  const handleOpenEdit = (c) => {
    setEditingCourse({
      ...c,
      featuresText: (c.features || []).join('\n'),
      whatYouWillLearnText: (c.whatYouWillLearn || []).join('\n'),
      mentorsText: (c.mentors || []).map((m) => (m.company ? `${m.name} (${m.company})` : m.name)).join('\n'),
      curriculum: (c.curriculum || []).map((m) => ({
        ...m,
        lessonsText: Array.isArray(m.lessons) ? m.lessons.join('\n') : '',
      })),
    });
  };

  const handleSavePrice = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    const cid = editingCourse.productId || editingCourse._id;

    try {
      await apiCall(`/courses/${encodeURIComponent(cid)}`, {
        method: 'PUT',
        body: JSON.stringify({
          price: Number(editingCourse.price),
          originalPrice: editingCourse.originalPrice ? Number(editingCourse.originalPrice) : null,
          title: editingCourse.title,
          badge: editingCourse.badge,
          imageUrl: editingCourse.imageUrl || '',
          duration: editingCourse.duration || '',
          level: editingCourse.level || '',
          description: editingCourse.description,
          sessionDate: editingCourse.sessionDate,
          category: editingCourse.category,
          isActive: editingCourse.isActive !== false,
          features: parseLines(editingCourse.featuresText),
          whatYouWillLearn: parseLines(editingCourse.whatYouWillLearnText),
          curriculum: normalizeCurriculum(editingCourse.curriculum),
          mentors: parseMentors(editingCourse.mentorsText),
        }),
      });

      showTempStatus(`✓ Course details updated for ${editingCourse.title}! Immediately live across storefront and checkout.`);
      setEditingCourse(null);
      loadCourses();
    } catch (err) {
      showTempStatus(`Error updating course: ${err.message}`, 'error');
    }
  };

  const handleCreateCourse = async (form) => {
    try {
      await apiCall('/courses', {
        method: 'POST',
        body: JSON.stringify({
          productId: form.productId.trim(),
          title: form.title.trim(),
          price: Number(form.price),
          originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
          category: form.category,
          badge: form.badge,
          imageUrl: form.imageUrl || '',
          duration: form.duration || 'Self-Paced / Live',
          level: form.level || 'All Levels',
          description: form.description,
          sessionDate: form.sessionDate || 'Upcoming Live Session',
          features: parseLines(form.featuresText || form.features),
          whatYouWillLearn: parseLines(form.whatYouWillLearnText),
          curriculum: normalizeCurriculum(form.curriculum),
          mentors: parseMentors(form.mentorsText),
          isActive: true,
        }),
      });

      showTempStatus(`✓ New course "${form.title}" created successfully!`);
      setAddingCourse(false);
      loadCourses();
    } catch (err) {
      showTempStatus(`Error creating course: ${err.message}`, 'error');
    }
  };

  return (
    <div className="pricing-page-root">
      <div className="pricing-page-header">
        <div>
          <h2 className="pricing-page-title">Course Pricing &amp; Plans Engine</h2>
          <p className="pricing-page-desc">
            Directly modify course &amp; subscription prices in database. Changes immediately reflect in checkout, APIs, and student /courses catalog.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<TuneIcon />}
            onClick={() => setEditingCatalogMeta(true)}
          >
            Edit /courses Hero &amp; FAQs
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setAddingCourse(true)}
            className="pricing-btn-add"
          >
            Add New Course Plan
          </Button>
        </div>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type || 'success'} sx={{ mb: 2.5 }} onClose={() => setStatusMsg({ text: '', type: '' })}>
          {statusMsg.text}
        </Alert>
      )}

      {loading ? (
        <div className="pricing-loading-box">
          <CircularProgress size={28} />
          <p>Loading real-time course plans from database...</p>
        </div>
      ) : (
        <div className="pricing-grid">
          {courses.map((c) => (
            <CoursePlanCard key={c.productId || c._id} course={c} onEdit={handleOpenEdit} />
          ))}
        </div>
      )}

      <Paper variant="outlined" className="pricing-audit-notice-section" sx={{ p: 2, borderRadius: 3 }}>
        <h4 className="pricing-notice-title">Pricing Audit &amp; Impact Notice</h4>
        <div className="pricing-notice-box">
          <LightbulbOutlinedIcon className="pricing-notice-icon" />
          <p>
            <strong>Real-Time Server-Side Protection:</strong> When you change a price here, the server updates the Course store &amp; MongoDB collection. During user checkout, the backend calculates the exact price directly from the server, preventing client-side tampering while instantly updating /courses storefront pages.
          </p>
        </div>
      </Paper>

      <EditCourseDialog
        editingCourse={editingCourse}
        setEditingCourse={setEditingCourse}
        onSubmit={handleSavePrice}
      />

      <AddCourseDialog
        open={addingCourse}
        onClose={() => setAddingCourse(false)}
        onSubmit={handleCreateCourse}
      />

      <CatalogMetaDialog
        open={editingCatalogMeta}
        onClose={() => setEditingCatalogMeta(false)}
        onSaved={(msg) => showTempStatus(msg)}
      />
    </div>
  );
}
