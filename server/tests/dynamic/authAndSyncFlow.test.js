const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');
const UserStore = require('../../src/utils/userStore');

async function runAuthAndSyncFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Auth Security, Route Renaming & Cross-App Sync');

  // 1. Verify /products route removal (404 across both Student & Admin v2 APIs)
  const legacyPublic = await apiRequest('/api/products');
  assert.strictEqual(legacyPublic.status, 404, `GET /api/products must return 404 after rename (got ${legacyPublic.status})`);
  const legacyV2 = await apiRequest('/api/v2/adminaccess/products');
  assert.strictEqual(legacyV2.status, 404, `GET /api/v2/adminaccess/products must return 404 (got ${legacyV2.status})`);
  console.log('    ✓ Confirmed legacy /api/products and /api/v2/adminaccess/products return 404');

  // 2. Verify unauthenticated requests are strictly rejected (no localhost auto-admin leak)
  const unauthMe = await apiRequest('/api/auth/me', { unauthenticated: true });
  assert.strictEqual(unauthMe.status, 401, `Unauthenticated GET /api/auth/me must return 401 (got ${unauthMe.status})`);

  const unauthProfile = await apiRequest('/api/v1/profile/me', { unauthenticated: true });
  assert.strictEqual(unauthProfile.status, 401, `Unauthenticated GET /api/v1/profile/me must return 401 (got ${unauthProfile.status})`);

  const unauthAdmin = await apiRequest('/api/v2/adminaccess/users', { unauthenticated: true });
  assert.strictEqual(unauthAdmin.status, 401, `Unauthenticated admin v2 route must return 401 (got ${unauthAdmin.status})`);
  console.log('    ✓ Confirmed unauthenticated student & admin endpoints reject with 401');

  // 3. Full Student Registration -> Auth/Me -> Profile/Me -> Progress -> Notes -> Logout flow
  const uniqueEmail = `qa.student.${Date.now()}@example.com`;
  try {
    const regRes = await apiRequest('/api/auth/register', {
      method: 'POST',
      headers: { 'x-admin-bypass': 'false' },
      body: {
        name: 'QA Dynamic Student',
        email: uniqueEmail,
        phone: '9876543210',
        password: 'Password123!',
      },
    });
    assert(regRes.status === 200 || regRes.status === 201, `Register should succeed (got ${regRes.status})`);
    assert(regRes.data?.token, 'Registration must return a JWT session token');
    const studentToken = regRes.data.token;

    const studentMe = await apiRequest('/api/auth/me', {
      headers: { Authorization: `Bearer ${studentToken}`, 'x-admin-bypass': 'false' },
    });
    assert.strictEqual(studentMe.status, 200, 'Signed-in student GET /api/auth/me must return 200');
    assert.strictEqual(studentMe.data?.user?.email, uniqueEmail, 'Auth user email must match signed-in student');
    assert.strictEqual(studentMe.data?.user?.name, 'QA Dynamic Student', 'Auth user name must match signed-in student');

    const studentProfile = await apiRequest('/api/v1/profile/me', {
      headers: { Authorization: `Bearer ${studentToken}`, 'x-admin-bypass': 'false' },
    });
    assert.strictEqual(studentProfile.status, 200, 'Signed-in student GET /api/v1/profile/me must return 200');
    assert.strictEqual(studentProfile.data?.profile?.email, uniqueEmail, 'Profile email must match signed-in student');

    const progressRes = await apiRequest('/api/v1/profile/progress', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}`, 'x-admin-bypass': 'false' },
      body: { solvedProblems: ['dsa-1-1', 'dsa-1-2'], starredProblems: ['dsa-1-1'] },
    });
    assert.strictEqual(progressRes.status, 200, 'Signed-in student progress sync must succeed');
    assert(
      Array.isArray(progressRes.data?.profile?.solvedProblems) &&
        progressRes.data.profile.solvedProblems.includes('dsa-1-2'),
      'Solved problem progress must persist in profile'
    );

    // Regular student MUST NOT access Admin v2 endpoints
    const studentToAdmin = await apiRequest('/api/v2/adminaccess/users', {
      headers: { Authorization: `Bearer ${studentToken}`, 'x-admin-bypass': 'false' },
    });
    assert.strictEqual(studentToAdmin.status, 403, `Regular student must receive 403 on admin API (got ${studentToAdmin.status})`);

    const logoutRes = await apiRequest('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken}`, 'x-admin-bypass': 'false' },
    });
    assert.strictEqual(logoutRes.status, 200, 'POST /api/auth/logout must succeed');
    console.log('    ✓ Student register -> /auth/me -> /profile/me -> /progress -> 403 admin block -> logout verified');
  } finally {
    UserStore.purgeByEmail(uniqueEmail);
  }

  // 4. Admin /api/v2/adminaccess Login + Invalid Credentials BVA + Logout
  const badAdminLogin = await apiRequest('/api/v2/adminaccess/auth/login', {
    method: 'POST',
    headers: { 'x-admin-bypass': 'false' },
    body: { email: 'creedracer111@gmail.com', password: 'wrongpassword' },
  });
  assert.strictEqual(badAdminLogin.status, 401, 'Wrong admin password must return 401');

  const adminLogin = await apiRequest('/api/v2/adminaccess/auth/login', {
    method: 'POST',
    headers: { 'x-admin-bypass': 'false' },
    body: { email: 'creedracer111@gmail.com', password: process.env.ADMIN_PASSWORD || 'admin123' },
  });
  assert.strictEqual(adminLogin.status, 200, 'Valid admin login must return 200');
  assert(adminLogin.data?.token, 'Admin login must return JWT token');
  const adminToken = adminLogin.data.token;

  const adminMe = await apiRequest('/api/v2/adminaccess/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
  });
  assert.strictEqual(adminMe.status, 200, 'Admin /auth/me must validate JWT');
  assert.strictEqual(adminMe.data?.user?.role, 'admin');

  // 5. Cross-App Synchronization: Catalog Meta (Admin -> Student /api/courses)
  const origMetaRes = await apiRequest('/api/v2/adminaccess/catalog-meta', {
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
  });
  assert.strictEqual(origMetaRes.status, 200);
  const originalCatalogMeta = origMetaRes.data.catalogMeta;

  try {
    const customHeroTitle = `Dynamic Sync Catalog Headline ${Date.now()}`;
    const updateMetaRes = await apiRequest('/api/v2/adminaccess/catalog-meta', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
      body: {
        ...originalCatalogMeta,
        hero: { ...(originalCatalogMeta.hero || {}), title: customHeroTitle },
      },
    });
    assert.strictEqual(updateMetaRes.status, 200);

    const publicCoursesRes = await apiRequest('/api/courses');
    assert.strictEqual(publicCoursesRes.status, 200, 'Student GET /api/courses must return 200');
    assert(Array.isArray(publicCoursesRes.data?.courses), 'Response must include courses array');
    assert.strictEqual(
      publicCoursesRes.data?.catalogMeta?.hero?.title,
      customHeroTitle,
      'Student /api/courses must immediately reflect Admin catalogMeta updates'
    );
    console.log('    ✓ Admin catalogMeta update immediately synchronized to Student /api/courses');
  } finally {
    await apiRequest('/api/v2/adminaccess/catalog-meta', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
      body: originalCatalogMeta,
    });
  }

  // 6. Cross-App Synchronization: Practice Sheets (Admin Create/Delete -> Student /api/practice/sheets)
  const createSheetRes = await apiRequest('/api/v2/adminaccess/practice', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
    body: {
      title: 'Dynamic QA Architecture Track',
      category: 'Engineering',
      roleType: 'tech',
      roleTag: 'QA Engineer',
      totalProblems: 10,
      companyTags: ['Atlassian', 'Google'],
    },
  });
  assert(createSheetRes.status === 200 || createSheetRes.status === 201);
  const createdSheetId = createSheetRes.data?.sheet?.sheetId || createSheetRes.data?.sheet?._id;
  assert(createdSheetId, 'Created practice sheet must return sheetId');

  try {
    const studentSheetsRes = await apiRequest('/api/practice/sheets');
    assert.strictEqual(studentSheetsRes.status, 200);
    const foundInStudent = (studentSheetsRes.data?.sheets || []).some(
      (s) => s.sheetId === createdSheetId || s._id === createdSheetId
    );
    assert(foundInStudent, 'Newly created practice sheet must immediately appear in Student /api/practice/sheets');
  } finally {
    await apiRequest(`/api/v2/adminaccess/practice/${encodeURIComponent(createdSheetId)}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
    });
  }
  console.log('    ✓ Practice sheet Admin create/delete synchronized with Student /api/practice/sheets');

  const adminLogout = await apiRequest('/api/v2/adminaccess/auth/logout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}`, 'x-admin-bypass': 'false' },
  });
  assert.strictEqual(adminLogout.status, 200);

  console.log('  ✅ Auth Security, Route Rename & Cross-App Sync: ALL PASSED');
  return true;
}

module.exports = runAuthAndSyncFlowTests;

if (require.main === module) {
  runAuthAndSyncFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}
