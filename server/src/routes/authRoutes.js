const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const UserStore = require('../utils/userStore');
const ActivityOrderStore = require('../utils/activityOrderStore');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { signSessionToken, verifySessionToken } = require('../utils/token');
const { hashPassword, verifyPassword } = require('../utils/password');

// Helper: build clean user response object
function formatAuthUser(userDoc, fallbackReqUser = {}) {
  const email = (userDoc?.email || fallbackReqUser.email || '').trim().toLowerCase();
  const uid = userDoc?.userId || fallbackReqUser.uid || `usr_${Date.now()}`;
  const envAdmin = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const role =
    userDoc?.role ||
    (envAdmin && email === envAdmin ? 'admin' : fallbackReqUser.role || 'user');

  return {
    _id: uid,
    id: uid,
    name: userDoc?.name || fallbackReqUser.name || (email ? email.split('@')[0] : 'Student'),
    email,
    phone: userDoc?.phone || '',
    role,
    isAdmin: role === 'admin',
    hasActiveSubscription: Boolean(userDoc?.hasActiveSubscription),
    enrolledCourses: userDoc?.enrolledCourses || [],
    enrolledPracticeSheets: userDoc?.enrolledPracticeSheets || [],
    maxPracticeSheetsAllowed: userDoc?.maxPracticeSheetsAllowed || 2,
  };
}

// Get current user session (/api/auth/me)
router.get('/me', verifyFirebaseToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      user: null,
      message: 'Not authenticated or session expired.',
    });
  }

  let userAccess = null;
  if (mongoose.connection.readyState === 1) {
    try {
      userAccess = await UserAccess.findOne({
        $or: [{ userId: req.user.uid }, { email: req.user.email }],
      }).maxTimeMS(1500);
    } catch (_) {}
  }

  if (!userAccess && req.user.email) {
    userAccess = UserStore.findRaw(req.user.email);
  }

  return res.json({
    success: true,
    user: formatAuthUser(userAccess, req.user),
  });
});

// Login endpoint (/api/auth/login)
router.post('/login', async (req, res) => {
  try {
    const { email, password, plan } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const userEmail = email.trim().toLowerCase();

    // Look up in MongoDB first if connected, otherwise UserStore
    let userAccess = null;
    if (mongoose.connection.readyState === 1) {
      try {
        userAccess = await UserAccess.findOne({ email: userEmail }).maxTimeMS(2000);
      } catch (dbErr) {
        console.warn('[Auth Login] DB notice, falling back to UserStore:', dbErr.message);
      }
    }
    if (!userAccess) {
      userAccess = UserStore.findRaw(userEmail);
    }

    if (!userAccess) {
      return res.status(404).json({
        success: false,
        notFound: true,
        message: `No account registered with ${userEmail}. Please create an account.`,
      });
    }

    if (password) {
      if (userAccess.password) {
        const matches = verifyPassword(password, userAccess.password);
        if (!matches) {
          return res.status(401).json({
            success: false,
            message: 'Incorrect password. Please verify and try again.',
          });
        }
      } else {
        const hashed = hashPassword(password);
        UserStore.upsert({ email: userEmail, password: hashed });
        if (mongoose.connection.readyState === 1) {
          UserAccess.updateOne({ email: userEmail }, { $set: { password: hashed } }).catch(() => {});
        }
      }
    }

    const formattedUser = formatAuthUser(userAccess, { email: userEmail });
    const token = signSessionToken({ uid: formattedUser.id, email: userEmail, role: formattedUser.role });

    const targetPlan = plan || 'masterclass';
    const alreadyOwnsCourse =
      formattedUser.enrolledCourses.some((c) => c.courseId === targetPlan) ||
      (formattedUser.hasActiveSubscription && targetPlan === 'masterclass');

    ActivityOrderStore.addLog({
      event: 'LOGIN',
      userEmail,
      ip: req.ip || '127.0.0.1',
      metadata: { plan: targetPlan, alreadyOwnsCourse },
      tag: 'AUTH',
    });

    return res.json({
      success: true,
      token,
      alreadyPaid: Boolean(alreadyOwnsCourse),
      accessUrl: alreadyOwnsCourse ? `/courses/${targetPlan}/access` : null,
      user: formattedUser,
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Login failed: ' + err.message });
  }
});

// Registration endpoint (/api/auth/register)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, plan } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const userEmail = email.trim().toLowerCase();

    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingUser = await UserAccess.findOne({ email: userEmail }).maxTimeMS(2000);
      } catch (_) {}
    }
    if (!existingUser) {
      existingUser = UserStore.findRaw(userEmail);
    }

    if (existingUser) {
      const targetPlan = plan || 'masterclass';
      const alreadyOwnsCourse =
        existingUser.enrolledCourses?.some((c) => c.courseId === targetPlan) ||
        (existingUser.hasActiveSubscription && targetPlan === 'masterclass');

      return res.status(409).json({
        success: false,
        exists: true,
        alreadyPaid: Boolean(alreadyOwnsCourse),
        message: 'An account with this email already exists. Please sign in.',
        redirect: `/login?email=${encodeURIComponent(userEmail)}${plan ? `&plan=${encodeURIComponent(plan)}` : ''}${alreadyOwnsCourse ? '&paid=1' : ''}`,
      });
    }

    const uid = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const hashedPassword = hashPassword(password || 'student123');
    const userName = name?.trim() || userEmail.split('@')[0];

    const created = UserStore.upsert({
      userId: uid,
      email: userEmail,
      name: userName,
      password: hashedPassword,
      role: 'user',
      hasActiveSubscription: false,
      watermarkIdentifier: `${userEmail} | ${uid.slice(0, 6)}`,
      enrolledCourses: [],
      enrolledPracticeSheets: [],
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await UserProfile.findOneAndUpdate(
          { email: userEmail },
          {
            userId: uid,
            email: userEmail,
            name: userName,
            targetCompanies: ['Zomato', 'Blinkit', 'Hyperpure', 'District', 'Porter', 'Amazon', 'Flipkart', 'Swiggy'],
          },
          { upsert: true, new: true }
        ).maxTimeMS(2000);
      } catch (_) {}
    }

    ActivityOrderStore.addLog({
      event: 'REGISTER',
      userEmail,
      ip: req.ip || '127.0.0.1',
      metadata: { plan: plan || 'none' },
      tag: 'AUTH',
    });

    const token = signSessionToken({ uid, email: userEmail, role: 'user' });

    return res.status(201).json({
      success: true,
      token,
      alreadyPaid: false,
      message: 'Account registered successfully.',
      user: formatAuthUser(created, { uid, email: userEmail }),
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ success: false, message: 'Registration failed: ' + err.message });
  }
});

// Account setup verification & password save (/api/auth/setup-account)
router.get('/setup-account', (req, res) => {
  const token = req.query.token || '';
  const payload = verifySessionToken(token);
  if (!payload || !payload.email) {
    return res.status(400).json({ success: false, error: 'Invalid or expired account setup token.' });
  }
  return res.json({ success: true, email: payload.email });
});

router.post('/setup-account', async (req, res) => {
  try {
    const { token, password } = req.body;
    const payload = verifySessionToken(token || '');
    if (!payload || !payload.email) {
      return res.status(400).json({ success: false, error: 'Invalid or expired setup link.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters.' });
    }
    const email = payload.email.trim().toLowerCase();
    const hashedPassword = hashPassword(password);
    const updated = UserStore.upsert({ email, password: hashedPassword });
    const sessionToken = signSessionToken({ uid: updated.userId, email, role: updated.role || 'user' });
    return res.json({
      success: true,
      token: sessionToken,
      accessUrl: '/courses',
      user: formatAuthUser(updated),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Password Reset Request
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    const userEmail = email.trim().toLowerCase();
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await UserAccess.findOne({ email: userEmail }).maxTimeMS(2000);
      } catch (_) {}
    }
    if (!user) {
      user = UserStore.findRaw(userEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    UserStore.upsert({
      email: userEmail,
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresAt.toISOString(),
    });

    const resetUrl = `/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

    return res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken,
      resetUrl,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset request failed: ' + err.message });
  }
});

// Password Reset Execution
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const userEmail = email.trim().toLowerCase();
    let user = null;
    if (mongoose.connection.readyState === 1) {
      try {
        user = await UserAccess.findOne({ email: userEmail }).maxTimeMS(2000);
      } catch (_) {}
    }
    if (!user) {
      user = UserStore.findRaw(userEmail);
    }
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (token && user.resetPasswordToken && user.resetPasswordToken !== token) {
      return res.status(400).json({ success: false, message: 'Invalid password reset token.' });
    }

    const hashedPassword = hashPassword(newPassword);
    UserStore.upsert({
      email: userEmail,
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
    });

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new credentials.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset failed: ' + err.message });
  }
});

// Token Refresh
router.post('/refresh', verifyFirebaseToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No active session to refresh.' });
  }
  const newToken = signSessionToken({ uid: req.user.uid, email: req.user.email, role: req.user.role });
  return res.json({ success: true, token: newToken });
});

// Logout endpoint (/api/auth/logout)
router.post('/logout', verifyFirebaseToken, (req, res) => {
  if (req.user?.email) {
    ActivityOrderStore.addLog({
      event: 'LOGOUT',
      userEmail: req.user.email,
      ip: req.ip || '127.0.0.1',
      metadata: { portal: 'Student Client' },
      tag: 'AUTH',
    });
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

module.exports = router;
