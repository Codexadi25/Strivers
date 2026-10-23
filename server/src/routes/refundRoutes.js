const router = require('express').Router();
const Payment = require('../models/Payment');
const ActivityLog = require('../models/ActivityLog');
const { verifyFirebaseToken, verifyAdmin } = require('../middlewares/authMiddleware');

const inMemoryRefunds = [];

// Apply authentication and admin verification to all refund routes
router.use(verifyFirebaseToken);
router.use(verifyAdmin);

// Get refundable orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Payment.find({ status: 'captured' }).sort('-createdAt').limit(20);
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch orders' });
  }
});

// List refunds
router.get('/', (req, res) => {
  res.json({ refunds: inMemoryRefunds });
});

// Create refund
router.post('/', async (req, res) => {

  try {
    const { orderId, type, reason, amount, bankDetails } = req.body;
    const payment = await Payment.findById(orderId).catch(() => null);

    const refundRecord = {
      _id: 'ref_' + Date.now(),
      orderId,
      user: { email: payment?.userEmail || req.user?.email || 'student@example.com' },
      userEmail: payment?.userEmail || req.user?.email || 'student@example.com',
      product: { title: payment?.planId || 'Strivers Masterclass' },
      amount: amount || (payment ? payment.amount * 100 : 2100),
      type: type || 'razorpay',
      status: 'processed',
      reason,
      razorpayRefundId: type === 'razorpay' ? `rfnd_dev_${Date.now()}` : null,
      bankDetailsMasked: bankDetails
        ? {
            bankName: bankDetails.bankName,
            ifsc: bankDetails.ifsc,
            accountLast4: bankDetails.accountNumber ? bankDetails.accountNumber.slice(-4) : 'XXXX',
          }
        : null,
      createdAt: new Date(),
    };

    inMemoryRefunds.unshift(refundRecord);

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PAYMENT_INIT',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Admin-Client',
      metaData: { action: 'REFUND_PROCESSED', refundId: refundRecord._id, orderId },
    });

    res.json({ success: true, refund: refundRecord });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process refund' });
  }
});

module.exports = router;
