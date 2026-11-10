const path = require('path');
const { spawnSync } = require('child_process');
const { createRequire } = require('module');

const projectRoot = path.resolve(__dirname, '..');

// 1. Run pure Node logic test suites first
const logicRun = spawnSync(process.execPath, [path.resolve(__dirname, '../src/__tests__/run_all_tests.js')], {
  cwd: projectRoot,
  stdio: 'inherit',
});

if (logicRun.status !== 0) {
  process.exit(logicRun.status || 1);
}

// 2. Run Jest + React Testing Library UI Component & Dynamic Flow Tests
const clientRequire = createRequire(path.resolve(__dirname, '../../client/package.json'));
const jestRunner = clientRequire('jest');

jestRunner
  .runCLI(
    {
      config: path.resolve(__dirname, '../jest.config.cjs'),
      runInBand: true,
    },
    [projectRoot]
  )
  .then(({ results }) => {
    process.exit(results && results.success ? 0 : 1);
  })
  .catch((err) => {
    console.error('[serverClient jest error]', err);
    process.exit(1);
  });
