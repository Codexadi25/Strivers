/**
 * Topbar Component View
 */

export class TopbarView {
  static render() {
    return `
      <div class="topbar-left">
        <span class="telemetry-pill">
          <span class="pulse-dot green"></span>
          <strong>Server Port:</strong> 5000 (Express)
        </span>
        <span class="telemetry-pill">
          <span class="pulse-dot blue"></span>
          <strong>Database:</strong> <span id="topbar-mongo">Connected</span>
        </span>
        <span class="telemetry-pill">
          <span class="pulse-dot purple"></span>
          <strong>Gateway:</strong> <span id="topbar-razorpay">Razorpay Live</span>
        </span>
      </div>

      <div class="topbar-right">
        <!-- Theme Mode Switcher -->
        <button id="theme-toggle-btn" class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle Theme (Light / Dark)">
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
          <span class="theme-label-text" id="theme-mode-label">Dark</span>
        </button>

        <button class="btn btn-secondary btn-sm" onclick="refreshCurrentTab()">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          <span>Sync Live Data</span>
        </button>
        <span class="server-time" id="server-clock">--:--:--</span>
      </div>
    `;
  }
}
