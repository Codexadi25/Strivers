import assert from 'node:assert';

export function calculateDiscount(price, originalPrice) {
  if (!originalPrice || isNaN(originalPrice) || !price || isNaN(price)) return null;
  const p = Number(price);
  const op = Number(originalPrice);
  if (op <= p) return null;
  return Math.round(((op - p) / op) * 100);
}

export function formatPriceInr(val) {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
}

export function toPaise(val) {
  const num = Number(val) || 0;
  return Math.round(num * 100);
}

export async function runPricingLogicTests() {
  console.log('\n  🧪 [UNIT TEST] serverClient: Pricing Engine & Discount Logic');

  // Test 1: Standard discount calculations (from Image 1 values)
  // placement_masterclass: ₹74 / was ₹399 -> 81% OFF
  const disc1 = calculateDiscount(74, 399);
  assert.strictEqual(disc1, 81, `Expected 81% OFF, got ${disc1}%`);
  console.log('    ✓ Placement Masterclass (₹74 / was ₹399): 81% OFF correctly derived');

  // masterclass: ₹111 / was ₹199 -> 44% OFF
  const disc2 = calculateDiscount(111, 199);
  assert.strictEqual(disc2, 44, `Expected 44% OFF, got ${disc2}%`);
  console.log('    ✓ Strivers Masterclass (₹111 / was ₹199): 44% OFF correctly derived');

  // channel: ₹174 / was ₹1999 -> 91% OFF
  const disc3 = calculateDiscount(174, 1999);
  assert.strictEqual(disc3, 91, `Expected 91% OFF, got ${disc3}%`);
  console.log('    ✓ Paid Job Channel (₹174 / was ₹1999): 91% OFF correctly derived');

  // course_fullstack: ₹499 / was ₹2999 -> 83% OFF
  const disc4 = calculateDiscount(499, 2999);
  assert.strictEqual(disc4, 83, `Expected 83% OFF, got ${disc4}%`);
  console.log('    ✓ Full-Stack Engineering (₹499 / was ₹2999): 83% OFF correctly derived');

  // Test 2: Currency and Paise formatting
  assert.strictEqual(formatPriceInr(74), '₹74');
  assert.strictEqual(formatPriceInr(1999), '₹1,999');
  assert.strictEqual(toPaise(74), 7400);
  assert.strictEqual(toPaise(111), 11100);
  console.log('    ✓ INR symbol and paise formatting verified (₹74 = 7400 paise)');

  // Test 3: Boundary Value Analysis on Pricing Logic
  // Case A: originalPrice == price (No discount)
  assert.strictEqual(calculateDiscount(100, 100), null, 'Zero discount should return null');

  // Case B: originalPrice < price (Discount negative -> invalid)
  assert.strictEqual(calculateDiscount(150, 100), null, 'Price higher than original should return null');

  // Case C: Null / undefined / invalid string inputs
  assert.strictEqual(calculateDiscount(null, 100), null);
  assert.strictEqual(calculateDiscount(100, undefined), null);
  assert.strictEqual(calculateDiscount('abc', 100), null);
  console.log('    ✓ Boundary Value Analysis: Edge cases (null, negative, equal prices) handled safely');

  console.log('  ✅ serverClient Pricing Engine Logic: ALL PASSED');
  return true;
}

if (process.argv[1] && process.argv[1].endsWith('pricingLogic.test.js')) {
  runPricingLogicTests().catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
}

