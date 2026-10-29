const router = require('express').Router();
const {
  getNotes,
  getNoteContent,
  redeemSecretCode,
  adminUploadNote,
  adminUpdateNote,
  adminDeleteNote,
} = require('../controllers/noteController');
const { verifyFirebaseToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Public / Logged-in Note Endpoints (Must be logged in to access)
router.get('/', verifyFirebaseToken, getNotes);
router.get('/list', verifyFirebaseToken, getNotes);
router.get('/:noteId/content', verifyFirebaseToken, getNoteContent);
router.post('/:noteId/redeem-code', verifyFirebaseToken, redeemSecretCode);
router.post('/redeem-secret-code', verifyFirebaseToken, redeemSecretCode);

// Admin Management Endpoints (Upload up to 10MB in PDF / HTML, set Free or Paid, set Secret Code)
router.post('/admin/upload', verifyFirebaseToken, verifyAdmin, adminUploadNote);
router.put('/admin/:noteId', verifyFirebaseToken, verifyAdmin, adminUpdateNote);
router.delete('/admin/:noteId', verifyFirebaseToken, verifyAdmin, adminDeleteNote);

module.exports = router;

