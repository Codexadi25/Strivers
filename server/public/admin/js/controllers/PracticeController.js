/**
 * Practice Sheets & Curriculum Controller
 */

import { PracticeModel } from '../models/PracticeModel.js';
import { PracticePageView } from '../views/pages/PracticePageView.js';
import { showToast, escapeHtml } from '../utils/formatters.js';

let practiceDebounceTimer = null;

export class PracticeController {
  static currentPracticeSheets = [];

  static async loadPracticeSheets() {
    const tbody = document.getElementById('practice-tbody');
    if (!tbody) return;

    const search = document.getElementById('practice-search')?.value.trim().toLowerCase() || '';
    const roleFilter = document.getElementById('practice-role-filter')?.value || 'all';

    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading practice sheets...</td></tr>`;

    try {
      this.currentPracticeSheets = await PracticeModel.getSheets();

      let filtered = this.currentPracticeSheets;
      if (roleFilter !== 'all') {
        filtered = filtered.filter((s) => s.roleType === roleFilter);
      }
      if (search) {
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(search) ||
            s.sheetId.toLowerCase().includes(search) ||
            (s.targetRole && s.targetRole.toLowerCase().includes(search)) ||
            (s.targetCompanies && s.targetCompanies.some((c) => c.toLowerCase().includes(search)))
        );
      }

      if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No practice sheets found matching filters.</td></tr>`;
        return;
      }

      tbody.innerHTML = filtered.map((s) => PracticePageView.renderSheetRow(s)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #f87171">Failed to load practice sheets: ${err.message}</td></tr>`;
    }
  }

  static debouncePracticeSearch() {
    clearTimeout(practiceDebounceTimer);
    practiceDebounceTimer = setTimeout(() => this.loadPracticeSheets(), 300);
  }

  static openEditSheetPriceModal(sheet) {
    document.getElementById('edit-sheet-id').value = sheet.sheetId;
    document.getElementById('edit-sheet-title').value = sheet.title;
    document.getElementById('edit-sheet-target-role').value = sheet.targetRole || '';
    document.getElementById('edit-sheet-price').value = sheet.price !== undefined ? sheet.price : 0;
    document.getElementById('edit-sheet-is-template').checked = Boolean(sheet.isTemplate);
    document.getElementById('modal-edit-sheet-price').classList.remove('hidden');
  }

  static closeEditSheetPriceModal() {
    const modal = document.getElementById('modal-edit-sheet-price');
    if (modal) modal.classList.add('hidden');
  }

  static async submitPracticeSheetPrice(e) {
    if (e && e.preventDefault) e.preventDefault();
    const sheetId = document.getElementById('edit-sheet-id').value;
    const title = document.getElementById('edit-sheet-title').value.trim();
    const targetRole = document.getElementById('edit-sheet-target-role').value.trim();
    const price = parseFloat(document.getElementById('edit-sheet-price').value) || 0;
    const isTemplate = document.getElementById('edit-sheet-is-template').checked;

    try {
      const res = await PracticeModel.updatePrice(sheetId, { price, title, targetRole, isTemplate });
      showToast(res.message, 'success');
      this.closeEditSheetPriceModal();
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to update sheet: ${err.message}`, 'error');
    }
  }

  static openAddPracticeSheetModal() {
    const form = document.getElementById('form-create-practice-sheet');
    if (form) form.reset();
    const idInput = document.getElementById('new-sheet-id');
    if (idInput) {
      idInput.readOnly = false;
      idInput.disabled = false;
    }
    document.getElementById('modal-sheet-title-text').textContent = 'Create Practice Sheet';
    document.getElementById('modal-add-sheet').classList.remove('hidden');
  }

  static openEditPracticeSheetModal(sheetId) {
    const sheet = (this.currentPracticeSheets || []).find((s) => s.sheetId === sheetId);
    if (!sheet) {
      showToast('Practice sheet not found.', 'error');
      return;
    }

    document.getElementById('modal-sheet-title-text').textContent = `Edit Sheet: ${sheet.title}`;
    const idInput = document.getElementById('new-sheet-id');
    idInput.value = sheet.sheetId;
    idInput.readOnly = true;

    document.getElementById('new-sheet-role-type').value = sheet.roleType || 'non-tech';
    document.getElementById('new-sheet-title').value = sheet.title || '';
    document.getElementById('new-sheet-target-role').value = sheet.targetRole || '';
    document.getElementById('new-sheet-difficulty').value = sheet.difficultyLevel || 'All Levels';
    document.getElementById('new-sheet-price').value = sheet.price !== undefined ? sheet.price : 0;
    document.getElementById('new-sheet-badge').value = sheet.badge || '';
    document.getElementById('new-sheet-companies').value = (sheet.targetCompanies || []).join(', ');
    document.getElementById('new-sheet-desc').value = sheet.description || '';
    document.getElementById('new-sheet-is-template').checked = Boolean(sheet.isTemplate);

    document.getElementById('modal-add-sheet').classList.remove('hidden');
  }

  static closeAddPracticeSheetModal() {
    const modal = document.getElementById('modal-add-sheet');
    if (modal) modal.classList.add('hidden');
  }

  static async submitCreatePracticeSheet(e) {
    if (e && e.preventDefault) e.preventDefault();
    const sheetId = document.getElementById('new-sheet-id').value.trim().toLowerCase();
    const title = document.getElementById('new-sheet-title').value.trim();
    const roleType = document.getElementById('new-sheet-role-type').value;
    const targetRole = document.getElementById('new-sheet-target-role').value.trim();
    const difficultyLevel = document.getElementById('new-sheet-difficulty').value;
    const price = parseFloat(document.getElementById('new-sheet-price').value) || 0;
    const badge = document.getElementById('new-sheet-badge').value.trim();
    const companies = document
      .getElementById('new-sheet-companies')
      .value.split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const description = document.getElementById('new-sheet-desc').value.trim();
    const isTemplate = document.getElementById('new-sheet-is-template').checked;

    try {
      const res = await PracticeModel.createSheet({
        sheetId,
        title,
        roleType,
        targetRole,
        difficultyLevel,
        price,
        badge,
        targetCompanies: companies,
        description,
        isTemplate,
      });

      showToast(res.message, 'success');
      this.closeAddPracticeSheetModal();
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to save practice sheet: ${err.message}`, 'error');
    }
  }

  static async deletePracticeSheet(sheetId) {
    if (!confirm(`Delete practice sheet "${sheetId}" and all its curriculum?`)) return;
    try {
      const res = await PracticeModel.deleteSheet(sheetId);
      showToast(res.message, 'success');
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Delete failed: ${err.message}`, 'error');
    }
  }

  static async openCurriculumModal(sheetId) {
    let sheet = (this.currentPracticeSheets || []).find((s) => s.sheetId === sheetId);
    if (!sheet) {
      try {
        this.currentPracticeSheets = await PracticeModel.getSheets();
        sheet = this.currentPracticeSheets.find((s) => s.sheetId === sheetId);
      } catch (err) {
        showToast(`Failed to load sheet details: ${err.message}`, 'error');
        return;
      }
    }

    if (!sheet) {
      showToast('Practice sheet not found.', 'error');
      return;
    }

    document.getElementById('curriculum-sheet-id').value = sheet.sheetId;
    document.getElementById('curriculum-sheet-title').textContent = `Curriculum Builder: ${sheet.title}`;
    document.getElementById('curriculum-sheet-subtitle').textContent = `${sheet.targetRole || 'Operations Specialist'} · Target: ${(sheet.targetCompanies || []).join(', ') || 'All Companies'}`;

    this.renderCurriculumView(sheet);
    document.getElementById('modal-sheet-curriculum').classList.remove('hidden');
  }

  static closeCurriculumModal() {
    const modal = document.getElementById('modal-sheet-curriculum');
    if (modal) modal.classList.add('hidden');
  }

  static renderCurriculumView(sheet) {
    const topics = sheet.topics || [];
    const totalProblems = topics.reduce((acc, t) => acc + (t.problems ? t.problems.length : 0), 0);

    const statsPill = document.getElementById('curriculum-stats-pill');
    if (statsPill) {
      statsPill.textContent = `${topics.length} Topics · ${totalProblems} Problems`;
    }

    const topicSelect = document.getElementById('prob-target-topic');
    if (topicSelect) {
      if (topics.length === 0) {
        topicSelect.innerHTML = `<option value="">-- Create a topic first using the form below --</option>`;
        topicSelect.disabled = true;
      } else {
        topicSelect.disabled = false;
        topicSelect.innerHTML = `
          <option value="">-- Choose a Topic --</option>
          ${topics.map((t) => `<option value="${escapeHtml(t.topicId)}">${escapeHtml(t.topicTitle)} (${(t.problems || []).length} scenarios)</option>`).join('')}
        `;
      }
    }

    const container = document.getElementById('curriculum-topics-container');
    if (!container) return;

    if (topics.length === 0) {
      container.innerHTML = `
        <div class="admin-subcard-dashed" style="padding: 28px; text-align: center;">
          <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem;">
            No curriculum topics created yet. Use the <strong>"+ Add New Topic to Sheet"</strong> section below to create your first learning module.
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = topics
      .map((t, idx) => {
        const problems = t.problems || [];
        return `
          <div class="topic-box" id="topic-box-${escapeHtml(t.topicId)}">
            <div class="topic-box-header">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge badge-info" style="font-size: 11px;">Topic ${idx + 1}</span>
                  <h4 style="margin: 0; display: inline-block;">${escapeHtml(t.topicTitle)}</h4>
                  <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; border: 1px solid var(--border-subtle);">
                    ${problems.length} Scenarios
                  </span>
                </div>
                ${t.summary ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(t.summary)}</div>` : ''}
              </div>
              <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deleteTopic('${escapeHtml(sheet.sheetId)}', '${escapeHtml(t.topicId)}')">
                🗑️ Delete Topic
              </button>
            </div>
            <div class="topic-box-body">
              ${
                problems.length > 0
                  ? problems
                      .map(
                        (p, pIdx) => `
                    <div class="curriculum-problem-item">
                      <div style="flex: 1;">
                        <div class="curriculum-problem-info">
                          <strong style="color: var(--text-main); font-size: 13.5px;">${pIdx + 1}. ${escapeHtml(p.title)}</strong>
                          <span class="badge badge-info" style="font-size: 11px; font-weight: 600;">${escapeHtml(p.company || 'Zomato')}</span>
                          <span class="diff-badge ${(p.difficulty || 'Medium').toLowerCase()}">${escapeHtml(p.difficulty || 'Medium')}</span>
                          <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; border: 1px solid var(--border-subtle);">${escapeHtml(p.type || 'Operational Scenario')}</span>
                          <span class="badge badge-success" style="font-size: 11px;">Acc: ${escapeHtml(p.acceptanceRate || '88%')}</span>
                        </div>

                        <div class="curriculum-scenario-box">
                          <strong>Scenario:</strong> ${escapeHtml(p.scenario)}
                        </div>

                        ${
                          p.solutionGuidance
                            ? `<div class="curriculum-guidance-box">
                                <strong>💡 Solution Guidance:</strong> ${escapeHtml(p.solutionGuidance)}
                              </div>`
                            : ''
                        }

                        <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 11.5px; flex-wrap: wrap;">
                          ${p.keyTakeaway ? `<span style="color: var(--emerald-text);"><strong>🎯 Takeaway:</strong> ${escapeHtml(p.keyTakeaway)}</span>` : ''}
                          ${p.resourceLink ? `<a href="${escapeHtml(p.resourceLink)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">🔗 Reference Link</a>` : ''}
                        </div>
                      </div>

                      <div style="margin-left: 12px;">
                        <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deleteProblem('${escapeHtml(sheet.sheetId)}', '${escapeHtml(t.topicId)}', '${escapeHtml(p.id)}')">
                          🗑️
                        </button>
                      </div>
                    </div>
                  `
                      )
                      .join('')
                  : `<div style="font-size: 12px; color: var(--text-faint); font-style: italic; padding: 8px;">No problems added to this topic yet. Select this topic below to add problem scenarios.</div>`
              }
            </div>
          </div>
        `;
      })
      .join('');
  }

  static async submitAddTopic(e) {
    if (e && e.preventDefault) e.preventDefault();
    const sheetId = document.getElementById('curriculum-sheet-id').value;
    const topicTitle = document.getElementById('new-topic-title').value.trim();
    const summary = document.getElementById('new-topic-summary').value.trim();

    if (!topicTitle) {
      showToast('Topic title is required.', 'error');
      return;
    }

    try {
      const res = await PracticeModel.addTopic(sheetId, { topicTitle, summary });

      showToast(res.message, 'success');
      document.getElementById('form-add-topic').reset();

      if (res.sheet) {
        const idx = (this.currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
        if (idx >= 0) this.currentPracticeSheets[idx] = res.sheet;
        this.renderCurriculumView(res.sheet);
      }
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to add topic: ${err.message}`, 'error');
    }
  }

  static async deleteTopic(sheetId, topicId) {
    if (!confirm('Are you sure you want to delete this entire topic and all its problem scenarios?')) return;

    try {
      const res = await PracticeModel.deleteTopic(sheetId, topicId);

      showToast(res.message, 'success');
      if (res.sheet) {
        const idx = (this.currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
        if (idx >= 0) this.currentPracticeSheets[idx] = res.sheet;
        this.renderCurriculumView(res.sheet);
      }
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to delete topic: ${err.message}`, 'error');
    }
  }

  static async submitAddProblem(e) {
    if (e && e.preventDefault) e.preventDefault();
    const sheetId = document.getElementById('curriculum-sheet-id').value;
    const topicId = document.getElementById('prob-target-topic').value;

    if (!topicId) {
      showToast('Please select a topic from the dropdown.', 'error');
      return;
    }

    const title = document.getElementById('prob-title').value.trim();
    const company = document.getElementById('prob-company').value.trim() || 'Zomato';
    const difficulty = document.getElementById('prob-difficulty').value;
    const type = document.getElementById('prob-type').value.trim() || 'Operational Scenario';
    const acceptanceRate = document.getElementById('prob-acceptance').value.trim() || '88%';
    const scenario = document.getElementById('prob-scenario').value.trim();
    const solutionGuidance = document.getElementById('prob-solution').value.trim();
    const keyTakeaway = document.getElementById('prob-takeaway').value.trim();
    const resourceLink = document.getElementById('prob-resource').value.trim();

    if (!title || !scenario) {
      showToast('Problem title and scenario statement are required.', 'error');
      return;
    }

    try {
      const res = await PracticeModel.addProblem(sheetId, topicId, {
        title,
        company,
        difficulty,
        type,
        acceptanceRate,
        scenario,
        solutionGuidance,
        keyTakeaway,
        resourceLink,
      });

      showToast(res.message, 'success');

      document.getElementById('prob-title').value = '';
      document.getElementById('prob-company').value = '';
      document.getElementById('prob-scenario').value = '';
      document.getElementById('prob-solution').value = '';
      document.getElementById('prob-takeaway').value = '';
      document.getElementById('prob-resource').value = '';

      if (res.sheet) {
        const idx = (this.currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
        if (idx >= 0) this.currentPracticeSheets[idx] = res.sheet;
        this.renderCurriculumView(res.sheet);
        document.getElementById('prob-target-topic').value = topicId;
      }
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to add problem: ${err.message}`, 'error');
    }
  }

  static async deleteProblem(sheetId, topicId, problemId) {
    if (!confirm('Are you sure you want to delete this problem scenario?')) return;

    try {
      const res = await PracticeModel.deleteProblem(sheetId, topicId, problemId);

      showToast(res.message, 'success');
      if (res.sheet) {
        const idx = (this.currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
        if (idx >= 0) this.currentPracticeSheets[idx] = res.sheet;
        this.renderCurriculumView(res.sheet);
      }
      this.loadPracticeSheets();
    } catch (err) {
      showToast(`Failed to delete problem: ${err.message}`, 'error');
    }
  }
}
