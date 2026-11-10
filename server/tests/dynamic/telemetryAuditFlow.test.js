const assert = require('assert');
const { apiRequest, stopTestServer } = require('../helpers/testServer');

async function runTelemetryAuditFlowTests() {
  console.log('\n  🧪 [DYNAMIC INTEGRATION TEST] Telemetry, Audit Logs & Platform Diagnostics Flow');

  // Step 1: Telemetry Diagnostics Overview
  const teleRes = await apiRequest('/api/v2/adminaccess/telemetry');
  assert.strictEqual(teleRes.status, 200, 'GET /api/v2/adminaccess/telemetry must return 200');
  assert(teleRes.data && teleRes.data.telemetry, 'Telemetry response must include telemetry data');

  const tel = teleRes.data.telemetry;
  assert(tel.metrics, 'Telemetry must include metrics');
  assert(tel.memory, 'Telemetry must include memory diagnostics');
  assert(tel.gateway, 'Telemetry must include gateway details');
  assert(Array.isArray(tel.activities), 'Telemetry must include activities');

  assert(typeof tel.nodeVersion === 'string', 'Node.js version must be a string');
  assert(typeof tel.memory.heapUsedMB === 'string', 'Heap memory must be reported');
  assert(typeof tel.gateway.mode === 'string', 'Gateway mode must be reported');
  assert(tel.gateway.keyId, 'Gateway Key ID must be present');
  console.log(`    ✓ Telemetry Diagnostics verified: Node ${tel.nodeVersion}, Heap: ${tel.memory.heapUsedMB} MB, Gateway: ${tel.gateway.mode}`);
  console.log(`    ✓ System Metrics: Revenue ${tel.metrics.totalRevenue}, Success Txns: ${tel.metrics.successfulTxns}, Audit Logs: ${tel.metrics.auditLogsRecorded}`);

  // Step 2: Audit & Security Logs
  const auditRes = await apiRequest('/api/v2/adminaccess/audit-logs');
  assert.strictEqual(auditRes.status, 200, 'GET /api/v2/adminaccess/audit-logs must return 200');
  assert(auditRes.data && Array.isArray(auditRes.data.logs), 'Audit logs must be an array');
  assert(auditRes.data.logs.length > 0, 'Audit logs must have recorded activities');
  console.log(`    ✓ Audit Logs verified: ${auditRes.data.logs.length} immutable security events logged`);

  // Step 3: Practice Sheets & Tracks
  const practiceRes = await apiRequest('/api/v2/adminaccess/practice');
  assert.strictEqual(practiceRes.status, 200, 'GET /api/v2/adminaccess/practice must return 200');
  assert(practiceRes.data && Array.isArray(practiceRes.data.sheets), 'Practice sheets must be an array');
  console.log(`    ✓ Practice Tracks verified: ${practiceRes.data.sheets.length} curated tracks available`);

  // Step 4: Refunds Console Ledger
  const refundsRes = await apiRequest('/api/v2/adminaccess/refunds');
  assert.strictEqual(refundsRes.status, 200, 'GET /api/v2/adminaccess/refunds must return 200');
  assert(refundsRes.data && Array.isArray(refundsRes.data.refunds), 'Refunds must be an array');
  console.log(`    ✓ Refunds Console verified: ${refundsRes.data.refunds.length} refund records tracked`);

  console.log('  ✅ Telemetry, Audit & Platform Flow: ALL PASSED');
  return true;
}

module.exports = runTelemetryAuditFlowTests;

if (require.main === module) {
  runTelemetryAuditFlowTests()
    .then(() => stopTestServer())
    .catch((err) => {
      console.error('Test Failed:', err);
      stopTestServer().finally(() => process.exit(1));
    });
}
