/**
 * System Telemetry Controller
 */

import { TelemetryModel } from '../models/TelemetryModel.js';
import { TelemetryPageView } from '../views/pages/TelemetryPageView.js';
import { formatUptime } from '../utils/formatters.js';

export class TelemetryController {
  static async loadTelemetry() {
    try {
      const res = await TelemetryModel.getTelemetry();
      this.initDashboardData(res);
    } catch (err) {
      console.error('Failed to load telemetry:', err);
    }
  }

  static initDashboardData(data) {
    if (!data) return;
    const { metrics, telemetry, recentActivities } = data;

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

    // Recent Activities Table
    if (recentActivities) {
      const tbody = document.getElementById('recent-activities-tbody');
      if (tbody) {
        if (recentActivities.length === 0) {
          tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No activities logged yet.</td></tr>`;
        } else {
          tbody.innerHTML = recentActivities.map((act) => TelemetryPageView.renderActivityRow(act)).join('');
        }
      }
    }
  }
}
