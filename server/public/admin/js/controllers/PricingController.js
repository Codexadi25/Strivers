/**
 * Pricing & Product Catalog Controller
 */

import { ProductModel } from '../models/ProductModel.js';
import { PricingPageView } from '../views/pages/PricingPageView.js';
import { showToast } from '../utils/formatters.js';

export class PricingController {
  static currentProducts = [];

  static async loadProducts() {
    const container = document.getElementById('pricing-cards-container');
    if (!container) return;

    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading live product catalog...</p>
      </div>
    `;

    try {
      this.currentProducts = await ProductModel.getAll();

      if (this.currentProducts.length === 0) {
        container.innerHTML = `
          <div class="loading-state">
            <p>No products configured yet.</p>
            <button class="btn btn-primary btn-sm mt-4" onclick="openAddProductModal()">+ Add First Product</button>
          </div>
        `;
        return;
      }

      container.innerHTML = this.currentProducts.map((p) => PricingPageView.renderProductCard(p)).join('');
    } catch (err) {
      container.innerHTML = `
        <div class="loading-state text-center">
          <p style="color: #f87171">Failed to load product catalog: ${err.message}</p>
          <button class="btn btn-secondary btn-sm mt-4" onclick="loadProducts()">Try Again</button>
        </div>
      `;
    }
  }

  static openEditPriceModal(productId) {
    const product = this.currentProducts.find((p) => p.productId === productId);
    if (!product) return;

    document.getElementById('edit-product-id').value = product.productId;
    document.getElementById('edit-title').value = product.title || '';
    document.getElementById('edit-price').value = product.price;
    document.getElementById('edit-paise-calc').textContent = product.priceInPaise;
    document.getElementById('edit-original-price').value = product.originalPrice || '';
    document.getElementById('edit-badge').value = product.badge || '';
    document.getElementById('edit-description').value = product.description || '';
    document.getElementById('edit-is-active').checked = product.isActive !== false;

    // Real-time paise calculator input listener
    const priceInput = document.getElementById('edit-price');
    priceInput.oninput = () => {
      const p = parseFloat(priceInput.value) || 0;
      document.getElementById('edit-paise-calc').textContent = Math.round(p * 100);
    };

    document.getElementById('modal-edit-price').classList.remove('hidden');
  }

  static closeEditPriceModal() {
    const modal = document.getElementById('modal-edit-price');
    if (modal) modal.classList.add('hidden');
  }

  static async submitPriceUpdate(e) {
    if (e && e.preventDefault) e.preventDefault();
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

    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.querySelector('span').textContent = 'Updating Price in DB...';
    }

    try {
      const res = await ProductModel.updatePrice(productId, {
        title,
        price,
        originalPrice,
        badge,
        description,
        isActive,
      });

      showToast(res.message || `Price updated to ₹${price}!`, 'success');
      this.closeEditPriceModal();
      this.loadProducts();
    } catch (err) {
      showToast(`Price update failed: ${err.message}`, 'error');
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.querySelector('span').textContent = 'Apply Price Change';
      }
    }
  }

  static openAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    if (modal) modal.classList.remove('hidden');
  }

  static closeAddProductModal() {
    const modal = document.getElementById('modal-add-product');
    if (modal) modal.classList.add('hidden');
  }

  static async submitCreateProduct(e) {
    if (e && e.preventDefault) e.preventDefault();
    const productId = document.getElementById('new-product-id').value.trim().toLowerCase();
    const title = document.getElementById('new-title').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const originalPrice = document.getElementById('new-original-price').value ? parseFloat(document.getElementById('new-original-price').value) : null;
    const badge = document.getElementById('new-badge').value.trim();
    const description = document.getElementById('new-description').value.trim();

    try {
      await ProductModel.create({
        productId,
        title,
        price,
        originalPrice,
        badge,
        description,
        isActive: true,
      });

      showToast(`Product "${title}" created at ₹${price}.`, 'success');
      this.closeAddProductModal();
      this.loadProducts();
    } catch (err) {
      showToast(`Failed to create product: ${err.message}`, 'error');
    }
  }
}
