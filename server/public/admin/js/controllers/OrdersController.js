/**
 * Orders & Payments Controller
 */

import { OrderModel } from '../models/OrderModel.js';
import { OrdersPageView } from '../views/pages/OrdersPageView.js';
import { RefundsController } from './RefundsController.js';

let ordersDebounceTimer = null;

export class OrdersController {
  static async loadOrders() {
    const tbody = document.getElementById('orders-tbody');
    if (!tbody) return;

    const search = document.getElementById('order-search')?.value.trim() || '';
    const status = document.getElementById('order-status-filter')?.value || 'all';

    tbody.innerHTML = `<tr><td colspan="10" class="text-center">Loading transactions...</td></tr>`;

    try {
      const orders = await OrderModel.getOrders(search, status);

      if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-muted">No orders found matching criteria.</td></tr>`;
        return;
      }

      tbody.innerHTML = orders.map((o) => OrdersPageView.renderOrderRow(o)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="color: #f87171">Failed to load orders: ${err.message}</td></tr>`;
    }
  }

  static debounceOrdersSearch() {
    clearTimeout(ordersDebounceTimer);
    ordersDebounceTimer = setTimeout(() => this.loadOrders(), 300);
  }

  static promptRefund(orderId, amount) {
    RefundsController.openRefundModal(orderId, amount);
  }
}
