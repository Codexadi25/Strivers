const path = require('path');
const { createRequire } = require('module');
const { TextEncoder, TextDecoder } = require('util');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const clientRequire = createRequire(path.resolve(__dirname, '../../../client/package.json'));
const jestDomPath = path.dirname(clientRequire.resolve('@testing-library/jest-dom/package.json'));
require(jestDomPath);

