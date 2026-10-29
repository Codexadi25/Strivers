/**
 * Audit & Security Logs Model
 */

import { apiRequest } from '../services/api.js';

export class LogModel {
  static async getLogs(search = '', action = 'all') {
    const query = new URLSearchParams();
    if (search) query.append('q', search);
    if (action && action !== 'all') query.append('action', action);

    const res = await apiRequest(`/logs?${query.toString()}`);
    return res.logs || [];
  }
}
