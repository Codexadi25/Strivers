import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import LockIcon from '@mui/icons-material/Lock';
import AddIcon from '@mui/icons-material/Add';
import { apiCall } from '../services/api';
import MasterclassCard from '../components/masterclasses/MasterclassCard';
import {
  CreateMasterclassDialog,
  EditMeetingDialog,
  EditDetailsDialog,
  ManageSlotsDialog,
  ManageMaterialsDialog,
} from '../components/masterclasses/MasterclassDialogs';
import './MasterclassesPage.css';

export default function MasterclassesPage() {
  const [masterclasses, setMasterclasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [editingDetails, setEditingDetails] = useState(null);
  const [slotsTarget, setSlotsTarget] = useState(null);
  const [materialsTarget, setMaterialsTarget] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ text: '', type: 'success' });

  const showStatus = (text, type = 'success') => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: '', type: 'success' }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await apiCall('/masterclasses');
      if (res.masterclasses && Array.isArray(res.masterclasses)) {
        setMasterclasses(res.masterclasses);
        // Keep open dialog references fresh
        if (slotsTarget) {
          const fresh = res.masterclasses.find((x) => x.productId === slotsTarget.productId);
          if (fresh) setSlotsTarget(fresh);
        }
        if (materialsTarget) {
          const fresh = res.masterclasses.find((x) => x.productId === materialsTarget.productId);
          if (fresh) setMaterialsTarget(fresh);
        }
      }
    } catch (err) {
      showStatus(`Failed to load masterclasses: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async ({ title, price, sessionDate, activeMeetingLink }) => {
    const productId = title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    try {
      await apiCall('/courses', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          title,
          category: 'masterclass',
          price,
          badge: 'LIVE WORKSHOP',
          sessionDate,
          activeMeetingLink,
          isActive: true,
        }),
      });
      setCreatingOpen(false);
      showStatus(`✓ Masterclass "${title}" created!`);
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleSaveMeeting = async (e) => {
    e.preventDefault();
    if (!editingMeeting) return;
    try {
      await apiCall(`/masterclasses/${encodeURIComponent(editingMeeting.productId)}/meeting`, {
        method: 'PUT',
        body: JSON.stringify({
          activeMeetingLink: editingMeeting.activeMeetingLink,
          meetingCode: editingMeeting.meetingCode,
          sessionStatus: editingMeeting.sessionStatus,
          sessionDate: editingMeeting.sessionDate,
        }),
      });
      showStatus(`✓ Meeting link synced for ${editingMeeting.title}!`);
      setEditingMeeting(null);
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!editingDetails) return;
    try {
      await apiCall(`/courses/${encodeURIComponent(editingDetails.productId)}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editingDetails.title,
          description: editingDetails.description,
          price: Number(editingDetails.price),
          secretPasscode: editingDetails.secretPasscode,
        }),
      });
      showStatus(`✓ Details updated for ${editingDetails.title}`);
      setEditingDetails(null);
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleDelete = async (m) => {
    if (!window.confirm(`Deactivate "${m.title}"?`)) return;
    try {
      await apiCall(`/courses/${encodeURIComponent(m.productId)}`, { method: 'DELETE' });
      showStatus(`✓ Masterclass "${m.title}" deactivated.`);
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleAddSlot = async (pid, payload) => {
    try {
      await apiCall(`/masterclasses/${encodeURIComponent(pid)}/slots`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showStatus('✓ Live timing slot added.');
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleDeleteSlot = async (pid, slotId) => {
    try {
      await apiCall(`/masterclasses/${encodeURIComponent(pid)}/slots/${encodeURIComponent(slotId)}`, {
        method: 'DELETE',
      });
      showStatus('✓ Timing slot removed.');
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleAddMaterial = async (pid, payload) => {
    try {
      await apiCall(`/masterclasses/${encodeURIComponent(pid)}/materials`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showStatus('✓ DRM study material attached.');
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  const handleDeleteMaterial = async (pid, materialId) => {
    try {
      await apiCall(`/masterclasses/${encodeURIComponent(pid)}/materials/${encodeURIComponent(materialId)}`, {
        method: 'DELETE',
      });
      showStatus('✓ Study material removed.');
      loadData();
    } catch (err) {
      showStatus(err.message, 'error');
    }
  };

  return (
    <div className="mc-page-root">
      <div className="mc-header">
        <div>
          <div className="mc-header-title-row">
            <h2 className="mc-title">Masterclasses, Live Sessions &amp; Study Material</h2>
            <Chip size="small" label="SCHEMA: CATEGORY='MASTERCLASS'" color="info" variant="outlined" />
          </div>
          <p className="mc-desc">
            Manage live interactive workshops, Google Meet links, timing slots, and MongoDB DRM study materials.
          </p>
        </div>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          className="mc-btn-create"
          onClick={() => setCreatingOpen(true)}
        >
          Create Masterclass
        </Button>
      </div>

      {statusMsg.text && (
        <Alert severity={statusMsg.type} sx={{ mb: 2 }} onClose={() => setStatusMsg({ text: '', type: 'success' })}>
          {statusMsg.text}
        </Alert>
      )}

      <Paper variant="outlined" className="mc-drm-banner">
        <div className="mc-drm-content">
          <div className="mc-drm-title-row">
            <LockIcon className="mc-lock-icon" />
            <strong>DRM &amp; Anti-Download Protection Enforced:</strong>
          </div>
          <p className="mc-drm-text">
            Study materials are saved as encoded payloads and rendered exclusively inside the Student In-App Canvas DRM Viewer with per-user email watermarks.
          </p>
        </div>
        <Chip label="DRM Active" color="primary" size="small" />
      </Paper>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '32px 0' }}>
          <CircularProgress size={24} />
          <span>Loading live masterclasses...</span>
        </div>
      ) : (
        <div className="mc-grid">
          {masterclasses.map((m) => (
            <MasterclassCard
              key={m.productId}
              masterclass={m}
              onEditMeeting={(item) => setEditingMeeting({ ...item })}
              onManageSlots={(item) => setSlotsTarget(item)}
              onManageMaterials={(item) => setMaterialsTarget(item)}
              onEditDetails={(item) => setEditingDetails({ ...item })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateMasterclassDialog open={creatingOpen} onClose={() => setCreatingOpen(false)} onCreate={handleCreate} />
      <EditMeetingDialog editingMeeting={editingMeeting} setEditingMeeting={setEditingMeeting} onSave={handleSaveMeeting} />
      <EditDetailsDialog editingDetails={editingDetails} setEditingDetails={setEditingDetails} onSave={handleSaveDetails} />
      <ManageSlotsDialog masterclass={slotsTarget} onClose={() => setSlotsTarget(null)} onAddSlot={handleAddSlot} onDeleteSlot={handleDeleteSlot} />
      <ManageMaterialsDialog masterclass={materialsTarget} onClose={() => setMaterialsTarget(null)} onAddMaterial={handleAddMaterial} onDeleteMaterial={handleDeleteMaterial} />
    </div>
  );
}
