import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Divider from '@mui/material/Divider';

import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';

import { apiCall } from '../services/api';
import PracticeSheetCard from '../components/practice/PracticeSheetCard';
import './PracticePage.css';

export default function PracticePage() {
  const [activeTab, setActiveTab] = useState(0); // 0: Practice Sheets, 1: Downloadable Notes, 2: Mentorship Schedule
  const [sheets, setSheets] = useState([]);
  const [notes, setNotes] = useState([]);
  const [mentorship, setMentorship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  // Filter & Search states
  const [sheetCategoryFilter, setSheetCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Practice Sheet Edit / Create Dialog State
  const [sheetModalOpen, setSheetModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [sheetForm, setSheetForm] = useState({
    sheetId: '',
    title: '',
    category: 'Engineering',
    roleType: 'tech',
    targetRole: '',
    description: '',
    companies: '',
    price: 0,
    isFree: true,
    difficultyLevel: 'Intermediate',
    badge: 'Free Enrollment',
    linkedCourseId: '',
  });

  // Curriculum & Questions Management Dialog State
  const [curriculumModalOpen, setCurriculumModalOpen] = useState(false);
  const [curriculumSheet, setCurriculumSheet] = useState(null);
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({ topicId: '', topicTitle: '', summary: '' });

  // Problem Dialog State
  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [targetTopicId, setTargetTopicId] = useState(null);
  const [editingProblem, setEditingProblem] = useState(null);
  const [problemForm, setProblemForm] = useState({
    id: '',
    title: '',
    company: 'Google',
    difficulty: 'Medium',
    type: 'Scenario',
    scenario: '',
    solutionGuidance: '',
    keyTakeaway: '',
    resourceLink: '',
    videoUrl: '',
    acceptanceRate: '85%',
  });

  // Downloadable Notes Modal State
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteForm, setNoteForm] = useState({
    noteId: '',
    title: '',
    subtitle: '',
    tag: 'Core Academic',
    color: '#3B82F6',
    type: 'free',
    fileType: 'html',
    secretCode: '',
    linkedMasterclassId: 'masterclass',
    content: '',
  });

  // DRM Note Preview Modal State
  const [previewNote, setPreviewNote] = useState(null);

  // Fetch all data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [sheetRes, noteRes, mentorRes] = await Promise.allSettled([
        apiCall('/practice'),
        apiCall('/notes'),
        apiCall('/mentorship'),
      ]);

      if (sheetRes.status === 'fulfilled' && sheetRes.value?.sheets) {
        setSheets(sheetRes.value.sheets);
        if (curriculumSheet) {
          const fresh = sheetRes.value.sheets.find(
            (s) => (s.sheetId || s.id) === (curriculumSheet.sheetId || curriculumSheet.id)
          );
          if (fresh) setCurriculumSheet(fresh);
        }
      }
      if (noteRes.status === 'fulfilled' && noteRes.value?.notes) {
        setNotes(noteRes.value.notes);
      }
      if (mentorRes.status === 'fulfilled' && mentorRes.value?.mentorship) {
        setMentorship(mentorRes.value.mentorship);
      }
    } catch (err) {
      showNotice(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showNotice = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 5000);
  };

  // ==========================================
  // PRACTICE SHEET ACTIONS
  // ==========================================
  const handleOpenCreateSheet = () => {
    setEditingSheet(null);
    setSheetForm({
      sheetId: `track_${Date.now()}`,
      title: '',
      category: 'Engineering',
      roleType: 'tech',
      targetRole: 'SDE-1 / SDE-2',
      description: '',
      companies: 'Amazon, Google, Blinkit, Zomato',
      price: 0,
      isFree: true,
      difficultyLevel: 'Intermediate',
      badge: 'Free Enrollment',
      linkedCourseId: '',
    });
    setSheetModalOpen(true);
  };

  const handleOpenEditSheet = (sheet) => {
    setEditingSheet(sheet);
    const comps = Array.isArray(sheet.companyTags || sheet.targetCompanies)
      ? (sheet.companyTags || sheet.targetCompanies).join(', ')
      : '';
    setSheetForm({
      sheetId: sheet.sheetId || sheet.id,
      title: sheet.title || '',
      category: sheet.category || (sheet.roleType === 'tech' ? 'Engineering' : 'Operations'),
      roleType: sheet.roleType || 'non-tech',
      targetRole: sheet.targetRole || sheet.roleTag || '',
      description: sheet.description || '',
      companies: comps,
      price: Number(sheet.price) || 0,
      isFree: sheet.isFree !== false && (Number(sheet.price) === 0 || !sheet.price),
      difficultyLevel: sheet.difficultyLevel || sheet.difficulty || 'Intermediate',
      badge: sheet.badge || (sheet.price > 0 ? 'Pro Track' : 'Free Enrollment'),
      linkedCourseId: sheet.linkedCourseId || '',
    });
    setSheetModalOpen(true);
  };

  const handleSaveSheet = async (e) => {
    e.preventDefault();
    const companyTags = sheetForm.companies
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      sheetId: sheetForm.sheetId.trim().toLowerCase(),
      title: sheetForm.title.trim(),
      category: sheetForm.category,
      roleType: sheetForm.category === 'Engineering' ? 'tech' : sheetForm.roleType,
      targetRole: sheetForm.targetRole.trim(),
      description: sheetForm.description.trim(),
      targetCompanies: companyTags,
      companyTags,
      price: sheetForm.isFree ? 0 : Number(sheetForm.price) || 0,
      isFree: Boolean(sheetForm.isFree),
      difficultyLevel: sheetForm.difficultyLevel,
      badge: sheetForm.badge,
      linkedCourseId: sheetForm.linkedCourseId.trim(),
    };

    try {
      if (editingSheet) {
        const sid = editingSheet.sheetId || editingSheet.id;
        await apiCall(`/practice/${encodeURIComponent(sid)}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showNotice(`✓ Practice track "${payload.title}" updated cleanly!`);
      } else {
        await apiCall('/practice', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showNotice(`✓ Practice track "${payload.title}" created and published!`);
      }
      setSheetModalOpen(false);
      fetchData();
    } catch (err) {
      showNotice(`Error saving track: ${err.message}`, 'error');
    }
  };

  const handleDeleteSheet = async (sheetId) => {
    if (!window.confirm(`Permanently remove track "${sheetId}" from database?`)) return;
    try {
      await apiCall(`/practice/${encodeURIComponent(sheetId)}`, { method: 'DELETE' });
      showNotice('✓ Practice track deleted cleanly.');
      fetchData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // ==========================================
  // TOPIC (MODULE) ACTIONS
  // ==========================================
  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    setTopicForm({
      topicId: `topic_${Date.now()}`,
      topicTitle: '',
      summary: '',
    });
    setTopicModalOpen(true);
  };

  const handleOpenEditTopic = (top) => {
    setEditingTopic(top);
    setTopicForm({
      topicId: top.topicId,
      topicTitle: top.topicTitle,
      summary: top.summary || '',
    });
    setTopicModalOpen(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!curriculumSheet) return;
    const sid = curriculumSheet.sheetId || curriculumSheet.id;

    try {
      if (editingTopic) {
        await apiCall(`/practice/${encodeURIComponent(sid)}/topics/${encodeURIComponent(editingTopic.topicId)}`, {
          method: 'PUT',
          body: JSON.stringify({
            topicTitle: topicForm.topicTitle.trim(),
            summary: topicForm.summary.trim(),
          }),
        });
        showNotice(`✓ Module "${topicForm.topicTitle}" updated.`);
      } else {
        await apiCall(`/practice/${encodeURIComponent(sid)}/topics`, {
          method: 'POST',
          body: JSON.stringify({
            topicId: topicForm.topicId.trim(),
            topicTitle: topicForm.topicTitle.trim(),
            summary: topicForm.summary.trim(),
            problems: [],
          }),
        });
        showNotice(`✓ Module "${topicForm.topicTitle}" added.`);
      }
      setTopicModalOpen(false);
      fetchData();
    } catch (err) {
      showNotice(`Error saving topic: ${err.message}`, 'error');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!curriculumSheet || !window.confirm('Delete this module and all its problems?')) return;
    const sid = curriculumSheet.sheetId || curriculumSheet.id;
    try {
      await apiCall(`/practice/${encodeURIComponent(sid)}/topics/${encodeURIComponent(topicId)}`, {
        method: 'DELETE',
      });
      showNotice('✓ Module deleted.');
      fetchData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // ==========================================
  // PROBLEM (QUESTION / SCENARIO) ACTIONS
  // ==========================================
  const handleOpenAddProblem = (topicId) => {
    setTargetTopicId(topicId);
    setEditingProblem(null);
    setProblemForm({
      id: `prob_${Date.now()}`,
      title: '',
      company: 'Google',
      difficulty: 'Medium',
      type: 'Scenario',
      scenario: '',
      solutionGuidance: '',
      keyTakeaway: '',
      resourceLink: '',
      videoUrl: '',
      acceptanceRate: '85%',
    });
    setProblemModalOpen(true);
  };

  const handleOpenEditProblem = (topicId, prob) => {
    setTargetTopicId(topicId);
    setEditingProblem(prob);
    setProblemForm({
      id: prob.id,
      title: prob.title || '',
      company: prob.company || 'Google',
      difficulty: prob.difficulty || 'Medium',
      type: prob.type || 'Scenario',
      scenario: prob.scenario || '',
      solutionGuidance: prob.solutionGuidance || '',
      keyTakeaway: prob.keyTakeaway || '',
      resourceLink: prob.resourceLink || prob.articleUrl || prob.practiceUrl || '',
      videoUrl: prob.videoUrl || '',
      acceptanceRate: prob.acceptanceRate || '85%',
    });
    setProblemModalOpen(true);
  };

  const handleSaveProblem = async (e) => {
    e.preventDefault();
    if (!curriculumSheet || !targetTopicId) return;
    const sid = curriculumSheet.sheetId || curriculumSheet.id;

    const payload = {
      id: problemForm.id.trim(),
      title: problemForm.title.trim(),
      company: problemForm.company.trim(),
      difficulty: problemForm.difficulty,
      type: problemForm.type.trim(),
      scenario: problemForm.scenario.trim(),
      solutionGuidance: problemForm.solutionGuidance.trim(),
      keyTakeaway: problemForm.keyTakeaway.trim(),
      resourceLink: problemForm.resourceLink.trim(),
      videoUrl: problemForm.videoUrl.trim(),
      acceptanceRate: problemForm.acceptanceRate.trim(),
    };

    try {
      if (editingProblem) {
        await apiCall(
          `/practice/${encodeURIComponent(sid)}/topics/${encodeURIComponent(targetTopicId)}/problems/${encodeURIComponent(
            editingProblem.id
          )}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );
        showNotice(`✓ Problem "${payload.title}" updated cleanly.`);
      } else {
        await apiCall(
          `/practice/${encodeURIComponent(sid)}/topics/${encodeURIComponent(targetTopicId)}/problems`,
          {
            method: 'POST',
            body: JSON.stringify(payload),
          }
        );
        showNotice(`✓ Problem "${payload.title}" added to module.`);
      }
      setProblemModalOpen(false);
      fetchData();
    } catch (err) {
      showNotice(`Error saving problem: ${err.message}`, 'error');
    }
  };

  const handleDeleteProblem = async (topicId, problemId) => {
    if (!curriculumSheet || !window.confirm('Delete this problem question?')) return;
    const sid = curriculumSheet.sheetId || curriculumSheet.id;
    try {
      await apiCall(
        `/practice/${encodeURIComponent(sid)}/topics/${encodeURIComponent(topicId)}/problems/${encodeURIComponent(
          problemId
        )}`,
        {
          method: 'DELETE',
        }
      );
      showNotice('✓ Problem removed cleanly.');
      fetchData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // ==========================================
  // DOWNLOADABLE NOTES ACTIONS
  // ==========================================
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteForm({
      noteId: `note-${Date.now()}`,
      title: '',
      subtitle: '',
      tag: 'Core Academic',
      color: '#3B82F6',
      type: 'free',
      fileType: 'html',
      secretCode: '',
      linkedMasterclassId: 'masterclass',
      content: `<div style="font-family: sans-serif; padding: 24px; line-height: 1.6;">\n  <h2>New Study Handbook</h2>\n  <p>Comprehensive revision guide for technical placements.</p>\n</div>`,
    });
    setNoteModalOpen(true);
  };

  const handleOpenEditNote = (note) => {
    setEditingNote(note);
    let decodedContent = '';
    if (note.fileData) {
      try {
        decodedContent = atob(note.fileData);
      } catch (_) {
        decodedContent = note.fileData;
      }
    }
    setNoteForm({
      noteId: note.noteId || note.id,
      title: note.title || '',
      subtitle: note.subtitle || '',
      tag: note.tag || 'Core Academic',
      color: note.color || '#3B82F6',
      type: note.type || 'free',
      fileType: note.fileType || 'html',
      secretCode: note.secretCode || '',
      linkedMasterclassId: note.linkedMasterclassId || 'masterclass',
      content: decodedContent || `<div style="font-family: sans-serif; padding: 24px;"><h2>${note.title}</h2><p>${note.subtitle || ''}</p></div>`,
    });
    setNoteModalOpen(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    const payload = {
      noteId: noteForm.noteId.trim().toLowerCase(),
      title: noteForm.title.trim(),
      subtitle: noteForm.subtitle.trim(),
      tag: noteForm.tag.trim(),
      color: noteForm.color,
      type: noteForm.type,
      fileType: noteForm.fileType,
      secretCode: noteForm.secretCode.trim(),
      linkedMasterclassId: noteForm.linkedMasterclassId.trim(),
      content: noteForm.content,
    };

    try {
      if (editingNote) {
        const nid = editingNote.noteId || editingNote.id;
        await apiCall(`/notes/${encodeURIComponent(nid)}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showNotice(`✓ Note "${payload.title}" updated cleanly!`);
      } else {
        await apiCall('/notes', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showNotice(`✓ Note "${payload.title}" added to Vault!`);
      }
      setNoteModalOpen(false);
      fetchData();
    } catch (err) {
      showNotice(`Error saving note: ${err.message}`, 'error');
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm(`Delete note "${noteId}" permanently?`)) return;
    try {
      await apiCall(`/notes/${encodeURIComponent(noteId)}`, { method: 'DELETE' });
      showNotice('✓ Note removed cleanly from Vault.');
      fetchData();
    } catch (err) {
      showNotice(err.message, 'error');
    }
  };

  // ==========================================
  // LIVE MENTORSHIP SCHEDULE ACTIONS
  // ==========================================
  const handleSaveMentorship = async () => {
    if (!mentorship) return;
    try {
      await apiCall('/mentorship', {
        method: 'PUT',
        body: JSON.stringify(mentorship),
      });
      showNotice('✓ Live Mentorship schedule, agenda, and recordings synchronized to /practice!');
      fetchData();
    } catch (err) {
      showNotice(`Error saving mentorship: ${err.message}`, 'error');
    }
  };

  // Filtered Sheets
  const filteredSheets = sheets.filter((s) => {
    const matchesCat =
      sheetCategoryFilter === 'all' ||
      (sheetCategoryFilter === 'tech' && s.roleType === 'tech') ||
      (sheetCategoryFilter === 'non-tech' && s.roleType === 'non-tech') ||
      (sheetCategoryFilter === 'analytics' && (s.roleType === 'analytics' || s.category === 'Analytics'));

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.title?.toLowerCase().includes(q) ||
      s.targetRole?.toLowerCase().includes(q) ||
      (s.companyTags || []).some((c) => c.toLowerCase().includes(q));

    return matchesCat && matchesSearch;
  });

  return (
    <div className="practice-page-root">
      {/* Top Header */}
      <div className="practice-header">
        <div>
          <h2 className="practice-title">Practice Curriculum &amp; Student Study Vault Control</h2>
          <p className="practice-desc">
            Manage live Practice Sheets, Downloadable DRM Notes, and Mentorship Timetables displayed on https://job-strivers.web.app/practice.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchData}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Sync Live
          </Button>
          {activeTab === 0 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              className="practice-btn-add"
              onClick={handleOpenCreateSheet}
            >
              Add Practice Track
            </Button>
          )}
          {activeTab === 1 && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              className="practice-btn-add"
              onClick={handleOpenAddNote}
            >
              Add Study Note
            </Button>
          )}
          {activeTab === 2 && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              className="practice-btn-add"
              onClick={handleSaveMentorship}
            >
              Save Mentorship Schedule
            </Button>
          )}
        </div>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MenuBookIcon fontSize="small" />
                <span>Practice Sheets ({sheets.length})</span>
              </Box>
            }
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <DescriptionOutlinedIcon fontSize="small" />
                <span>Downloadable Notes Vault ({notes.length})</span>
              </Box>
            }
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideocamOutlinedIcon fontSize="small" />
                <span>Live Mentorship Timetable &amp; Recordings</span>
              </Box>
            }
            sx={{ textTransform: 'none', fontWeight: 700 }}
          />
        </Tabs>
      </Box>

      {/* TAB 0: PRACTICE SHEETS */}
      {activeTab === 0 && (
        <div>
          {/* Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All Tracks (${sheets.length})` },
                { id: 'tech', label: `Engineering (${sheets.filter((s) => s.roleType === 'tech').length})` },
                { id: 'non-tech', label: `Operations (${sheets.filter((s) => s.roleType === 'non-tech').length})` },
                { id: 'analytics', label: 'Data & Analytics' },
              ].map((pill) => (
                <Chip
                  key={pill.id}
                  label={pill.label}
                  clickable
                  color={sheetCategoryFilter === pill.id ? 'primary' : 'default'}
                  variant={sheetCategoryFilter === pill.id ? 'filled' : 'outlined'}
                  onClick={() => setSheetCategoryFilter(pill.id)}
                  sx={{ fontWeight: 700 }}
                />
              ))}
            </div>

            <TextField
              size="small"
              placeholder="Search by title, role, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
          </div>

          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '36px 0' }}>
              <CircularProgress size={26} />
              <span>Loading practice tracks from database...</span>
            </div>
          ) : (
            <div className="practice-grid">
              {filteredSheets.map((s) => (
                <PracticeSheetCard
                  key={s.sheetId || s.id}
                  sheet={s}
                  onEdit={handleOpenEditSheet}
                  onManageCurriculum={(sheet) => {
                    setCurriculumSheet(sheet);
                    setCurriculumModalOpen(true);
                  }}
                  onDelete={handleDeleteSheet}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 1: DOWNLOADABLE NOTES VAULT */}
      {activeTab === 1 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Chip label={`Total Notes: ${notes.length}`} sx={{ fontWeight: 700 }} />
              <Chip label={`Free: ${notes.filter((n) => n.type === 'free').length}`} sx={{ bgcolor: '#DCFCE7', color: '#16A34A', fontWeight: 700 }} />
              <Chip label={`Member (Paid): ${notes.filter((n) => n.type === 'paid').length}`} sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', fontWeight: 700 }} />
            </div>

            <TextField
              size="small"
              placeholder="Search notes by title or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: { xs: '100%', sm: 300 } }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {notes
              .filter((n) => !searchQuery || n.title?.toLowerCase().includes(searchQuery.toLowerCase()) || n.tag?.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((note) => {
                const isPaid = note.type === 'paid';
                return (
                  <Card key={note.noteId || note.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <Chip size="small" label={note.tag} sx={{ fontWeight: 700, bgcolor: '#F1F5F9' }} />
                        <Chip
                          size="small"
                          icon={isPaid ? <LockOutlinedIcon sx={{ fontSize: 14 }} /> : <LockOpenOutlinedIcon sx={{ fontSize: 14 }} />}
                          label={isPaid ? 'Member Note (Paid)' : 'Free Note'}
                          sx={{
                            fontWeight: 700,
                            bgcolor: isPaid ? '#EDE9FE' : '#DCFCE7',
                            color: isPaid ? '#7C3AED' : '#16A34A',
                          }}
                        />
                      </div>

                      <h3 style={{ fontSize: '1.05rem', margin: '0 0 6px', color: '#0F172A', fontWeight: 800 }}>{note.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: '#64748B', margin: '0 0 12px', lineHeight: 1.4 }}>{note.subtitle}</p>

                      <div style={{ display: 'flex', gap: 10, fontSize: '0.78rem', color: '#475569', mb: 1.5 }}>
                        <span>Format: <strong>{note.fileType?.toUpperCase()}</strong></span>
                        <span>•</span>
                        <span>ID: <code>{note.noteId}</code></span>
                      </div>

                      {isPaid && (
                        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 10px', borderRadius: 6, fontSize: '0.76rem', color: '#475569', marginBottom: 12 }}>
                          <span>Secret Code: <strong style={{ color: '#7C3AED' }}>{note.secretCode || 'None Set'}</strong></span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: 10, marginTop: 12 }}>
                      <Button
                        size="small"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() => setPreviewNote(note)}
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                      >
                        DRM Preview
                      </Button>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <IconButton size="small" color="primary" onClick={() => handleOpenEditNote(note)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteNote(note.noteId || note.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE MENTORSHIP TIMETABLE */}
      {activeTab === 2 && mentorship && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Section 1: Next Live Session */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Next Live Cohort Announcement
              </Typography>
              <Chip
                label={mentorship.nextSession?.status || 'UPCOMING'}
                color={mentorship.nextSession?.status === 'LIVE' ? 'error' : 'primary'}
                sx={{ fontWeight: 700 }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              <TextField
                label="Masterclass Title"
                size="small"
                fullWidth
                value={mentorship.nextSession?.title || ''}
                onChange={(e) =>
                  setMentorship({
                    ...mentorship,
                    nextSession: { ...mentorship.nextSession, title: e.target.value },
                  })
                }
              />
              <TextField
                label="Session Status"
                size="small"
                select
                fullWidth
                value={mentorship.nextSession?.status || 'UPCOMING'}
                onChange={(e) =>
                  setMentorship({
                    ...mentorship,
                    nextSession: { ...mentorship.nextSession, status: e.target.value },
                  })
                }
              >
                <MenuItem value="UPCOMING">UPCOMING</MenuItem>
                <MenuItem value="LIVE">LIVE NOW</MenuItem>
                <MenuItem value="ENDED">ENDED / OVER</MenuItem>
              </TextField>
              <TextField
                label="Display Date &amp; Time"
                size="small"
                fullWidth
                placeholder="Sunday, 11:00 AM IST"
                value={mentorship.nextSession?.date || ''}
                onChange={(e) =>
                  setMentorship({
                    ...mentorship,
                    nextSession: { ...mentorship.nextSession, date: e.target.value },
                  })
                }
              />
              <TextField
                label="Google Meet URL"
                size="small"
                fullWidth
                value={mentorship.nextSession?.meetUrl || ''}
                onChange={(e) =>
                  setMentorship({
                    ...mentorship,
                    nextSession: { ...mentorship.nextSession, meetUrl: e.target.value },
                  })
                }
              />
            </div>

            {/* Agenda Editor */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 3, mb: 1 }}>
              Masterclass Agenda Items
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(mentorship.nextSession?.agenda || []).map((ag, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Time Range"
                    value={ag.time}
                    sx={{ width: 180 }}
                    onChange={(e) => {
                      const next = [...mentorship.nextSession.agenda];
                      next[idx].time = e.target.value;
                      setMentorship({
                        ...mentorship,
                        nextSession: { ...mentorship.nextSession, agenda: next },
                      });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Topic / Outline"
                    fullWidth
                    value={ag.topic}
                    onChange={(e) => {
                      const next = [...mentorship.nextSession.agenda];
                      next[idx].topic = e.target.value;
                      setMentorship({
                        ...mentorship,
                        nextSession: { ...mentorship.nextSession, agenda: next },
                      });
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      const next = mentorship.nextSession.agenda.filter((_, i) => i !== idx);
                      setMentorship({
                        ...mentorship,
                        nextSession: { ...mentorship.nextSession, agenda: next },
                      });
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const next = [...(mentorship.nextSession.agenda || []), { time: '12:00 PM', topic: 'New Agenda Topic' }];
                  setMentorship({
                    ...mentorship,
                    nextSession: { ...mentorship.nextSession, agenda: next },
                  });
                }}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', mt: 1 }}
              >
                Add Agenda Item
              </Button>
            </div>
          </Card>

          {/* Section 2: Weekly Live Timetable */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Weekly Timetable Slots
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(mentorship.weeklySchedule || []).map((slot, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '140px 180px 1fr 180px 40px', gap: 10, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label="Day"
                    value={slot.day}
                    onChange={(e) => {
                      const next = [...mentorship.weeklySchedule];
                      next[idx].day = e.target.value;
                      setMentorship({ ...mentorship, weeklySchedule: next });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Time"
                    value={slot.time}
                    onChange={(e) => {
                      const next = [...mentorship.weeklySchedule];
                      next[idx].time = e.target.value;
                      setMentorship({ ...mentorship, weeklySchedule: next });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Session Title"
                    value={slot.title}
                    onChange={(e) => {
                      const next = [...mentorship.weeklySchedule];
                      next[idx].title = e.target.value;
                      setMentorship({ ...mentorship, weeklySchedule: next });
                    }}
                  />
                  <TextField
                    size="small"
                    label="Mentor"
                    value={slot.mentor}
                    onChange={(e) => {
                      const next = [...mentorship.weeklySchedule];
                      next[idx].mentor = e.target.value;
                      setMentorship({ ...mentorship, weeklySchedule: next });
                    }}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      const next = mentorship.weeklySchedule.filter((_, i) => i !== idx);
                      setMentorship({ ...mentorship, weeklySchedule: next });
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </div>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const next = [...(mentorship.weeklySchedule || []), { day: 'Saturday', time: '7:00 PM IST', title: 'Live Problem Solving', mentor: 'Staff Mentor' }];
                  setMentorship({ ...mentorship, weeklySchedule: next });
                }}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', mt: 1 }}
              >
                Add Timetable Slot
              </Button>
            </div>
          </Card>

          {/* Section 3: Recorded Sessions */}
          <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
              Recorded Sessions Catalog
            </Typography>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(mentorship.recordedSessions || []).map((rec, idx) => (
                <div key={idx} style={{ padding: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 40px', gap: 10, mb: 1 }}>
                    <TextField
                      size="small"
                      label="Title"
                      value={rec.title}
                      onChange={(e) => {
                        const next = [...mentorship.recordedSessions];
                        next[idx].title = e.target.value;
                        setMentorship({ ...mentorship, recordedSessions: next });
                      }}
                    />
                    <TextField
                      size="small"
                      label="Duration (e.g. 1h 30m)"
                      value={rec.duration}
                      onChange={(e) => {
                        const next = [...mentorship.recordedSessions];
                        next[idx].duration = e.target.value;
                        setMentorship({ ...mentorship, recordedSessions: next });
                      }}
                    />
                    <TextField
                      size="small"
                      label="Mentor"
                      value={rec.mentor}
                      onChange={(e) => {
                        const next = [...mentorship.recordedSessions];
                        next[idx].mentor = e.target.value;
                        setMentorship({ ...mentorship, recordedSessions: next });
                      }}
                    />
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        const next = mentorship.recordedSessions.filter((_, i) => i !== idx);
                        setMentorship({ ...mentorship, recordedSessions: next });
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </div>
                  <TextField
                    size="small"
                    label="Recording Video URL (YouTube / Vimeo / CDN)"
                    fullWidth
                    value={rec.recordingUrl}
                    onChange={(e) => {
                      const next = [...mentorship.recordedSessions];
                      next[idx].recordingUrl = e.target.value;
                      setMentorship({ ...mentorship, recordedSessions: next });
                    }}
                  />
                </div>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const next = [
                    ...(mentorship.recordedSessions || []),
                    {
                      id: `rec-${Date.now()}`,
                      title: 'New Masterclass Recording',
                      duration: '1h 15m',
                      recordedDate: 'Recently Recorded',
                      mentor: 'Lead Mentor',
                      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=480',
                      recordingUrl: 'https://www.youtube.com',
                      notesPdf: '#',
                    },
                  ];
                  setMentorship({ ...mentorship, recordedSessions: next });
                }}
                sx={{ alignSelf: 'flex-start', textTransform: 'none', mt: 1 }}
              >
                Add Recorded Session
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ==========================================
          DIALOG: CREATE / EDIT PRACTICE SHEET
          ========================================== */}
      <Dialog
        open={sheetModalOpen}
        onClose={() => setSheetModalOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingSheet ? `Edit Practice Track: ${editingSheet.title}` : 'Create New Practice Track'}
        </DialogTitle>
        <form onSubmit={handleSaveSheet}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <TextField
                label="Track Title"
                size="small"
                required
                value={sheetForm.title}
                onChange={(e) => setSheetForm({ ...sheetForm, title: e.target.value })}
              />
              <TextField
                label="Sheet ID (Unique)"
                size="small"
                required
                disabled={Boolean(editingSheet)}
                value={sheetForm.sheetId}
                onChange={(e) => setSheetForm({ ...sheetForm, sheetId: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <TextField
                select
                label="Category"
                size="small"
                value={sheetForm.category}
                onChange={(e) =>
                  setSheetForm({
                    ...sheetForm,
                    category: e.target.value,
                    roleType: e.target.value === 'Engineering' ? 'tech' : 'non-tech',
                  })
                }
              >
                <MenuItem value="Engineering">Engineering (SDE)</MenuItem>
                <MenuItem value="Operations">Quick Commerce Operations</MenuItem>
                <MenuItem value="Analytics">Data &amp; SQL Analytics</MenuItem>
              </TextField>

              <TextField
                select
                label="Role Type"
                size="small"
                value={sheetForm.roleType}
                onChange={(e) => setSheetForm({ ...sheetForm, roleType: e.target.value })}
              >
                <MenuItem value="tech">Technical (tech)</MenuItem>
                <MenuItem value="non-tech">Non-Technical (non-tech)</MenuItem>
                <MenuItem value="analytics">Analytics</MenuItem>
              </TextField>

              <TextField
                select
                label="Difficulty Level"
                size="small"
                value={sheetForm.difficultyLevel}
                onChange={(e) => setSheetForm({ ...sheetForm, difficultyLevel: e.target.value })}
              >
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </TextField>
            </div>

            <TextField
              label="Target Role Tag"
              size="small"
              placeholder="e.g. Dark Store Lead / Logistics Executive or SDE-1 / SDE-2"
              value={sheetForm.targetRole}
              onChange={(e) => setSheetForm({ ...sheetForm, targetRole: e.target.value })}
            />

            <TextField
              label="Target Hiring Companies (Comma-separated)"
              size="small"
              placeholder="Zomato, Blinkit, Swiggy, Amazon"
              value={sheetForm.companies}
              onChange={(e) => setSheetForm({ ...sheetForm, companies: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={sheetForm.isFree}
                    onChange={(e) =>
                      setSheetForm({
                        ...sheetForm,
                        isFree: e.target.checked,
                        price: e.target.checked ? 0 : sheetForm.price || 49,
                      })
                    }
                  />
                }
                label="Free Enrollment (₹0)"
              />

              {!sheetForm.isFree && (
                <TextField
                  label="Track Price (₹ INR)"
                  type="number"
                  size="small"
                  value={sheetForm.price}
                  onChange={(e) => setSheetForm({ ...sheetForm, price: e.target.value })}
                />
              )}

              <TextField
                label="Badge Label"
                size="small"
                value={sheetForm.badge}
                onChange={(e) => setSheetForm({ ...sheetForm, badge: e.target.value })}
              />
            </div>

            <TextField
              label="Description"
              size="small"
              multiline
              rows={3}
              value={sheetForm.description}
              onChange={(e) => setSheetForm({ ...sheetForm, description: e.target.value })}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSheetModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingSheet ? 'Save Changes' : 'Create Track'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==========================================
          DIALOG: MANAGE CURRICULUM (TOPICS & PROBLEMS)
          ========================================== */}
      <Dialog
        open={curriculumModalOpen}
        onClose={() => setCurriculumModalOpen(false)}
        maxWidth="lg"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, maxHeight: '90vh' } } }}
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span>Curriculum Engine: {curriculumSheet?.title}</span>
            <div style={{ fontSize: '0.85rem', color: '#64748B', fontWeight: 500, marginTop: 2 }}>
              ID: <code>{curriculumSheet?.sheetId}</code> • Total Modules: {curriculumSheet?.topics?.length || 0}
            </div>
          </div>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleOpenAddTopic}
            sx={{ textTransform: 'none', fontWeight: 700 }}
          >
            Add Module
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 2.5 }}>
          {(!curriculumSheet?.topics || curriculumSheet.topics.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>
              <MenuBookIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
              <Typography variant="h6">No Modules in this Track Yet</Typography>
              <p>Click "Add Module" to start structuring problems and questions.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {curriculumSheet.topics.map((topic) => (
                <Accordion key={topic.topicId} defaultExpanded variant="outlined" sx={{ borderRadius: 2 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                      <div>
                        <strong style={{ fontSize: '0.98rem', color: '#0F172A' }}>{topic.topicTitle}</strong>
                        {topic.summary && (
                          <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: 2 }}>{topic.summary}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Chip size="small" label={`${topic.problems?.length || 0} Questions`} sx={{ fontWeight: 700 }} />
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditTopic(topic);
                          }}
                        >
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTopic(topic.topicId);
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569' }}>Questions / Scenarios:</span>
                      <Button
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => handleOpenAddProblem(topic.topicId)}
                        sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.78rem' }}
                      >
                        Add Problem
                      </Button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {(topic.problems || []).map((p) => (
                        <div
                          key={p.id}
                          style={{
                            padding: '10px 14px',
                            background: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <div style={{ flex: 1, pr: 2 }}>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                              <strong style={{ fontSize: '0.92rem', color: '#0F172A' }}>{p.title}</strong>
                              <Chip size="small" label={p.company} variant="outlined" sx={{ fontSize: '0.72rem', height: 20 }} />
                              <Chip
                                size="small"
                                label={p.difficulty}
                                sx={{
                                  fontSize: '0.72rem',
                                  height: 20,
                                  fontWeight: 700,
                                  bgcolor: p.difficulty === 'Easy' ? '#DCFCE7' : p.difficulty === 'Hard' ? '#FEE2E2' : '#FEF3C7',
                                  color: p.difficulty === 'Easy' ? '#16A34A' : p.difficulty === 'Hard' ? '#DC2626' : '#D97706',
                                }}
                              />
                            </div>
                            <div style={{ fontSize: '0.8rem', color: '#64748B' }}>
                              {p.scenario?.slice(0, 110)}...
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <IconButton size="small" color="primary" onClick={() => handleOpenEditProblem(topic.topicId, p)}>
                              <EditOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteProblem(topic.topicId, p.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionDetails>
                </Accordion>
              ))}
            </div>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCurriculumModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* ==========================================
          DIALOG: ADD / EDIT TOPIC (MODULE)
          ========================================== */}
      <Dialog open={topicModalOpen} onClose={() => setTopicModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingTopic ? 'Edit Module' : 'Add New Module'}</DialogTitle>
        <form onSubmit={handleSaveTopic}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Module ID"
              size="small"
              required
              disabled={Boolean(editingTopic)}
              value={topicForm.topicId}
              onChange={(e) => setTopicForm({ ...topicForm, topicId: e.target.value })}
            />
            <TextField
              label="Module Title"
              size="small"
              required
              placeholder="e.g. Day 1: Array (Part 1) or Dark Store Logistics"
              value={topicForm.topicTitle}
              onChange={(e) => setTopicForm({ ...topicForm, topicTitle: e.target.value })}
            />
            <TextField
              label="Module Summary / Guidance"
              size="small"
              multiline
              rows={2}
              value={topicForm.summary}
              onChange={(e) => setTopicForm({ ...topicForm, summary: e.target.value })}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTopicModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Module
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==========================================
          DIALOG: ADD / EDIT PROBLEM
          ========================================== */}
      <Dialog open={problemModalOpen} onClose={() => setProblemModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingProblem ? 'Edit Problem / Scenario' : 'Add Problem to Module'}</DialogTitle>
        <form onSubmit={handleSaveProblem}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <TextField
                label="Problem Title"
                size="small"
                required
                value={problemForm.title}
                onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
              />
              <TextField
                label="Problem ID"
                size="small"
                required
                disabled={Boolean(editingProblem)}
                value={problemForm.id}
                onChange={(e) => setProblemForm({ ...problemForm, id: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <TextField
                label="Target Company"
                size="small"
                value={problemForm.company}
                onChange={(e) => setProblemForm({ ...problemForm, company: e.target.value })}
              />
              <TextField
                select
                label="Difficulty"
                size="small"
                value={problemForm.difficulty}
                onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
              >
                <MenuItem value="Easy">Easy</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="Hard">Hard</MenuItem>
              </TextField>
              <TextField
                label="Question Type"
                size="small"
                placeholder="Scenario, Algorithms, etc."
                value={problemForm.type}
                onChange={(e) => setProblemForm({ ...problemForm, type: e.target.value })}
              />
              <TextField
                label="Acceptance Rate"
                size="small"
                value={problemForm.acceptanceRate}
                onChange={(e) => setProblemForm({ ...problemForm, acceptanceRate: e.target.value })}
              />
            </div>

            <TextField
              label="Scenario / Problem Description"
              size="small"
              multiline
              rows={3}
              required
              value={problemForm.scenario}
              onChange={(e) => setProblemForm({ ...problemForm, scenario: e.target.value })}
            />

            <TextField
              label="Solution Guidance / Approach"
              size="small"
              multiline
              rows={3}
              value={problemForm.solutionGuidance}
              onChange={(e) => setProblemForm({ ...problemForm, solutionGuidance: e.target.value })}
            />

            <TextField
              label="Key Takeaway / Interview Tip"
              size="small"
              value={problemForm.keyTakeaway}
              onChange={(e) => setProblemForm({ ...problemForm, keyTakeaway: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <TextField
                label="Practice / Article Link URL"
                size="small"
                value={problemForm.resourceLink}
                onChange={(e) => setProblemForm({ ...problemForm, resourceLink: e.target.value })}
              />
              <TextField
                label="Video Explanation URL"
                size="small"
                value={problemForm.videoUrl}
                onChange={(e) => setProblemForm({ ...problemForm, videoUrl: e.target.value })}
              />
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setProblemModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Problem
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==========================================
          DIALOG: ADD / EDIT DOWNLOADABLE NOTE
          ========================================== */}
      <Dialog open={noteModalOpen} onClose={() => setNoteModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>{editingNote ? `Edit Note: ${editingNote.title}` : 'Upload / Add Study Note'}</DialogTitle>
        <form onSubmit={handleSaveNote}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
              <TextField
                label="Note Title"
                size="small"
                required
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
              />
              <TextField
                label="Note ID"
                size="small"
                required
                disabled={Boolean(editingNote)}
                value={noteForm.noteId}
                onChange={(e) => setNoteForm({ ...noteForm, noteId: e.target.value })}
              />
            </div>

            <TextField
              label="Subtitle / Summary"
              size="small"
              value={noteForm.subtitle}
              onChange={(e) => setNoteForm({ ...noteForm, subtitle: e.target.value })}
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
              <TextField
                select
                label="Tag / Domain"
                size="small"
                value={noteForm.tag}
                onChange={(e) => setNoteForm({ ...noteForm, tag: e.target.value })}
              >
                <MenuItem value="Career & Off-Campus">Career &amp; Off-Campus</MenuItem>
                <MenuItem value="Core Academic">Core Academic</MenuItem>
                <MenuItem value="Languages">Languages</MenuItem>
                <MenuItem value="Frontend">Frontend</MenuItem>
                <MenuItem value="Databases">Databases</MenuItem>
                <MenuItem value="DevOps & Tools">DevOps &amp; Tools</MenuItem>
                <MenuItem value="Roadmap">Roadmap</MenuItem>
                <MenuItem value="VIP Masterclass">VIP Masterclass</MenuItem>
              </TextField>

              <TextField
                select
                label="Access Type"
                size="small"
                value={noteForm.type}
                onChange={(e) => setNoteForm({ ...noteForm, type: e.target.value })}
              >
                <MenuItem value="free">Free Note</MenuItem>
                <MenuItem value="paid">Member Note (Paid)</MenuItem>
              </TextField>

              <TextField
                select
                label="File Format"
                size="small"
                value={noteForm.fileType}
                onChange={(e) => setNoteForm({ ...noteForm, fileType: e.target.value })}
              >
                <MenuItem value="html">HTML Document</MenuItem>
                <MenuItem value="pdf">PDF Document</MenuItem>
              </TextField>

              <TextField
                label="Secret Passcode"
                size="small"
                placeholder="e.g. Secret Code"
                value={noteForm.secretCode}
                onChange={(e) => setNoteForm({ ...noteForm, secretCode: e.target.value })}
              />
            </div>

            <TextField
              label="HTML Content Source Code"
              size="small"
              multiline
              rows={8}
              required
              value={noteForm.content}
              onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
              helperText="Full HTML formatting is supported. Rendered cleanly inside DRM Anti-Screenshot reader."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setNoteModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Save Note
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ==========================================
          DIALOG: DRM NOTE VIEWER SIMULATED PREVIEW
          ========================================== */}
      <Dialog open={Boolean(previewNote)} onClose={() => setPreviewNote(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span>DRM Reader Simulated Preview: {previewNote?.title}</span>
            <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
              Watermark simulation: admin@strivers.tech • Anti-Screenshot Active
            </div>
          </div>
          <Chip size="small" label={previewNote?.type?.toUpperCase()} color={previewNote?.type === 'paid' ? 'secondary' : 'success'} sx={{ fontWeight: 700 }} />
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3, position: 'relative', overflowY: 'auto', maxHeight: '70vh' }}>
          {previewNote?.fileData ? (
            <div
              dangerouslySetInnerHTML={{
                __html: (() => {
                  try {
                    return atob(previewNote.fileData);
                  } catch (_) {
                    return previewNote.fileData;
                  }
                })(),
              }}
            />
          ) : (
            <div>No content available.</div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewNote(null)}>Close Reader</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
