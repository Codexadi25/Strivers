const router = require('express').Router();
const {
  logPaymentFailure,
  raiseTicket,
  trackTicket,
  getAdminTickets,
  updateAdminTicket,
  getTransactionAnalytics,
  getOrderTransactionDetails,
} = require('../controllers/ticketController');
const { verifyFirebaseToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Public / Student endpoints
router.post('/log-failure', logPaymentFailure);
router.post('/payments/log-failure', logPaymentFailure);
router.post('/raise', raiseTicket);
router.get('/track/:query', trackTicket);

// Admin Analytics & Order Txn Popup Details
router.get('/analytics/transactions', verifyFirebaseToken, getTransactionAnalytics);
router.get('/orders/:orderId/details', verifyFirebaseToken, getOrderTransactionDetails);

// Admin Ticket Management endpoints
router.get('/admin/list', verifyFirebaseToken, verifyAdmin, getAdminTickets);
router.get('/', verifyFirebaseToken, verifyAdmin, getAdminTickets);
router.patch('/admin/:id', verifyFirebaseToken, verifyAdmin, updateAdminTicket);
router.patch('/:id', verifyFirebaseToken, verifyAdmin, updateAdminTicket);

module.exports = router;
