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
          <div class="search-filter-bar">
            <input type="text" id="logs-search" class="input-control" placeholder="Filter by email, IP, action..." oninput="debounceLogsSearch()">
            <select id="logs-action-filter" class="select-control" onchange="loadLogs()">
              <option value="all">All Events</option>
              <option value="PRICE_UPDATED">PRICE_UPDATED</option>
              <option value="ADMIN_LOGIN">ADMIN_LOGIN</option>
              <option value="PAYMENT_SUCCESS">PAYMENT_SUCCESS</option>
              <option value="PAYMENT_INIT">PAYMENT_INIT</option>
              <option value="ACCESS_GRANTED">ACCESS_GRANTED</option>
              <option value="ACCESS_REVOKED">ACCESS_REVOKED</option>
              <option value="SECURITY_BREACH_ATTEMPT">SECURITY_BREACH_ATTEMPT</option>
            </select>
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
