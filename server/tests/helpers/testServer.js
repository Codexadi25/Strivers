process.env.NODE_ENV = 'test';
const { Readable } = require('stream');
const EventEmitter = require('events');
const app = require('../../src/app');
const { signSessionToken } = require('../../src/utils/token');

function createTestToken(user = {}) {
  return signSessionToken({
    uid: user.uid || 'test_user_123',
    email: user.email || 'student.test@example.com',
    role: user.role || 'user',
  });
}

function createMockReq(options) {
  const method = (options.method || 'GET').toUpperCase();
  const url = options.path || '/';
  const headers = {
    'content-type': 'application/json',
    ...(options.unauthenticated ? {} : { 'x-admin-bypass': 'true' }),
    host: 'localhost',
    ...(options.headers || {}),
  };

  // If no authorization header provided, create default test token (unless testing unauthenticated flow)
  if (!options.unauthenticated && !headers.authorization && !headers.Authorization) {
    headers.authorization = `Bearer ${createTestToken(options.user || {})}`;
  }

  const bodyStr = options.body
    ? typeof options.body === 'string'
      ? options.body
      : JSON.stringify(options.body)
    : '';

  if (bodyStr && !headers['content-length']) {
    headers['content-length'] = Buffer.byteLength(bodyStr);
  }

  const req = new Readable({
    read() {
      if (bodyStr) {
        this.push(bodyStr);
      }
      this.push(null);
    },
  });

  const mockSocket = new EventEmitter();
  mockSocket.remoteAddress = '127.0.0.1';
  mockSocket.remotePort = 54321;
  mockSocket.encrypted = false;
  mockSocket.destroy = () => {};
  mockSocket.end = () => {};
  mockSocket.write = () => true;

  req.method = method;
  req.url = url;
  req.originalUrl = url;
  req.baseUrl = '';
  req.path = url.split('?')[0];
  req.headers = headers;
  req.rawHeaders = Object.entries(headers).flat();
  req.ip = '127.0.0.1';
  req.hostname = 'localhost';
  req.connection = mockSocket;
  req.socket = mockSocket;
  req.httpVersion = '1.1';
  req.httpVersionMajor = 1;
  req.httpVersionMinor = 1;

  return req;
}

function createMockRes(resolve) {
  const res = new EventEmitter();
  let chunks = [];
  const headers = {};

  res.statusCode = 200;
  res.headersSent = false;

  res.setHeader = function (name, value) {
    headers[name.toLowerCase()] = value;
  };
  res.getHeader = function (name) {
    return headers[name.toLowerCase()];
  };
  res.getHeaders = function () {
    return { ...headers };
  };
  res.hasHeader = function (name) {
    return headers[name.toLowerCase()] !== undefined;
  };
  res.removeHeader = function (name) {
    delete headers[name.toLowerCase()];
  };

  res.writeHead = function (status, reason, hdrs) {
    res.statusCode = status;
    const h = typeof reason === 'object' ? reason : hdrs;
    if (h) {
      Object.entries(h).forEach(([k, v]) => res.setHeader(k, v));
    }
    return res;
  };

  res.write = function (chunk) {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return true;
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    res.headersSent = true;

    const rawBody = Buffer.concat(chunks).toString('utf8');
    const contentType = headers['content-type'] || '';
    let data = rawBody;

    if (contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawBody);
      } catch (e) {
        data = rawBody;
      }
    }

    resolve({
      status: res.statusCode,
      ok: res.statusCode >= 200 && res.statusCode < 300,
      headers: headers,
      data,
      text: rawBody,
    });
  };

  return res;
}

async function apiRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const req = createMockReq({ path, ...options });
      const res = createMockRes(resolve);

      app.handle(req, res, (err) => {
        if (err) return reject(err);
        if (!res.headersSent) {
          resolve({
            status: 404,
            ok: false,
            headers: {},
            data: { success: false, message: 'Not found' },
            text: '',
          });
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

async function startTestServer() {
  return { baseUrl: 'in-process' };
}

async function stopTestServer() {
  return Promise.resolve();
}

module.exports = {
  apiRequest,
  createTestToken,
  startTestServer,
  stopTestServer,
};
