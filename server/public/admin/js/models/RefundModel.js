/**
 * Refunds and Reversals Model
 */

import { apiRequest } from '../services/api.js';

export class RefundModel {
  static async getRefunds() {
    const res = await apiRequest('/refunds');
    return res.refunds || [];
  }

  static async submitRefund(payload) {
    return await apiRequest('/refunds', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
