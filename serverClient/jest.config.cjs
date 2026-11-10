const path = require('path');
const { createRequire } = require('module');

const clientRequire = createRequire(path.resolve(__dirname, '../client/package.json'));
const clientModules = path.resolve(__dirname, '../client/node_modules');

module.exports = {
  rootDir: __dirname,
  testEnvironment: clientRequire.resolve('jest-environment-jsdom'),
  testMatch: ['<rootDir>/src/__tests__/**/*.test.jsx'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setupTests.cjs'],
  moduleDirectories: [clientModules, 'node_modules'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__tests__/__mocks__/styleMock.js',
    '\\.(png|jpe?g|gif|svg|ico)$': '<rootDir>/src/__tests__/__mocks__/fileMock.js',
    '^react$': path.resolve(clientModules, 'react'),
    '^react-dom$': path.resolve(clientModules, 'react-dom'),
    '^react-dom/(.*)$': path.resolve(clientModules, 'react-dom/$1'),
    '^react/jsx-runtime$': path.resolve(clientModules, 'react/jsx-runtime'),
    '^react/jsx-dev-runtime$': path.resolve(clientModules, 'react/jsx-dev-runtime'),
    '^@mui/material$': path.resolve(clientModules, '@mui/material'),
    '^@mui/material/(.*)$': path.resolve(clientModules, '@mui/material/$1'),
    '^@mui/icons-material$': path.resolve(clientModules, '@mui/icons-material'),
    '^@mui/icons-material/(.*)$': path.resolve(clientModules, '@mui/icons-material/$1'),
    '^@emotion/react$': path.resolve(clientModules, '@emotion/react'),
    '^@emotion/styled$': path.resolve(clientModules, '@emotion/styled'),
    '^@testing-library/react$': path.resolve(clientModules, '@testing-library/react'),
    '^@testing-library/dom$': path.resolve(clientModules, '@testing-library/dom'),
  },
  transform: {
    '^.+\\.(js|jsx|mjs)$': [
      clientRequire.resolve('babel-jest'),
      {
        presets: [
          [clientRequire.resolve('@babel/preset-env'), { targets: { node: 'current' } }],
          [clientRequire.resolve('@babel/preset-react'), { runtime: 'automatic' }],
        ],
      },
    ],
  },
  transformIgnorePatterns: ['/node_modules/(?!(@mui|@emotion|lucide-react)/)'],
};

