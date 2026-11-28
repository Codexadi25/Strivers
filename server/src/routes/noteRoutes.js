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

const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyFirebaseToken(req, res, next);
  }
  return next();
};

// Public & Logged-in Note Endpoints
router.get('/', optionalAuth, getNotes);
router.get('/list', optionalAuth, getNotes);
router.get('/:noteId/content', optionalAuth, getNoteContent);
router.post('/:noteId/redeem-code', optionalAuth, redeemSecretCode);
router.post('/redeem-secret-code', optionalAuth, redeemSecretCode);

// Admin Management Endpoints
router.post('/admin/upload', verifyFirebaseToken, verifyAdmin, adminUploadNote);
router.put('/admin/:noteId', verifyFirebaseToken, verifyAdmin, adminUpdateNote);
router.delete('/admin/:noteId', verifyFirebaseToken, verifyAdmin, adminDeleteNote);

module.exports = router;
