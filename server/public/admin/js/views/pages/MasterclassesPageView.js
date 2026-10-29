/**
 * Masterclasses, Live Sessions & Study Material Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class MasterclassesPageView {
  static renderPane() {
    return `
      <section id="tab-masterclasses" class="tab-pane">
        <div class="pane-header">
          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <h2 style="margin: 0;">Masterclasses, Live Sessions & Study Material</h2>
              <span class="badge badge-info" style="font-size: 0.72rem; padding: 3px 8px; font-weight: 700;">SCHEMA: category='masterclass'</span>
            </div>
            <p class="text-muted">Live interactive masterclasses, Google Meet links, industry mentors, and MongoDB DRM study materials. (Self-paced courses are managed separately under Pricing & Products).</p>
          </div>
          <button class="btn btn-primary" onclick="openCreateMasterclassModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>+ Create Masterclass</span>
          </button>
        </div>

        <div class="card" style="margin-bottom: 24px; padding: 18px 24px; background: #0E1B3D; color: #FFF; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                <span style="font-size: 1.2rem;">🔒</span>
                <strong style="color: #38BDF8; font-size: 1.05rem;">DRM & Anti-Download Protection Enforced:</strong>
              </div>
              <p style="margin: 0; color: #94A3B8; font-size: 0.88rem; max-width: 800px; line-height: 1.5;">
                Study materials (PDFs, notes, cheatsheets) are saved directly in MongoDB as Base64 documents. Students access them exclusively inside our custom In-App Canvas Reader with real-time student watermarks. <strong>Direct file downloads, browser printing, and text copying are permanently blocked.</strong>
              </p>
            </div>
            <span class="chip-status success" style="font-size: 0.8rem; padding: 6px 14px; font-weight: 700;">
              🛡️ DRM Active
            </span>
          </div>
        </div>

        <div class="pricing-grid" id="masterclasses-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading masterclasses & live sessions...</p>
          </div>
        </div>
      </section>
    `;
  }

  static renderMasterclassCard(m) {
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
            <span class="product-badge-pill" style="background: rgba(37, 99, 235, 0.2); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.4); font-weight: 700;">
              🔴 MASTERCLASS (schema: ${escapeHtml(m.category || 'masterclass')})
            </span>
            <span class="product-slug">ID: ${escapeHtml(m.productId)}</span>
          </div>

          <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-top: 6px;">
            <h3 class="product-title" style="margin: 0;">${escapeHtml(m.title)}</h3>
            ${statusLabels[status] || statusLabels.upcoming}
          </div>

          <p class="product-desc" style="margin-top: 6px;">${escapeHtml(m.description || 'No blurb provided.')}</p>

          <div style="margin: 8px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px;">
            <span style="font-size: 0.82rem; color: #94a3b8;">📅 Schedule: <strong style="color: #f1f5f9;">${escapeHtml(m.sessionDate || 'Sunday, 11:00 AM IST')}</strong></span>
            <span class="badge badge-info" style="font-size: 0.74rem;">🔑 DRM Passcode: <code>${escapeHtml(m.secretPasscode || 'STRIVERS2026')}</code></span>
          </div>

          <!-- Mentors List Preview -->
          <div style="margin: 10px 0 14px;">
            <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: #94a3b8; margin-bottom: 6px; font-weight: 700;">
              👨‍🏫 Live Instructors & Mentors:
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              ${(m.mentors && m.mentors.length > 0
                ? m.mentors
                : [
                    { name: 'Alex Morgan', role: 'Ex-Google · Blinkit' },
                    { name: 'Priya Sharma', role: 'Staff Eng @ Zomato' },
                    { name: 'Rahul Verma', role: 'Eng Lead @ Porter' },
                  ]
              ).map((mt) => `
                <span style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); padding: 4px 9px; border-radius: 99px; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 5px;">
                  <span style="color: #38bdf8;">👤</span>
                  <strong style="color: #f8fafc;">${escapeHtml(mt.name)}</strong>
                  <span style="color: #94a3b8; font-size: 0.7rem;">(${escapeHtml(mt.role)})</span>
                </span>
              `).join('')}
            </div>
          </div>

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
}
