/**
 * Orders & Payments Model
 */

import { apiRequest } from '../services/api.js';

export class OrderModel {
  static async getOrders(search = '', status = 'all') {
    const query = new URLSearchParams();
    if (search) query.append('q', search);
    if (status && status !== 'all') query.append('status', status);

    const res = await apiRequest(`/orders?${query.toString()}`);
    return res.orders || [];
  }
}
