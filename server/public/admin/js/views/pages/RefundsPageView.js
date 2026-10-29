/**
 * Refunds and Reversals Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class RefundsPageView {
  static renderPane() {
    return `
      <section id="tab-refunds" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>Refunds & Reversals Console</h2>
            <p class="text-muted">Process full/partial refunds for Razorpay orders and track refund history.</p>
          </div>
          <button class="btn btn-danger" onclick="openRefundModal()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <polyline points="1 4 1 10 7 10"></polyline>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
            </svg>
            <span>Issue Direct Refund</span>
          </button>
        </div>

        <div class="card table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Refund ID</th>
                <th>Order ID</th>
                <th>Customer Email</th>
                <th>Amount Refunded</th>
                <th>Reason</th>
                <th>Method</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody id="refunds-tbody">
              <tr><td colspan="8" class="text-center">No refund requests recorded.</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  static renderRefundRow(r) {
    return `
      <tr>
        <td><span class="code-cell">${escapeHtml(r._id)}</span></td>
        <td><span class="code-cell">${escapeHtml(r.orderId)}</span></td>
        <td>${escapeHtml(r.userEmail)}</td>
        <td><strong style="color: #f87171">₹${r.amount}</strong></td>
        <td>${escapeHtml(r.reason || 'Requested by customer')}</td>
        <td><span class="badge badge-info">${escapeHtml(r.type || 'direct')}</span></td>
        <td><span class="badge badge-success">${escapeHtml(r.status || 'processed')}</span></td>
        <td class="text-muted">${new Date(r.createdAt).toLocaleString('en-IN')}</td>
      </tr>
    `;
  }
}
