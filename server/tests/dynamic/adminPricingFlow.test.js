const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runAdminPricingFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Admin Course Pricing -> Student Storefront -> Payment Order Dynamic Flow');

  // Step 1: Query student storefront for initial catalog (/api/courses)
  const storeRes = await apiRequest('/api/courses');
  assert.strictEqual(storeRes.status, 200, 'GET /api/courses must return 200 OK');
  assert(storeRes.data && storeRes.data.courses, 'Response must have courses list');
  const initialCourses = storeRes.data.courses;
  assert(initialCourses.length > 0, 'Courses list must not be empty');
  console.log(`    ✓ Initial public catalog fetched: ${initialCourses.length} active courses`);

  // Choose the first course for end-to-end sync testing
  const targetCourse = initialCourses[0];
  const targetId = targetCourse.productId || targetCourse._id;
  const originalPrice = targetCourse.price;
  const dynamicTestPrice = 74;
  console.log(`    ℹ Testing course '${targetId}' (Current: ₹${originalPrice})`);

  // Step 2: Admin updates price via Admin API (/api/v2/adminaccess/courses/:id)
  const updateRes = await apiRequest(`/api/v2/adminaccess/courses/${targetId}`, {
    method: 'PUT',
    body: {
      price: dynamicTestPrice,
      originalPrice: 399,
      badge: 'Live Session Every Sunday',
    },
  });

  assert.strictEqual(updateRes.status, 200, `PUT /api/v2/adminaccess/courses/${targetId} must return 200`);
  assert(updateRes.data && updateRes.data.success, 'Update response must report success');
  assert.strictEqual(updateRes.data.course.price, dynamicTestPrice, `Reported price must be ₹${dynamicTestPrice}`);
  assert.strictEqual(updateRes.data.course.priceInPaise, dynamicTestPrice * 100, `Paise must be ${dynamicTestPrice * 100}`);
  console.log(`    ✓ Admin PUT updated '${targetId}' price to ₹${dynamicTestPrice} (${updateRes.data.course.priceInPaise} paise)`);

  // Step 3: Student storefront calls GET /api/courses - must immediately reflect updated price
  const storeResAfter = await apiRequest('/api/courses');
  assert.strictEqual(storeResAfter.status, 200, 'GET /api/courses must return 200');
  const updatedCatalog = storeResAfter.data.courses;
  const updatedItem = updatedCatalog.find((p) => (p.productId || p._id) === targetId);
  assert(updatedItem, `Target item '${targetId}' must exist in public catalog`);
  assert.strictEqual(updatedItem.price, dynamicTestPrice, `Student sees new price ₹${dynamicTestPrice}`);
  assert.strictEqual(updatedItem.priceInPaise, dynamicTestPrice * 100, `Student sees new price in paise: ${dynamicTestPrice * 100}`);
  console.log(`    ✓ Student storefront immediately reflected new price ₹${dynamicTestPrice}`);

  // Step 4: Student initiates checkout via POST /api/payments/create-order
  const orderRes = await apiRequest('/api/payments/create-order', {
    method: 'POST',
    body: {
      planId: targetId,
      customerEmail: 'student.test@example.com',
      customerPhone: '9876543210',
    },
  });

  assert(
    orderRes.status === 201 || orderRes.status === 200,
    `POST /api/payments/create-order must succeed (got ${orderRes.status})`
  );
  assert(orderRes.data && (orderRes.data.order_id || orderRes.data.orderId), 'Payment order ID must be returned');
  const createdAmount = orderRes.data.amount;
  assert.strictEqual(
    createdAmount,
    dynamicTestPrice * 100,
    `Razorpay order must be charged exactly ${dynamicTestPrice * 100} paise (₹${dynamicTestPrice}), got ${createdAmount}`
  );
  assert.strictEqual(orderRes.data.currency, 'INR', 'Currency must be INR');
  console.log(`    ✓ Razorpay order dynamically created for ₹${createdAmount / 100} (${createdAmount} paise) matching Admin price`);

  // Step 5: Dynamic Boundary Value Analysis & Fuzzing
  const bvaRes1 = await apiRequest(`/api/v2/adminaccess/courses/${targetId}`, {
    method: 'PUT',
    body: { price: -50 },
  });
  assert(bvaRes1.status === 200 || bvaRes1.status === 400, 'Negative price must be handled safely');
  if (bvaRes1.status === 200) {
    assert(bvaRes1.data.course.price > 0, 'Price must clamp to positive value');
  }
  console.log('    ✓ BVA: Negative price input handled safely without server crash');

  const bvaRes2 = await apiRequest(`/api/v2/adminaccess/courses/${targetId}`, {
    method: 'PUT',
    body: { price: 'invalid_price_abc' },
  });
  assert(bvaRes2.status === 200 || bvaRes2.status === 400, 'Invalid string price handled safely');
  console.log('    ✓ BVA: String price fuzzing handled safely');

  // Step 5.5: Admin updates imageUrl (data URI uploaded photo), duration, level, whatYouWillLearn & curriculum -> verify /api/courses/:id syncs
  const sampleImageUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const syllabusUpdate = [
    {
      moduleTitle: 'Dynamic Syllabus Module 1',
      duration: 'Week 1',
      lessons: ['Lesson A: Foundations', 'Lesson B: Case Study'],
    },
  ];
  const fullUpdateRes = await apiRequest(`/api/v2/adminaccess/courses/${targetId}`, {
    method: 'PUT',
    body: {
      imageUrl: sampleImageUri,
      duration: '6 Weeks Dynamic',
      level: 'Advanced',
      whatYouWillLearn: ['Master architecture', 'Ship projects'],
      curriculum: syllabusUpdate,
    },
  });
  assert.strictEqual(fullUpdateRes.status, 200, 'Full course details update must succeed');

  const detailRes = await apiRequest(`/api/courses/${targetId}`);
  assert.strictEqual(detailRes.status, 200, `GET /api/courses/${targetId} must return 200`);
  assert.strictEqual(detailRes.data.course.imageUrl, sampleImageUri, 'Uploaded imageUrl must persist to public course detail');
  assert.strictEqual(detailRes.data.course.duration, '6 Weeks Dynamic', 'Duration must persist');
  assert.strictEqual(detailRes.data.course.level, 'Advanced', 'Level must persist');
  assert.strictEqual(detailRes.data.course.curriculum[0].moduleTitle, 'Dynamic Syllabus Module 1', 'Curriculum module must persist');
  console.log('    ✓ Course photo upload (data URI), duration, level & curriculum synced to GET /api/courses/:id');

  // Step 6: Clean up & restore original price and defaults
  await apiRequest(`/api/v2/adminaccess/courses/${targetId}`, {
    method: 'PUT',
    body: {
      price: originalPrice,
      imageUrl: targetCourse.imageUrl || '',
      duration: targetCourse.duration || '',
      level: targetCourse.level || '',
      whatYouWillLearn: targetCourse.whatYouWillLearn || [],
      curriculum: targetCourse.curriculum || [],
    },
  });
  console.log(`    ✓ Reverted course price back to ₹${originalPrice}`);

  console.log('  ✅ Admin Pricing Dynamic Flow: ALL PASSED');
  return true;
}

module.exports = runAdminPricingFlowTests;

if (require.main === module) {
  runAdminPricingFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}
