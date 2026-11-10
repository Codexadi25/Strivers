const path = require('path');
const { createRequire } = require('module');

const clientRequire = createRequire(path.resolve(__dirname, '../../client/package.json'));
const webpack = clientRequire('webpack');
const createConfig = require('../webpack.config.cjs');

const config = createConfig({}, { mode: 'production' });
const compiler = webpack(config);

compiler.run((err, stats) => {
  if (err) {
    console.error('[serverClient build error]', err);
    process.exit(1);
  }
  const info = stats.toJson({ colors: true });
  if (stats.hasErrors()) {
    console.error('[serverClient compilation errors]');
    info.errors.forEach((e) => console.error(e.message || e));
    process.exit(1);
  }
  if (stats.hasWarnings()) {
    info.warnings.forEach((w) => console.warn('[warning]', w.message || w));
  }
  console.log(stats.toString({ colors: true, chunks: false, modules: false }));
  compiler.close((closeErr) => {
    if (closeErr) {
      console.error(closeErr);
      process.exit(1);
    }
    process.exit(0);
  });
});
