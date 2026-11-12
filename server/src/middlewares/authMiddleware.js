const mongoose = require('mongoose');
const admin = require('../config/firebaseAdmin');
const UserAccess = require('../models/UserAccess');
const UserStore = require('../utils/userStore');
const { verifySessionToken } = require('../utils/token');

/**
 * Extracts and verifies Bearer session or Firebase ID tokens.
 * Never auto-authenticates unauthenticated browser traffic on localhost so Login & Sign Out stay accurate.
 */
const verifyFirebaseToken = async (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Test-harness-only bypass for automated backend Admin API integration suites
  const isAutomatedAdminTestBypass =
    process.env.NODE_ENV === 'test' &&
    req.headers['x-admin-bypass'] === 'true' &&
    !String(req.originalUrl || '').startsWith('/api/auth');

  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    let token = '';

    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      token = authHeader.split('Bearer ')[1].trim();
    }

    if (!token || token === 'null' || token === 'undefined') {
      if (isAutomatedAdminTestBypass) {
        req.user = {
          uid: 'admin_test_runner',
          email: process.env.ADMIN_EMAIL || 'creedracer111@gmail.com',
          role: 'admin',
          isAdmin: true,
        };
        return next();
      }
      req.user = null;
      return next();
    }

    // 1. Verify HMAC-SHA256 Strivers Session Token
    const sessionPayload = verifySessionToken(token);
    if (sessionPayload) {
      let userDoc = null;
      if (mongoose.connection.readyState === 1) {
        try {
          userDoc = await UserAccess.findOne({
            $or: [{ userId: sessionPayload.uid }, { email: sessionPayload.email }],
          }).maxTimeMS(1500);
        } catch (_) {}
      }
      if (!userDoc && sessionPayload.email) {
        userDoc = UserStore.findRaw(sessionPayload.email);
      }

      const envAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
      const role =
        userDoc?.role ||
        (envAdmin && sessionPayload.email?.toLowerCase() === envAdmin ? 'admin' : sessionPayload.role || 'user');

      req.user = {
        uid: sessionPayload.uid || userDoc?.userId || 'usr_session',
        email: sessionPayload.email,
        name: userDoc?.name || sessionPayload.email?.split('@')[0] || 'Student',
        role,
        isAdmin: role === 'admin',
      };
      return next();
    }

    // 2. Verify Firebase ID Token if Firebase Admin SDK is active
    const isFirebaseConfigured = admin.apps && admin.apps.length > 0;
    if (isFirebaseConfigured) {
      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        let userDoc = null;
        if (mongoose.connection.readyState === 1) {
          try {
            userDoc = await UserAccess.findOne({
              $or: [{ userId: decodedToken.uid }, { email: decodedToken.email }],
            }).maxTimeMS(1500);
          } catch (_) {}
        }
        if (!userDoc && decodedToken.email) {
          userDoc = UserStore.findRaw(decodedToken.email);
        }

        const envAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
        const role =
          userDoc?.role ||
          (envAdmin && decodedToken.email?.toLowerCase() === envAdmin ? 'admin' : 'user');

        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          name: userDoc?.name || decodedToken.name || decodedToken.email?.split('@')[0],
          role,
          isAdmin: role === 'admin',
        };
        return next();
      } catch (_) {
        // Invalid Firebase token falls through to 401
      }
    }

    if (isAutomatedAdminTestBypass) {
      req.user = {
        uid: 'admin_test_runner',
        email: process.env.ADMIN_EMAIL || 'creedracer111@gmail.com',
        role: 'admin',
        isAdmin: true,
      };
      return next();
    }

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
  if (req.method === 'OPTIONS') {
    return next();
  }

  const isAutomatedAdminTestBypass =
    process.env.NODE_ENV === 'test' &&
    req.headers['x-admin-bypass'] === 'true';

  if (!req.user) {
    if (isAutomatedAdminTestBypass) {
      req.user = {
        uid: 'admin_test_runner',
        email: process.env.ADMIN_EMAIL || 'creedracer111@gmail.com',
        role: 'admin',
        isAdmin: true,
      };
      return next();
    }

    return res.status(401).json({
      success: false,
      message: 'Admin authentication required. Please sign in to the Admin Console.',
    });
  }

  const envAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (
    isAutomatedAdminTestBypass ||
    req.user.isAdmin ||
    req.user.role === 'admin' ||
    (envAdmin && req.user.email?.toLowerCase() === envAdmin)
  ) {
    req.user.role = 'admin';
    req.user.isAdmin = true;
    return next();
  }

  // Fallback check against unified store / DB
  try {
    if (mongoose.connection.readyState === 1) {
      const userDoc = await UserAccess.findOne({
        $or: [{ userId: req.user.uid }, { email: req.user.email }],
      }).maxTimeMS(1500);
      if (userDoc?.role === 'admin') {
        req.user.role = 'admin';
        req.user.isAdmin = true;
        return next();
      }
    }
    const stored = UserStore.findRaw(req.user.email || req.user.uid);
    if (stored?.role === 'admin') {
      req.user.role = 'admin';
      req.user.isAdmin = true;
      return next();
    }
  } catch (_) {}

  return res.status(403).json({
    success: false,
    message: 'Forbidden. Administrator privileges required.',
  });
};

module.exports = { verifyFirebaseToken, verifyAdmin };
