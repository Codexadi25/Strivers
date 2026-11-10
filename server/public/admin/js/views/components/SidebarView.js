/**
 * Server Core Basic GUI - Sidebar Navigation Component View
 * Focused strictly on: User Access Control, Security Logs, and System Telemetry
 */

export class SidebarView {
  static render() {
    return `
      <div class="brand">
        <div class="brand-icon" style="background: transparent; box-shadow: none;">
          <img src="/admin/favicon.ico" alt="Strivers logo" style="width: 34px; height: 34px; border-radius: 8px; object-fit: contain;" />
        </div>
        <div class="brand-text">
          <h1>Strivers</h1>
          <span class="badge-role">SERVER CORE</span>
        </div>
      </div>

      <nav class="nav-menu">
        <button class="nav-item active" data-tab="users" onclick="switchTab('users')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>User Access Control</span>
        </button>

        <button class="nav-item" data-tab="logs" onclick="switchTab('logs')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Audit & Security Logs</span>
        </button>

        <button class="nav-item" data-tab="telemetry" onclick="switchTab('telemetry')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span>System Telemetry</span>
        </button>
      </nav>

      <div class="sidebar-v2-notice" style="margin: 20px 14px; padding: 12px; background: rgba(37, 99, 235, 0.08); border: 1px solid rgba(37, 99, 235, 0.2); border-radius: 10px; font-size: 0.78rem; color: var(--text-muted, #94a3b8);">
        <div style="font-weight: 700; color: #3b82f6; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
          <span>🌐 Server Client & API</span>
        </div>
        <p style="margin: 0; line-height: 1.4;">
          Lifeline Hub, Pricing, and Orders are managed via <code>/api/v2/adminaccess</code> and ServerClient UI.
        </p>
      </div>

      <div class="sidebar-footer">
        <div class="operator-profile">
          <div class="avatar" id="admin-initials">AS</div>
          <div class="operator-info">
            <span class="operator-name">Root Operator</span>
            <span class="operator-email" id="sidebar-admin-email">creedracer111@gmail.com</span>
          </div>
        </div>
        <button class="btn-logout" title="Close Session" onclick="handleLogout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    `;
  }
}
