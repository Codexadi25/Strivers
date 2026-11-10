const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const secureContentRoutes = require('./routes/secureContentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const refundRoutes = require('./routes/refundRoutes');
const profileRoutes = require('./routes/profileRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const lifelineRoutes = require('./routes/lifelineRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const { createReactEngine } = require('./views/engine/reactEngine');

const app = express();

// Configure React.js View Engine on Server (Shifting away from legacy EJS)
app.engine('js', createReactEngine());
app.engine('jsx', createReactEngine());
app.set('views', path.join(__dirname, 'views/templates'));
app.set('view engine', 'js');

// Disable CSP so internal admin scripts, fonts, and styles load smoothly
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// Server Backend Admin GUI Static Assets with Cache-Busting for Live Development
const adminStaticPath = path.join(__dirname, '../public/admin');
app.use(
  '/admin',
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  },
  express.static(adminStaticPath, { etag: false, maxAge: 0 })
);

// Health check and warm-up endpoints
app.get(['/health', '/ping', '/api/v1/ping'], (req, res) => {
  res.status(200).json({ ok: true, status: 'UP', service: 'Strivers Backend Core' });
});

// API Route Mounts
app.use('/api', paymentRoutes);
app.use('/api/v1', paymentRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/practice', practiceRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/v1/orders', paymentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/secure', secureContentRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes);
app.use('/api/v1/lifeline', lifelineRoutes);
app.use('/api/lifeline', lifelineRoutes);

function normalizeSearchType(type, val = '') {
  const t = (type || '').toLowerCase().replace(/[-_]/g, '');
  if (t.includes('email')) return 'email';
  if (t.includes('cust') || t.includes('user')) return 'customerId';
  if (t.includes('phone') || t.includes('mobile') || t.includes('contact')) return 'phone';
  if (t.includes('txn') || t.includes('pay')) return 'txnId';
  if (t.includes('ref') || t.includes('rcpt') || t.includes('receipt')) return 'refId';
  if (t.includes('order')) return 'orderId';

  if (val && typeof val === 'string') {
    if (val.includes('@')) return 'email';
    if (val.startsWith('pay_')) return 'txnId';
    if (val.startsWith('rcpt_')) return 'refId';
    if (val.startsWith('order_')) return 'orderId';
  }

  return 'orderId';
}

function extractLifelineParams(req) {
  let paramType = req.params.searchParameter || req.query.type || '';
  let paramVal = req.params.value || req.query.value || req.query.q || '';

  // 1. Support ?=value (empty key in req.query when URL has ?=artisahu6880@gmail.com)
  if (!paramVal && req.query[''] !== undefined) {
    paramVal = req.query[''];
  }

  // 2. Support direct query keys (?email=..., ?orderId=..., etc.)
  if (!paramVal) {
    const knownKeys = [
      'email', 'orderid', 'order_id', 'order',
      'customerid', 'customer_id', 'customer', 'cust', 'userid', 'user_id', 'user',
      'phone', 'phoneno', 'phone_no', 'mobile', 'contact',
      'txnid', 'txn_id', 'txn', 'paymentid', 'payment_id', 'payment',
      'refid', 'ref_id', 'ref', 'receipt'
    ];
    for (const key of Object.keys(req.query)) {
      const lower = key.toLowerCase();
      if (knownKeys.includes(lower)) {
        paramVal = req.query[key];
        if (!paramType) paramType = key;
        break;
      }
    }
  }

  // 3. Raw URL fallback for ?= or ?value without key (e.g. /templates/lifeline/email?=artisahu6880@gmail.com)
  if (!paramVal && req.url.includes('?=')) {
    const parts = req.url.split('?=');
    if (parts[1]) {
      paramVal = parts[1].split('&')[0];
      try { paramVal = decodeURIComponent(paramVal); } catch (_) {}
    }
  } else if (!paramVal && req.url.includes('?')) {
    const rawQuery = req.url.split('?')[1];
    if (rawQuery && !rawQuery.includes('=')) {
      paramVal = rawQuery.split('&')[0];
      try { paramVal = decodeURIComponent(paramVal); } catch (_) {}
    }
  }

  const normalizedType = normalizeSearchType(paramType, paramVal);

  return {
    type: normalizedType,
    q: (paramVal || '').trim(),
  };
}

// Server-Side React Lifeline Template Endpoints (React View Engine)
const lifelineRoutePaths = [
  '/templates/lifeline/:searchParameter/:value',
  '/templates/lifeline/:searchParameter',
  '/templates/lifeline',
  '/lifeline/:searchParameter/:value',
  '/lifeline/:searchParameter',
  '/lifeline',
  '/practice/lifeline/:searchParameter/:value',
  '/practice/lifeline/:searchParameter',
  '/practice/lifeline',
];

app.get(lifelineRoutePaths, async (req, res) => {
  try {
    const searchParam = (req.params.searchParameter || '').toLowerCase();
    
    // Check if this route is requesting a practice sheet track (e.g. tech-dsa-striver-template)
    if (searchParam && (searchParam.startsWith('tech-') || searchParam.startsWith('non-tech-') || searchParam.startsWith('sheet-'))) {
      const PracticeSheet = require('./models/PracticeSheet');
      const sheet = await PracticeSheet.findOne({ sheetId: searchParam }).catch(() => null);
      if (sheet) {
        return res.render('LifelineTemplate', {
          sheet,
          initialQuery: { type: 'orderId', q: '' },
          user: {
            name: req.user?.name || 'Aditya Sahu',
            email: req.user?.email || 'creedracer111@gmail.com',
            watermark: `${req.user?.email || 'creedracer111@gmail.com'} | VERIFIED LIFELINE TRACK`,
          },
        });
      }
    }

    const { type, q } = extractLifelineParams(req);

    res.render('LifelineTemplate', {
      initialQuery: { type, q },
      user: {
        name: req.user?.name || 'Aditya Sahu',
        email: req.user?.email || 'creedracer111@gmail.com',
        watermark: `${req.user?.email || 'creedracer111@gmail.com'} | VERIFIED LIFELINE TRACK`,
      },
    });
  } catch (err) {
    res.status(500).send(`Failed to render Lifeline Template: ${err.message}`);
  }
});

app.get(['/practice/sheets/:sheetId/template', '/templates/sheets/:sheetId'], async (req, res) => {
  try {
    const PracticeSheet = require('./models/PracticeSheet');
    const sheet = await PracticeSheet.findOne({ sheetId: req.params.sheetId.toLowerCase() });
    res.render('LifelineTemplate', {
      sheet: sheet || null,
      initialQuery: { type: 'orderId', q: '' },
      user: {
        name: req.user?.name || 'Aditya Sahu',
        email: req.user?.email || 'creedracer111@gmail.com',
        watermark: `${req.user?.email || 'creedracer111@gmail.com'} | VERIFIED LIFELINE TRACK`,
      },
    });
  } catch (err) {
    res.status(500).send(`Failed to render Practice Sheet: ${err.message}`);
  }
});

// Admin GUI Single Page App Fallback
app.get(['/admin', '/admin/*'], (req, res, next) => {
  if (req.path.startsWith('/api/') || path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(adminStaticPath, 'index.html'));
});

// Root path redirects to Server Admin Control Center
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
