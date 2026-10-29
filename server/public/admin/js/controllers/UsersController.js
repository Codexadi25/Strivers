/**
 * User Access Control & Subscriptions Controller
 */

import { UserModel } from '../models/UserModel.js';
import { UsersPageView } from '../views/pages/UsersPageView.js';
import { showToast } from '../utils/formatters.js';

let usersDebounceTimer = null;

export class UsersController {
  static async loadUsers() {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    const search = document.getElementById('user-search')?.value.trim() || '';
    tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading users...</td></tr>`;

    try {
      const users = await UserModel.getUsers(search);

      if (users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No user records found.</td></tr>`;
        return;
      }

      tbody.innerHTML = users.map((u) => UsersPageView.renderUserRow(u)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #f87171">Failed to load users: ${err.message}</td></tr>`;
    }
  }

  static debounceUsersSearch() {
    clearTimeout(usersDebounceTimer);
    usersDebounceTimer = setTimeout(() => this.loadUsers(), 300);
  }

  static openGrantAccessModal(email = '') {
    const modal = document.getElementById('modal-grant-access');
    if (modal) {
      modal.classList.remove('hidden');
      if (email) {
        document.getElementById('grant-email').value = email;
      }
    }
  }

  static closeGrantAccessModal() {
    const modal = document.getElementById('modal-grant-access');
    if (modal) modal.classList.add('hidden');
  }

  static togglePermanentDuration() {
    const isPerm = document.getElementById('grant-is-permanent').checked;
    const wrap = document.getElementById('wrap-grant-duration');
    if (wrap) {
      if (isPerm) wrap.classList.add('hidden');
      else wrap.classList.remove('hidden');
    }
  }

  static async submitGrantAccess(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('grant-email').value.trim();
    const isPermanent = document.getElementById('grant-is-permanent').checked;
    const durationDays = isPermanent ? 0 : (parseInt(document.getElementById('grant-duration').value) || 30);
    const courseId = document.getElementById('grant-course').value;
    const sheetId = document.getElementById('grant-sheet').value;
    const maxPracticeSheetsAllowed = parseInt(document.getElementById('grant-limit').value) || 2;
    const role = document.getElementById('grant-role').value;

    try {
      const res = await UserModel.grantAccess({
        email,
        durationDays,
        isPermanent,
        courseId,
        sheetId,
        maxPracticeSheetsAllowed,
        role,
      });
      showToast(res.message, 'success');
      this.closeGrantAccessModal();
      this.loadUsers();
    } catch (err) {
      showToast(`Access grant failed: ${err.message}`, 'error');
    }
  }

  static openResetPasswordModal(email) {
    document.getElementById('reset-user-email').value = email;
    document.getElementById('reset-user-new-password').value = 'strivers2026';
    const modal = document.getElementById('modal-reset-password');
    if (modal) modal.classList.remove('hidden');
  }

  static closeResetPasswordModal() {
    const modal = document.getElementById('modal-reset-password');
    if (modal) modal.classList.add('hidden');
  }

  static async submitResetPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('reset-user-email').value.trim();
    const newPassword = document.getElementById('reset-user-new-password').value.trim();

    if (!newPassword) {
      showToast('Please enter a new password.', 'error');
      return;
    }

    try {
      const res = await UserModel.resetPassword({ email, newPassword });
      showToast(res.message, 'success');
      this.closeResetPasswordModal();
    } catch (err) {
      showToast(`Password reset failed: ${err.message}`, 'error');
    }
  }

  static async generateResetLinkOnly() {
    const email = document.getElementById('reset-user-email').value.trim();
    try {
      const res = await UserModel.resetPassword({ email, generateTokenOnly: true });
      prompt('Password Reset URL generated successfully. Copy and share with user:', `${window.location.origin}${res.resetUrl}`);
      showToast('Reset link generated.', 'success');
      this.closeResetPasswordModal();
    } catch (err) {
      showToast(`Failed to generate link: ${err.message}`, 'error');
    }
  }

  static async revokeUserAccess(email) {
    if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
    try {
      const res = await UserModel.revokeAccess(email);
      showToast(res.message, 'success');
      this.loadUsers();
    } catch (err) {
      showToast(`Revocation failed: ${err.message}`, 'error');
    }
  }

  static async toggleUserRole(email, newRole) {
    if (!confirm(`Change role for ${email} to ${newRole.toUpperCase()}?`)) return;
    try {
      const res = await UserModel.toggleRole(email, newRole);
      showToast(res.message, 'success');
      this.loadUsers();
    } catch (err) {
      showToast(`Role change failed: ${err.message}`, 'error');
    }
  }
}
