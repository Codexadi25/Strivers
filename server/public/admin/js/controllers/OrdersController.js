/**
 * Orders & Payments Controller
 * Includes Transaction Details Popup (Exact Match) and Real-time Status/Issue Plots
 */

import { OrderModel } from '../models/OrderModel.js';
import { OrdersPageView } from '../views/pages/OrdersPageView.js';
import { RefundsController } from './RefundsController.js';
import { escapeHtml } from '../utils/formatters.js';

let ordersDebounceTimer = null;

export class OrdersController {
  static async loadOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    const search = document.getElementById('order-search')?.value.trim() || '';
    const status = document.getElementById('order-status-filter')?.value || 'all';

    tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading transactions...</td></tr>`;

    // Concurrently load table & analytics plots
    this.loadAnalytics();

    try {
      const orders = await OrderModel.getOrders(search, status);

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No orders found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = orders.map((o) => OrdersPageView.renderOrderRow(o)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="color: #f87171">Failed to load orders: ${err.message}</td></tr>`;
    }
  }

  static async loadAnalytics() {
    try {
      const analytics = await OrderModel.getTransactionAnalytics();
      if (!analytics) return;

      const total = analytics.totalAttempts || 0;
      const counts = analytics.statusCounts || {};
      const issues = analytics.issueTypeCounts || {};

      // 1. Total & Rates
      const totalBadge = document.getElementById('plot-total-attempts');
      if (totalBadge) totalBadge.textContent = `${total} Total Attempts`;

      const failureBadge = document.getElementById('plot-failure-rate-badge');
      if (failureBadge) failureBadge.textContent = `${analytics.failureRate || 0}% Failure Rate`;

      // 2. Plot Status Bars & Percentages
      const canceledCount = (counts.canceled !== undefined ? counts.canceled : 0) + (counts.created !== undefined ? counts.created : 0);
      const capPct = total > 0 ? ((counts.captured || 0) / total) * 100 : 0;
      const failPct = total > 0 ? ((counts.failed || 0) / total) * 100 : 0;
      const createPct = total > 0 ? (canceledCount / total) * 100 : 0;
      const refPct = total > 0 ? ((counts.refunded || 0) / total) * 100 : 0;

      const elCapVal = document.getElementById('stat-captured-val');
      const elCapBar = document.getElementById('stat-captured-bar');
      if (elCapVal) elCapVal.textContent = `${counts.captured || 0} (${capPct.toFixed(1)}%)`;
      if (elCapBar) elCapBar.style.width = `${Math.max(capPct > 0 ? 4 : 0, capPct)}%`;

      const elFailVal = document.getElementById('stat-failed-val');
      const elFailBar = document.getElementById('stat-failed-bar');
      if (elFailVal) elFailVal.textContent = `${counts.failed || 0} (${failPct.toFixed(1)}%)`;
      if (elFailBar) elFailBar.style.width = `${Math.max(failPct > 0 ? 4 : 0, failPct)}%`;

      const elCreateVal = document.getElementById('stat-created-val');
      const elCreateBar = document.getElementById('stat-created-bar');
      if (elCreateVal) elCreateVal.textContent = `${canceledCount} (${createPct.toFixed(1)}%)`;
      if (elCreateBar) elCreateBar.style.width = `${Math.max(createPct > 0 ? 4 : 0, createPct)}%`;

      const elRefVal = document.getElementById('stat-refunded-val');
      const elRefBar = document.getElementById('stat-refunded-bar');
      if (elRefVal) elRefVal.textContent = `${counts.refunded || 0} (${refPct.toFixed(1)}%)`;
      if (elRefBar) elRefBar.style.width = `${Math.max(refPct > 0 ? 4 : 0, refPct)}%`;

      // 3. Plot PG Failure Issue Types
      const totalFail = counts.failed || 1;
      const riskCount = issues.payment_risk_check_failed || 0;
      const bankCount = issues.bank_server_timeout || 0;
      const cancelCount = issues.user_cancelled || 0;

      const elRiskVal = document.getElementById('issue-domain-val');
      const elRiskBar = document.getElementById('issue-domain-bar');
      if (elRiskVal) elRiskVal.textContent = `${riskCount} instances`;
      if (elRiskBar) elRiskBar.style.width = `${Math.min(100, (riskCount / totalFail) * 100)}%`;

      const elBankVal = document.getElementById('issue-bank-val');
      const elBankBar = document.getElementById('issue-bank-bar');
      if (elBankVal) elBankVal.textContent = `${bankCount} instances`;
      if (elBankBar) elBankBar.style.width = `${Math.min(100, (bankCount / totalFail) * 100)}%`;

      const elCancelVal = document.getElementById('issue-cancel-val');
      const elCancelBar = document.getElementById('issue-cancel-bar');
      if (elCancelVal) elCancelVal.textContent = `${cancelCount} instances`;
      if (elCancelBar) elCancelBar.style.width = `${Math.min(100, (cancelCount / totalFail) * 100)}%`;
    } catch (e) {
      console.warn('Analytics plot warning:', e.message);
    }
  }

  static debounceOrdersSearch() {
    clearTimeout(ordersDebounceTimer);
    ordersDebounceTimer = setTimeout(() => this.loadOrders(), 300);
  }

  static promptRefund(orderId, amount) {
    RefundsController.openRefundModal(orderId, amount);
  }

  /**
   * OPENS THE TRANSACTION DETAILS POPUP MODAL (Exact match to Razorpay/Merchant standard)
   */
  static async openTransactionDetailsModal(orderId) {
    const modal = document.getElementById('modal-transaction-details');
    if (!modal) return;

    modal.classList.remove('hidden');

    const tableBody = document.getElementById('txn-modal-table-body');
    const refundNotice = document.getElementById('txn-modal-refund-notice');
    const refundBody = document.getElementById('txn-modal-refund-body');

    if (tableBody) {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #6b7280;">Loading order ${escapeHtml(orderId)} details...</td></tr>`;
    }

    try {
      const order = await OrderModel.getOrderDetails(orderId);
      if (!order) {
        if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">Order details not found.</td></tr>`;
        return;
      }

      // 1. Table 1: Transaction Information (Supports split transactions as in screenshots)
      const txns =
        order.transactions && order.transactions.length > 0
          ? order.transactions
          : [
              {
                amount: order.formattedAmount || `₹${order.totalPaidAmount}`,
                timestamp: order.timestamp,
                status: order.status,
                statusLabel: order.statusLabel || (order.status === 'failed' ? 'Failed' : 'Success'),
                txnRefId: order.txnRefId || order.paymentTxnId || order.paymentOrderId,
                paymentMode: order.paymentModes || 'BANK',
                remark: order.remark || '-',
              },
            ];

      if (tableBody) {
        tableBody.innerHTML = txns
          .map((t) => {
            let sClass = 'success';
            const st = (t.status || '').toLowerCase();
            const lbl = (t.statusLabel || '').toLowerCase();
            if (st === 'failed' || lbl === 'failed') sClass = 'failed';
            else if (st === 'created' || st === 'pending' || lbl === 'pending') sClass = 'pending';
            else if (st === 'refunded' || lbl === 'refunded') sClass = 'refunded';

            return `
              <tr>
                <td>
                  <span class="txn-amount-val">${escapeHtml(t.amount || `₹${t.totalPaidAmount || order.totalPaidAmount}`)}</span>
                  <span class="txn-date-sub">${escapeHtml(t.timestamp || order.timestamp)}</span>
                </td>
                <td>
                  <span class="txn-pill ${sClass}">${escapeHtml(t.statusLabel || (sClass === 'failed' ? 'Failed' : 'Success'))}</span>
                </td>
                <td>
                  <span class="txn-ref-code">${escapeHtml(String(t.txnRefId !== undefined ? t.txnRefId : (order.txnRefId || '-')))}</span>
                </td>
                <td>
                  <span style="font-weight: 500;">${escapeHtml(t.paymentMode || t.paymentModes || 'BANK')}</span>
                </td>
                <td>
                  <span style="color: ${sClass === 'failed' ? '#dc2626' : '#6b7280'}; font-weight: ${sClass === 'failed' ? '600' : '400'};">
                    ${escapeHtml(t.remark || '-')}
                  </span>
                </td>
              </tr>
            `;
          })
          .join('');
      }

      // 2. Middle Notice Banner
      if (refundNotice) {
        refundNotice.textContent = order.refundNotice || 'There are no refunds against this order';
      }

      // 3. Table 2: Refund Details
      if (refundBody) {
        if (order.refunds && order.refunds.length > 0) {
          refundBody.innerHTML = order.refunds
            .map(
              (r) => `
              <tr>
                <td><strong>${escapeHtml(r.refundedItem)}</strong></td>
                <td><span class="txn-ref-code">${escapeHtml(r.itemId)}</span></td>
                <td>${escapeHtml(String(r.quantity))}</td>
                <td><span class="badge badge-info">${escapeHtml(r.refundedBy)}</span></td>
              </tr>
            `
            )
            .join('');
        } else {
          refundBody.innerHTML = `
            <tr>
              <td colspan="4" style="text-align: left; color: #1f2937; padding: 16px 18px;">No data available.</td>
            </tr>
          `;
        }
      }
    } catch (err) {
      if (tableBody) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #ef4444; padding: 20px;">Failed to load transaction details: ${err.message}</td></tr>`;
      }
    }
  }

  static closeTransactionDetailsModal() {
    const modal = document.getElementById('modal-transaction-details');
    if (modal) modal.classList.add('hidden');
  }
}
