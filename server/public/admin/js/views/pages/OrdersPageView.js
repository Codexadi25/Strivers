/**
 * Orders & Payments Page View
 * With Live Transaction Status & PG Failure Issue Type Analytics Plots
 */

import { escapeHtml } from '../../utils/formatters.js';

export class OrdersPageView {
  static renderPane() {
    return `
      <section id="tab-orders" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>Orders & Payment Transactions</h2>
            <p class="text-muted">Live ledger of Razorpay transactions, PG risk failures, status analytics, and receipts.</p>
          </div>
          <div class="search-filter-bar">
            <input type="text" id="order-search" class="input-control" placeholder="Search by email, order ID, payment ID, ref ID..." oninput="debounceOrdersSearch()">
            <select id="order-status-filter" class="select-control" onchange="loadOrders()">
              <option value="all">All Statuses</option>
              <option value="captured">Captured (Success)</option>
              <option value="failed">PG Failure</option>
              <option value="canceled">Payment Canceled</option>
              <option value="refunded">Refunded to Source</option>
            </select>
          </div>
        </div>

        <!-- TRANSACTION STATUS & PG FAILURE ISSUE TYPE PLOTS -->
        <div class="analytics-plot-grid">
          <!-- Plot 1: Transaction Status Distribution -->
          <div class="plot-card">
            <div class="plot-card-header">
              <h3>📊 Transaction Status Distribution</h3>
              <span id="plot-total-attempts" class="badge badge-info">0 Total Attempts</span>
            </div>
            <div class="plot-bar-list" id="plot-status-list">
              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span><strong>Captured (Success)</strong></span>
                  <span id="stat-captured-val" style="color: #10b981; font-weight: 700;">0 (0%)</span>
                </div>
                <div class="plot-bar-track">
                  <div id="stat-captured-bar" class="plot-bar-fill success" style="width: 0%;"></div>
                </div>
              </div>

              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span><strong>Failed (PG / Risk Failure)</strong></span>
                  <span id="stat-failed-val" style="color: #ef4444; font-weight: 700;">0 (0%)</span>
                </div>
                <div class="plot-bar-track">
                  <div id="stat-failed-bar" class="plot-bar-fill failed" style="width: 0%;"></div>
                </div>
              </div>

              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span><strong>Payment Canceled</strong></span>
                  <span id="stat-created-val" style="color: #f59e0b; font-weight: 700;">0 (0%)</span>
                </div>
                <div class="plot-bar-track">
                  <div id="stat-created-bar" class="plot-bar-fill cancel" style="width: 0%;"></div>
                </div>
              </div>

              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span><strong>Refunded to Source</strong></span>
                  <span id="stat-refunded-val" style="color: #8b5cf6; font-weight: 700;">0 (0%)</span>
                </div>
                <div class="plot-bar-track">
                  <div id="stat-refunded-bar" class="plot-bar-fill refunded" style="width: 0%;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Plot 2: PG Failure Breakdown by Issue Type -->
          <div class="plot-card">
            <div class="plot-card-header">
              <h3>⚠️ PG Failure Breakdown by Issue Type</h3>
              <span id="plot-failure-rate-badge" class="badge badge-warning">0.0% Failure Rate</span>
            </div>
            <div class="plot-bar-list" id="plot-issue-list">
              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span>🛑 <strong>Domain / Risk Check (payment_risk_check_failed)</strong></span>
                  <span id="issue-domain-val" style="color: #f43f5e; font-weight: 700;">0</span>
                </div>
                <div class="plot-bar-track">
                  <div id="issue-domain-bar" class="plot-bar-fill risk" style="width: 0%;"></div>
                </div>
                <span class="help-text" style="font-size: 0.76rem; color: #94a3b8;">Website domain not registered in Razorpay Dashboard</span>
              </div>

              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span>🏦 <strong>Bank Network / Acquiring Timeout</strong></span>
                  <span id="issue-bank-val" style="color: #06b6d4; font-weight: 700;">0</span>
                </div>
                <div class="plot-bar-track">
                  <div id="issue-bank-bar" class="plot-bar-fill bank" style="width: 0%;"></div>
                </div>
              </div>

              <div class="plot-bar-item">
                <div class="plot-bar-header">
                  <span>👤 <strong>User Cancelled / Modal Dismissed</strong></span>
                  <span id="issue-cancel-val" style="color: #64748b; font-weight: 700;">0</span>
                </div>
                <div class="plot-bar-track">
                  <div id="issue-cancel-bar" class="plot-bar-fill cancel" style="width: 0%;"></div>
                </div>
              </div>
            </div>
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
                <th>Remark / Diagnostics</th>
                <th>Actions</th>
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
    let statusClass = 'badge-success';
    let statusLabel = 'Captured (Success)';

    if (o.status === 'failed') {
      statusClass = 'badge-danger';
      statusLabel = 'PG Failure';
    } else if (o.status === 'canceled' || o.status === 'created') {
      statusClass = 'badge-warning';
      statusLabel = 'Payment Canceled';
    } else if (o.status === 'refunded') {
      statusClass = 'badge-info';
      statusLabel = 'Refunded to Source';
    }

    const remarkText = o.failureReason
      ? `${escapeHtml(o.failureReason)}: ${escapeHtml(o.errorDescription || 'Risk check blocked')}`
      : (o.remark || '-');

    return `
      <tr>
        <td class="text-muted">${new Date(o.createdAt).toLocaleString('en-IN')}</td>
        <td>
          <a href="javascript:void(0)" onclick="openTransactionDetailsModal('${escapeHtml(o.razorpayOrderId)}')" style="font-weight: 600; text-decoration: underline; color: #2563EB;">
            ${escapeHtml(o.razorpayOrderId)}
          </a>
        </td>
        <td><span class="code-cell" style="color: #60a5fa">${escapeHtml(o.razorpayPaymentId || 'N/A')}</span></td>
        <td><span class="code-cell" style="color: #a78bfa">${escapeHtml(o.receipt || 'N/A')}</span></td>
        <td><strong>${escapeHtml(o.userEmail)}</strong></td>
        <td><span class="badge badge-info">${escapeHtml(o.planId)}</span></td>
        <td><strong style="color: #34d399">₹${o.amount}</strong></td>
        <td><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td style="max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(remarkText)}">
          <span style="font-size: 0.84rem; color: ${o.status === 'failed' ? '#ef4444' : 'var(--text-muted)'};">
            ${escapeHtml(remarkText)}
          </span>
        </td>
        <td>
          <div style="display: flex; gap: 6px; align-items: center;">
            <button class="btn btn-secondary btn-sm" onclick="openTransactionDetailsModal('${escapeHtml(o.razorpayOrderId)}')" title="View detailed transaction breakdown">
              🔍 Details
            </button>
            ${o.status === 'captured' ? `
              <button class="btn btn-outline-danger btn-sm" onclick="promptRefund('${o.razorpayOrderId}', ${o.amount})">Refund</button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }
}
