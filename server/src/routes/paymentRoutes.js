const router = require('express').Router();
const { createOrder, verifyPayment } = require('../controllers/paymentController');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

router.post('/create-order', verifyFirebaseToken, createOrder);
router.post('/create', verifyFirebaseToken, createOrder);
router.post('/verify-payment', verifyFirebaseToken, verifyPayment);
router.post('/verify', verifyFirebaseToken, verifyPayment);


module.exports = router;