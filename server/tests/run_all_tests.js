const { stopTestServer } = require('./helpers/testServer');
const runCourseStoreUnitTests = require('./unit/courseStore.test');
const runAdminPricingFlowTests = require('./dynamic/adminPricingFlow.test');
const runMasterclassDRMFlowTests = require('./dynamic/masterclassDRMFlow.test');
const runOrdersAndTicketsFlowTests = require('./dynamic/ordersAndTicketsFlow.test');
const runUserAccessFlowTests = require('./dynamic/userAccessFlow.test');
const runLifelineHubDynamicTests = require('./dynamic/lifelineHubDynamic.test');
const runTelemetryAuditFlowTests = require('./dynamic/telemetryAuditFlow.test');
const runAuthAndSyncFlowTests = require('./dynamic/authAndSyncFlow.test');

const suites = [
  { name: 'CourseStore Unit Persistence Tests', runner: runCourseStoreUnitTests },
  { name: 'Admin Course Pricing -> Public Storefront -> Order Creation Flow', runner: runAdminPricingFlowTests },
  { name: 'Masterclasses & DRM Protected Access Flow', runner: runMasterclassDRMFlowTests },
  { name: 'Orders Ledger & Support Dispute Tickets Flow', runner: runOrdersAndTicketsFlowTests },
  { name: 'User Access Control & Role Provisioning Flow', runner: runUserAccessFlowTests },
  { name: 'Lifeline Hub Investigation & High-Availability Dynamic Flow', runner: runLifelineHubDynamicTests },
  { name: 'Telemetry, Audit Logs & Platform Diagnostics Flow', runner: runTelemetryAuditFlowTests },
  { name: 'Auth Security, /courses Migration & Cross-App Sync', runner: runAuthAndSyncFlowTests },
];

async function runAll() {
  const startTime = Date.now();
  console.log('\n===============================================================');
  console.log('🚀 STRIVERS BACKEND & API SUITE - DYNAMIC UNIT & INTEGRATION RUNNER');
  console.log('===============================================================');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const suite of suites) {
    const sStart = Date.now();
    try {
      await suite.runner();
      const duration = Date.now() - sStart;
      passed++;
      results.push({ name: suite.name, status: 'PASSED', duration });
    } catch (err) {
      const duration = Date.now() - sStart;
      failed++;
      results.push({ name: suite.name, status: 'FAILED', duration, error: err.message });
      console.error(`\n❌ [FAILURE in ${suite.name}]:`, err);
    }
  }

  await stopTestServer();

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===============================================================');
  console.log('📊 TEST EXECUTION SUMMARY REPORT');
  console.log('===============================================================');
  results.forEach((r, idx) => {
    const symbol = r.status === 'PASSED' ? '✅' : '❌';
    console.log(`  ${symbol} [${idx + 1}/${suites.length}] ${r.name} (${r.duration}ms)`);
    if (r.error) {
      console.log(`     Error: ${r.error}`);
    }
  });

  console.log('---------------------------------------------------------------');
  console.log(`  Total Suites: ${suites.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`  Overall Success Rate: ${((passed / suites.length) * 100).toFixed(1)}%`);
  console.log(`  Total Duration: ${totalTime}s`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runAll().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});

