const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runOrdersAndTicketsFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Orders Ledger & Support Dispute Tickets Flow');

  // Step 1: Orders ledger listing & analytics breakdown
  const ordersRes = await apiRequest('/api/v2/adminaccess/orders');
  assert.strictEqual(ordersRes.status, 200, 'GET /api/v2/adminaccess/orders must return 200');
  assert(ordersRes.data && Array.isArray(ordersRes.data.orders), 'Response must include orders list');
  assert(ordersRes.data.distribution, 'Response must include distribution metrics');
  assert(ordersRes.data.failureBreakdown, 'Response must include failureBreakdown metrics');
  console.log(`    ✓ Fetched orders ledger: ${ordersRes.data.orders.length} transactions recorded`);
  console.log('    ✓ Analytics metrics verified: Distribution breakdown and failure categories present');

  // Step 2: Dynamic Search & Filtering on Orders
  const searchRes = await apiRequest('/api/v2/adminaccess/orders?q=admin@yourdomain.com');
  assert.strictEqual(searchRes.status, 200, 'Search filter query must return 200');
  assert(Array.isArray(searchRes.data.orders), 'Search result must be an array');
  console.log(`    ✓ Dynamic search by query 'admin@yourdomain.com' returned ${searchRes.data.orders.length} matches`);

  // Step 3: Support Tickets Listing
  const ticketsRes = await apiRequest('/api/v2/adminaccess/tickets');
  assert.strictEqual(ticketsRes.status, 200, 'GET /api/v2/adminaccess/tickets must return 200');
  assert(ticketsRes.data && Array.isArray(ticketsRes.data.tickets), 'Response must include tickets array');
  console.log(`    ✓ Fetched active dispute tickets: ${ticketsRes.data.tickets.length} tickets`);

  // Step 4: Create a New PG Failure Dispute Ticket
  const newTicketPayload = {
    customerEmail: 'dispute.student@example.com',
    orderId: 'order_test_dispute_12345',
    utr: 'UTR987654321',
    amount: 174,
    issueCategory: 'BANK_TIMEOUT',
    description: 'Amount deducted from bank account via UPI, but session was not unlocked.',
  };

  const createTicketRes = await apiRequest('/api/v2/adminaccess/tickets', {
    method: 'POST',
    body: newTicketPayload,
  });

  assert.strictEqual(createTicketRes.status, 200, 'POST /api/v2/adminaccess/tickets must return 200');
  assert(createTicketRes.data && createTicketRes.data.ticket, 'Created ticket must be returned');
  const createdTicket = createTicketRes.data.ticket;
  const ticketId = createdTicket.ticketId || createdTicket._id;
  assert.strictEqual(createdTicket.customerEmail, newTicketPayload.customerEmail);
  console.log(`    ✓ Dispute ticket created successfully (Ticket ID: ${ticketId})`);

  // Step 5: Resolve the Dispute Ticket (Admin Action)
  const resolveTicketRes = await apiRequest(`/api/v2/adminaccess/tickets/${ticketId}`, {
    method: 'PUT',
    body: {
      status: 'RESOLVED',
      adminNotes: 'Payment verified manually in Razorpay dashboard. Course access provisioned.',
    },
  });

  assert.strictEqual(resolveTicketRes.status, 200, 'PUT /api/v2/adminaccess/tickets/:id must return 200');
  assert(resolveTicketRes.data && resolveTicketRes.data.ticket, 'Updated ticket must be returned');
  assert.strictEqual(resolveTicketRes.data.ticket.status, 'RESOLVED', 'Ticket status must be RESOLVED');
  console.log(`    ✓ Dispute ticket '${ticketId}' successfully resolved by Admin`);

  console.log('  ✅ Orders & Tickets Dynamic Flow: ALL PASSED');
  return true;
}

module.exports = runOrdersAndTicketsFlowTests;

if (require.main === module) {
  runOrdersAndTicketsFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}
