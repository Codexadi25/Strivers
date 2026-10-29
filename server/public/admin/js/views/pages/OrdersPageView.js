/**
 * Orders & Payments Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class OrdersPageView {
  static renderPane() {
    return `
      <section id="tab-orders" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>Orders & Payment Transactions</h2>
            <p class="text-muted">Live ledger of Razorpay orders, captured payments, permanent access grants, and receipts.</p>
          </div>
          <div class="search-filter-bar">
            <input type="text" id="order-search" class="input-control" placeholder="Search by email, order ID, payment ID, ref ID..." oninput="debounceOrdersSearch()">
            <select id="order-status-filter" class="select-control" onchange="loadOrders()">
              <option value="all">All Statuses</option>
              <option value="captured">Captured (Paid)</option>
              <option value="created">Created (Pending)</option>
              <option value="failed">Failed / Refunded</option>
            </select>
          </div>
        </div>

        <div class="card table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Order ID</th>
                <th>Txn ID (Payment)</th>
                <th>Ref ID (Receipt)</th>
                <th>Customer Email</th>
                <th>Course / Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Access Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="orders-tbody">
              <tr><td colspan="10" class="text-center">Loading transactions...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  static renderOrderRow(o) {
    const statusClass = o.status === 'captured' ? 'badge-success' : (o.status === 'created' ? 'badge-warning' : 'badge-danger');

    return `
      <tr>
        <td class="text-muted">${new Date(o.createdAt).toLocaleString('en-IN')}</td>
        <td><span class="code-cell">${escapeHtml(o.razorpayOrderId)}</span></td>
        <td><span class="code-cell" style="color: #60a5fa">${escapeHtml(o.razorpayPaymentId || 'N/A')}</span></td>
        <td><span class="code-cell" style="color: #a78bfa">${escapeHtml(o.receipt || 'N/A')}</span></td>
        <td><strong>${escapeHtml(o.userEmail)}</strong></td>
        <td><span class="badge badge-info">${escapeHtml(o.planId)}</span></td>
        <td><strong style="color: #34d399">₹${o.amount}</strong></td>
        <td><span class="badge ${statusClass}">${escapeHtml(o.status)}</span></td>
        <td><span class="badge badge-success">Permanent Access ✓</span></td>
        <td>
          ${o.status === 'captured' ? `
            <button class="btn btn-outline-danger btn-sm" onclick="promptRefund('${o.razorpayOrderId}', ${o.amount})">Refund</button>
          ` : '<span class="text-muted">—</span>'}
        </td>
      </tr>
    `;
  }
}
