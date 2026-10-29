/**
 * Sidebar Navigation Component View
 */

export class SidebarView {
  static render() {
    return `
      <div class="brand">
        <div class="brand-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>
        <div class="brand-text">
          <h1>Strivers</h1>
          <span class="badge-role">SERVER GUI</span>
        </div>
      </div>

      <nav class="nav-menu">
        <button class="nav-item active" data-tab="pricing" onclick="switchTab('pricing')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <span>Pricing & Products</span>
          <span class="pill-highlight">NEW</span>
        </button>

        <button class="nav-item" data-tab="masterclasses" onclick="switchTab('masterclasses')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span>Masterclasses & Live Sessions</span>
          <span class="pill-highlight" style="background: #2563EB; color: white;">LIVE</span>
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

        <button class="nav-item" data-tab="orders" onclick="switchTab('orders')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <span>Orders & Payments</span>
        </button>

        <a class="nav-item" href="/templates/lifeline" target="_blank" style="text-decoration: none; color: inherit;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          <span>Lifeline Hub</span>
          <span class="pill-highlight" style="background: #16A34A; color: white;">REACT</span>
        </a>

        <button class="nav-item" data-tab="tickets" onclick="switchTab('tickets')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          <span>PG Failure & Tickets</span>
          <span class="pill-highlight" style="background: #f59e0b; color: white;">DISPUTES</span>
        </button>

        <button class="nav-item" data-tab="users" onclick="switchTab('users')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <span>User Access Control</span>
        </button>

        <button class="nav-item" data-tab="practice" onclick="switchTab('practice')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Practice Sheets & Roles</span>
          <span class="pill-highlight" style="background: #10b981; color: white;">NEW</span>
        </button>

        <button class="nav-item" data-tab="refunds" onclick="switchTab('refunds')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
          <span>Refunds Console</span>
        </button>

        <button class="nav-item" data-tab="logs" onclick="switchTab('logs')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <span>Audit & Security Logs</span>
        </button>
      </nav>

      <div class="sidebar-footer">
        <div class="user-chip">
          <div class="user-avatar" id="admin-initials">AD</div>
          <div class="user-meta">
            <span class="user-email" id="sidebar-admin-email">admin@domain.com</span>
            <span class="user-status"><span class="pulse-dot green"></span> Live Root Admin</span>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="handleLogout()" title="Logout from Admin GUI">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    `;
  }
}
