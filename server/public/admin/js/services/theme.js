/**
 * Theme Service for Strivers Admin GUI
 * Manages Dark Mode & Light Mode toggling and persistence
 */

export function getActiveTheme() {
  return localStorage.getItem('strivers_admin_theme') || 'dark';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  localStorage.setItem('strivers_admin_theme', theme);

  // Update label text if present on DOM
  const topbarLabel = document.getElementById('theme-mode-label');
  if (topbarLabel) {
    topbarLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }

  const authLabel = document.getElementById('auth-theme-mode-label');
  if (authLabel) {
    authLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
}

export function initTheme() {
  const active = getActiveTheme();
  applyTheme(active);
}

export function toggleTheme() {
  const current = getActiveTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}
