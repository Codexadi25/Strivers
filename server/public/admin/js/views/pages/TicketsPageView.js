/**
 * Support & PG Dispute Tickets Page View
 */

export class TicketsPageView {
  static renderPane() {
    return `
      <section id="tab-tickets" class="tab-pane">
        <div class="pane-header">
          <div>
            <h2>PG Failure & Refund Support Tickets</h2>
            <p class="text-muted">Manage student disputes where money was deducted on payment failure and source refunds are being reconciled.</p>
          </div>
          <div class="search-filter-bar">
            <input type="text" id="ticket-search" class="input-control" placeholder="Search by Ticket ID, email, UTR, order ID..." oninput="loadTickets()">
            <select id="ticket-issue-filter" class="select-control" onchange="loadTickets()">
              <option value="all">All Issue Categories</option>
              <option value="amount_debited_payment_failed">Amount Debited / Payment Failed</option>
              <option value="website_risk_check_blocked">Domain Mismatch (payment_risk_check_failed)</option>
              <option value="refund_not_received_7_days">Refund Delayed (> 7 Days)</option>
              <option value="double_debit">Double Debit</option>
            </select>
            <select id="ticket-status-filter" class="select-control" onchange="loadTickets()">
              <option value="all">All Ticket Statuses</option>
              <option value="open">Open (In 7-Day Window)</option>
              <option value="under_investigation">Under Investigation</option>
              <option value="refund_verified_pg">Verified by Razorpay</option>
              <option value="manual_refund_done">Manual UPI / Bank Refund Done</option>
              <option value="access_granted">Access Granted to Course</option>
              <option value="resolved">Resolved / Closed</option>
            </select>
          </div>
        </div>

        <div class="card" style="background: var(--bg-elevated); margin-bottom: 20px; padding: 18px 24px; border-left: 4px solid #f59e0b;">
          <div style="display: flex; gap: 14px; align-items: center;">
            <span style="font-size: 1.5rem;">ℹ️</span>
            <div>
              <strong style="color: var(--text-main);">Razorpay Auto-Refund Policy (5-7 Business Days):</strong>
              <div style="font-size: 0.88rem; color: var(--text-muted); margin-top: 2px;">
                When a payment fails with <code>payment_risk_check_failed</code> or bank timeout, Razorpay automatically pushes a reversal to the customer's UPI / acquiring bank. If not refunded within 7 days, check the Bank UTR / RRN in the Razorpay Dashboard or issue a direct bank transfer.
              </div>
            </div>
          </div>
        </div>

        <div class="card table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Created</th>
                <th>Student Contact</th>
                <th>Order / Txn / Bank UTR</th>
                <th>Amount</th>
                <th>Issue Category</th>
                <th>Status</th>
                <th>SLA Deadline</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody id="tickets-tbody">
              <tr><td colspan="9" class="text-center">Loading dispute tickets...</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }
}

