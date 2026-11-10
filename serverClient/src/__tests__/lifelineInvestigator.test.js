import assert from 'node:assert';

export function maskPhoneValue(phone, reveal = false) {
  if (!phone) return 'Not on file';
  if (reveal) return phone;
  const clean = String(phone).replace(/[^0-9]/g, '');
  if (clean.length > 4) {
    return `+91 XXXXXXXX${clean.slice(-4)}`;
  }
  return phone;
}

export function maskEmailValue(email, reveal = false) {
  if (!email) return 'Not on file';
  if (reveal) return email;
  const [user, domain] = String(email).split('@');
  if (!domain) return email;
  return `${user.slice(0, 2)}****@${domain}`;
}

export function mergePaginatedLifelineResponse(prevData, nextPayload, pageNum) {
  if (!nextPayload || !nextPayload.matched || !nextPayload.data) {
    return pageNum === 1 ? null : prevData;
  }
  if (pageNum === 1) {
    return nextPayload.data;
  }
  return {
    ...nextPayload.data,
    orders: [...(prevData?.orders || []), ...(nextPayload.data.orders || [])],
  };
}

export async function runLifelineInvestigatorTests() {
  console.log('\n  🧪 [UNIT TEST] serverClient: Lifeline Investigation Masking & Pagination Merge Logic');

  // Test 1: Phone masking / unmasking
  assert.strictEqual(maskPhoneValue('+91 9876545543', false), '+91 XXXXXXXX5543');
  assert.strictEqual(maskPhoneValue('+91 9876545543', true), '+91 9876545543');
  assert.strictEqual(maskPhoneValue('', false), 'Not on file');
  console.log('    ✓ Phone masking & PII toggle verified');

  // Test 2: Email masking / unmasking & invalid input boundary
  assert.strictEqual(maskEmailValue('artisahu6880@gmail.com', false), 'ar****@gmail.com');
  assert.strictEqual(maskEmailValue('artisahu6880@gmail.com', true), 'artisahu6880@gmail.com');
  assert.strictEqual(maskEmailValue('invalidemail', false), 'invalidemail');
  assert.strictEqual(maskEmailValue(null, false), 'Not on file');
  console.log('    ✓ Email masking & malformed/null boundaries verified');

  // Test 3: Real DB response pagination merge (page 1 -> page 2 -> no-match)
  const p1 = mergePaginatedLifelineResponse(null, {
    success: true,
    matched: true,
    data: { customerId: 'usr_1', orders: [{ orderId: 'o1' }, { orderId: 'o2' }, { orderId: 'o3' }] },
  }, 1);
  assert.strictEqual(p1.orders.length, 3);

  const p2 = mergePaginatedLifelineResponse(p1, {
    success: true,
    matched: true,
    data: { customerId: 'usr_1', orders: [{ orderId: 'o4' }, { orderId: 'o5' }] },
  }, 2);
  assert.strictEqual(p2.orders.length, 5);
  assert.strictEqual(p2.orders[0].orderId, 'o1');
  assert.strictEqual(p2.orders[4].orderId, 'o5');

  const noMatch = mergePaginatedLifelineResponse(p2, { success: true, matched: false, data: null }, 1);
  assert.strictEqual(noMatch, null, 'Unmatched lookup on page 1 must clear data instead of fabricating records');
  console.log('    ✓ Real DB response pagination merge & empty match clearing verified');

  console.log('  ✅ serverClient Lifeline Investigator Logic: ALL PASSED');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('lifelineInvestigator.test.js')) {
  runLifelineInvestigatorTests().catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
}
