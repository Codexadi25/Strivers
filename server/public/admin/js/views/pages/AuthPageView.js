/**
 * Authentication Screen View
 */

export class AuthPageView {
  static render() {
    return `
      <!-- Floating Theme Switcher on Login Screen -->
      <div class="auth-theme-toggle-wrap">
        <button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Theme (Light / Dark)">
          <span class="theme-toggle-slider">
            <svg class="sun-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
            <svg class="moon-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          </span>
          <span class="theme-label-text" id="auth-theme-mode-label">Dark</span>
        </button>
      </div>

      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo-chip">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
              <line x1="6" y1="6" x2="6.01" y2="6"></line>
              <line x1="6" y1="18" x2="6.01" y2="18"></line>
            </svg>
          </div>
          <h2>Strivers Backend Console</h2>
          <p class="auth-sub">Internal Server Administration & Product Pricing Engine</p>
        </div>
        
        <form id="login-form" class="auth-form" onsubmit="handleAdminLogin(event)">
          <div class="form-group">
            <label for="admin-email">Administrator Email</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <input type="email" id="admin-email" required placeholder="email@domain.com">
            </div>
          </div>

          <div class="form-group">
            <label for="admin-password">Administrative Passkey</label>
            <div class="input-wrap">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input type="password" id="admin-password" required placeholder="••••••••">
            </div>
          </div>

          <button type="submit" id="btn-login" class="btn btn-primary btn-block">
            <span>Authenticate & Access GUI</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>

          <div id="login-error" class="login-error hidden"></div>
        </form>

        <div class="auth-footer">
          <span class="chip-secure">
            <span class="pulse-dot"></span> Port 5000 Isolated Server GUI
          </span>
        </div>
      </div>
    `;
  }
}
