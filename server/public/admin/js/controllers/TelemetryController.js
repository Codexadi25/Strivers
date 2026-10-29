/**
 * System Telemetry Controller
 */

import { TelemetryModel } from '../models/TelemetryModel.js';
import { LogModel } from '../models/LogModel.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';
import { formatUptime } from '../utils/formatters.js';

export class TelemetryController {
  static currentPage = 1;
  static currentLimit = 20;
  static totalCount = 0;
  static totalPages = 1;

  static async loadTelemetry() {
    try {
      const res = await TelemetryModel.getTelemetry();
      this.initDashboardData(res);
      await this.loadRecentActivities();
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  }

  static async loadRecentActivities() {
    const tbody = document.getElementById('recent-activities-tbody');
    if (!tbody) return;

    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading activity stream...</td></tr>`;

    try {
      const data = await LogModel.getLogs('', 'all', this.currentPage, this.currentLimit);
      const logs = data.logs || [];
      this.totalCount = data.total || logs.length;
      this.totalPages = Math.max(1, data.totalPages || Math.ceil(this.totalCount / this.currentLimit));

      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No activities logged yet.</td></tr>`;
      } else {
        tbody.innerHTML = logs.map((act) => TelemetryPageView.renderActivityRow(act)).join('');
      }

      this.updatePaginationUI();
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No activities recorded.</td></tr>`;
      this.updatePaginationUI();
    }
  }

  static updatePaginationUI() {
    const rangeEl = document.getElementById('recent-activities-range');
    const pageEl = document.getElementById('recent-activities-page');
    const prevBtn = document.getElementById('btn-recent-prev');
    const nextBtn = document.getElementById('btn-recent-next');

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
    await this.loadRecentActivities();
  }

  static async prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      await this.loadRecentActivities();
    }
  }

  static async nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      await this.loadRecentActivities();
    }
  }

  static initDashboardData(data) {
    if (!data) return;
    const { metrics, telemetry } = data;

    // KPI Metrics
    if (metrics) {
      const revEl = document.getElementById('kpi-revenue');
      if (revEl) revEl.textContent = `₹${(metrics.totalRevenue || 0).toLocaleString('en-IN')}`;

      const txnEl = document.getElementById('kpi-transactions');
      if (txnEl) txnEl.textContent = (metrics.totalTransactions || 0).toLocaleString();

      const subEl = document.getElementById('kpi-subscribers');
      if (subEl) subEl.textContent = (metrics.activeSubscribers || 0).toLocaleString();

      const logEl = document.getElementById('kpi-logs');
      if (logEl) logEl.textContent = (metrics.totalLogs || 0).toLocaleString();
    }

    // Topbar & System Diagnostics
    if (telemetry) {
      const mongoEl = document.getElementById('topbar-mongo');
      if (mongoEl) mongoEl.textContent = telemetry.mongoState || 'Connected';

      const rzpEl = document.getElementById('topbar-razorpay');
      if (rzpEl) rzpEl.textContent = telemetry.razorpayMode || 'Live';

      // Server Diagnostics List
      const serverList = document.getElementById('telemetry-list');
      if (serverList) {
        serverList.innerHTML = `
          <div class="telemetry-row"><span>Node.js Version</span><strong>${telemetry.nodeVersion}</strong></div>
          <div class="telemetry-row"><span>Platform / Arch</span><strong>${telemetry.platform} (${telemetry.arch})</strong></div>
          <div class="telemetry-row"><span>Process Uptime</span><strong>${formatUptime(telemetry.uptimeSeconds)}</strong></div>
          <div class="telemetry-row"><span>Heap Memory</span><strong>${telemetry.memoryHeapUsedMB} MB</strong></div>
          <div class="telemetry-row"><span>Resident Set (RSS)</span><strong>${telemetry.memoryRssMB} MB</strong></div>
          <div class="telemetry-row"><span>Environment</span><strong>${telemetry.env}</strong></div>
        `;
      }

      // Gateway List
      const gwList = document.getElementById('gateway-list');
      if (gwList) {
        gwList.innerHTML = `
          <div class="telemetry-row"><span>Razorpay Mode</span><strong style="color: #34d399">${telemetry.razorpayMode}</strong></div>
          <div class="telemetry-row"><span>Key ID</span><strong>${telemetry.razorpayKeyMasked}</strong></div>
          <div class="telemetry-row"><span>Webhook Signature</span><strong>Active HMAC-SHA256</strong></div>
          <div class="telemetry-row"><span>Database Connection</span><strong style="color: #60a5fa">${telemetry.mongoState}</strong></div>
        `;
      }
    }
  }
}

// Global window hooks for inline HTML onclick/onchange bindings
if (typeof window !== 'undefined') {
  window.handleActivitiesLimitChange = (val) => TelemetryController.changeLimit(val);
  window.handleActivitiesPrevPage = () => TelemetryController.prevPage();
  window.handleActivitiesNextPage = () => TelemetryController.nextPage();
}
