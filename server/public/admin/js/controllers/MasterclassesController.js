/**
 * Masterclasses, Live Sessions & Study Material Controller
 */

import { MasterclassModel } from '../models/MasterclassModel.js';
import { MasterclassesPageView } from '../views/pages/MasterclassesPageView.js';
import { PricingController } from './PricingController.js';
import { showToast, escapeHtml } from '../utils/formatters.js';

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
      this.currentMasterclasses = await MasterclassModel.getAll();

      if (this.currentMasterclasses.length === 0) {
        container.innerHTML = `
          <div class="loading-state">
            <p>No masterclasses or courses created yet.</p>
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
    if (!confirm(`Are you sure you want to delete course "${productId}"? This cannot be undone.`)) {
      return;
    }
    try {
      const res = await MasterclassModel.delete(productId);
      showToast(res.message || `Course "${productId}" removed.`, 'success');
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

    try {
      const res = await MasterclassModel.updateSession(productId, { activeMeetingLink, meetingCode, sessionStatus });
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
            <button class="btn btn-outline-danger btn-xs" onclick="deleteStudyMaterial('${course.productId}', '${mat._id}')">
              Delete
            </button>
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
    const description = document.getElementById('mat-desc').value.trim();
    const fileInput = document.getElementById('mat-file-input');
    const textInput = document.getElementById('mat-text-input').value.trim();
    const submitBtn = document.getElementById('btn-submit-mat');

    const file = fileInput.files && fileInput.files[0];

    if (!file && !textInput) {
      showToast('Please select a file or enter text/markdown content to store in MongoDB.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.querySelector('span').textContent = 'Encoding & Saving to MongoDB...';
    }

    try {
      let fileData = '';
      let mimeType = 'text/plain';
      let fileSize = 0;

      if (file) {
        fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
        mimeType = file.type || 'application/pdf';
        fileSize = file.size;
      } else {
        fileData = 'data:text/markdown;base64,' + btoa(unescape(encodeURIComponent(textInput)));
        mimeType = 'text/markdown';
        fileSize = textInput.length;
      }

      const res = await MasterclassModel.uploadStudyMaterial(courseId, {
        title,
        description,
        fileType,
        mimeType,
        fileData,
        fileSize,
      });

      showToast(res.message || 'Document securely saved to MongoDB!', 'success');
      document.getElementById('form-upload-material').reset();

      await this.loadMasterclasses();
      const updatedCourse = this.currentMasterclasses.find((x) => x.productId === courseId);
      if (updatedCourse) this.renderMaterialsList(updatedCourse);
    } catch (err) {
      showToast(`Material upload failed: ${err.message}`, 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = 'Save to MongoDB (View-Only DRM)';
      }
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
