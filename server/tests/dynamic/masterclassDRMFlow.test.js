const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runMasterclassDRMFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Masterclasses & DRM Protected Access Flow');

  // Step 1: Fetch masterclasses via Admin API
  const listRes = await apiRequest('/api/v2/adminaccess/masterclasses');
  assert.strictEqual(listRes.status, 200, 'GET /api/v2/adminaccess/masterclasses must return 200');
  assert(listRes.data && Array.isArray(listRes.data.masterclasses), 'Response must include masterclasses array');
  const masterclasses = listRes.data.masterclasses;
  assert(masterclasses.length > 0, 'Must have at least one masterclass');
  console.log(`    ✓ Fetched ${masterclasses.length} live masterclasses from backend`);

  const targetMc = masterclasses[0];
  const targetId = targetMc.productId;
  console.log(`    ℹ Testing Masterclass: '${targetMc.title}' (ID: ${targetId})`);

  // Step 2: Dynamic Meeting Link Update
  const newMeetingLink = 'https://meet.google.com/dynamic-test-session';
  const newMeetingCode = 'dynamic-test-session';
  const newSecretPasscode = 'SECURETEST2026';

  const updateMeetingRes = await apiRequest(`/api/v2/adminaccess/masterclasses/${targetId}/meeting`, {
    method: 'PUT',
    body: {
      meetingLink: newMeetingLink,
      meetingCode: newMeetingCode,
      secretPasscode: newSecretPasscode,
    },
  });

  assert.strictEqual(updateMeetingRes.status, 200, 'PUT /meeting must return 200');
  assert(updateMeetingRes.data && updateMeetingRes.data.success, 'Update must be successful');
  console.log('    ✓ Dynamic meeting link updated to:', newMeetingLink);

  // Step 3: Verify meeting link update in subsequent list fetch
  const verifyListRes = await apiRequest('/api/v2/adminaccess/masterclasses');
  const updatedItem = verifyListRes.data.masterclasses.find((m) => m.productId === targetId);
  assert(updatedItem, 'Updated masterclass must exist in list');
  assert.strictEqual(updatedItem.activeMeetingLink, newMeetingLink, 'Active meeting link must match new URL');
  assert.strictEqual(updatedItem.meetingCode, newMeetingCode, 'Meeting code must match');
  console.log('    ✓ Masterclasses list accurately returned updated Google Meet details');

  // Step 4: Add DRM Study Material (PDF / Cheatsheet)
  const materialPayload = {
    title: 'Dynamic Testing & Security Cheatsheet (Automated)',
    fileType: 'pdf',
    drmLevel: 'HIGH_SECURITY',
  };

  const addMaterialRes = await apiRequest(`/api/v2/adminaccess/masterclasses/${targetId}/materials`, {
    method: 'POST',
    body: materialPayload,
  });

  assert.strictEqual(addMaterialRes.status, 200, 'POST /materials must return 200');
  assert(addMaterialRes.data && addMaterialRes.data.success, 'Adding material must succeed');
  assert(addMaterialRes.data.materialsCount >= 1, 'Materials count must increase');
  console.log(`    ✓ DRM material attached to session. New materials count: ${addMaterialRes.data.materialsCount}`);

  // Step 5: Add Live Timing Slot
  const slotPayload = {
    dateTime: 'Sunday, 22 Nov 2026 - 11:00 AM IST (Aditya & Lead Mentors)',
    capacity: 150,
  };

  const addSlotRes = await apiRequest(`/api/v2/adminaccess/masterclasses/${targetId}/slots`, {
    method: 'POST',
    body: slotPayload,
  });

  assert.strictEqual(addSlotRes.status, 200, 'POST /slots must return 200');
  assert(addSlotRes.data && addSlotRes.data.success, 'Adding timing slot must succeed');
  console.log(`    ✓ Live timing slot added: '${slotPayload.dateTime}'`);

  console.log('  ✅ Masterclass & DRM Dynamic Flow: ALL PASSED');
  return true;
}

module.exports = runMasterclassDRMFlowTests;

if (require.main === module) {
  runMasterclassDRMFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}

