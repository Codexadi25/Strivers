const admin = require('../config/firebaseAdmin');
const UserAccess = require('../models/UserAccess');
const { verifySessionToken } = require('../utils/token');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split('Bearer ')[1].trim();
    if (!token) {
      req.user = null;
      return next();
    }

    // 1. Check native session token (signed via HMAC-SHA256)
    const sessionPayload = verifySessionToken(token);
    if (sessionPayload) {
      let userDoc = null;
      if (require('mongoose').connection.readyState === 1) {
        try {
          userDoc = await UserAccess.findOne({
            $or: [{ userId: sessionPayload.uid }, { email: sessionPayload.email }],
          }).maxTimeMS(2000);
        } catch (_) {}
      }
      const role =
        userDoc?.role ||
        (sessionPayload.email === process.env.ADMIN_EMAIL ? 'admin' : sessionPayload.role || 'user');

      req.user = {
        uid: sessionPayload.uid || userDoc?.userId || 'usr_session',
        email: sessionPayload.email,
        role,
        isAdmin: role === 'admin',
      };
      return next();
    }

    // 2. Check Firebase ID token if Firebase Admin is configured
    const isFirebaseConfigured = admin.apps && admin.apps.length > 0;
    if (isFirebaseConfigured) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const userDoc = await UserAccess.findOne({
          $or: [{ userId: decodedToken.uid }, { email: decodedToken.email }],
        });
        const role =
          userDoc?.role ||
          (decodedToken.email === process.env.ADMIN_EMAIL ? 'admin' : 'user');

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          role,
          isAdmin: role === 'admin',
        };
        return next();
      } catch (fbErr) {
        // Fall through to invalid token error
      }
    }

    // If token was provided but invalid/expired:
    req.user = null;
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session. Please sign in again.',
    });
  } catch (error) {
    req.user = null;
    return res.status(401).json({
      success: false,
      message: 'Authentication verification failed.',
    });
  }
};

const verifyAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in to access the Admin Portal.',
    });
  }

  // Double check current role from database
  const userDoc = await UserAccess.findOne({
    $or: [{ userId: req.user.uid }, { email: req.user.email }],
  });

  const role = userDoc?.role || req.user.role;
  const isEnvAdmin = req.user.email && req.user.email === process.env.ADMIN_EMAIL;

  if (role === 'admin' || isEnvAdmin || req.user.isAdmin) {
    req.user.role = 'admin';
    req.user.isAdmin = true;
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Admin access required. Only users with the admin role have access to this portal.',
  });
};

module.exports = { verifyFirebaseToken, verifyAdmin };