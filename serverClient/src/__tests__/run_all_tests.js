import { runPricingLogicTests } from './pricingLogic.test.js';
import { runLifelineInvestigatorTests } from './lifelineInvestigator.test.js';
import { runOrdersAnalyticsTests } from './ordersAnalytics.test.js';

const suites = [
  { name: 'Pricing Engine & Dynamic Discount Logic', runner: runPricingLogicTests },
  { name: 'Lifeline Investigation Engine & Fallback Logic', runner: runLifelineInvestigatorTests },
  { name: 'Orders Ledger & PG Failure Analytics Logic', runner: runOrdersAnalyticsTests },
];

async function runAll() {
  const startTime = Date.now();
  console.log('\n===============================================================');
  console.log('🚀 SERVERCLIENT WEBAPP - DYNAMIC UNIT & LOGIC TEST SUITE');
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

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n===============================================================');
  console.log('📊 SERVERCLIENT TEST SUMMARY REPORT');
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

