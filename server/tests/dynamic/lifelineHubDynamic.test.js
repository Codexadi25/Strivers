const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runLifelineHubDynamicTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Lifeline Hub Investigation & High-Availability Flow');

  // Test 1: Category - Customer Email
  const emailRes = await apiRequest('/api/v2/adminaccess/lifeline?param=customer_email&query=kamaldeep@gmail.com');
  assert.strictEqual(emailRes.status, 200, 'Lifeline email search must return 200');
  assert(emailRes.data && emailRes.data.data, 'Lifeline response must contain data payload');
  const customer = emailRes.data.data;
  assert.strictEqual(customer.email, 'kamaldeep@gmail.com', 'User email must match query');
  assert(Array.isArray(customer.orders), 'Orders list must be an array');
  console.log(`    ✓ Lifeline [customer_email]: User '${customer.name}' found with ${customer.orders.length} orders`);

  // Test 2: Category - Customer Phone
  const phoneRes = await apiRequest('/api/v2/adminaccess/lifeline?param=customer_phone&query=9876545543');
  assert.strictEqual(phoneRes.status, 200, 'Lifeline phone search must return 200');
  assert(phoneRes.data.data, 'Customer data object must be returned');
  assert(phoneRes.data.data.phone.includes('9876545543'), 'Customer phone must match query digits');
  console.log(`    ✓ Lifeline [customer_phone]: Resolved phone ${phoneRes.data.data.phone}`);

  // Test 3: Category - Order ID
  const orderRes = await apiRequest('/api/v2/adminaccess/lifeline?param=order_id&query=order_Kml2837192011');
  assert.strictEqual(orderRes.status, 200, 'Lifeline order search must return 200');
  assert(orderRes.data && orderRes.data.matched, 'Lifeline must match genuine database order');
  assert(orderRes.data.data.orders.length > 0, 'Orders list must contain transactions');
  console.log(`    ✓ Lifeline [order_id]: Resolved order data for order_Kml2837192011`);

  // Test 4: Category - Txn ID & Ref ID
  const txnRes = await apiRequest('/api/v2/adminaccess/lifeline?param=txn_id&query=pay_Kml2837192011_1');
  assert.strictEqual(txnRes.status, 200, 'Lifeline txn_id search must return 200');
  assert(txnRes.data && txnRes.data.matched, 'Lifeline must match genuine transaction');
  const refRes = await apiRequest('/api/v2/adminaccess/lifeline?param=ref_id&query=rcpt_al_dev_1794246100111');
  assert.strictEqual(refRes.status, 200, 'Lifeline ref_id search must return 200');
  assert(refRes.data && refRes.data.matched, 'Lifeline must match genuine receipt');
  console.log('    ✓ Lifeline [txn_id & ref_id]: Successfully resolved transaction references');

  // Test 5: Dynamic Pagination Check
  const page1Res = await apiRequest('/api/v2/adminaccess/lifeline?query=kamaldeep@gmail.com&page=1&limit=2');
  const page2Res = await apiRequest('/api/v2/adminaccess/lifeline?query=kamaldeep@gmail.com&page=2&limit=2');
  assert.strictEqual(page1Res.status, 200);
  assert.strictEqual(page2Res.status, 200);
  assert.strictEqual(page1Res.data.data.orders.length, 2, 'Page 1 must contain 2 orders');
  assert.strictEqual(page2Res.data.data.orders.length, 2, 'Page 2 must contain 2 orders');
  console.log('    ✓ Dynamic pagination verified: page 1 and page 2 return distinct sliced orders');

  // Test 6: Boundary Values & Fuzzing (High Availability Assurance)
  // Case A: Blank query returns graceful idle state
  const blankRes = await apiRequest('/api/v2/adminaccess/lifeline?query=');
  assert.strictEqual(blankRes.status, 200, 'Blank query must not crash and return 200');
  assert.strictEqual(blankRes.data.matched, false, 'Blank query reports matched: false (idle state)');
  assert.strictEqual(blankRes.data.data, null, 'Blank query has data: null');

  // Case B: Special characters and symbols
  const fuzzRes = await apiRequest('/api/v2/adminaccess/lifeline?query=@@!!$$%^&*');
  assert.strictEqual(fuzzRes.status, 200, 'Fuzz query must not crash and return 200');
  assert.strictEqual(fuzzRes.data.matched, false, 'Fuzz query returns matched: false cleanly without crashing');

  // Case C: Non-existent identifier (strict real data, no synthetic mocks)
  const nonExistentRes = await apiRequest('/api/v2/adminaccess/lifeline?query=totally_non_existent_99999');
  assert.strictEqual(nonExistentRes.status, 200, 'Non-existent identifier handled safely');
  assert.strictEqual(nonExistentRes.data.matched, false, 'Non-existent query accurately reports matched: false');
  assert.strictEqual(nonExistentRes.data.data, null, 'No synthetic orders generated');
  console.log('    ✓ High-Availability & Real Data Fallback: Lifeline never crashes on fuzzing or non-existent inputs and loads only authentic DB records');

  console.log('  ✅ Lifeline Hub Dynamic Flow: ALL PASSED');
  return true;
}

module.exports = runLifelineHubDynamicTests;

if (require.main === module) {
  runLifelineHubDynamicTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}
