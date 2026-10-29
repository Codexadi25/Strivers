const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { logPaymentFailure } = require('../controllers/ticketController');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

// Step 1 & Step 3: Core Razorpay Standard Checkout Endpoints
router.post('/create-order', verifyFirebaseToken, createOrder);
router.post('/verify-payment', verifyFirebaseToken, verifyPayment);

// Failure Diagnostics Logging
router.post('/log-failure', logPaymentFailure);
router.post('/payments/log-failure', logPaymentFailure);
router.post('/orders/log-failure', logPaymentFailure);

// Aliases for compatibility with existing frontend callers
router.post('/create', verifyFirebaseToken, createOrder);
router.post('/verify', verifyFirebaseToken, verifyPayment);
router.post('/orders/create-order', verifyFirebaseToken, createOrder);
router.post('/orders/create', verifyFirebaseToken, createOrder);
router.post('/orders/verify-payment', verifyFirebaseToken, verifyPayment);
router.post('/orders/verify', verifyFirebaseToken, verifyPayment);
router.post('/payments/create-order', verifyFirebaseToken, createOrder);
router.post('/payments/create', verifyFirebaseToken, createOrder);
router.post('/payments/verify-payment', verifyFirebaseToken, verifyPayment);
router.post('/payments/verify', verifyFirebaseToken, verifyPayment);

module.exports = router;
