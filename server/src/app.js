const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const paymentRoutes = require('./routes/paymentRoutes');
const secureContentRoutes = require('./routes/secureContentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const refundRoutes = require('./routes/refundRoutes');
const profileRoutes = require('./routes/profileRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const errorHandler = require('./middlewares/errorMiddleware');

const app = express();

// Disable CSP so internal admin scripts, fonts, and styles load smoothly
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));
app.use(morgan('dev'));

// Server Backend Admin GUI Static Assets
const adminStaticPath = path.join(__dirname, '../public/admin');
app.use('/admin', express.static(adminStaticPath));

// Health check and warm-up endpoints
app.get(['/health', '/ping', '/api/v1/ping'], (req, res) => {
  res.status(200).json({ ok: true, status: 'UP', service: 'Strivers Backend Core' });
});

// API Route Mounts
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/practice', practiceRoutes);
app.use('/api/v1/orders', paymentRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/refunds', refundRoutes);
app.use('/api/v1/secure', secureContentRoutes);
app.use('/api/v1/admin', adminRoutes);

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