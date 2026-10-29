/**
 * System Telemetry & Metrics Page View
 */

import { escapeHtml, getActionBadgeClass } from '../../utils/formatters.js';

export class TelemetryPageView {
  static renderPane() {
    return `
      <section id="tab-telemetry" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>System Telemetry & Platform Overview</h2>
            <p class="text-muted">Real-time health, memory metrics, captured transactions, and system activity.</p>
          </div>
        </div>

        <!-- KPI Grid -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-icon emerald">₹</div>
            <div class="kpi-content">
              <span class="kpi-label">Total Revenue</span>
              <span class="kpi-value" id="kpi-revenue">₹0</span>
              <span class="kpi-sub green">Captured in production</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon blue">💳</div>
            <div class="kpi-content">
              <span class="kpi-label">Successful Transactions</span>
              <span class="kpi-value" id="kpi-transactions">0</span>
              <span class="kpi-sub">Verified payments</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon indigo">🎓</div>
            <div class="kpi-content">
              <span class="kpi-label">Active Subscribers</span>
              <span class="kpi-value" id="kpi-subscribers">0</span>
              <span class="kpi-sub">Active 30-day access</span>
            </div>
          </div>

          <div class="kpi-card">
            <div class="kpi-icon purple">🛡️</div>
            <div class="kpi-content">
              <span class="kpi-label">Audit Logs Recorded</span>
              <span class="kpi-value" id="kpi-logs">0</span>
              <span class="kpi-sub">Security & payment events</span>
            </div>
          </div>
        </div>

        <!-- Server Hardware & Environment Diagnostics -->
        <div class="grid-2col">
          <div class="card">
            <div class="card-header">
              <h3>Server Runtime Diagnostics</h3>
            </div>
            <div class="card-body">
              <div class="telemetry-list" id="telemetry-list">
                <!-- Dynamically loaded -->
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <h3>Gateway & Gateway Credentials</h3>
            </div>
            <div class="card-body">
              <div class="telemetry-list" id="gateway-list">
                <!-- Dynamically loaded -->
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity Feed -->
        <div class="card mt-4">
          <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
            <div>
              <h3 style="margin: 0;">Recent System Activities</h3>
              <p class="text-muted" style="margin: 2px 0 0; font-size: 0.82rem;">Live audit stream of payment verifications, session events, and curriculum actions.</p>
            </div>
            <div class="pagination-toolbar" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span class="text-muted" style="font-size: 0.82rem;">Per Page:</span>
              <select id="recent-activities-limit" class="select-control" style="width: auto; padding: 4px 10px; font-size: 0.82rem; height: 32px;" onchange="window.handleActivitiesLimitChange(this.value)">
                <option value="20" selected>20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span id="recent-activities-range" class="text-muted" style="font-size: 0.82rem; font-weight: 500;">Showing 1-20</span>
              <div class="btn-group" style="display: inline-flex; align-items: center; gap: 4px;">
                <button id="btn-recent-prev" class="btn btn-secondary btn-xs" style="padding: 4px 10px; height: 32px;" onclick="window.handleActivitiesPrevPage()" title="Previous Page">&lt;</button>
                <span id="recent-activities-page" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 600; min-width: 65px; text-align: center;">Page 1</span>
                <button id="btn-recent-next" class="btn btn-secondary btn-xs" style="padding: 4px 10px; height: 32px;" onclick="window.handleActivitiesNextPage()" title="Next Page">&gt;</button>
              </div>
            </div>
          </div>
          <div class="card-body table-responsive">
            <table class="data-table" id="recent-activities-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>User / Email</th>
                  <th>IP Address</th>
                  <th>Time</th>
                  <th>Metadata</th>
                </tr>
              </thead>
              <tbody id="recent-activities-tbody">
                <tr><td colspan="5" class="text-center">Loading activity stream...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    `;
  }

  static renderActivityRow(act) {
    const badgeClass = getActionBadgeClass(act.action);
    const time = new Date(act.createdAt).toLocaleString('en-IN');
    const metaStr = act.metaData ? JSON.stringify(act.metaData) : '{}';
    const orderId = act.metaData?.orderId || act.metaData?.razorpayOrderId;

    return `
      <tr>
        <td><span class="badge ${badgeClass}">${act.action}</span></td>
        <td><strong>${escapeHtml(act.userEmail || act.userId || 'Guest')}</strong></td>
        <td><code>${escapeHtml(act.ipAddress || '127.0.0.1')}</code></td>
        <td class="text-muted">${time}</td>
        <td>
          <span class="code-cell" title="${escapeHtml(metaStr)}">${escapeHtml(metaStr.substring(0, 40))}${metaStr.length > 40 ? '...' : ''}</span>
          ${orderId ? ` <a href="javascript:void(0)" onclick="openTransactionDetailsModal('${escapeHtml(orderId)}')" class="badge badge-secondary" style="text-decoration: underline; cursor: pointer; margin-left: 6px;" title="View exact transaction popup">🔍 Txn</a>` : ''}
        </td>
      </tr>
    `;
  }
}
