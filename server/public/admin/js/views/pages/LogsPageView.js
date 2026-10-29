/**
 * Platform Audit & Security Logs Page View
 */

import { escapeHtml } from '../../utils/formatters.js';

export class LogsPageView {
  static renderPane() {
    return `
      <section id="tab-logs" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>Platform Audit & Security Event Logs</h2>
            <p class="text-muted">Immutable forensic log of logins, price changes, payment verifications, and breach attempts.</p>
          </div>
          <div class="search-filter-bar" style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <input type="text" id="logs-search" class="input-control" style="min-width: 200px;" placeholder="Filter by email, IP, action..." oninput="debounceLogsSearch()">
            <select id="logs-action-filter" class="select-control" style="width: auto;" onchange="loadLogs()">
              <option value="all">All Events</option>
              <option value="PRICE_UPDATED">PRICE_UPDATED</option>
              <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
              <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
              <option value="PAYMENT_INIT">PAYMENT_INIT</option>
              <option value="ACCESS_GRANTED">ACCESS_GRANTED</option>
              <option value="ACCESS_REVOKED">ACCESS_REVOKED</option>
              <option value="SECURITY_BREACH_ATTEMPT">SECURITY_BREACH_ATTEMPT</option>
            </select>
            <div class="pagination-toolbar" style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
              <span class="text-muted" style="font-size: 0.82rem;">Per Page:</span>
              <select id="logs-limit-select" class="select-control" style="width: auto; padding: 4px 10px; font-size: 0.82rem; height: 32px;" onchange="window.handleLogsLimitChange(this.value)">
                <option value="20" selected>20</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
              <span id="logs-range-text" class="text-muted" style="font-size: 0.82rem; font-weight: 500;">Showing 1-20</span>
              <div class="btn-group" style="display: inline-flex; align-items: center; gap: 4px;">
                <button id="btn-logs-prev" class="btn btn-secondary btn-xs" style="padding: 4px 10px; height: 32px;" onclick="window.handleLogsPrevPage()" title="Previous Page">&lt;</button>
                <span id="logs-page-indicator" style="padding: 4px 8px; font-size: 0.82rem; font-weight: 600; min-width: 65px; text-align: center;">Page 1</span>
                <button id="btn-logs-next" class="btn btn-secondary btn-xs" style="padding: 4px 10px; height: 32px;" onclick="window.handleLogsNextPage()" title="Next Page">&gt;</button>
              </div>
            </div>
          </div>
        </div>

        <div class="card table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Event Action</th>
                <th>User / Operator</th>
                <th>Client IP</th>
                <th>Event Metadata</th>
              </tr>
            </thead>
            <tbody id="logs-tbody">
              <tr><td colspan="5" class="text-center">Loading audit log stream...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}
