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
          <table class="data-table">
            <thead>
              <tr>
                <th>Sheet Identifier</th>
                <th>Curriculum Title & Target Role</th>
                <th>Target Companies</th>
                <th>Role Type</th>
                <th>Access Fee</th>
                <th>Template Status</th>
                <th>Enrolled</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="practice-tbody">
              <tr><td colspan="8" class="text-center">Loading practice sheets...</td></tr>
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
      <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border-subtle); font-size: 0.72rem; margin-right: 2px;">${escapeHtml(c)}</span>
    `).join('');

    const sheetJsonEscaped = JSON.stringify(s).replace(/'/g, '&#39;').replace(/"/g, '&quot;');

    return `
      <tr>
        <td><span class="code-cell">${escapeHtml(s.sheetId)}</span></td>
        <td>
          <strong>${escapeHtml(s.title)}</strong>
          <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 2px;">
            Role: <em>${escapeHtml(s.targetRole || 'Operations Specialist')}</em>
          </div>
          <div style="margin-top: 5px; display: flex; gap: 4px; align-items: center; flex-wrap: wrap;">
            <span class="badge badge-info" style="font-size: 10.5px;">📚 ${topicsCount} Topics</span>
            <span class="badge" style="background: rgba(99,102,241,0.15); color: #818cf8; font-size: 10.5px; border: 1px solid rgba(99,102,241,0.3);">
              ⚡ ${problemsCount} Scenarios
            </span>
            ${s.badge ? `<span class="badge" style="background: rgba(245, 158, 11, 0.15); color: #f59e0b; font-size: 10.5px; border: 1px solid rgba(245, 158, 11, 0.3);">⭐ ${escapeHtml(s.badge)}</span>` : ''}
            <span class="badge" style="background: rgba(148, 163, 184, 0.12); color: #94a3b8; font-size: 10.5px;">${escapeHtml(s.difficultyLevel || 'All Levels')}</span>
          </div>
        </td>
        <td><div style="max-width: 220px; display: flex; flex-wrap: wrap; gap: 2px;">${companyBadges}</div></td>
        <td>
          <span class="badge ${isNonTech ? 'badge-success' : 'badge-info'}">
            ${isNonTech ? 'Non-Tech Operations' : (s.roleType === 'tech' ? 'Technical SDE' : s.roleType.toUpperCase())}
          </span>
        </td>
        <td>
          <span class="badge ${isFree ? 'badge-success' : 'badge-warning'}">
            ${isFree ? '₹0.00 Free Enrollment' : `₹${s.price.toFixed(2)} Paid Track`}
          </span>
        </td>
        <td>
          <span class="badge ${s.isTemplate ? 'badge-info' : 'badge-secondary'}">
            ${s.isTemplate ? 'Template Mode (Preserved)' : 'Active Curriculum'}
          </span>
        </td>
        <td><strong>${s.enrolledCount || 0}</strong> users</td>
        <td>
          <div class="d-flex gap-1" style="flex-wrap: wrap;">
            <button class="btn btn-primary btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="openCurriculumModal('${escapeHtml(s.sheetId)}')">
              📚 Curriculum & Problems (${problemsCount})
            </button>
            <button class="btn btn-secondary btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="openEditPracticeSheetModal('${escapeHtml(s.sheetId)}')">
              ✏️ Edit Details
            </button>
            <button class="btn btn-secondary btn-xs" style="padding: 4px 8px; font-size: 11px;" data-sheet='${sheetJsonEscaped}' onclick="handleEditSheetPriceClick(this)">
              💵 Price
            </button>
            <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deletePracticeSheet('${escapeHtml(s.sheetId)}')">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}
