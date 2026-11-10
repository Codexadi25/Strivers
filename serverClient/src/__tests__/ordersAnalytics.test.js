import assert from 'node:assert';

export function computeDistribution(orders) {
  const total = orders.length;
  if (total === 0) {
    return {
      total: 0,
      captured: 0,
      capturedPct: 0,
      failed: 0,
      failedPct: 0,
      canceled: 0,
      canceledPct: 0,
      refunded: 0,
      refundedPct: 0,
    };
  }

  const captured = orders.filter((o) => (o.status || '').toUpperCase() === 'CAPTURED').length;
  const canceled = orders.filter((o) => (o.status || '').toUpperCase().includes('CANCEL')).length;
  const failed = orders.filter((o) => (o.status || '').toUpperCase().includes('FAIL')).length;
  const refunded = orders.filter((o) => (o.status || '').toUpperCase().includes('REFUND')).length;

  return {
    total,
    captured,
    capturedPct: Math.round((captured / total) * 100),
    failed,
    failedPct: Math.round((failed / total) * 100),
    canceled,
    canceledPct: Math.round((canceled / total) * 100),
    refunded,
    refundedPct: Math.round((refunded / total) * 100),
  };
}

export function filterOrders(orders, search = '', statusFilter = 'ALL') {
  const s = search.toLowerCase().trim();
  const sf = statusFilter.toUpperCase().trim();

  return orders.filter((o) => {
    const matchesSearch =
      !s ||
      (o.orderId || '').toLowerCase().includes(s) ||
      (o.txnId || '').toLowerCase().includes(s) ||
      (o.refId || '').toLowerCase().includes(s) ||
      (o.customerEmail || '').toLowerCase().includes(s) ||
      (o.courseTitle || '').toLowerCase().includes(s);

    const matchesStatus =
      sf === 'ALL' ||
      (o.status || '').toUpperCase() === sf ||
      (sf === 'CANCELED' && (o.status || '').toUpperCase().includes('CANCEL')) ||
      (sf === 'CAPTURED' && (o.status || '').toUpperCase() === 'CAPTURED');

    return matchesSearch && matchesStatus;
  });
}

export async function runOrdersAnalyticsTests() {
  console.log('\n  🧪 [UNIT TEST] serverClient: Orders & PG Failure Analytics Logic');

  const sampleOrders = [
    { orderId: 'ord_1', customerEmail: 'a@ex.com', status: 'CAPTURED', amount: 100 },
    { orderId: 'ord_2', customerEmail: 'b@ex.com', status: 'CAPTURED', amount: 200 },
    { orderId: 'ord_3', customerEmail: 'c@ex.com', status: 'PAYMENT CANCELED', amount: 74 },
    { orderId: 'ord_4', customerEmail: 'd@ex.com', status: 'FAILED', amount: 174 },
  ];

  // Test 1: Distribution calculation
  const dist = computeDistribution(sampleOrders);
  assert.strictEqual(dist.total, 4);
  assert.strictEqual(dist.captured, 2);
  assert.strictEqual(dist.capturedPct, 50); // 2/4 = 50%
  assert.strictEqual(dist.canceled, 1);
  assert.strictEqual(dist.canceledPct, 25); // 1/4 = 25%
  assert.strictEqual(dist.failed, 1);
  assert.strictEqual(dist.failedPct, 25); // 1/4 = 25%
  console.log('    ✓ Distribution percentages verified: 50% Captured, 25% Canceled, 25% Failed');

  // Test 2: Boundary Value Analysis on Empty Array
  const emptyDist = computeDistribution([]);
  assert.strictEqual(emptyDist.total, 0);
  assert.strictEqual(emptyDist.capturedPct, 0);
  assert(!isNaN(emptyDist.capturedPct), 'Percentage must not be NaN for empty list');
  console.log('    ✓ BVA: Zero orders handled without division by zero NaN');

  // Test 3: Search filter matching
  const searchMatch = filterOrders(sampleOrders, 'ord_2');
  assert.strictEqual(searchMatch.length, 1);
  assert.strictEqual(searchMatch[0].customerEmail, 'b@ex.com');

  const statusMatch = filterOrders(sampleOrders, '', 'CAPTURED');
  assert.strictEqual(statusMatch.length, 2);

  const combinedMatch = filterOrders(sampleOrders, 'c@ex.com', 'CANCELED');
  assert.strictEqual(combinedMatch.length, 1);
  assert.strictEqual(combinedMatch[0].orderId, 'ord_3');
  console.log('    ✓ Search & status filtering verified with dynamic multi-criteria matches');

  console.log('  ✅ serverClient Orders Analytics Logic: ALL PASSED');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('ordersAnalytics.test.js')) {
  runOrdersAnalyticsTests().catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
}

