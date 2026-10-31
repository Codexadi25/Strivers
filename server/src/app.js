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

// Server-Side React Lifeline Template Endpoints (React View Engine)
app.get(['/templates/lifeline', '/practice/lifeline', '/lifeline'], async (req, res) => {
  try {
    const q = req.query.q || req.query.orderId || req.query.email || '';
    const type = req.query.type || (req.query.orderId ? 'orderId' : (req.query.email ? 'email' : 'orderId'));

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

app.get(['/templates/lifeline/:sheetId', '/practice/sheets/:sheetId/template'], async (req, res) => {
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
    res.status(500).send(`Failed to render Lifeline Template: ${err.message}`);
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
