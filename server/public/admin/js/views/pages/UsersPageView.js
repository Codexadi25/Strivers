/**
 * User Access Control Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class UsersPageView {
  static renderPane() {
    return `
      <section id="tab-users" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>User Access & Subscription Authority</h2>
            <p class="text-muted">Manage permanent course access, practice sheet limits, and password reset control.</p>
          </div>
          <div class="d-flex gap-2">
            <input type="text" id="user-search" class="input-control" placeholder="Search user by email or ID..." oninput="debounceUsersSearch()">
            <button class="btn btn-primary" onclick="openGrantAccessModal()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Grant Access</span>
            </button>
          </div>
        </div>

        <div class="card table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Customer Email</th>
                <th>User ID</th>
                <th>Role</th>
                <th>Subscription Status</th>
                <th>Enrolled Courses (Txn & Ref)</th>
                <th>Practice Sheets (Enrolled / Limit)</th>
                <th>Controls</th>
              </tr>
            </thead>
            <tbody id="users-tbody">
              <tr><td colspan="7" class="text-center">Loading user access list...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  static renderUserRow(u) {
    const isExpired = u.expiresAt && new Date(u.expiresAt) <= new Date();
    const hasSub = u.hasActiveSubscription && !isExpired;
    const isPermanent = u.hasActiveSubscription && !u.expiresAt;
    const isAdmin = u.role === 'admin';

    // Render enrolled courses
    const coursesHtml = (u.enrolledCourses && u.enrolledCourses.length > 0)
      ? u.enrolledCourses.map((c) => `
          <div style="margin-bottom: 4px;">
            <span class="badge badge-success" style="font-size: 0.75rem;">${escapeHtml(c.courseTitle || c.courseId)}</span>
            <span class="badge badge-info" style="font-size: 0.7rem;">Permanent ✓</span>
            <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 2px;">
              Txn: <code>${escapeHtml(c.paymentId || 'N/A')}</code> • Ref: <code>${escapeHtml(c.referenceId || 'N/A')}</code>
            </div>
          </div>
        `).join('')
      : '<span class="text-muted">No course enrolled</span>';

    // Render enrolled practice sheets
    const sheetsCount = u.enrolledPracticeSheets?.length || 0;
    const limit = u.maxPracticeSheetsAllowed || 2;
    const sheetsHtml = `
      <div>
        <strong style="color: ${sheetsCount >= limit ? '#f59e0b' : '#34d399'}">${sheetsCount} / ${limit}</strong>
        ${(u.enrolledPracticeSheets && u.enrolledPracticeSheets.length > 0)
          ? `<div style="margin-top: 4px;">` + u.enrolledPracticeSheets.map((s) => `
              <span class="badge badge-warning" style="font-size: 0.72rem; margin: 2px 2px 0 0;" title="${escapeHtml(s.sheetTitle || s.sheetId)}">
                ${escapeHtml((s.sheetTitle || s.sheetId).slice(0, 24))}...
              </span>
            `).join('') + `</div>`
          : ''}
      </div>
    `;

    return `
      <tr>
        <td><strong>${escapeHtml(u.email)}</strong></td>
        <td><span class="code-cell">${escapeHtml(u.userId)}</span></td>
        <td><span class="badge ${isAdmin ? 'badge-info' : 'badge-warning'}">${escapeHtml(u.role)}</span></td>
        <td>
          <span class="badge ${isPermanent ? 'badge-success' : (hasSub ? 'badge-info' : 'badge-danger')}">
            ${isPermanent ? 'Permanent Lifetime' : (hasSub ? 'Active Access' : 'Inactive / Expired')}
          </span>
        </td>
        <td>${coursesHtml}</td>
        <td>${sheetsHtml}</td>
        <td>
          <div class="d-flex gap-2" style="flex-wrap: wrap;">
            <button class="btn btn-primary btn-sm" onclick="openGrantAccessModal('${escapeHtml(u.email)}')">Grant Access</button>
            <button class="btn btn-secondary btn-sm" onclick="openResetPasswordModal('${escapeHtml(u.email)}')">Reset Password</button>
            ${hasSub ? `
              <button class="btn btn-outline-danger btn-sm" onclick="revokeUserAccess('${escapeHtml(u.email)}')">Revoke</button>
            ` : ''}
            <button class="btn btn-secondary btn-sm" onclick="toggleUserRole('${escapeHtml(u.email)}', '${isAdmin ? 'user' : 'admin'}')">
              ${isAdmin ? 'Demote' : 'Make Admin'}
            </button>
          </div>
        </td>
      </tr>
    `;
  }
}
