/**
 * Server Core Basic GUI - Central Application Controller
 * Coordinates strictly: User Access Control, Audit & Security Logs, and System Telemetry
 */

import { initTheme, toggleTheme } from '../services/theme.js';
import { AuthController } from './AuthController.js';
import { TelemetryController } from './TelemetryController.js';
import { UsersController } from './UsersController.js';
import { LogsController } from './LogsController.js';

import { SidebarView } from '../views/components/SidebarView.js';
import { TopbarView } from '../views/components/TopbarView.js';
import { ModalsView } from '../views/components/ModalsView.js';
import { AuthPageView } from '../views/pages/AuthPageView.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';
import { UsersPageView } from '../views/pages/UsersPageView.js';
import { LogsPageView } from '../views/pages/LogsPageView.js';

export class AppController {
  static currentActiveTab = 'users';

  static init() {
    initTheme();
    this.mountViews();
    this.bindGlobals();
    this.startServerClock();

    AuthController.checkSession().then((isAuthenticated) => {
      if (isAuthenticated) {
        this.switchTab('users');
      }
    });
  }

  static mountViews() {
    const authScreen = document.getElementById('auth-screen');
    if (authScreen && !authScreen.innerHTML.trim()) {
      authScreen.innerHTML = AuthPageView.render();
    }

    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer && !sidebarContainer.innerHTML.trim()) {
      sidebarContainer.innerHTML = SidebarView.render();
    }

    const topbarContainer = document.getElementById('topbar-container');
    if (topbarContainer && !topbarContainer.innerHTML.trim()) {
      topbarContainer.innerHTML = TopbarView.render();
    }

    const pagesContainer = document.getElementById('pages-container');
    if (pagesContainer && !pagesContainer.innerHTML.trim()) {
      pagesContainer.innerHTML = [
        UsersPageView.renderPane(),
        LogsPageView.renderPane(),
        TelemetryPageView.renderPane(),
      ].join('\n');
    }

    const modalsContainer = document.getElementById('modals-container');
    if (modalsContainer && !modalsContainer.innerHTML.trim()) {
      modalsContainer.innerHTML = ModalsView.renderAllModals();
    }
  }

  static switchTab(tabId) {
    const allowedTabs = ['users', 'logs', 'telemetry'];
    const targetTab = allowedTabs.includes(tabId) ? tabId : 'users';
    this.currentActiveTab = targetTab;

    document.querySelectorAll('.nav-item').forEach((item) => {
      item.classList.toggle('active', item.getAttribute('data-tab') === targetTab);
    });

    document.querySelectorAll('.tab-pane').forEach((pane) => {
      pane.classList.toggle('active', pane.id === `tab-${targetTab}`);
    });

    this.loadActiveTabData(targetTab);
  }

  static loadActiveTabData(tabId) {
    switch (tabId) {
      case 'telemetry':
        TelemetryController.loadTelemetry();
        break;
      case 'users':
        UsersController.loadUsers();
        break;
      case 'logs':
        LogsController.loadLogs();
        break;
      default:
        UsersController.loadUsers();
        break;
    }
  }

  static refreshCurrentTab() {
    this.loadActiveTabData(this.currentActiveTab);
  }

  static startServerClock() {
    const clockEl = document.getElementById('server-clock');
    if (!clockEl) return;

    const update = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
    };

    update();
    setInterval(update, 1000);
  }

  static bindGlobals() {
    window.switchTab = (tabId) => this.switchTab(tabId);
    window.refreshCurrentTab = () => this.refreshCurrentTab();
    window.toggleTheme = () => toggleTheme();

    window.handleAdminLogin = (e) => AuthController.handleLogin(e);
    window.handleLogout = () => AuthController.handleLogout();

    // User Access
    window.loadUsers = () => UsersController.loadUsers();
    window.debounceUsersSearch = () => UsersController.debounceUsersSearch();
    window.openGrantAccessModal = (email) => UsersController.openGrantAccessModal(email);
    window.closeGrantAccessModal = () => UsersController.closeGrantAccessModal();
    window.togglePermanentDuration = () => UsersController.togglePermanentDuration();
    window.submitGrantAccess = (e) => UsersController.submitGrantAccess(e);
    window.openResetPasswordModal = (email) => UsersController.openResetPasswordModal(email);
    window.closeResetPasswordModal = () => UsersController.closeResetPasswordModal();
    window.submitResetPassword = (e) => UsersController.submitResetPassword(e);
    window.generateResetLinkOnly = () => UsersController.generateResetLinkOnly();
    window.revokeUserAccess = (email) => UsersController.revokeUserAccess(email);
    window.toggleUserRole = (email, role) => UsersController.toggleUserRole(email, role);
    window.removeUser = (email) => UsersController.removeUser(email);

    // Telemetry & Activities
    window.handleActivitiesLimitChange = (val) => TelemetryController.changeLimit(val);
    window.handleActivitiesPrevPage = () => TelemetryController.prevPage();
    window.handleActivitiesNextPage = () => TelemetryController.nextPage();

    // Logs
    window.loadLogs = () => LogsController.loadLogs();
    window.debounceLogsSearch = () => LogsController.debounceLogsSearch();
    window.handleLogsLimitChange = (val) => LogsController.changeLimit(val);
    window.handleLogsPrevPage = () => LogsController.prevPage();
    window.handleLogsNextPage = () => LogsController.nextPage();
  }
}
