const path = require('path');
const { createRequire } = require('module');

const clientRequire = createRequire(path.resolve(__dirname, '../../client/package.json'));
const webpack = clientRequire('webpack');
const WebpackDevServer = clientRequire('webpack-dev-server');
const createConfig = require('../webpack.config.cjs');

const config = createConfig({}, { mode: 'development' });
const compiler = webpack(config);
const devServerOptions = {
  ...config.devServer,
  port: Number(process.env.PORT) || 5173,
  host: 'localhost',
  open: false,
};

const server = new WebpackDevServer(devServerOptions, compiler);

(async () => {
  try {
    await server.start();
    console.log(`[serverClient] Dev server running cleanly at http://localhost:${devServerOptions.port}`);
  } catch (err) {
    console.error('[serverClient dev server error]', err);
    process.exit(1);
  }
})();
