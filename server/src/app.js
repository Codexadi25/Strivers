const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const paymentRoutes = require('./routes/paymentRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const secureContentRoutes = require('./routes/secureContentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const refundRoutes = require('./routes/refundRoutes');
const profileRoutes = require('./routes/profileRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const noteRoutes = require('./routes/noteRoutes');
const adminAccessV2Routes = require('./routes/adminAccessV2Routes');
const errorHandler = require('./middlewares/errorMiddleware');
const app = express();

// Register express-react-views JSX template engine
app.engine('jsx', require('express-react-views').createEngine());
app.set('view engine', 'jsx');
app.set('views', path.join(__dirname, 'views'));

// Disable CSP so internal admin scripts, fonts, and styles load smoothly
app.use(helmet({ contentSecurityPolicy: false }));

// Robust CORS with all methods and custom bypass headers
const corsOptions = {
  origin: (origin, callback) => callback(null, true),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-bypass', 'x-requested-with', 'Accept', 'Origin'],
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// Basic Server Admin Console Static Assets (User Access, Security Logs, Telemetry only)
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

// Shifted serverClient GUI Static Assets (Lifeline Hub, Pricing, Masterclasses, Orders, etc.)
const serverClientStaticPath = path.join(__dirname, '../../serverClient/dist');
app.use(
  ['/serverclient', '/gui'],
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  },
  express.static(serverClientStaticPath, { etag: false, maxAge: 0 })
);

// Assets folder for serverClient bundle
app.use('/assets', express.static(path.join(serverClientStaticPath, 'assets')));

// Health check and warm-up endpoints
app.get(['/health', '/ping', '/api/v1/ping', '/api/ping'], (req, res) => {
  res.status(200).json({ ok: true, status: 'UP', service: 'Strivers Backend Core' });
});

// =========================================================================
// 1. SECURED USER ACCESS & CLIENT WEBSITE APIS (/api/...)
// =========================================================================
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', paymentRoutes);
app.use('/api/secure', secureContentRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/refunds', refundRoutes);

// Direct checkout aliases for compatibility
app.post('/api/create-order', paymentRoutes);
app.post('/api/verify-payment', paymentRoutes);

// Backward-compatibility aliases for legacy /api/v1/... callers
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/orders', paymentRoutes);
app.use('/api/v1/secure', secureContentRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/practice', practiceRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1', adminRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/v1', paymentRoutes);

// =========================================================================
// 2. ADMIN ACCESS & SERVERCLIENT MANAGEMENT APIS (/api/v2/...)
// =========================================================================
app.use('/api/v2/adminaccess', adminAccessV2Routes);
app.use('/api/v2', adminAccessV2Routes);

// Sample route to verify Server-Side JSX rendering with express-react-views
app.get('/test-jsx', (req, res) => {
  res.render('index', { title: 'Hello World' });
});

// Basic Admin GUI Single Page App Fallback
app.get(['/admin', '/admin/*'], (req, res, next) => {
  if (req.path.startsWith('/api/') || path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(adminStaticPath, 'index.html'));
});

// serverClient GUI Single Page App Fallback
app.get(['/serverclient', '/serverclient/*', '/gui', '/gui/*'], (req, res, next) => {
  if (req.path.startsWith('/api/') || path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(serverClientStaticPath, 'index.html'));
});

// Root path redirects to Server Admin Control Center
app.get('/', (req, res) => {
  res.redirect('/admin');
});

// Unmatched API routes return clean JSON 404
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
