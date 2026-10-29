/**
 * Audit & Security Logs Controller
 */

import { LogModel } from '../models/LogModel.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';

let logsDebounceTimer = null;

export class LogsController {
  static currentPage = 1;
  static currentLimit = 20;
  static totalCount = 0;
  static totalPages = 1;

  static async loadLogs() {
    const tbody = document.getElementById('logs-tbody');
    if (!tbody) return;

    const search = document.getElementById('logs-search')?.value.trim() || '';
    const action = document.getElementById('logs-action-filter')?.value || 'all';

    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading audit stream...</td></tr>`;

    try {
      const data = await LogModel.getLogs(search, action, this.currentPage, this.currentLimit);
      const logs = data.logs || [];
      this.totalCount = data.total || logs.length;
      this.totalPages = Math.max(1, data.totalPages || Math.ceil(this.totalCount / this.currentLimit));

      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No log events recorded.</td></tr>`;
      } else {
        tbody.innerHTML = logs.map((l) => TelemetryPageView.renderActivityRow(l)).join('');
      }

      this.updatePaginationUI();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center" style="color: #f87171">Logs fetch error: ${err.message}</td></tr>`;
      this.updatePaginationUI();
    }
  }

  static updatePaginationUI() {
    const rangeEl = document.getElementById('logs-range-text');
    const pageEl = document.getElementById('logs-page-indicator');
    const prevBtn = document.getElementById('btn-logs-prev');
    const nextBtn = document.getElementById('btn-logs-next');

    const start = this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.currentLimit + 1;
    const end = Math.min(this.currentPage * this.currentLimit, this.totalCount);

    if (rangeEl) rangeEl.textContent = `Showing ${start}-${end} of ${this.totalCount}`;
    if (pageEl) pageEl.textContent = `Page ${this.currentPage} of ${this.totalPages}`;
    if (prevBtn) prevBtn.disabled = this.currentPage <= 1;
    if (nextBtn) nextBtn.disabled = this.currentPage >= this.totalPages;
  }

  static async changeLimit(newLimit) {
    this.currentLimit = parseInt(newLimit, 10) || 20;
    this.currentPage = 1;
    await this.loadLogs();
  }

  static async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadLogs();
    }
  }

  static async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.loadLogs();
    }
  }

  static debounceLogsSearch() {
    clearTimeout(logsDebounceTimer);
    logsDebounceTimer = setTimeout(() => {
      this.currentPage = 1;
      this.loadLogs();
    }, 300);
  }
}

// Global window hooks for inline HTML onclick/onchange bindings
if (typeof window !== 'undefined') {
  window.handleLogsLimitChange = (val) => LogsController.changeLimit(val);
  window.handleLogsPrevPage = () => LogsController.prevPage();
  window.handleLogsNextPage = () => LogsController.nextPage();
}
