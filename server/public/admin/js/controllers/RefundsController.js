/**
 * Refunds and Reversals Controller
 */

import { RefundModel } from '../models/RefundModel.js';
import { RefundsPageView } from '../views/pages/RefundsPageView.js';
import { showToast } from '../utils/formatters.js';

export class RefundsController {
  static async loadRefunds() {
    const tbody = document.getElementById('refunds-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Loading refunds...</td></tr>`;

    try {
      const refunds = await RefundModel.getRefunds();

      if (refunds.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No refund logs recorded.</td></tr>`;
        return;
      }

      tbody.innerHTML = refunds.map((r) => RefundsPageView.renderRefundRow(r)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="color: #f87171">Error: ${err.message}</td></tr>`;
    }
  }

  static openRefundModal(orderId = '', amount = '') {
    const orderInput = document.getElementById('refund-order-id');
    const amountInput = document.getElementById('refund-amount');
    if (orderInput) orderInput.value = orderId;
    if (amountInput) amountInput.value = amount;

    const modal = document.getElementById('modal-refund');
    if (modal) modal.classList.remove('hidden');
  }

  static closeRefundModal() {
    const modal = document.getElementById('modal-refund');
    if (modal) modal.classList.add('hidden');
  }

  static async submitRefund(e) {
    if (e && e.preventDefault) e.preventDefault();
    const orderId = document.getElementById('refund-order-id').value.trim();
    const amount = parseFloat(document.getElementById('refund-amount').value);
    const type = document.getElementById('refund-type').value;
    const reason = document.getElementById('refund-reason').value.trim();

    try {
      const res = await RefundModel.submitRefund({ orderId, amount, type, reason });
      showToast(res.message || 'Refund successfully processed.', 'success');
      this.closeRefundModal();
      this.loadRefunds();
    } catch (err) {
      showToast(`Refund processing failed: ${err.message}`, 'error');
    }
  }
}
