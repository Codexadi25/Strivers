const assert = require('assert');
const CourseStore = require('../../src/utils/courseStore');

async function runCourseStoreUnitTests() {
  console.log('\n  🧪 [UNIT TEST] CourseStore In-Memory & File Persistence Tests');

  // Test 1: Initial Seed Data Integrity
  const courses = CourseStore.getAll();
  assert(Array.isArray(courses), 'CourseStore.getAll() must return an array');
  assert(courses.length >= 2, `Expected at least 2 seeded courses, got ${courses.length}`);
  console.log(`    ✓ CourseStore.getAll() returned ${courses.length} courses`);

  // Test 2: Find specific course by productId
  const testId = courses[0].productId;
  const cm = CourseStore.getById(testId);
  assert(cm !== null, `CourseStore.getById('${testId}') should not be null`);
  assert.strictEqual(cm.productId, testId, `productId must match ${testId}`);
  assert(typeof cm.price === 'number', 'Course price must be a number');
  assert(cm.priceInPaise === Math.round(cm.price * 100), 'priceInPaise must stay synchronized');
  console.log(`    ✓ CourseStore.getById('${testId}') verified: ₹${cm.price} (${cm.priceInPaise} paise)`);

  // Test 3: Dynamic Update & Persistence
  const originalPrice = cm.price;
  const testNewPrice = 149;
  const updated = CourseStore.update(testId, { price: testNewPrice });
  assert(updated !== null, 'Updated course should not be null');
  assert.strictEqual(updated.price, testNewPrice, 'Returned course price must be updated');
  assert.strictEqual(updated.priceInPaise, testNewPrice * 100, 'Paise must auto-recalculate');

  const refetched = CourseStore.getById(testId);
  assert.strictEqual(refetched.price, testNewPrice, 'Refetched course must have persisted price');
  console.log(`    ✓ CourseStore.update() correctly updated price to ₹${testNewPrice}`);

  // Boundary Value Analysis: negative price clamping
  const bvaNeg = CourseStore.update(testId, { price: -25 });
  assert(bvaNeg.price >= 1, 'Negative price must clamp safely >= ₹1');
  CourseStore.update(testId, { price: originalPrice });
  console.log(`    ✓ BVA negative price clamped & restored back to ₹${originalPrice}`);

  // Test 4: Dynamic Create Course
  const tempId = `temp_course_${Date.now()}`;
  const tempCourse = {
    productId: tempId,
    title: 'Dynamic Unit Test Bootcamp',
    price: 199,
    originalPrice: 999,
    category: 'course',
    badge: 'UNIT TEST',
    description: 'Testing persistence layer.',
    features: ['Test feature 1', 'Test feature 2'],
  };

  const created = CourseStore.create(tempCourse);
  assert(created !== null, 'Created course should not be null');
  assert.strictEqual(created.productId, tempId, 'Created course ID should match');
  assert.strictEqual(created.priceInPaise, 19900, 'Created course paise should match 19900');

  const fetchedCreated = CourseStore.getById(tempId);
  assert(fetchedCreated !== null, 'Should be able to get created course');
  assert.strictEqual(fetchedCreated.title, tempCourse.title, 'Created course title should match');
  console.log(`    ✓ CourseStore.create() added course '${tempId}'`);

  // Test 5: Delete / Soft Deactivation & Purge Cleanup
  const deleted = CourseStore.delete(tempId);
  assert.strictEqual(deleted, true, 'CourseStore.delete should return true');
  const fetchedDeleted = CourseStore.getById(tempId);
  assert.strictEqual(fetchedDeleted.isActive, false, 'Course should be marked inactive after delete');
  CourseStore.purge(tempId);
  assert.strictEqual(CourseStore.getById(tempId), null, 'Course must be gone after purge');
  console.log('    ✓ CourseStore.delete() & purge() cleaned up temporary course');

  // Test 6: Invalid ID Handling
  assert.strictEqual(CourseStore.getById('completely_non_existent_id_xyz_999'), null);
  assert.strictEqual(CourseStore.delete('non_existent_xyz'), false);
  console.log('    ✓ CourseStore edge cases handled cleanly');

  // Test 7: Public Catalog Formatter
  const formatted = CourseStore.formatPublic(cm);
  assert.strictEqual(formatted.productId, cm.productId, 'Public course must include productId');
  assert.strictEqual(formatted._id, cm.productId, 'Public course must alias _id');
  assert(Array.isArray(formatted.features), 'Public course must include features array');
  console.log('    ✓ CourseStore.formatPublic() maps catalog data correctly');

  console.log('  ✅ CourseStore Unit Tests: ALL PASSED (7/7 tests)');
  return true;
}

module.exports = runCourseStoreUnitTests;

if (require.main === module) {
  runCourseStoreUnitTests().catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });
}

