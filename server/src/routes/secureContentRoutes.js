const router = require('express').Router();
const { getGatedContent, logBreachAttempt } = require('../controllers/secureContentController');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { contentLimiter } = require('../middlewares/rateLimiter');

router.get('/data', verifyFirebaseToken, contentLimiter, getGatedContent);
router.post('/log-breach', verifyFirebaseToken, logBreachAttempt);

module.exports = router;