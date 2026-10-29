/**
 * Pricing & Products Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class PricingPageView {
  static renderPane() {
    return `
      <section id="tab-pricing" class="tab-pane active">
        <div class="pane-header">
          <div>
            <h2>Product Pricing & Plans Engine</h2>
            <p class="text-muted">Directly modify course & subscription prices in MongoDB. Changes immediately reflect in checkout, APIs, and client storefront.</p>
          </div>
          <button class="btn btn-primary" onclick="openAddProductModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Add New Product Plan</span>
          </button>
        </div>

        <div class="pricing-grid" id="pricing-cards-container">
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading live product catalog...</p>
          </div>
        </div>

        <div class="pricing-audit-box card">
          <div class="card-header">
            <h3>Pricing Audit & Impact Notice</h3>
          </div>
          <div class="card-body">
            <div class="info-callout">
              <div class="callout-icon">💡</div>
              <div class="callout-text">
                <strong>Real-Time Server-Side Protection:</strong> When you change a price here, the server updates the <code>Product</code> collection. During user checkout, the backend calculates the exact price from MongoDB, preventing any client-side tampering while instantly updating what users pay.
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  static renderProductCard(p) {
    const isInactive = !p.isActive;
    const originalPriceFormatted = p.originalPrice ? `₹${p.originalPrice}` : '';
    const discount = p.originalPrice && p.originalPrice > p.price
      ? Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)
      : null;

    return `
      <div class="product-card ${isInactive ? 'inactive' : ''}" id="product-card-${p.productId}">
        <div class="product-top">
          <span class="product-badge-pill">${escapeHtml(p.badge || 'Standard Tier')}</span>
          <span class="product-slug">ID: ${escapeHtml(p.productId)}</span>
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
}
