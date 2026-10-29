/**
 * Audit & Security Logs Controller
 */

import { LogModel } from '../models/LogModel.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';

let logsDebounceTimer = null;

export class LogsController {
  static async loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;

    const search = document.getElementById('logs-search')?.value.trim() || '';
    const action = document.getElementById('logs-action-filter')?.value || 'all';

    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading audit stream...</td></tr>`;

    try {
      const logs = await LogModel.getLogs(search, action);

      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No log events recorded.</td></tr>`;
        return;
      }

      tbody.innerHTML = logs.map((l) => TelemetryPageView.renderActivityRow(l)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #f87171">Logs fetch error: ${err.message}</td></tr>`;
    }
  }

  static debounceLogsSearch() {
    clearTimeout(logsDebounceTimer);
    logsDebounceTimer = setTimeout(() => this.loadLogs(), 300);
  }
}
