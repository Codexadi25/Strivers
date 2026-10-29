/**
 * Auth Controller for Strivers Admin GUI
 */

import { apiRequest, setAuthToken, clearAuthToken, getAuthToken } from '../services/api.js';
import { showToast, escapeHtml } from '../utils/formatters.js';

export class AuthController {
  static currentUser = null;

  static async checkSession() {
    const token = getAuthToken();
    if (!token) {
      this.showAuthScreen();
      return false;
    }

    try {
      const res = await apiRequest('/auth/me');
      if (res.user && res.user.role === 'admin') {
        this.currentUser = res.user;
        this.showDashboard(res.user);
        return true;
      } else {
        clearAuthToken();
        this.showAuthScreen();
        return false;
      }
    } catch {
      clearAuthToken();
      this.showAuthScreen();
      return false;
    }
  }

  static showAuthScreen() {
    const authScreen = document.getElementById('auth-screen');
    const adminApp = document.getElementById('admin-app');
    if (authScreen) authScreen.classList.remove('hidden');
    if (adminApp) adminApp.classList.add('hidden');
  }

  static showDashboard(user) {
    const authScreen = document.getElementById('auth-screen');
    const adminApp = document.getElementById('admin-app');
    if (authScreen) authScreen.classList.add('hidden');
    if (adminApp) adminApp.classList.remove('hidden');

    const emailEl = document.getElementById('sidebar-admin-email');
    if (emailEl && user) emailEl.textContent = user.email || 'admin@domain.com';

    const initialsEl = document.getElementById('admin-initials');
    if (initialsEl && user && user.email) {
      initialsEl.textContent = user.email.substring(0, 2).toUpperCase();
    }
  }

  static async handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('admin-email').value.trim();
    const password = document.getElementById('admin-password').value;
    const btn = document.getElementById('btn-login');
    const errBox = document.getElementById('login-error');

    if (errBox) {
      errBox.classList.add('hidden');
      errBox.textContent = '';
    }

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span>Verifying Root Credentials...</span>';
    }

    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (!res.token || !res.user || res.user.role !== 'admin') {
        throw new Error('Access denied. Administrator privileges required.');
      }

      setAuthToken(res.token);
      this.currentUser = res.user;
      showToast('Authenticated as Master Root Administrator', 'success');
      this.showDashboard(res.user);

      // Trigger initial tab load
      if (window.switchTab) {
        window.switchTab('pricing');
      }
    } catch (err) {
      if (errBox) {
        errBox.classList.remove('hidden');
        errBox.textContent = err.message || 'Authentication failed.';
      }
      showToast(err.message, 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <span>Authenticate & Access GUI</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    }
  }

  static handleLogout() {
    clearAuthToken();
    this.currentUser = null;
    showToast('Administrator session closed.', 'info');
    this.showAuthScreen();
  }
}
