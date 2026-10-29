/**
 * Audit & Security Logs Model
 */

import { apiRequest } from '../services/api.js';

export class LogModel {
  static async getLogs(search = '', action = 'all', page = 1, limit = 20) {
    const query = new URLSearchParams();
    if (search) query.append('q', search);
    if (action && action !== 'all') query.append('action', action);
    query.append('page', page);
    query.append('limit', limit);

    try {
      const res = await apiRequest(`/logs?${query.toString()}`);
      return {
        logs: res.logs || [],
        total: res.total || 0,
        page: res.page || page,
        limit: res.limit || limit,
        totalPages: res.totalPages || Math.ceil((res.total || 0) / limit) || 1,
      };
    } catch (err) {
      console.warn('[LogModel] Falling back on error:', err.message);
      return {
        logs: [],
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        error: err.message,
      };
    }
  }
}
