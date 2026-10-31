/**
 * Masterclasses, Live Sessions & Study Material Controller
 */

import { MasterclassModel } from '../models/MasterclassModel.js';
import { MasterclassesPageView } from '../views/pages/MasterclassesPageView.js';
import { PricingController } from './PricingController.js';
import { showToast, escapeHtml } from '../utils/formatters.js';
import { apiRequest } from '../services/api.js';

export class MasterclassesController {
  static currentMasterclasses = [];

  static async loadMasterclasses() {
    const container = document.getElementById('masterclasses-container');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading masterclasses & live sessions...</p>
      </div>
    `;

    try {
      const allFetched = await MasterclassModel.getAll();
      // Distinguish Masterclasses using the schema value (category: 'masterclass' or isMasterclass: true)
      this.currentMasterclasses = (allFetched || []).filter(
        (m) => m.category === 'masterclass' || m.isMasterclass === true || m.productId === 'masterclass'
      );

      if (this.currentMasterclasses.length === 0) {
        container.innerHTML = `
          <div class="loading-state">
            <p>No masterclasses created yet (Courses are managed under Pricing & Products).</p>
            <button class="btn btn-primary btn-sm mt-4" onclick="openCreateMasterclassModal()">+ Create First Masterclass</button>
          </div>
        `;
        return;
      }

      container.innerHTML = this.currentMasterclasses.map((m) => MasterclassesPageView.renderMasterclassCard(m)).join('');
    } catch (err) {
      container.innerHTML = `
        <div class="loading-state text-center">
          <p style="color: #f87171">Failed to load masterclasses: ${err.message}</p>
          <button class="btn btn-secondary btn-sm mt-4" onclick="loadMasterclasses()">Try Again</button>
        </div>
      `;
    }
  }

  static openCreateMasterclassModal() {
    document.getElementById('modal-masterclass-title-text').textContent = 'Create Masterclass / Course';
    const idInput = document.getElementById('mc-id');
    idInput.value = '';
    idInput.readOnly = false;
    document.getElementById('form-create-masterclass').reset();
    document.getElementById('modal-create-masterclass').classList.remove('hidden');
  }

  static closeCreateMasterclassModal() {
    const modal = document.getElementById('modal-create-masterclass');
    if (modal) modal.classList.add('hidden');
  }

  static openEditMasterclassModal(productId) {
    const m = this.currentMasterclasses.find((x) => x.productId === productId);
    if (!m) return;

    document.getElementById('modal-masterclass-title-text').textContent = `Edit Course: ${m.title}`;
    const idInput = document.getElementById('mc-id');
    idInput.value = m.productId;
    idInput.readOnly = true;

    document.getElementById('mc-category').value = m.category || 'masterclass';
    document.getElementById('mc-title').value = m.title || '';
    document.getElementById('mc-desc').value = m.description || '';
    document.getElementById('mc-price').value = m.price;
    document.getElementById('mc-original-price').value = m.originalPrice || '';
    document.getElementById('mc-badge').value = m.badge || '';
    document.getElementById('mc-features').value = (m.features || []).join('\n');
    document.getElementById('mc-meeting-link').value = m.activeMeetingLink || '';
    document.getElementById('mc-session-status').value = m.sessionStatus || 'upcoming';
    document.getElementById('mc-session-date').value = m.sessionDate || 'Sunday, 11:00 AM IST';
    document.getElementById('mc-secret-passcode').value = m.secretPasscode || 'STRIVERS2026';

    const mentors = m.mentors || [];
    const m1 = mentors[0] || { name: 'Alex Morgan', role: 'Ex-Google · SDE-2 @ Blinkit', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80' };
    const m2 = mentors[1] || { name: 'Priya Sharma', role: 'Staff Engineer @ Zomato', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80' };
    const m3 = mentors[2] || { name: 'Rahul Verma', role: 'Engineering Lead @ Porter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80' };

    document.getElementById('mc-m1-name').value = m1.name || '';
    document.getElementById('mc-m1-role').value = m1.role || '';
    document.getElementById('mc-m1-avatar').value = m1.avatar || '';

    document.getElementById('mc-m2-name').value = m2.name || '';
    document.getElementById('mc-m2-role').value = m2.role || '';
    document.getElementById('mc-m2-avatar').value = m2.avatar || '';

    document.getElementById('mc-m3-name').value = m3.name || '';
    document.getElementById('mc-m3-role').value = m3.role || '';
    document.getElementById('mc-m3-avatar').value = m3.avatar || '';

    document.getElementById('modal-create-masterclass').classList.remove('hidden');
  }

  static async submitCreateMasterclass(e) {
    if (e && e.preventDefault) e.preventDefault();
    const productId = document.getElementById('mc-id').value.trim().toLowerCase();
    const category = document.getElementById('mc-category').value;
    const title = document.getElementById('mc-title').value.trim();
    const description = document.getElementById('mc-desc').value.trim();
    const price = parseFloat(document.getElementById('mc-price').value);
    const originalPrice = document.getElementById('mc-original-price').value
      ? parseFloat(document.getElementById('mc-original-price').value)
      : null;
    const badge = document.getElementById('mc-badge').value.trim();
    const features = document
      .getElementById('mc-features')
      .value.split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    const activeMeetingLink = document.getElementById('mc-meeting-link').value.trim();
    const sessionStatus = document.getElementById('mc-session-status').value;
    const sessionDate = document.getElementById('mc-session-date').value.trim();
    const secretPasscode = document.getElementById('mc-secret-passcode').value.trim();

    const mentors = [];
    const m1Name = document.getElementById('mc-m1-name').value.trim();
    if (m1Name) {
      mentors.push({
        name: m1Name,
        role: document.getElementById('mc-m1-role').value.trim(),
        avatar: document.getElementById('mc-m1-avatar').value.trim(),
      });
    }
    const m2Name = document.getElementById('mc-m2-name').value.trim();
    if (m2Name) {
      mentors.push({
        name: m2Name,
        role: document.getElementById('mc-m2-role').value.trim(),
        avatar: document.getElementById('mc-m2-avatar').value.trim(),
      });
    }
    const m3Name = document.getElementById('mc-m3-name').value.trim();
    if (m3Name) {
      mentors.push({
        name: m3Name,
        role: document.getElementById('mc-m3-role').value.trim(),
        avatar: document.getElementById('mc-m3-avatar').value.trim(),
      });
    }

    try {
      const res = await MasterclassModel.create({
        productId,
        category,
        title,
        description,
        price,
        originalPrice,
        badge,
        features,
        activeMeetingLink,
        sessionStatus,
        sessionDate,
        secretPasscode,
        mentors,
        isActive: true,
      });

      showToast(res.message || `Masterclass "${title}" saved successfully!`, 'success');
      this.closeCreateMasterclassModal();
      this.loadMasterclasses();
      PricingController.loadProducts();
    } catch (err) {
      showToast(`Failed to save masterclass: ${err.message}`, 'error');
    }
  }

  static async deleteMasterclass(productId) {
    if (!confirm(`Are you sure you want to delete masterclass "${productId}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await MasterclassModel.delete(productId);
      showToast(res.message || `Masterclass "${productId}" removed successfully.`, 'success');
      this.loadMasterclasses();
      PricingController.loadProducts();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  static openSessionModal(productId) {
    const m = this.currentMasterclasses.find((x) => x.productId === productId);
    if (!m) return;

    document.getElementById('session-course-id').value = m.productId;
    document.getElementById('session-course-name').textContent = `${m.title} (${m.productId})`;
    document.getElementById('session-link-input').value = m.activeMeetingLink || '';
    document.getElementById('session-code-input').value = m.meetingCode || '';
    document.getElementById('session-status-select').value = m.sessionStatus || 'upcoming';
    document.getElementById('session-date-input').value = m.sessionDate || 'Sunday, 11:00 AM IST';
    document.getElementById('session-passcode-input').value = m.secretPasscode || 'STRIVERS2026';

    document.getElementById('modal-session-link').classList.remove('hidden');
  }

  static closeSessionModal() {
    const modal = document.getElementById('modal-session-link');
    if (modal) modal.classList.add('hidden');
  }

  static async submitUpdateSession(e) {
    if (e && e.preventDefault) e.preventDefault();
    const productId = document.getElementById('session-course-id').value;
    const activeMeetingLink = document.getElementById('session-link-input').value.trim();
    const meetingCode = document.getElementById('session-code-input').value.trim();
    const sessionStatus = document.getElementById('session-status-select').value;
    const sessionDate = document.getElementById('session-date-input').value.trim();
    const secretPasscode = document.getElementById('session-passcode-input').value.trim();

    try {
      const res = await MasterclassModel.updateSession(productId, {
        activeMeetingLink,
        meetingCode,
        sessionStatus,
        sessionDate,
        secretPasscode,
      });
      showToast(res.message || 'Meeting session updated!', 'success');
      this.closeSessionModal();
      this.loadMasterclasses();
    } catch (err) {
      showToast(`Failed to update session: ${err.message}`, 'error');
    }
  }

  static openSlotsModal(productId) {
    const m = this.currentMasterclasses.find((x) => x.productId === productId);
    if (!m) return;

    document.getElementById('slots-course-id').value = m.productId;
    document.getElementById('slots-course-name').textContent = `${m.title} (${m.productId})`;
    this.renderSlotsList(m);

    document.getElementById('modal-timing-slots').classList.remove('hidden');
  }

  static closeSlotsModal() {
    const modal = document.getElementById('modal-timing-slots');
    if (modal) modal.classList.add('hidden');
  }

  static renderSlotsList(course) {
    const container = document.getElementById('slots-list-container');
    const slots = course.timingSlots || [];

    if (slots.length === 0) {
      container.innerHTML = `
        <div style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No timing slots configured. Add one below to schedule student batches.
        </div>
      `;
      return;
    }

    container.innerHTML = slots
      .map(
        (slot) => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 8px;">
        <div>
          <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${escapeHtml(slot.title)}</div>
          <div style="font-size: 12px; color: var(--accent); margin-top: 3px;">
            📅 ${escapeHtml(slot.date)} · ⏱️ ${escapeHtml(slot.startTime)}
            ${slot.mentorName ? `· 👤 <strong>${escapeHtml(slot.mentorName)}</strong> (${escapeHtml(slot.mentorRole || 'Mentor')})` : ''}
          </div>
        </div>
        <button class="btn btn-outline-danger btn-xs" onclick="deleteTimingSlot('${course.productId}', '${slot._id}')">
          Delete
        </button>
      </div>
    `
      )
      .join('');
  }

  static async submitAddSlot(e) {
    if (e && e.preventDefault) e.preventDefault();
    const courseId = document.getElementById('slots-course-id').value;
    const title = document.getElementById('slot-title').value.trim();
    const date = document.getElementById('slot-date').value.trim();
    const startTime = document.getElementById('slot-start-time').value.trim();
    const mentorName = document.getElementById('slot-mentor-name').value.trim();
    const mentorRole = document.getElementById('slot-mentor-role').value.trim();

    try {
      const res = await MasterclassModel.addTimingSlot(courseId, { title, date, startTime, mentorName, mentorRole });
      showToast(res.message || 'Timing slot added to course schedule!', 'success');
      document.getElementById('form-add-slot').reset();

      await this.loadMasterclasses();
      const updatedCourse = this.currentMasterclasses.find((x) => x.productId === courseId);
      if (updatedCourse) this.renderSlotsList(updatedCourse);
    } catch (err) {
      showToast(`Failed to add slot: ${err.message}`, 'error');
    }
  }

  static async deleteTimingSlot(courseId, slotId) {
    if (!confirm('Remove this timing slot from the course schedule?')) return;
    try {
      const res = await MasterclassModel.deleteTimingSlot(courseId, slotId);
      showToast(res.message || 'Slot deleted.', 'info');
      await this.loadMasterclasses();
      const updatedCourse = this.currentMasterclasses.find((x) => x.productId === courseId);
      if (updatedCourse) this.renderSlotsList(updatedCourse);
    } catch (err) {
      showToast(`Failed to delete slot: ${err.message}`, 'error');
    }
  }

  static openMaterialsModal(productId) {
    const m = this.currentMasterclasses.find((x) => x.productId === productId);
    if (!m) return;

    document.getElementById('materials-course-id').value = m.productId;
    document.getElementById('materials-course-name').textContent = `${m.title} (${m.productId})`;
    this.renderMaterialsList(m);

    document.getElementById('modal-study-materials').classList.remove('hidden');
  }

  static closeMaterialsModal() {
    const modal = document.getElementById('modal-study-materials');
    if (modal) modal.classList.add('hidden');
  }

  static renderMaterialsList(course) {
    const container = document.getElementById('materials-list-container');
    const materials = course.notesAndPdfs || [];

    if (materials.length === 0) {
      container.innerHTML = `
        <div style="padding: 16px; background: rgba(255,255,255,0.03); border-radius: 8px; text-align: center; color: var(--text-muted); font-size: 13px;">
          No study materials stored yet. Upload notes, PDFs, or cheatsheets into MongoDB below.
        </div>
      `;
      return;
    }

    container.innerHTML = materials
      .map((mat) => {
        const sizeFormatted = mat.fileSize ? `${Math.round(mat.fileSize / 1024)} KB` : 'Embedded Text';
        const typeIcons = { pdf: '📄 PDF', notes: '📝 Notes', cheatsheet: '⚡ Cheatsheet', document: '📁 Docket' };

        return `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.04); border: 1px solid var(--border-subtle); border-radius: 8px;">
            <div>
              <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px; display: flex; align-items: center; gap: 8px;">
                <span>${typeIcons[mat.fileType] || '📄 Document'}</span>
                <span>${escapeHtml(mat.title)}</span>
                <span class="badge badge-success" style="font-size: 10px;">🔒 Stored in DB</span>
              </div>
              <div style="font-size: 12px; color: var(--text-muted); margin-top: 3px;">
                ${escapeHtml(mat.description || 'No summary')} · Size: <code>${sizeFormatted}</code> · DRM: In-App View Only
              </div>
            </div>
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" class="btn btn-secondary btn-xs" onclick="previewStudyMaterial('${course.productId}', '${mat.materialId || mat._id}')">
                👁️ View
              </button>
              <button type="button" class="btn btn-outline-danger btn-xs" onclick="deleteStudyMaterial('${course.productId}', '${mat.materialId || mat._id}')">
                Delete
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  static async submitUploadMaterial(e) {
    if (e && e.preventDefault) e.preventDefault();
    const courseId = document.getElementById('materials-course-id').value;
    const title = document.getElementById('mat-title').value.trim();
    const fileType = document.getElementById('mat-type').value;
    const tier = document.getElementById('mat-tier')?.value || 'paid';
    const secretCode = document.getElementById('mat-secret-code')?.value.trim() || '';
    const description = document.getElementById('mat-desc').value.trim();
    const fileInput = document.getElementById('mat-file-input');
    const textInput = document.getElementById('mat-text-input').value.trim();
    const submitBtn = document.getElementById('btn-submit-mat');

    const file = fileInput.files && fileInput.files[0];

    if (!file && !textInput) {
      showToast('Please select a PDF/HTML file or enter text content to store in MongoDB.', 'error');
      return;
    }

    // REQUIREMENT: Max file size up to 10MB only
    if (file && file.size > 10 * 1024 * 1024) {
      showToast(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds 10MB limit! Notes must be up to 10MB only.`, 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Encoding & Storing in MongoDB (Max 10MB)...';
    }

    try {
      let fileData = '';
      let mimeType = 'text/plain';
      let fileSize = 0;

      let effectiveFileType = fileType;

      if (file) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        const isPdfFile = file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf' || fileType === 'pdf';
        const isHtmlFile = file.name.toLowerCase().endsWith('.html') || file.name.toLowerCase().endsWith('.htm') || file.type === 'text/html' || fileType === 'html';

        effectiveFileType = isPdfFile ? 'pdf' : isHtmlFile ? 'html' : (fileType || 'notes');
        mimeType = file.type || (isPdfFile ? 'application/pdf' : isHtmlFile ? 'text/html' : 'text/plain');
        fileSize = file.size;
      } else {
        effectiveFileType = fileType === 'html' ? 'html' : (fileType || 'notes');
        fileData = 'data:text/html;base64,' + btoa(unescape(encodeURIComponent(textInput)));
        mimeType = 'text/html';
        fileSize = textInput.length;
      }

      // 1. Upload to Course Notes in MongoDB
      const res = await MasterclassModel.uploadStudyMaterial(courseId, {
        title,
        description,
        fileType: effectiveFileType,
        mimeType,
        fileData,
        fileSize,
      });

      // 2. Also register in Downloadable Notes Collection (Free or Paid with Secret Code)
      try {
        const rawBase64 = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        await apiRequest('/notes/admin/upload', {
          method: 'POST',
          body: JSON.stringify({
            noteId: `note-${Date.now()}`,
            title,
            subtitle: description || 'Masterclass Study Guide & Engineering Notes',
            tag: tier === 'paid' ? 'VIP Masterclass' : 'Core Academic',
            type: tier,
            fileType: effectiveFileType === 'pdf' ? 'pdf' : 'html',
            mimeType,
            fileData: rawBase64,
            fileSize,
            linkedMasterclassId: courseId,
            secretCode,
          }),
        });
      } catch (noteErr) {
        console.warn('Note registry notice:', noteErr.message);
      }

      showToast(res.message || 'Note successfully saved to MongoDB (10MB limit enforced)!', 'success');
      document.getElementById('form-upload-material').reset();

      await this.loadMasterclasses();
      const updatedCourse = this.currentMasterclasses.find((x) => x.productId === courseId);
      if (updatedCourse) this.renderMaterialsList(updatedCourse);
    } catch (err) {
      showToast(`Material upload failed: ${err.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Save Note to MongoDB (10MB Limit · View-Only DRM)';
      }
    }
  }

  static previewStudyMaterial(courseId, materialId) {
    const course = this.currentMasterclasses.find((x) => x.productId === courseId);
    if (!course) return;
    const mat = (course.notesAndPdfs || []).find((m) => (m.materialId || m._id) === materialId);
    if (!mat || !mat.fileData) {
      showToast('Document payload not found in MongoDB record.', 'error');
      return;
    }

    try {
      const base64Data = mat.fileData.includes(',') ? mat.fileData.split(',')[1] : mat.fileData;
      const isPdf = mat.fileType === 'pdf' || (mat.mimeType && mat.mimeType.includes('pdf'));

      if (isPdf) {
        const byteChars = atob(base64Data);
        const byteNums = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([byteNums], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } else {
        let htmlText = '';
        try {
          const byteChars = atob(base64Data);
          const byteNums = new Uint8Array(byteChars.length);
          for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
          htmlText = new TextDecoder('utf-8').decode(byteNums);
        } catch {
          htmlText = atob(base64Data);
        }
        const previewWin = window.open('', '_blank');
        if (previewWin) {
          previewWin.document.write(htmlText);
          previewWin.document.close();
        }
      }
    } catch (err) {
      showToast('Failed to preview document: ' + err.message, 'error');
    }
  }

  static async deleteStudyMaterial(courseId, materialId) {
    if (!confirm('Permanently delete this document from MongoDB?')) return;
    try {
      const res = await MasterclassModel.deleteStudyMaterial(courseId, materialId);
      showToast(res.message || 'Document deleted from MongoDB.', 'info');
      await this.loadMasterclasses();
      const updatedCourse = this.currentMasterclasses.find((x) => x.productId === courseId);
      if (updatedCourse) this.renderMaterialsList(updatedCourse);
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }
}
