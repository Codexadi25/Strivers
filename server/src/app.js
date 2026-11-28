const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

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
const integrationRoutes = require('./routes/integrationRoutes');
const errorHandler = require('./middlewares/errorMiddleware');
const app = express();

// Trust reverse proxies (Vercel, Cloudflare, Firebase) for correct client IP detection
app.set('trust proxy', 1);

// Register express-react-views JSX template engine
app.engine('jsx', require('express-react-views').createEngine());
app.set('view engine', 'jsx');
app.set('views', path.join(__dirname, 'views'));

// Disable CSP so internal admin scripts, fonts, and styles load smoothly
app.use(helmet({ contentSecurityPolicy: false }));

// Strict production-grade CORS policy
const allowedOrigins = [
  'https://job-strivers.web.app',
  'https://externalstrivers.web.app',
  'https://strivers-amber.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:8080',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (server-to-server calls, curl, Postman, mobile webviews)
    if (!origin) return callback(null, true);

    const isExplicitAllowed = allowedOrigins.includes(origin);
    const isDomainAllowed =
      origin.endsWith('.web.app') ||
      origin.endsWith('.firebaseapp.com') ||
      origin.endsWith('.vercel.app');

    if (isExplicitAllowed || isDomainAllowed) {
      return callback(null, true);
    }

    // Disallow unauthorized origins cleanly (browser will block response without server 500 error)
    return callback(null, false);
  },
  credentials: true,
  maxAge: 86400,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-bypass', 'x-requested-with', 'Accept', 'Origin'],
};
app.use(cors(corsOptions));
app.options('*', (req, res) => {
  res.setHeader('Access-Control-Max-Age', '86400');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendStatus(204);
});

// Production Rate Limiting
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 attempts per 15 minutes to prevent brute-force attacks
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please wait 15 minutes before trying again.',
  },
});

const integrationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Max 60 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Integration API rate limit exceeded. Please wait a moment.',
  },
});

// Apply rate limiters
app.use(['/api/auth/login', '/api/v2/adminaccess/login', '/api/v1/auth/login'], authLimiter);
app.use('/api/v2/integration', integrationLimiter);
app.use('/api', generalApiLimiter);

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Only log HTTP requests in local development to save serverless CPU cycles and log quotas
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Serverless / Cold-Start MongoDB Connection Assurance Middleware
let lastConnectAttempt = 0;
app.use(async (req, res, next) => {
  const now = Date.now();
  if (mongoose.connection.readyState !== 1 && (now - lastConnectAttempt > 30000)) {
    lastConnectAttempt = now;
    try {
      await connectDB();
    } catch (e) {
      // Non-blocking fallback handled by db.js
    }
  }
  next();
});

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
if (fs.existsSync(serverClientStaticPath)) {
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
} else {
  // Graceful fallback for standalone serverless deployment (Vercel) where serverClient is hosted on Firebase
  app.get(['/serverclient', '/gui', '/serverclient/*', '/gui/*'], (req, res) => {
    res.redirect('https://externalstrivers.web.app');
  });
}

// Health check and warm-up endpoints with Edge CDN caching (prevents cold-boot spam)
app.get(['/health', '/ping', '/api/v1/ping', '/api/ping'], (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
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
app.use('/api/v2/integration', integrationRoutes);
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
