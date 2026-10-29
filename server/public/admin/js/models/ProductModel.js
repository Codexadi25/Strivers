/**
 * Product & Pricing Model
 */

import { apiRequest } from '../services/api.js';

export class ProductModel {
  static async getAll() {
    const res = await apiRequest('/products');
    return res.products || res.data || [];
  }

  static async updatePrice(productId, payload) {
    return await apiRequest(`/products/${encodeURIComponent(productId)}/price`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  static async create(payload) {
    return await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
