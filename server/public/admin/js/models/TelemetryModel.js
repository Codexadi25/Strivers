/**
 * System Telemetry & Diagnostics Model
 */

import { apiRequest } from '../services/api.js';

export class TelemetryModel {
  static async getTelemetry() {
    const res = await apiRequest('/admin/telemetry');
    return res.data || {};
  }
}
