const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');

exports.getGatedContent = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in.',
      });
    }

    const { uid, email } = req.user;

    const access = await UserAccess.findOne({
      $or: [{ userId: uid }, { email }],
    });
    const isAccessValid =
      access && access.hasActiveSubscription && (!access.expiresAt || new Date(access.expiresAt) > new Date());

    if (!isAccessValid) {
      return res.status(403).json({
        success: false,
        paymentRequired: true,
        message: 'Active subscription required to view this content.',
      });
    }

    // Log the access to track session activity
    await ActivityLog.create({
      userId: uid,
      userEmail: email,
      action: 'CONTENT_VIEW',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Instead of raw unencrypted HTML, send structured vectors/render metadata
    return res.status(200).json({
      success: true,
      watermark: access.watermarkIdentifier,
      sessionToken: Math.random().toString(36).substring(2),
      // Controlled content payload structured for canvas text streaming
      payload: {
        title: "Confidential Strategy Docket 2026",
        version: "v4.2-Encrypted",
        sections: [
          "1. Executive Overview & Growth Strategy: Revenue targets reached ₹1.2 Cr in Q2.",
          "2. Protected Client List & Architecture topology encrypted using RSA-4096.",
          "3. Proprietary Algorithms: Real-time HMAC-verified webhook processing pipeline.",
          "4. Infrastructure breakdown: Distributed Dockerized nodes on Render & Firebase Edge."
        ]
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.logBreachAttempt = async (req, res, next) => {
  try {
    const uid = req.user?.uid || 'anonymous_guest';
    const email = req.user?.email || req.body?.email || 'anonymous';
    const { reason } = req.body;

    await ActivityLog.create({
      userId: uid,
      userEmail: email,
      action: 'SECURITY_BREACH_ATTEMPT',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      metaData: { reason },
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};