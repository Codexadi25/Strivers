const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runUserAccessFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] User Access Control & Permissions Dynamic Flow');

  // Step 1: Fetch list of users
  const usersRes = await apiRequest('/api/v2/adminaccess/users');
  assert.strictEqual(usersRes.status, 200, 'GET /api/v2/adminaccess/users must return 200');
  assert(usersRes.data && Array.isArray(usersRes.data.users), 'Response must include users array');
  const users = usersRes.data.users;
  assert(users.length > 0, 'Users list must not be empty');
  assert(!users.some((u) => u.email === 'admin@yourdomain.com' || u.userId === 'usr_admin_001'), 'Deprecated admin@yourdomain.com (usr_admin_001) must be removed');
  console.log(`    ✓ Fetched user directory: ${users.length} registered accounts (usr_admin_001 absent)`);

  const targetUser = users[0];
  const targetId = targetUser.userId || targetUser._id;
  const initialRole = targetUser.role;
  const initialSubscription = targetUser.hasActiveSubscription;
  console.log(`    ℹ Target User: ${targetUser.email} (Role: ${initialRole}, Subscribed: ${initialSubscription})`);

  // Step 2: Promote / Update User Role and Subscription
  const newRole = initialRole === 'admin' ? 'student' : 'admin';
  const newSubscription = !initialSubscription;

  const updateRes = await apiRequest(`/api/v2/adminaccess/users/${encodeURIComponent(targetId)}`, {
    method: 'PUT',
    body: {
      role: newRole,
      hasActiveSubscription: newSubscription,
      status: 'Active',
    },
  });

  assert.strictEqual(updateRes.status, 200, 'PUT /api/v2/adminaccess/users/:id must return 200');
  assert(updateRes.data && updateRes.data.success, 'Update response must report success');
  console.log(`    ✓ User access updated: role -> ${newRole}, subscription -> ${newSubscription}`);

  // Step 3: Verify the changes are reflected on subsequent fetch
  const verifyRes = await apiRequest('/api/v2/adminaccess/users');
  const refetchedUser = verifyRes.data.users.find((u) => u.userId === targetId || u._id === targetId);
  assert(refetchedUser, 'Updated user must exist in list');
  assert.strictEqual(refetchedUser.role, newRole, `Role must be updated to ${newRole}`);
  assert.strictEqual(refetchedUser.hasActiveSubscription, newSubscription, 'Subscription status must be updated');
  console.log('    ✓ Re-fetched user verified with new permissions');

  // Step 4: Revert user permissions back
  await apiRequest(`/api/v2/adminaccess/users/${encodeURIComponent(targetId)}`, {
    method: 'PUT',
    body: {
      role: initialRole,
      hasActiveSubscription: initialSubscription,
    },
  });
  console.log(`    ✓ Reverted user permissions back to ${initialRole}`);

  // Step 5: Test DELETE /api/v2/adminaccess/users/:id using a temporary registered account
  const tempEmail = `delete_probe_${Date.now()}@example.com`;
  const regRes = await apiRequest('/api/auth/register', {
    method: 'POST',
    unauthenticated: true,
    body: { name: 'Temp User', email: tempEmail, password: 'Password123!' },
  });
  assert(regRes.status === 200 || regRes.status === 201, 'Temporary student must register cleanly');
  const delRes = await apiRequest(`/api/v2/adminaccess/users/${encodeURIComponent(tempEmail)}`, {
    method: 'DELETE',
  });
  assert.strictEqual(delRes.status, 200, 'DELETE /api/v2/adminaccess/users/:id must succeed');
  const afterDel = await apiRequest('/api/v2/adminaccess/users');
  assert(!afterDel.data.users.some((u) => u.email === tempEmail), 'Deleted user must be absent from directory');
  console.log('    ✓ Verified DELETE /api/v2/adminaccess/users/:id removes account cleanly');

  console.log('  ✅ User Access Control Dynamic Flow: ALL PASSED');
  return true;
}

module.exports = runUserAccessFlowTests;

if (require.main === module) {
  runUserAccessFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}

