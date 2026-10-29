/**
 * Support & PG Dispute Tickets Controller
 */

import { apiRequest } from '../services/api.js';
import { escapeHtml } from '../utils/formatters.js';

export class TicketsController {
  static async loadTickets() {
    const tbody = document.getElementById('tickets-tbody');
    if (!tbody) return;

    const status = document.getElementById('ticket-status-filter')?.value || 'all';
    const issueType = document.getElementById('ticket-issue-filter')?.value || 'all';
    const q = document.getElementById('ticket-search')?.value.trim() || '';

    tbody.innerHTML = `<tr><td colspan="9" class="text-center">Loading dispute tickets...</td></tr>`;

    try {
      const query = new URLSearchParams();
      if (status !== 'all') query.append('status', status);
      if (issueType !== 'all') query.append('issueType', issueType);
      if (q) query.append('q', q);

      const res = await apiRequest(`/tickets?${query.toString()}`);
      const tickets = res.tickets || [];

      if (tickets.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted">No dispute tickets found.</td></tr>`;
        return;
      }

      tbody.innerHTML = tickets.map((t) => this.renderTicketRow(t)).join('');
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="9" class="text-center" style="color: #f87171">Failed to load tickets: ${err.message}</td></tr>`;
    }
  }

  static renderTicketRow(t) {
    let statusBadge = 'badge-warning';
    if (t.status === 'resolved' || t.status === 'access_granted' || t.status === 'manual_refund_done') {
      statusBadge = 'badge-success';
    } else if (t.status === 'under_investigation') {
      statusBadge = 'badge-info';
    }

    const slaDate = new Date(t.slaDeadline).toLocaleDateString('en-IN');
    const isOverdue = new Date(t.slaDeadline) < new Date() && t.status !== 'resolved' && t.status !== 'closed';

    return `
      <tr>
        <td><strong>${escapeHtml(t.ticketId)}</strong></td>
        <td class="text-muted">${new Date(t.createdAt).toLocaleDateString('en-IN')}</td>
        <td>
          <strong>${escapeHtml(t.userEmail)}</strong>
          <div style="font-size: 0.8rem; color: #94a3b8;">${escapeHtml(t.userPhone)}</div>
        </td>
        <td>
          <div>Order: <a href="javascript:void(0)" onclick="openTransactionDetailsModal('${escapeHtml(t.razorpayOrderId)}')" style="font-weight: 600; text-decoration: underline; color: #3b82f6;" title="Click to view full transaction popup">${escapeHtml(t.razorpayOrderId)}</a></div>
          ${t.razorpayPaymentId ? `<div style="font-size: 0.8rem;">Payment: <a href="javascript:void(0)" onclick="openTransactionDetailsModal('${escapeHtml(t.razorpayPaymentId)}')" class="code-cell" style="color:#60a5fa; text-decoration: underline;" title="Click to view full transaction popup">${escapeHtml(t.razorpayPaymentId)}</a></div>` : ''}
          ${t.bankRrn ? `<div style="font-size: 0.8rem; color:#34d399;">UTR: <strong>${escapeHtml(t.bankRrn)}</strong></div>` : ''}
        </td>
        <td><strong style="color: #34d399">₹${t.amount}</strong></td>
        <td><span class="badge badge-info">${escapeHtml(t.issueType.replace(/_/g, ' '))}</span></td>
        <td><span class="badge ${statusBadge}">${escapeHtml(t.status.replace(/_/g, ' '))}</span></td>
        <td>
          <span style="font-size: 0.84rem; color: ${isOverdue ? '#ef4444' : 'var(--text-muted)'}; font-weight: ${isOverdue ? '700' : '400'};">
            ${slaDate} ${isOverdue ? '⚠️ Overdue' : ''}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="openManageTicketModal('${t.ticketId}', '${escapeHtml(t.userEmail)}', ${t.amount}, '${escapeHtml(t.razorpayOrderId)}', '${t.status}')">
            Resolve
          </button>
        </td>
      </tr>
    `;
  }

  static openManageTicketModal(ticketId, email, amount, orderId, currentStatus) {
    const modal = document.getElementById('modal-manage-ticket');
    if (!modal) return;

    modal.classList.remove('hidden');
    document.getElementById('ticket-modal-id').value = ticketId;
    document.getElementById('ticket-status-select').value = currentStatus || 'open';

    const preview = document.getElementById('ticket-meta-preview');
    if (preview) {
      preview.innerHTML = `
        <div><strong>Ticket:</strong> ${escapeHtml(ticketId)}</div>
        <div><strong>Student:</strong> ${escapeHtml(email)}</div>
        <div><strong>Deducted Amount:</strong> ₹${amount} (Order: ${escapeHtml(orderId)})</div>
        <div style="margin-top: 6px; color: #94a3b8; font-size: 0.82rem;">Razorpay standard refund window: 5-7 business days to source bank.</div>
      `;
    }
  }

  static closeManageTicketModal() {
    const modal = document.getElementById('modal-manage-ticket');
    if (modal) modal.classList.add('hidden');
  }

  static async submitTicketResolution(e) {
    e.preventDefault();
    const ticketId = document.getElementById('ticket-modal-id').value;
    const status = document.getElementById('ticket-status-select').value;
    const adminRemarks = document.getElementById('ticket-admin-remarks').value.trim();

    try {
      await apiRequest(`/tickets/${encodeURIComponent(ticketId)}`, 'PATCH', {
        status,
        adminRemarks,
      });

      this.closeManageTicketModal();
      this.loadTickets();
      alert(`Ticket ${ticketId} status updated to ${status}.`);
    } catch (err) {
      alert(`Failed to update ticket: ${err.message}`);
    }
  }
}

