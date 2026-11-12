const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const clientRequire = createRequire(path.resolve(__dirname, '../client/package.json'));
const webpack = clientRequire('webpack');
const HtmlWebpackPlugin = clientRequire('html-webpack-plugin');

const clientModules = path.resolve(__dirname, '../client/node_modules');

function loadEnvVariables(isProd) {
  const mode = isProd ? 'production' : 'development';
  const envFiles = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];
  const resolved = {};

  for (const file of envFiles) {
    const filePath = path.resolve(__dirname, file);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, 'utf8');
    raw.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      resolved[key] = val;
    });
  }

  const pick = (key) => {
    if (process.env[key] !== undefined) return process.env[key];
    return resolved[key] || '';
  };

  return {
    'process.env.NODE_ENV': JSON.stringify(mode),
    'process.env.VITE_API_BASE_URL': JSON.stringify(pick('VITE_API_BASE_URL')),
    'process.env.REACT_APP_API_BASE_URL': JSON.stringify(pick('REACT_APP_API_BASE_URL')),
    'process.env.VITE_FIREBASE_API_KEY': JSON.stringify(pick('VITE_FIREBASE_API_KEY')),
    'process.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(pick('VITE_FIREBASE_AUTH_DOMAIN')),
    'process.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(pick('VITE_FIREBASE_PROJECT_ID')),
    'process.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(pick('VITE_FIREBASE_STORAGE_BUCKET')),
    'process.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(pick('VITE_FIREBASE_MESSAGING_SENDER_ID')),
    'process.env.VITE_FIREBASE_APP_ID': JSON.stringify(pick('VITE_FIREBASE_APP_ID')),
    'process.env.VITE_FIREBASE_MEASUREMENT_ID': JSON.stringify(pick('VITE_FIREBASE_MEASUREMENT_ID')),
  };
}

module.exports = (env, argv) => {
  const isProd = argv && argv.mode === 'production';

  return {
    mode: isProd ? 'production' : 'development',
    devtool: isProd ? false : 'eval-cheap-module-source-map',
    entry: path.resolve(__dirname, 'src/main.jsx'),
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProd ? 'assets/index.[contenthash].js' : 'assets/index.js',
      publicPath: '/',
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.jsx', '.json'],
      modules: [clientModules, path.resolve(__dirname, 'node_modules'), 'node_modules'],
      alias: {
        react: path.resolve(clientModules, 'react'),
        'react-dom': path.resolve(clientModules, 'react-dom'),
        'react/jsx-runtime': path.resolve(clientModules, 'react/jsx-runtime'),
        'react/jsx-dev-runtime': path.resolve(clientModules, 'react/jsx-dev-runtime'),
        '@mui/material': path.resolve(clientModules, '@mui/material'),
        '@mui/icons-material': path.resolve(clientModules, '@mui/icons-material'),
        '@emotion/react': path.resolve(clientModules, '@emotion/react'),
        '@emotion/styled': path.resolve(clientModules, '@emotion/styled'),
      },
    },
    resolveLoader: {
      modules: [clientModules, path.resolve(__dirname, 'node_modules'), 'node_modules'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|mjs)$/,
          exclude: /node_modules/,
          use: {
            loader: clientRequire.resolve('babel-loader'),
            options: {
              presets: [
                [clientRequire.resolve('@babel/preset-env'), { targets: { browsers: ['last 2 versions'] } }],
                [clientRequire.resolve('@babel/preset-react'), { runtime: 'automatic' }],
              ],
            },
          },
        },
        {
          test: /\.css$/,
          use: [
            clientRequire.resolve('style-loader'),
            { loader: clientRequire.resolve('css-loader'), options: { sourceMap: false } },
          ],
        },
        {
          test: /\.(png|jpe?g|gif|svg|ico)$/i,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new webpack.DefinePlugin(loadEnvVariables(isProd)),
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'public/index.html'),
        favicon: path.resolve(__dirname, 'public/favicon.ico'),
        inject: 'body',
      }),
    ],
    devServer: {
      static: path.resolve(__dirname, 'public'),
      port: 5173,
      host: 'localhost',
      hot: true,
      open: false,
      historyApiFallback: {
        disableDotRule: true,
        rewrites: [
          { from: /^\/api/, to: (context) => context.parsedUrl.pathname },
        ],
      },
      allowedHosts: 'all',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      proxy: [
        {
          context: ['/api'],
          target: 'http://127.0.0.1:8080',
          changeOrigin: true,
          secure: false,
        },
      ],
    },
    performance: {
      hints: false,
    },
  };
};
