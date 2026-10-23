/**
 * Strivers Server Backend GUI Client Logic
 * Powers Product Pricing Engine, Real-Time Telemetry, and Paywall Authority.
 */

const API_BASE = '/api/v1/admin';
let currentAdminUser = null;
let currentProducts = [];
let searchDebounceTimer = null;

// ==========================================
// THEME MANAGEMENT (DARK / LIGHT)
// ==========================================
function getActiveTheme() {
  return localStorage.getItem('strivers_admin_theme') || 'dark';
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('strivers_admin_theme', theme);

  const label = document.getElementById('theme-mode-label');
  if (label) {
    label.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
  const authLabel = document.getElementById('auth-theme-mode-label');
  if (authLabel) {
    authLabel.textContent = theme === 'dark' ? 'Dark' : 'Light';
  }
}

function initTheme() {
  applyTheme(getActiveTheme());
}

function toggleTheme() {
  const current = getActiveTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  showToast(`Switched to ${next === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
}

// ==========================================
// INITIALIZATION & AUTHENTICATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  startServerClock();
  checkAuthSession();

  // Dynamic paise calculation listener
  const editPriceInput = document.getElementById('edit-price');
  if (editPriceInput) {
    editPriceInput.addEventListener('input', () => {
      const val = parseFloat(editPriceInput.value) || 0;
      const calcElem = document.getElementById('edit-paise-calc');
      if (calcElem) calcElem.textContent = Math.round(val * 100);
    });
  }
});

function startServerClock() {
  const clockEl = document.getElementById('server-clock');
  const update = () => {
    const d = new Date();
    clockEl.textContent = d.toLocaleTimeString('en-IN', { hour12: false }) + ' IST';
  };
  update();
  setInterval(update, 1000);
}

function getAuthToken() {
  return localStorage.getItem('strivers_admin_token') || '';
}

function setAuthToken(token) {
  if (token) {
    localStorage.setItem('strivers_admin_token', token);
  } else {
    localStorage.removeItem('strivers_admin_token');
  }
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 401 || res.status === 403) {
    if (!endpoint.includes('/login')) {
      showToast('Session expired or unauthorized. Please re-authenticate.', 'error');
      handleLogout();
    }
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with HTTP ${res.status}`);
  }

  return data;
}

async function checkAuthSession() {
  const token = getAuthToken();
  if (!token) {
    showAuthScreen();
    return;
  }

  try {
    const res = await apiRequest('/metrics');
    if (res.success) {
      currentAdminUser = {
        email: localStorage.getItem('strivers_admin_email') || 'admin@yourdomain.com',
        role: 'admin',
      };
      showDashboard();
      initDashboardData(res.data);
    } else {
      showAuthScreen();
    }
  } catch (err) {
    console.warn('Session verification failed:', err.message);
    showAuthScreen();
  }
}

function showAuthScreen() {
  document.getElementById('auth-screen').classList.remove('hidden');
  document.getElementById('admin-app').classList.add('hidden');
}

function showDashboard() {
  document.getElementById('auth-screen').classList.add('hidden');
  document.getElementById('admin-app').classList.remove('hidden');

  const email = currentAdminUser?.email || 'admin@yourdomain.com';
  document.getElementById('sidebar-admin-email').textContent = email;
  document.getElementById('admin-initials').textContent = email.substring(0, 2).toUpperCase();

  // Load default tab
  loadProducts();
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById('admin-email');
  const passwordInput = document.getElementById('admin-password');
  const btn = document.getElementById('btn-login');
  const errorBox = document.getElementById('login-error');

  errorBox.classList.add('hidden');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Verifying Credentials...';

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Authentication rejected by server.');
    }

    setAuthToken(data.token);
    localStorage.setItem('strivers_admin_email', data.user.email);
    currentAdminUser = data.user;

    showToast(`Welcome, Root Admin (${data.user.email})!`, 'success');
    showDashboard();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.remove('hidden');
  } finally {
    btn.disabled = false;
    btn.querySelector('span').textContent = 'Authenticate & Access GUI';
  }
}

function handleLogout() {
  setAuthToken(null);
  localStorage.removeItem('strivers_admin_email');
  currentAdminUser = null;
  showToast('Logged out of Admin GUI.', 'info');
  showAuthScreen();
}

// ==========================================
// TAB NAVIGATION
// ==========================================
function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach((b) => b.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach((p) => p.classList.remove('active'));

  const navBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  const pane = document.getElementById(`tab-${tabId}`);

  if (navBtn) navBtn.classList.add('active');
  if (pane) pane.classList.add('active');

  // Trigger relevant fetch
  if (tabId === 'pricing') loadProducts();
  else if (tabId === 'masterclasses') loadMasterclasses();
  else if (tabId === 'telemetry') loadTelemetry();
  else if (tabId === 'orders') loadOrders();
  else if (tabId === 'users') loadUsers();
  else if (tabId === 'practice') loadPracticeSheets();
  else if (tabId === 'refunds') loadRefunds();
  else if (tabId === 'logs') loadLogs();
}

function refreshCurrentTab() {
  const activeBtn = document.querySelector('.nav-item.active');
  const tab = activeBtn ? activeBtn.getAttribute('data-tab') : 'pricing';
  switchTab(tab);
  showToast('Data synced with live MongoDB state.', 'info');
}

// ==========================================
// TAB 1: PRODUCT PRICING ENGINE
// ==========================================
async function loadProducts() {
  const container = document.getElementById('pricing-cards-container');
  try {
    const res = await apiRequest('/products');
    currentProducts = res.products || [];

    if (currentProducts.length === 0) {
      container.innerHTML = `
        <div class="loading-state">
          <p>No products configured yet.</p>
          <button class="btn btn-primary btn-sm mt-4" onclick="openAddProductModal()">+ Add First Product</button>
        </div>
      `;
      return;
    }

    container.innerHTML = currentProducts.map((p) => renderProductCard(p)).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="loading-state text-center">
        <p style="color: #f87171">Failed to load product catalog: ${err.message}</p>
        <button class="btn btn-secondary btn-sm mt-4" onclick="loadProducts()">Try Again</button>
      </div>
    `;
  }
}

function renderProductCard(p) {
  const isInactive = !p.isActive;
  const originalPriceFormatted = p.originalPrice ? `₹${p.originalPrice}` : '';
  const discount = p.originalPrice && p.originalPrice > p.price
    ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
    : null;

  return `
    <div class="product-card ${isInactive ? 'inactive' : ''}" id="product-card-${p.productId}">
      <div class="product-top">
        <span class="product-badge-pill">${p.badge || 'Standard Tier'}</span>
        <span class="product-slug">ID: ${p.productId}</span>
      </div>

      <h3 class="product-title">${escapeHtml(p.title)}</h3>
      <p class="product-desc">${escapeHtml(p.description || 'No description provided.')}</p>

      <div class="product-pricing-box">
        <div class="price-display-row">
          <span class="price-main">₹${p.price}</span>
          ${originalPriceFormatted ? `<span class="price-original">${originalPriceFormatted}</span>` : ''}
          ${discount ? `<span class="price-discount-tag">${discount}% OFF</span>` : ''}
        </div>
        <div class="price-paise-row">
          <span>Backend Raw: <code>${p.priceInPaise} paise</code></span>
          <span>Status: <strong>${p.isActive ? '🟢 Active' : '🔴 Inactive'}</strong></span>
        </div>
      </div>

      <ul class="product-features-list">
        ${(p.features || []).map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
      </ul>

      <div class="product-actions">
        <button class="btn btn-primary btn-block" onclick="openEditPriceModal('${p.productId}')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          <span>Change Price & Details</span>
        </button>
      </div>
    </div>
  `;
}

function openEditPriceModal(productId) {
  const product = currentProducts.find((p) => p.productId === productId);
  if (!product) return;

  document.getElementById('edit-product-id').value = product.productId;
  document.getElementById('edit-title').value = product.title || '';
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-paise-calc').textContent = product.priceInPaise;
  document.getElementById('edit-original-price').value = product.originalPrice || '';
  document.getElementById('edit-badge').value = product.badge || '';
  document.getElementById('edit-description').value = product.description || '';
  document.getElementById('edit-is-active').checked = product.isActive !== false;

  document.getElementById('modal-edit-price').classList.remove('hidden');
}

function closeEditPriceModal() {
  document.getElementById('modal-edit-price').classList.add('hidden');
}

async function submitPriceUpdate(e) {
  e.preventDefault();
  const productId = document.getElementById('edit-product-id').value;
  const title = document.getElementById('edit-title').value.trim();
  const price = parseFloat(document.getElementById('edit-price').value);
  const originalPrice = document.getElementById('edit-original-price').value ? parseFloat(document.getElementById('edit-original-price').value) : null;
  const badge = document.getElementById('edit-badge').value.trim();
  const description = document.getElementById('edit-description').value.trim();
  const isActive = document.getElementById('edit-is-active').checked;
  const saveBtn = document.getElementById('btn-save-price');

  if (isNaN(price) || price < 1) {
    showToast('Please enter a valid price (minimum ₹1).', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.querySelector('span').textContent = 'Updating Price in DB...';

  try {
    const res = await apiRequest(`/products/${productId}/price`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        price,
        originalPrice,
        badge,
        description,
        isActive,
      }),
    });

    showToast(res.message || `Price updated to ₹${price}!`, 'success');
    closeEditPriceModal();
    loadProducts();
  } catch (err) {
    showToast(`Price update failed: ${err.message}`, 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.querySelector('span').textContent = 'Apply Price Change';
  }
}

function openAddProductModal() {
  document.getElementById('modal-add-product').classList.remove('hidden');
}

function closeAddProductModal() {
  document.getElementById('modal-add-product').classList.add('hidden');
}

async function submitCreateProduct(e) {
  e.preventDefault();
  const productId = document.getElementById('new-product-id').value.trim().toLowerCase();
  const title = document.getElementById('new-title').value.trim();
  const price = parseFloat(document.getElementById('new-price').value);
  const originalPrice = document.getElementById('new-original-price').value ? parseFloat(document.getElementById('new-original-price').value) : null;
  const badge = document.getElementById('new-badge').value.trim();
  const description = document.getElementById('new-description').value.trim();

  try {
    const res = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        title,
        price,
        originalPrice,
        badge,
        description,
        isActive: true,
      }),
    });

    showToast(`Product "${title}" created at ₹${price}.`, 'success');
    closeAddProductModal();
    loadProducts();
  } catch (err) {
    showToast(`Failed to create product: ${err.message}`, 'error');
  }
}

// ==========================================
// TAB: MASTERCLASSES & LIVE SESSIONS ENGINE
// ==========================================
let currentMasterclasses = [];

async function loadMasterclasses() {
  const container = document.getElementById('masterclasses-container');
  if (!container) return;
  try {
    const res = await apiRequest('/courses');
    currentMasterclasses = res.products || [];

    if (currentMasterclasses.length === 0) {
      container.innerHTML = `
        <div class="loading-state text-center">
          <p>No masterclasses or courses configured yet in MongoDB.</p>
          <button class="btn btn-primary btn-sm mt-4" onclick="openCreateMasterclassModal()">+ Create First Masterclass</button>
        </div>
      `;
      return;
    }

    container.innerHTML = currentMasterclasses.map((m) => renderMasterclassCard(m)).join('');
  } catch (err) {
    container.innerHTML = `
      <div class="loading-state text-center">
        <p style="color: #f87171">Failed to load masterclasses: ${err.message}</p>
        <button class="btn btn-secondary btn-sm mt-4" onclick="loadMasterclasses()">Try Again</button>
      </div>
    `;
  }
}

function renderMasterclassCard(m) {
  const status = m.sessionStatus || 'upcoming';
  const statusLabels = {
    live: '<span class="session-status-badge live"><span class="pulse-dot red"></span>Live Now 🔴</span>',
    upcoming: '<span class="session-status-badge upcoming">📅 Upcoming</span>',
    completed: '<span class="session-status-badge completed">✓ Concluded</span>',
  };

  const timingSlots = m.timingSlots || [];
  const materials = m.notesAndPdfs || [];
  const nextSlot = timingSlots[0];

  return `
    <div class="product-card" id="mc-card-${m.productId}" style="display: flex; flex-direction: column; justify-content: space-between;">
      <div>
        <div class="product-top">
          <span class="product-badge-pill" style="background: var(--info-bg); color: var(--info-text); border: 1px solid var(--info-border);">
            ${escapeHtml((m.category || 'masterclass').toUpperCase())}
          </span>
          <span class="product-slug">Slug: ${escapeHtml(m.productId)}</span>
        </div>

        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-top: 6px;">
          <h3 class="product-title" style="margin: 0;">${escapeHtml(m.title)}</h3>
          ${statusLabels[status] || statusLabels.upcoming}
        </div>

        <p class="product-desc" style="margin-top: 6px;">${escapeHtml(m.description || 'No blurb provided.')}</p>

        <!-- Active Meeting Link Box -->
        <div class="session-box">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <strong style="color: var(--accent); font-size: 12px; display: flex; align-items: center; gap: 5px;">
              <span>🎥</span> Meeting Link (${escapeHtml(m.meetingPlatform || 'Google Meet')})
            </strong>
            <button class="btn btn-secondary btn-xs" style="padding: 2px 8px; font-size: 11px;" onclick="openSessionModal('${m.productId}')">
              Edit Link
            </button>
          </div>
          <div style="word-break: break-all; font-family: var(--font-mono); font-size: 11.5px; color: var(--text-main);">
            ${
              m.activeMeetingLink
                ? `<a href="${escapeHtml(m.activeMeetingLink)}" target="_blank" rel="noopener noreferrer" style="color: var(--info-text); text-decoration: underline;">${escapeHtml(m.activeMeetingLink)}</a>`
                : '<span style="color: var(--text-faint); font-style: italic;">No meeting URL configured</span>'
            }
          </div>
          ${
            m.meetingCode
              ? `<div style="margin-top: 4px; font-size: 11px; color: var(--text-muted);">Code: <code>${escapeHtml(m.meetingCode)}</code></div>`
              : ''
          }
        </div>

        <!-- Timing Slots & Schedule Summary -->
        <div class="info-subbox">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-main);">
              ⏱️ Timing Slots (${timingSlots.length})
            </span>
            <button class="btn btn-secondary btn-xs" style="padding: 2px 8px; font-size: 11px;" onclick="openSlotsModal('${m.productId}')">
              Manage Slots
            </button>
          </div>
          <div style="margin-top: 6px; font-size: 11.5px; color: var(--text-muted);">
            ${
              nextSlot
                ? `<strong>Next:</strong> ${escapeHtml(nextSlot.date)} · ${escapeHtml(nextSlot.startTime)}${nextSlot.mentorName ? ` (${escapeHtml(nextSlot.mentorName)})` : ''}`
                : 'No timing slots scheduled yet.'
            }
          </div>
        </div>

        <!-- DRM Study Material Summary -->
        <div class="info-subbox">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 12px; font-weight: 600; color: var(--text-main); display: flex; align-items: center; gap: 5px;">
              <span>📁</span> Notes & PDFs (${materials.length})
            </span>
            <button class="btn btn-secondary btn-xs" style="padding: 2px 8px; font-size: 11px;" onclick="openMaterialsModal('${m.productId}')">
              Manage Materials
            </button>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: var(--info-text); display: flex; align-items: center; gap: 5px;">
            <span>🔒</span> Stored in MongoDB · Anti-Download DRM Enforced
          </div>
        </div>

        <!-- Price Details -->
        <div class="product-pricing-box" style="margin-bottom: 14px;">
          <div class="price-display-row">
            <span class="price-main">₹${m.price}</span>
            ${m.originalPrice ? `<span class="price-original">₹${m.originalPrice}</span>` : ''}
          </div>
          <div class="price-paise-row">
            <span>Raw: <code>${m.priceInPaise} paise</code></span>
            <span>Status: <strong>${m.isActive !== false ? '🟢 Active' : '🔴 Inactive'}</strong></span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 8px;">
        <button class="btn btn-secondary btn-sm" onclick="openEditMasterclassModal('${m.productId}')">
          ✏️ Edit Details
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteMasterclass('${m.productId}')">
          🗑️ Delete
        </button>
      </div>
    </div>
  `;
}

function openCreateMasterclassModal() {
  const form = document.getElementById('form-create-masterclass');
  if (form) form.reset();
  const idInput = document.getElementById('mc-id');
  if (idInput) {
    idInput.readOnly = false;
    idInput.disabled = false;
  }
  document.getElementById('modal-masterclass-title-text').textContent = 'Create Masterclass / Course';
  document.getElementById('modal-create-masterclass').classList.remove('hidden');
}

function closeCreateMasterclassModal() {
  document.getElementById('modal-create-masterclass').classList.add('hidden');
}

function openEditMasterclassModal(productId) {
  const m = currentMasterclasses.find((x) => x.productId === productId);
  if (!m) return;

  document.getElementById('modal-masterclass-title-text').textContent = `Edit Course: ${m.title}`;
  const idInput = document.getElementById('mc-id');
  idInput.value = m.productId;
  idInput.readOnly = true;

  document.getElementById('mc-category').value = m.category || 'masterclass';
  document.getElementById('mc-title').value = m.title || '';
  document.getElementById('mc-desc').value = m.description || '';
  document.getElementById('mc-price').value = m.price;
  document.getElementById('mc-original-price').value = m.originalPrice || '';
  document.getElementById('mc-badge').value = m.badge || '';
  document.getElementById('mc-features').value = (m.features || []).join('\n');
  document.getElementById('mc-meeting-link').value = m.activeMeetingLink || '';
  document.getElementById('mc-session-status').value = m.sessionStatus || 'upcoming';

  document.getElementById('modal-create-masterclass').classList.remove('hidden');
}

async function submitCreateMasterclass(e) {
  e.preventDefault();
  const productId = document.getElementById('mc-id').value.trim().toLowerCase();
  const category = document.getElementById('mc-category').value;
  const title = document.getElementById('mc-title').value.trim();
  const description = document.getElementById('mc-desc').value.trim();
  const price = parseFloat(document.getElementById('mc-price').value);
  const originalPrice = document.getElementById('mc-original-price').value
    ? parseFloat(document.getElementById('mc-original-price').value)
    : null;
  const badge = document.getElementById('mc-badge').value.trim();
  const features = document
    .getElementById('mc-features')
    .value.split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
  const activeMeetingLink = document.getElementById('mc-meeting-link').value.trim();
  const sessionStatus = document.getElementById('mc-session-status').value;

  try {
    const res = await apiRequest('/courses', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        category,
        title,
        description,
        price,
        originalPrice,
        badge,
        features,
        activeMeetingLink,
        sessionStatus,
        isActive: true,
      }),
    });

    showToast(res.message || `Masterclass "${title}" saved successfully!`, 'success');
    closeCreateMasterclassModal();
    loadMasterclasses();
    loadProducts();
  } catch (err) {
    showToast(`Failed to save masterclass: ${err.message}`, 'error');
  }
}

async function deleteMasterclass(productId) {
  if (!confirm(`Are you sure you want to delete course "${productId}"? This cannot be undone.`)) {
    return;
  }
  try {
    const res = await apiRequest(`/courses/${productId}`, { method: 'DELETE' });
    showToast(res.message || `Course "${productId}" removed.`, 'success');
    loadMasterclasses();
    loadProducts();
  } catch (err) {
    showToast(`Delete failed: ${err.message}`, 'error');
  }
}

// Session Link Modal Logic
function openSessionModal(productId) {
  const m = currentMasterclasses.find((x) => x.productId === productId);
  if (!m) return;

  document.getElementById('session-course-id').value = m.productId;
  document.getElementById('session-course-name').textContent = `${m.title} (${m.productId})`;
  document.getElementById('session-link-input').value = m.activeMeetingLink || '';
  document.getElementById('session-code-input').value = m.meetingCode || '';
  document.getElementById('session-status-select').value = m.sessionStatus || 'upcoming';

  document.getElementById('modal-session-link').classList.remove('hidden');
}

function closeSessionModal() {
  document.getElementById('modal-session-link').classList.add('hidden');
}

async function submitUpdateSession(e) {
  e.preventDefault();
  const courseId = document.getElementById('session-course-id').value;
  const activeMeetingLink = document.getElementById('session-link-input').value.trim();
  const meetingCode = document.getElementById('session-code-input').value.trim();
  const sessionStatus = document.getElementById('session-status-select').value;

  try {
    const res = await apiRequest(`/courses/${courseId}/session`, {
      method: 'PUT',
      body: JSON.stringify({ activeMeetingLink, meetingCode, sessionStatus }),
    });

    showToast(res.message || 'Active session details updated!', 'success');
    closeSessionModal();
    loadMasterclasses();
  } catch (err) {
    showToast(`Update failed: ${err.message}`, 'error');
  }
}

// Timing Slots Modal Logic
function openSlotsModal(productId) {
  const m = currentMasterclasses.find((x) => x.productId === productId);
  if (!m) return;

  document.getElementById('slots-course-id').value = m.productId;
  document.getElementById('slots-course-name').textContent = `${m.title} (${m.productId})`;
  renderSlotsList(m);

  document.getElementById('modal-timing-slots').classList.remove('hidden');
}

function closeSlotsModal() {
  document.getElementById('modal-timing-slots').classList.add('hidden');
}

function renderSlotsList(course) {
  const container = document.getElementById('slots-list-container');
  const slots = course.timingSlots || [];

  if (slots.length === 0) {
    container.innerHTML = `<p style="font-size: 13px; color: var(--text-faint); margin: 0;">No timing slots configured. Add a new slot below.</p>`;
    return;
  }

  container.innerHTML = slots
    .map(
      (s) => `
    <div class="slot-item">
      <div class="slot-item-info">
        <h5>${escapeHtml(s.title)}</h5>
        <p>
          📅 <strong>${escapeHtml(s.date)}</strong> · ⏰ ${escapeHtml(s.startTime)}
          ${s.mentorName ? ` · 👤 <em>${escapeHtml(s.mentorName)} (${escapeHtml(s.mentorRole || 'Mentor')})</em>` : ''}
        </p>
      </div>
      <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px;" onclick="deleteTimingSlot('${course.productId}', '${s.slotId}')">
        🗑️ Delete
      </button>
    </div>
  `
    )
    .join('');
}

async function submitAddSlot(e) {
  e.preventDefault();
  const courseId = document.getElementById('slots-course-id').value;
  const title = document.getElementById('slot-title').value.trim();
  const date = document.getElementById('slot-date').value.trim();
  const startTime = document.getElementById('slot-start-time').value.trim();
  const mentorName = document.getElementById('slot-mentor-name').value.trim();
  const mentorRole = document.getElementById('slot-mentor-role').value.trim();

  try {
    const res = await apiRequest(`/courses/${courseId}/timing-slots`, {
      method: 'POST',
      body: JSON.stringify({ title, date, startTime, mentorName, mentorRole }),
    });

    showToast(res.message || 'Timing slot scheduled!', 'success');
    document.getElementById('form-add-slot').reset();

    await loadMasterclasses();
    const updatedCourse = currentMasterclasses.find((x) => x.productId === courseId);
    if (updatedCourse) renderSlotsList(updatedCourse);
  } catch (err) {
    showToast(`Slot addition failed: ${err.message}`, 'error');
  }
}

async function deleteTimingSlot(courseId, slotId) {
  if (!confirm('Remove this timing slot from the schedule?')) return;
  try {
    const res = await apiRequest(`/courses/${courseId}/timing-slots/${slotId}`, {
      method: 'DELETE',
    });
    showToast(res.message || 'Slot deleted.', 'info');
    await loadMasterclasses();
    const updatedCourse = currentMasterclasses.find((x) => x.productId === courseId);
    if (updatedCourse) renderSlotsList(updatedCourse);
  } catch (err) {
    showToast(`Slot delete failed: ${err.message}`, 'error');
  }
}

// Study Materials Modal Logic (Stored in MongoDB, View-Only DRM)
function openMaterialsModal(productId) {
  const m = currentMasterclasses.find((x) => x.productId === productId);
  if (!m) return;

  document.getElementById('materials-course-id').value = m.productId;
  document.getElementById('materials-course-name').textContent = `${m.title} · Stored in MongoDB (View-Only DRM)`;
  renderMaterialsList(m);

  document.getElementById('modal-study-materials').classList.remove('hidden');
}

function closeMaterialsModal() {
  document.getElementById('modal-study-materials').classList.add('hidden');
}

function renderMaterialsList(course) {
  const container = document.getElementById('materials-list-container');
  const materials = course.notesAndPdfs || [];

  if (materials.length === 0) {
    container.innerHTML = `<p style="font-size: 13px; color: var(--text-faint); margin: 0;">No documents stored in MongoDB yet. Upload or enter text below.</p>`;
    return;
  }

  const icons = {
    pdf: '📄',
    notes: '📝',
    cheatsheet: '⚡',
    document: '📑',
  };

  container.innerHTML = materials
    .map((m) => {
      const sizeKB = m.fileSize ? Math.round(m.fileSize / 1024) : 0;
      const sizeFormatted = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;
      return `
      <div class="material-item">
        <div class="material-item-info">
          <div class="material-icon">${icons[m.fileType] || '📄'}</div>
          <div>
            <h5>${escapeHtml(m.title)}</h5>
            <p>
              <span style="font-weight: 600; text-transform: uppercase;">${escapeHtml(m.fileType)}</span> · ${sizeFormatted}
              ${m.description ? ` · <em>${escapeHtml(m.description)}</em>` : ''}
              <span class="badge badge-success" style="margin-left: 6px; font-size: 10px; padding: 2px 6px;">🔒 DRM Protected</span>
            </p>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px;" onclick="deleteStudyMaterial('${course.productId}', '${m.materialId}')">
          🗑️ Delete
        </button>
      </div>
    `;
    })
    .join('');
}

async function submitUploadMaterial(e) {
  e.preventDefault();
  const courseId = document.getElementById('materials-course-id').value;
  const title = document.getElementById('mat-title').value.trim();
  const fileType = document.getElementById('mat-type').value;
  const description = document.getElementById('mat-desc').value.trim();
  const fileInput = document.getElementById('mat-file-input');
  const textInput = document.getElementById('mat-text-input').value.trim();
  const submitBtn = document.getElementById('btn-submit-mat');

  const file = fileInput.files && fileInput.files[0];

  if (!file && !textInput) {
    showToast('Please select a file or enter text/markdown content to store in MongoDB.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.querySelector('span').textContent = 'Encoding & Saving to MongoDB...';

  try {
    let fileData = '';
    let mimeType = 'text/plain';
    let fileSize = 0;

    if (file) {
      fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });
      mimeType = file.type || 'application/pdf';
      fileSize = file.size;
    } else {
      fileData = 'data:text/markdown;base64,' + btoa(unescape(encodeURIComponent(textInput)));
      mimeType = 'text/markdown';
      fileSize = textInput.length;
    }

    const res = await apiRequest(`/courses/${courseId}/materials`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        fileType,
        mimeType,
        fileData,
        fileSize,
      }),
    });

    showToast(res.message || 'Document securely saved to MongoDB!', 'success');
    document.getElementById('form-upload-material').reset();

    await loadMasterclasses();
    const updatedCourse = currentMasterclasses.find((x) => x.productId === courseId);
    if (updatedCourse) renderMaterialsList(updatedCourse);
  } catch (err) {
    showToast(`Material upload failed: ${err.message}`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.querySelector('span').textContent = 'Save to MongoDB (View-Only DRM)';
  }
}

async function deleteStudyMaterial(courseId, materialId) {
  if (!confirm('Permanently delete this document from MongoDB?')) return;
  try {
    const res = await apiRequest(`/courses/${courseId}/materials/${materialId}`, {
      method: 'DELETE',
    });
    showToast(res.message || 'Document deleted from MongoDB.', 'info');
    await loadMasterclasses();
    const updatedCourse = currentMasterclasses.find((x) => x.productId === courseId);
    if (updatedCourse) renderMaterialsList(updatedCourse);
  } catch (err) {
    showToast(`Material delete failed: ${err.message}`, 'error');
  }
}

// ==========================================
// TAB 2: TELEMETRY & SYSTEM METRICS
// ==========================================
async function loadTelemetry() {
  try {
    const res = await apiRequest('/metrics');
    initDashboardData(res.data);
  } catch (err) {
    showToast(`Telemetry fetch failed: ${err.message}`, 'error');
  }
}

function initDashboardData(data) {
  if (!data) return;
  const { metrics, telemetry, recentActivities } = data;

  // KPI Metrics
  if (metrics) {
    document.getElementById('kpi-revenue').textContent = `₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`;
    document.getElementById('kpi-transactions').textContent = (metrics.totalTransactions || 0).toLocaleString();
    document.getElementById('kpi-subscribers').textContent = (metrics.activeSubscribers || 0).toLocaleString();
    document.getElementById('kpi-logs').textContent = (metrics.totalLogs || 0).toLocaleString();
  }

  // Topbar
  if (telemetry) {
    document.getElementById('topbar-mongo').textContent = telemetry.mongoState || 'Connected';
    document.getElementById('topbar-razorpay').textContent = telemetry.razorpayMode || 'Live';

    // Server list
    const serverList = document.getElementById('telemetry-list');
    serverList.innerHTML = `
      <div class="telemetry-row"><span>Node.js Version</span><strong>${telemetry.nodeVersion}</strong></div>
      <div class="telemetry-row"><span>Platform / Arch</span><strong>${telemetry.platform} (${telemetry.arch})</strong></div>
      <div class="telemetry-row"><span>Process Uptime</span><strong>${formatUptime(telemetry.uptimeSeconds)}</strong></div>
      <div class="telemetry-row"><span>Heap Memory</span><strong>${telemetry.memoryHeapUsedMB} MB</strong></div>
      <div class="telemetry-row"><span>Resident Set (RSS)</span><strong>${telemetry.memoryRssMB} MB</strong></div>
      <div class="telemetry-row"><span>Environment</span><strong>${telemetry.env}</strong></div>
    `;

    // Gateway list
    const gwList = document.getElementById('gateway-list');
    gwList.innerHTML = `
      <div class="telemetry-row"><span>Razorpay Mode</span><strong style="color: #34d399">${telemetry.razorpayMode}</strong></div>
      <div class="telemetry-row"><span>Key ID</span><strong>${telemetry.razorpayKeyMasked}</strong></div>
      <div class="telemetry-row"><span>Webhook Signature</span><strong>Active HMAC-SHA256</strong></div>
      <div class="telemetry-row"><span>Database Connection</span><strong style="color: #60a5fa">${telemetry.mongoState}</strong></div>
    `;
  }

  // Recent Activities
  if (recentActivities) {
    const tbody = document.getElementById('recent-activities-tbody');
    if (recentActivities.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No activities logged yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = recentActivities.map((act) => renderActivityRow(act)).join('');
  }
}

function renderActivityRow(act) {
  const badgeClass = getActionBadgeClass(act.action);
  const time = new Date(act.createdAt).toLocaleString('en-IN');
  const metaStr = act.metaData ? JSON.stringify(act.metaData) : '{}';

  return `
    <tr>
      <td><span class="badge ${badgeClass}">${act.action}</span></td>
      <td><strong>${escapeHtml(act.userEmail || act.userId || 'Guest')}</strong></td>
      <td><code>${escapeHtml(act.ipAddress || '127.0.0.1')}</code></td>
      <td class="text-muted">${time}</td>
      <td><span class="code-cell" title="${escapeHtml(metaStr)}">${escapeHtml(metaStr.substring(0, 40))}${metaStr.length > 40 ? '...' : ''}</span></td>
    </tr>
  `;
}

function getActionBadgeClass(action) {
  if (action === 'PRICE_UPDATED' || action === 'PAYMENT_SUCCESS') return 'badge-success';
  if (action === 'SECURITY_BREACH_ATTEMPT' || action === 'ACCESS_REVOKED') return 'badge-danger';
  if (action === 'ADMIN_LOGIN' || action === 'ACCESS_GRANTED') return 'badge-info';
  return 'badge-warning';
}

function formatUptime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// ==========================================
// TAB 3: ORDERS & TRANSACTIONS
// ==========================================
// ==========================================
// TAB 3: ORDERS & TRANSACTIONS
// ==========================================
async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');
  const search = document.getElementById('order-search')?.value.trim() || '';
  const status = document.getElementById('order-status-filter')?.value || 'all';

  tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading transactions...</td></tr>`;

  try {
    const res = await apiRequest(`/orders?q=${encodeURIComponent(search)}&status=${status}`);
    const orders = res.orders || [];

    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No orders found matching criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map((o) => `
      <tr>
        <td class="text-muted">${new Date(o.createdAt).toLocaleString('en-IN')}</td>
        <td><span class="code-cell">${escapeHtml(o.razorpayOrderId)}</span></td>
        <td><span class="code-cell" style="color: #60a5fa">${escapeHtml(o.razorpayPaymentId || 'N/A')}</span></td>
        <td><span class="code-cell" style="color: #a78bfa">${escapeHtml(o.receipt || 'N/A')}</span></td>
        <td><strong>${escapeHtml(o.userEmail)}</strong></td>
        <td><span class="badge badge-info">${escapeHtml(o.planId)}</span></td>
        <td><strong style="color: #34d399">₹${o.amount}</strong></td>
        <td><span class="badge ${o.status === 'captured' ? 'badge-success' : (o.status === 'created' ? 'badge-warning' : 'badge-danger')}">${o.status}</span></td>
        <td><span class="badge badge-success">Permanent Access ✓</span></td>
        <td>
          ${o.status === 'captured' ? `
            <button class="btn btn-outline-danger btn-sm" onclick="promptRefund('${o.razorpayOrderId}', ${o.amount})">Refund</button>
          ` : '<span class="text-muted">—</span>'}
        </td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="color: #f87171">Failed to load orders: ${err.message}</td></tr>`;
  }
}

function debounceOrdersSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadOrders, 300);
}

// ==========================================
// TAB 4: USERS & PERMISSIONS
// ==========================================
async function loadUsers() {
  const tbody = document.getElementById('users-tbody');
  const search = document.getElementById('user-search')?.value.trim() || '';

  tbody.innerHTML = `<tr><td colspan="7" class="text-center">Loading users...</td></tr>`;

  try {
    const res = await apiRequest(`/users?q=${encodeURIComponent(search)}`);
    const users = res.users || [];

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No user records found.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map((u) => {
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
          <td><span class="code-cell">${u.userId}</span></td>
          <td><span class="badge ${isAdmin ? 'badge-info' : 'badge-warning'}">${u.role}</span></td>
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
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center" style="color: #f87171">Failed to load users: ${err.message}</td></tr>`;
  }
}

function debounceUsersSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadUsers, 300);
}

function openGrantAccessModal(email = '') {
  document.getElementById('modal-grant-access').classList.remove('hidden');
  if (email) {
    document.getElementById('grant-email').value = email;
  }
}
function closeGrantAccessModal() {
  document.getElementById('modal-grant-access').classList.add('hidden');
}

function togglePermanentDuration() {
  const isPerm = document.getElementById('grant-is-permanent').checked;
  const wrap = document.getElementById('wrap-grant-duration');
  if (wrap) {
    if (isPerm) wrap.classList.add('hidden');
    else wrap.classList.remove('hidden');
  }
}

async function submitGrantAccess(e) {
  e.preventDefault();
  const email = document.getElementById('grant-email').value.trim();
  const isPermanent = document.getElementById('grant-is-permanent').checked;
  const durationDays = isPermanent ? 0 : (parseInt(document.getElementById('grant-duration').value) || 30);
  const courseId = document.getElementById('grant-course').value;
  const sheetId = document.getElementById('grant-sheet').value;
  const maxPracticeSheetsAllowed = parseInt(document.getElementById('grant-limit').value) || 2;
  const role = document.getElementById('grant-role').value;

  try {
    const res = await apiRequest('/users/grant-access', {
      method: 'POST',
      body: JSON.stringify({
        email,
        durationDays,
        isPermanent,
        courseId,
        sheetId,
        maxPracticeSheetsAllowed,
        role,
      }),
    });
    showToast(res.message, 'success');
    closeGrantAccessModal();
    loadUsers();
  } catch (err) {
    showToast(`Access grant failed: ${err.message}`, 'error');
  }
}

// Password Reset Control Mechanism
let currentResetTargetEmail = '';
function openResetPasswordModal(email) {
  currentResetTargetEmail = email;
  document.getElementById('reset-user-email').value = email;
  document.getElementById('reset-user-new-password').value = 'strivers2026';
  document.getElementById('modal-reset-password').classList.remove('hidden');
}
function closeResetPasswordModal() {
  document.getElementById('modal-reset-password').classList.add('hidden');
}

async function submitResetPassword(e) {
  e.preventDefault();
  const email = document.getElementById('reset-user-email').value.trim();
  const newPassword = document.getElementById('reset-user-new-password').value.trim();

  if (!newPassword) {
    showToast('Please enter a new password.', 'error');
    return;
  }

  try {
    const res = await apiRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
    showToast(res.message, 'success');
    closeResetPasswordModal();
  } catch (err) {
    showToast(`Password reset failed: ${err.message}`, 'error');
  }
}

async function generateResetLinkOnly() {
  const email = document.getElementById('reset-user-email').value.trim();
  try {
    const res = await apiRequest('/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, generateTokenOnly: true }),
    });
    prompt('Password Reset URL generated successfully. Copy and share with user:', `${window.location.origin}${res.resetUrl}`);
    showToast('Reset link generated.', 'success');
    closeResetPasswordModal();
  } catch (err) {
    showToast(`Failed to generate link: ${err.message}`, 'error');
  }
}

async function revokeUserAccess(email) {
  if (!confirm(`Are you sure you want to revoke access for ${email}?`)) return;
  try {
    const res = await apiRequest('/users/revoke-access', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    showToast(res.message, 'success');
    loadUsers();
  } catch (err) {
    showToast(`Revocation failed: ${err.message}`, 'error');
  }
}

async function toggleUserRole(email, newRole) {
  if (!confirm(`Change role for ${email} to ${newRole.toUpperCase()}?`)) return;
  try {
    const res = await apiRequest('/users/set-role', {
      method: 'POST',
      body: JSON.stringify({ email, role: newRole }),
    });
    showToast(res.message, 'success');
    loadUsers();
  } catch (err) {
    showToast(`Role change failed: ${err.message}`, 'error');
  }
}

// ==========================================
// TAB: PRACTICE SHEETS & ROLES CURRICULUM
// ==========================================
let currentPracticeSheets = [];

async function loadPracticeSheets() {
  const tbody = document.getElementById('practice-tbody');
  const search = document.getElementById('practice-search')?.value.trim().toLowerCase() || '';
  const roleFilter = document.getElementById('practice-role-filter')?.value || 'all';

  tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading practice curriculum sheets...</td></tr>`;

  try {
    const res = await apiRequest('/practice/sheets');
    currentPracticeSheets = res.sheets || [];

    let filtered = currentPracticeSheets;
    if (roleFilter !== 'all') {
      filtered = filtered.filter((s) => s.roleType === roleFilter);
    }
    if (search) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(search) ||
        s.sheetId.toLowerCase().includes(search) ||
        (s.targetRole && s.targetRole.toLowerCase().includes(search)) ||
        (s.targetCompanies && s.targetCompanies.some((c) => c.toLowerCase().includes(search)))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No practice sheets found matching filters.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((s) => {
      const isFree = s.price === 0 || s.isFree;
      const isNonTech = s.roleType === 'non-tech';
      const topicsCount = (s.topics || []).length;
      const problemsCount = (s.topics || []).reduce((acc, t) => acc + (t.problems ? t.problems.length : 0), 0);

      const companyBadges = (s.targetCompanies || []).map((c) => `
        <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); border: 1px solid var(--border-subtle); font-size: 0.72rem; margin-right: 2px;">${escapeHtml(c)}</span>
      `).join('');

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
              <button class="btn btn-secondary btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick='openEditSheetPriceModal(${JSON.stringify(s).replace(/'/g, "&#39;")})'>
                💵 Price
              </button>
              <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deletePracticeSheet('${escapeHtml(s.sheetId)}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #f87171">Failed to load practice sheets: ${err.message}</td></tr>`;
  }
}

function debouncePracticeSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadPracticeSheets, 300);
}

// -------------------------------------------------------------
// Sheet Price & Status Quick Editor
// -------------------------------------------------------------
function openEditSheetPriceModal(sheet) {
  document.getElementById('edit-sheet-id').value = sheet.sheetId;
  document.getElementById('edit-sheet-title').value = sheet.title;
  document.getElementById('edit-sheet-target-role').value = sheet.targetRole || '';
  document.getElementById('edit-sheet-price').value = sheet.price !== undefined ? sheet.price : 0;
  document.getElementById('edit-sheet-is-template').checked = Boolean(sheet.isTemplate);
  document.getElementById('modal-edit-sheet-price').classList.remove('hidden');
}

function closeEditSheetPriceModal() {
  document.getElementById('modal-edit-sheet-price').classList.add('hidden');
}

async function submitPracticeSheetPrice(e) {
  e.preventDefault();
  const sheetId = document.getElementById('edit-sheet-id').value;
  const title = document.getElementById('edit-sheet-title').value.trim();
  const targetRole = document.getElementById('edit-sheet-target-role').value.trim();
  const price = parseFloat(document.getElementById('edit-sheet-price').value) || 0;
  const isTemplate = document.getElementById('edit-sheet-is-template').checked;

  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}/price`, {
      method: 'PUT',
      body: JSON.stringify({ price, title, targetRole, isTemplate }),
    });
    showToast(res.message, 'success');
    closeEditSheetPriceModal();
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to update sheet: ${err.message}`, 'error');
  }
}

// -------------------------------------------------------------
// Practice Sheet Creation & Comprehensive Metadata Editor
// -------------------------------------------------------------
function openAddPracticeSheetModal() {
  const form = document.getElementById('form-create-practice-sheet');
  if (form) form.reset();
  const idInput = document.getElementById('new-sheet-id');
  if (idInput) {
    idInput.readOnly = false;
    idInput.disabled = false;
  }
  document.getElementById('modal-sheet-title-text').textContent = 'Create Practice Sheet';
  document.getElementById('modal-add-sheet').classList.remove('hidden');
}

function openEditPracticeSheetModal(sheetId) {
  const sheet = (currentPracticeSheets || []).find((s) => s.sheetId === sheetId);
  if (!sheet) {
    showToast('Practice sheet not found.', 'error');
    return;
  }

  document.getElementById('modal-sheet-title-text').textContent = `Edit Sheet: ${sheet.title}`;
  const idInput = document.getElementById('new-sheet-id');
  idInput.value = sheet.sheetId;
  idInput.readOnly = true;

  document.getElementById('new-sheet-role-type').value = sheet.roleType || 'non-tech';
  document.getElementById('new-sheet-title').value = sheet.title || '';
  document.getElementById('new-sheet-target-role').value = sheet.targetRole || '';
  document.getElementById('new-sheet-difficulty').value = sheet.difficultyLevel || 'All Levels';
  document.getElementById('new-sheet-price').value = sheet.price !== undefined ? sheet.price : 0;
  document.getElementById('new-sheet-badge').value = sheet.badge || '';
  document.getElementById('new-sheet-companies').value = (sheet.targetCompanies || []).join(', ');
  document.getElementById('new-sheet-desc').value = sheet.description || '';
  document.getElementById('new-sheet-is-template').checked = Boolean(sheet.isTemplate);

  document.getElementById('modal-add-sheet').classList.remove('hidden');
}

function closeAddPracticeSheetModal() {
  document.getElementById('modal-add-sheet').classList.add('hidden');
}

async function submitCreatePracticeSheet(e) {
  e.preventDefault();
  const sheetId = document.getElementById('new-sheet-id').value.trim().toLowerCase();
  const title = document.getElementById('new-sheet-title').value.trim();
  const roleType = document.getElementById('new-sheet-role-type').value;
  const targetRole = document.getElementById('new-sheet-target-role').value.trim();
  const difficultyLevel = document.getElementById('new-sheet-difficulty').value;
  const price = parseFloat(document.getElementById('new-sheet-price').value) || 0;
  const badge = document.getElementById('new-sheet-badge').value.trim();
  const companiesRaw = document.getElementById('new-sheet-companies').value;
  const targetCompanies = companiesRaw.split(',').map((c) => c.trim()).filter(Boolean);
  const description = document.getElementById('new-sheet-desc').value.trim();
  const isTemplate = document.getElementById('new-sheet-is-template').checked;

  try {
    const res = await apiRequest('/practice/sheets', {
      method: 'POST',
      body: JSON.stringify({
        sheetId,
        title,
        roleType,
        targetRole,
        difficultyLevel,
        price,
        badge,
        targetCompanies,
        description,
        isTemplate,
      }),
    });
    showToast(res.message, 'success');
    closeAddPracticeSheetModal();
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to save practice sheet: ${err.message}`, 'error');
  }
}

async function deletePracticeSheet(sheetId) {
  if (!confirm(`Are you sure you want to delete practice sheet "${sheetId}" and all its curriculum problems?`)) return;
  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}`, {
      method: 'DELETE',
    });
    showToast(res.message, 'success');
    loadPracticeSheets();
  } catch (err) {
    showToast(`Deletion failed: ${err.message}`, 'error');
  }
}

// -------------------------------------------------------------
// Interactive Curriculum & Problem Builder
// -------------------------------------------------------------
async function openCurriculumModal(sheetId) {
  let sheet = (currentPracticeSheets || []).find((s) => s.sheetId === sheetId);
  if (!sheet) {
    try {
      const res = await apiRequest('/practice/sheets');
      currentPracticeSheets = res.sheets || [];
      sheet = currentPracticeSheets.find((s) => s.sheetId === sheetId);
    } catch (err) {
      showToast(`Failed to load sheet details: ${err.message}`, 'error');
      return;
    }
  }

  if (!sheet) {
    showToast('Practice sheet not found.', 'error');
    return;
  }

  document.getElementById('curriculum-sheet-id').value = sheet.sheetId;
  document.getElementById('curriculum-sheet-title').textContent = `Curriculum Builder: ${sheet.title}`;
  document.getElementById('curriculum-sheet-subtitle').textContent = `${sheet.targetRole || 'Operations Specialist'} · Target: ${(sheet.targetCompanies || []).join(', ') || 'All Companies'}`;

  renderCurriculumView(sheet);
  document.getElementById('modal-sheet-curriculum').classList.remove('hidden');
}

function closeCurriculumModal() {
  document.getElementById('modal-sheet-curriculum').classList.add('hidden');
}

function renderCurriculumView(sheet) {
  const topics = sheet.topics || [];
  const totalProblems = topics.reduce((acc, t) => acc + (t.problems ? t.problems.length : 0), 0);

  // Update Pill Counter
  const statsPill = document.getElementById('curriculum-stats-pill');
  if (statsPill) {
    statsPill.textContent = `${topics.length} Topics · ${totalProblems} Problems`;
  }

  // Populate Select Topic Dropdown in Problem Form
  const topicSelect = document.getElementById('prob-target-topic');
  if (topicSelect) {
    if (topics.length === 0) {
      topicSelect.innerHTML = `<option value="">-- Create a topic first using the form below --</option>`;
      topicSelect.disabled = true;
    } else {
      topicSelect.disabled = false;
      topicSelect.innerHTML = `
        <option value="">-- Choose a Topic --</option>
        ${topics.map((t) => `<option value="${escapeHtml(t.topicId)}">${escapeHtml(t.topicTitle)} (${(t.problems || []).length} scenarios)</option>`).join('')}
      `;
    }
  }

  // Populate Topics and Problems Accordion/Container
  const container = document.getElementById('curriculum-topics-container');
  if (!container) return;

  if (topics.length === 0) {
    container.innerHTML = `
      <div class="admin-subcard-dashed" style="padding: 28px; text-align: center;">
        <p style="margin: 0; color: var(--text-muted); font-size: 0.95rem;">
          No curriculum topics created yet. Use the <strong>"+ Add New Topic to Sheet"</strong> section below to create your first learning module.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = topics.map((t, idx) => {
    const problems = t.problems || [];
    return `
      <div class="topic-box" id="topic-box-${escapeHtml(t.topicId)}">
        <div class="topic-box-header">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="badge badge-info" style="font-size: 11px;">Topic ${idx + 1}</span>
              <h4 style="margin: 0; display: inline-block;">${escapeHtml(t.topicTitle)}</h4>
              <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; border: 1px solid var(--border-subtle);">
                ${problems.length} Scenarios
              </span>
            </div>
            ${t.summary ? `<div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">${escapeHtml(t.summary)}</div>` : ''}
          </div>
          <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deleteTopic('${escapeHtml(sheet.sheetId)}', '${escapeHtml(t.topicId)}')">
            🗑️ Delete Topic
          </button>
        </div>
        <div class="topic-box-body">
          ${
            problems.length > 0
              ? problems.map((p, pIdx) => `
                <div class="curriculum-problem-item">
                  <div style="flex: 1;">
                    <div class="curriculum-problem-info">
                      <strong style="color: var(--text-main); font-size: 13.5px;">${pIdx + 1}. ${escapeHtml(p.title)}</strong>
                      <span class="badge badge-info" style="font-size: 11px; font-weight: 600;">${escapeHtml(p.company || 'Zomato')}</span>
                      <span class="diff-badge ${(p.difficulty || 'Medium').toLowerCase()}">${escapeHtml(p.difficulty || 'Medium')}</span>
                      <span class="badge" style="background: var(--bg-subtle); color: var(--text-muted); font-size: 11px; border: 1px solid var(--border-subtle);">${escapeHtml(p.type || 'Operational Scenario')}</span>
                      <span class="badge badge-success" style="font-size: 11px;">Acc: ${escapeHtml(p.acceptanceRate || '88%')}</span>
                    </div>

                    <div class="curriculum-scenario-box">
                      <strong>Scenario:</strong> ${escapeHtml(p.scenario)}
                    </div>

                    ${
                      p.solutionGuidance
                        ? `<div class="curriculum-guidance-box">
                            <strong>💡 Solution Guidance:</strong> ${escapeHtml(p.solutionGuidance)}
                          </div>`
                        : ''
                    }

                    <div style="display: flex; gap: 12px; margin-top: 6px; font-size: 11.5px; flex-wrap: wrap;">
                      ${p.keyTakeaway ? `<span style="color: var(--emerald-text);"><strong>🎯 Takeaway:</strong> ${escapeHtml(p.keyTakeaway)}</span>` : ''}
                      ${p.resourceLink ? `<a href="${escapeHtml(p.resourceLink)}" target="_blank" rel="noopener noreferrer" style="color: var(--accent); text-decoration: underline;">🔗 Reference Link</a>` : ''}
                    </div>
                  </div>

                  <div style="margin-left: 12px;">
                    <button class="btn btn-outline-danger btn-xs" style="padding: 4px 8px; font-size: 11px;" onclick="deleteProblem('${escapeHtml(sheet.sheetId)}', '${escapeHtml(t.topicId)}', '${escapeHtml(p.id)}')">
                      🗑️
                    </button>
                  </div>
                </div>
              `).join('')
              : `<div style="font-size: 12px; color: var(--text-faint); font-style: italic; padding: 8px;">No problems added to this topic yet. Select this topic below to add problem scenarios.</div>`
          }
        </div>
      </div>
    `;
  }).join('');
}

async function submitAddTopic(e) {
  e.preventDefault();
  const sheetId = document.getElementById('curriculum-sheet-id').value;
  const topicTitle = document.getElementById('new-topic-title').value.trim();
  const summary = document.getElementById('new-topic-summary').value.trim();

  if (!topicTitle) {
    showToast('Topic title is required.', 'error');
    return;
  }

  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}/topics`, {
      method: 'POST',
      body: JSON.stringify({ topicTitle, summary }),
    });

    showToast(res.message, 'success');
    document.getElementById('form-add-topic').reset();

    // Update in-memory sheet
    if (res.sheet) {
      const idx = (currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
      if (idx >= 0) currentPracticeSheets[idx] = res.sheet;
      renderCurriculumView(res.sheet);
    }
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to add topic: ${err.message}`, 'error');
  }
}

async function deleteTopic(sheetId, topicId) {
  if (!confirm('Are you sure you want to delete this entire topic and all its problem scenarios?')) return;

  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}/topics/${topicId}`, {
      method: 'DELETE',
    });

    showToast(res.message, 'success');
    if (res.sheet) {
      const idx = (currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
      if (idx >= 0) currentPracticeSheets[idx] = res.sheet;
      renderCurriculumView(res.sheet);
    }
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to delete topic: ${err.message}`, 'error');
  }
}

async function submitAddProblem(e) {
  e.preventDefault();
  const sheetId = document.getElementById('curriculum-sheet-id').value;
  const topicId = document.getElementById('prob-target-topic').value;

  if (!topicId) {
    showToast('Please select a topic from the dropdown.', 'error');
    return;
  }

  const title = document.getElementById('prob-title').value.trim();
  const company = document.getElementById('prob-company').value.trim() || 'Zomato';
  const difficulty = document.getElementById('prob-difficulty').value;
  const type = document.getElementById('prob-type').value.trim() || 'Operational Scenario';
  const acceptanceRate = document.getElementById('prob-acceptance').value.trim() || '88%';
  const scenario = document.getElementById('prob-scenario').value.trim();
  const solutionGuidance = document.getElementById('prob-solution').value.trim();
  const keyTakeaway = document.getElementById('prob-takeaway').value.trim();
  const resourceLink = document.getElementById('prob-resource').value.trim();

  if (!title || !scenario) {
    showToast('Problem title and scenario statement are required.', 'error');
    return;
  }

  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}/topics/${topicId}/problems`, {
      method: 'POST',
      body: JSON.stringify({
        title,
        company,
        difficulty,
        type,
        acceptanceRate,
        scenario,
        solutionGuidance,
        keyTakeaway,
        resourceLink,
      }),
    });

    showToast(res.message, 'success');

    // Reset problem form fields except the selected topic for rapid sequential additions
    document.getElementById('prob-title').value = '';
    document.getElementById('prob-company').value = '';
    document.getElementById('prob-scenario').value = '';
    document.getElementById('prob-solution').value = '';
    document.getElementById('prob-takeaway').value = '';
    document.getElementById('prob-resource').value = '';

    // Update in-memory sheet
    if (res.sheet) {
      const idx = (currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
      if (idx >= 0) currentPracticeSheets[idx] = res.sheet;
      renderCurriculumView(res.sheet);
      // Keep selected topic preserved in the dropdown
      document.getElementById('prob-target-topic').value = topicId;
    }
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to add problem: ${err.message}`, 'error');
  }
}

async function deleteProblem(sheetId, topicId, problemId) {
  if (!confirm('Are you sure you want to delete this problem scenario?')) return;

  try {
    const res = await apiRequest(`/practice/sheets/${sheetId}/topics/${topicId}/problems/${problemId}`, {
      method: 'DELETE',
    });

    showToast(res.message, 'success');
    if (res.sheet) {
      const idx = (currentPracticeSheets || []).findIndex((s) => s.sheetId === sheetId);
      if (idx >= 0) currentPracticeSheets[idx] = res.sheet;
      renderCurriculumView(res.sheet);
    }
    loadPracticeSheets();
  } catch (err) {
    showToast(`Failed to delete problem: ${err.message}`, 'error');
  }
}

// ==========================================
// TAB 5: REFUNDS
// ==========================================
async function loadRefunds() {
  const tbody = document.getElementById('refunds-tbody');
  try {
    const res = await apiRequest('/refunds');
    const refunds = res.refunds || [];

    if (refunds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No refund logs recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = refunds.map((r) => `
      <tr>
        <td><span class="code-cell">${r._id}</span></td>
        <td><span class="code-cell">${r.orderId}</span></td>
        <td>${escapeHtml(r.userEmail)}</td>
        <td><strong style="color: #f87171">₹${r.amount}</strong></td>
        <td>${escapeHtml(r.reason)}</td>
        <td><span class="badge badge-info">${r.type}</span></td>
        <td><span class="badge badge-success">${r.status}</span></td>
        <td class="text-muted">${new Date(r.createdAt).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #f87171">Error: ${err.message}</td></tr>`;
  }
}

function openRefundModal(orderId = '', amount = '') {
  document.getElementById('refund-order-id').value = orderId;
  document.getElementById('refund-amount').value = amount;
  document.getElementById('modal-refund').classList.remove('hidden');
}
function closeRefundModal() {
  document.getElementById('modal-refund').classList.add('hidden');
}

function promptRefund(orderId, amount) {
  openRefundModal(orderId, amount);
}

async function submitRefund(e) {
  e.preventDefault();
  const orderId = document.getElementById('refund-order-id').value.trim();
  const amount = parseFloat(document.getElementById('refund-amount').value);
  const type = document.getElementById('refund-type').value;
  const reason = document.getElementById('refund-reason').value.trim();

  try {
    const res = await apiRequest('/refunds', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, type, reason }),
    });
    showToast(res.message, 'success');
    closeRefundModal();
    loadRefunds();
  } catch (err) {
    showToast(`Refund processing failed: ${err.message}`, 'error');
  }
}

// ==========================================
// TAB 6: AUDIT LOGS
// ==========================================
async function loadLogs() {
  const tbody = document.getElementById('logs-tbody');
  const search = document.getElementById('logs-search')?.value.trim() || '';
  const action = document.getElementById('logs-action-filter')?.value || 'all';

  tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading audit stream...</td></tr>`;

  try {
    const res = await apiRequest(`/logs?q=${encodeURIComponent(search)}&action=${action}`);
    const logs = res.logs || [];

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No log events recorded.</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map((l) => renderActivityRow(l)).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #f87171">Logs fetch error: ${err.message}</td></tr>`;
  }
}

function debounceLogsSearch() {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(loadLogs, 300);
}

// ==========================================
// UTILITIES: TOASTS & ESCAPING
// ==========================================
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : (type === 'error' ? '❌' : 'ℹ️')}</span>
    <span>${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
