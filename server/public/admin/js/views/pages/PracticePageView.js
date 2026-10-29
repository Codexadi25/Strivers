/**
 * Practice Sheets & Roles Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class PracticePageView {
  static renderPane() {
    return `
      <section id="tab-practice" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>Practice Sheets & Job Roles Curriculum Engine</h2>
            <p class="text-muted">Design and price interview sheets for Non-Tech Roles (Zomato, Blinkit, Hyperpure, District, Porter, Amazon, Flipkart, Swiggy) and Technical DSA Sheets. Practice Sheets with ₹0.00 fee allow 1-click Free Enrollment.</p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-primary" onclick="openAddPracticeSheetModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Create Practice Sheet</span>
            </button>
          </div>
        </div>

        <div class="search-filter-bar" style="margin-bottom: 16px;">
          <input type="text" id="practice-search" class="input-control" placeholder="Search by title, company, or target role..." oninput="debouncePracticeSearch()">
          <select id="practice-role-filter" class="select-control" onchange="loadPracticeSheets()">
            <option value="all">All Practice Roles</option>
            <option value="non-tech">Non-Technical Operations (Active)</option>
            <option value="tech">Technical SDE (Template Mode)</option>
          </select>
        </div>

        <div class="card table-responsive">
          <table class="data-table practice-table">
            <thead>
              <tr>
                <th style="min-width: 260px;">Curriculum & Target Job Role</th>
                <th style="min-width: 170px;">Track & Scope</th>
                <th style="min-width: 190px;">Hiring Companies</th>
                <th style="min-width: 140px;">Pricing & Access</th>
                <th style="min-width: 230px; text-align: right;">Curriculum Engine Actions</th>
              </tr>
            </thead>
            <tbody id="practice-tbody">
              <tr><td colspan="5" class="text-center">Loading practice sheets...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  static renderSheetRow(s) {
    const isFree = s.price === 0 || s.isFree;
    const isNonTech = s.roleType === 'non-tech';
    const topicsCount = (s.topics || []).length;
    const problemsCount = (s.topics || []).reduce((acc, t) => acc + (t.problems ? t.problems.length : 0), 0);

    const companyBadges = (s.targetCompanies || []).map((c) => `
      <span class="company-tag-pill">${escapeHtml(c)}</span>
    `).join('');

    const sheetJsonEscaped = JSON.stringify(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

    return `
      <tr>
        <td>
          <div class="practice-sheet-title" onclick="openCurriculumModal('${escapeHtml(s.sheetId)}')" style="cursor: pointer;" title="Click to view detailed curriculum">
            ${escapeHtml(s.title)}
          </div>
          <div class="practice-sheet-role">
            Target: <strong>${escapeHtml(s.targetRole || 'Operations Specialist')}</strong>
          </div>
          <div class="practice-meta-row">
            <span class="code-cell" style="font-size: 0.72rem;">${escapeHtml(s.sheetId)}</span>
            <span class="badge" style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; font-size: 0.72rem;">${escapeHtml(s.difficultyLevel || 'All Levels')}</span>
            ${s.badge ? `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; font-size: 0.72rem; border: 1px solid rgba(245, 158, 11, 0.3);">⭐ ${escapeHtml(s.badge)}</span>` : ''}
          </div>
        </td>
        <td>
          <div style="margin-bottom: 5px;">
            <span class="badge ${isNonTech ? 'badge-success' : 'badge-info'}" style="font-size: 0.74rem;">
              ${isNonTech ? 'Non-Tech Operations' : (s.roleType === 'tech' ? 'Technical SDE' : s.roleType.toUpperCase())}
            </span>
          </div>
          <div style="display: flex; gap: 4px; flex-wrap: wrap;">
            <span class="practice-pill-stat">📚 ${topicsCount} Modules</span>
            <span class="practice-pill-stat">⚡ ${problemsCount} Scenarios</span>
          </div>
        </td>
        <td>
          <div style="display: flex; flex-wrap: wrap; gap: 3px; max-width: 210px;">
            ${companyBadges || '<span class="text-muted" style="font-size: 0.75rem;">General Track</span>'}
          </div>
        </td>
        <td>
          <div style="margin-bottom: 3px;">
            <span class="badge ${isFree ? 'badge-success' : 'badge-warning'}" style="font-size: 0.76rem; font-weight: 600;">
              ${isFree ? '₹0.00 Free' : `₹${s.price.toFixed(2)}`}
            </span>
          </div>
          <div class="text-muted" style="font-size: 0.76rem;">
            <strong>${s.enrolledCount || 0}</strong> enrolled
          </div>
        </td>
        <td style="text-align: right;">
          <div class="d-flex gap-1" style="justify-content: flex-end; flex-wrap: wrap;">
            <button class="btn btn-primary btn-xs" style="padding: 5px 10px; font-size: 0.8rem; font-weight: 600;" onclick="openCurriculumModal('${escapeHtml(s.sheetId)}')">
              📚 Curriculum (${problemsCount})
            </button>
            <button class="btn btn-secondary btn-xs" style="padding: 5px 8px; font-size: 0.78rem;" onclick="openEditPracticeSheetModal('${escapeHtml(s.sheetId)}')">
              ✏️ Edit
            </button>
            <button class="btn btn-secondary btn-xs" style="padding: 5px 8px; font-size: 0.78rem;" data-sheet='${sheetJsonEscaped}' onclick="handleEditSheetPriceClick(this)">
              💵 Price
            </button>
            <button class="btn btn-outline-danger btn-xs" style="padding: 5px 8px; font-size: 0.78rem;" onclick="deletePracticeSheet('${escapeHtml(s.sheetId)}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}
