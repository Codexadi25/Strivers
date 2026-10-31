const router = require('express').Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const ActivityLog = require('../models/ActivityLog');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { signSessionToken } = require('../utils/token');
const { hashPassword, verifyPassword } = require('../utils/password');

// High-availability in-memory user cache (prevents login/registration failures during DB timeouts or offline mode)
const inMemoryUsers = new Map();

function initSeedUsers() {
  if (inMemoryUsers.size === 0) {
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@yourdomain.com').trim().toLowerCase();
    inMemoryUsers.set(adminEmail, {
      userId: 'usr_admin_001',
      email: adminEmail,
      name: 'System Administrator',
      password: hashPassword('admin123'),
      role: 'admin',
      hasActiveSubscription: true,
      enrolledCourses: [{ courseId: 'masterclass', title: 'Full Stack Masterclass', enrolledAt: new Date() }],
      enrolledPracticeSheets: [],
    });

    inMemoryUsers.set('creedracer111@gmail.com', {
      userId: 'usr_creed_001',
      email: 'creedracer111@gmail.com',
      name: 'Creed Racer',
      password: hashPassword('student123'),
      role: 'admin',
      hasActiveSubscription: true,
      enrolledCourses: [{ courseId: 'masterclass', title: 'Full Stack Masterclass', enrolledAt: new Date() }],
      enrolledPracticeSheets: [],
    });

    inMemoryUsers.set('kamaldeep@gmail.com', {
      userId: '312795448',
      email: 'kamaldeep@gmail.com',
      name: 'Kamaldeep',
      phone: '+91 98765 55543',
      password: hashPassword('student123'),
      role: 'user',
      hasActiveSubscription: true,
      enrolledCourses: [{ courseId: 'masterclass', title: 'Full Stack Masterclass', enrolledAt: new Date() }],
      enrolledPracticeSheets: [],
    });
  }
}
initSeedUsers();

// Get current user session
router.get('/me', verifyFirebaseToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      user: null,
      message: 'Not authenticated',
    });
  }

  let userAccess = null;
  if (mongoose.connection.readyState === 1) {
    try {
      userAccess = await UserAccess.findOne({
        $or: [{ userId: req.user.uid }, { email: req.user.email }],
      }).maxTimeMS(2500);
    } catch (_) {}
  }

  if (!userAccess && req.user.email) {
    userAccess = inMemoryUsers.get(req.user.email.toLowerCase());
  }

  const role =
    userAccess?.role ||
    (req.user.email === process.env.ADMIN_EMAIL ? 'admin' : req.user.role || 'user');

  return res.json({
    success: true,
    user: {
      _id: req.user.uid,
      id: req.user.uid,
      name: userAccess?.name || req.user.name || (req.user.email ? req.user.email.split('@')[0] : 'User'),
      email: req.user.email,
      role: role,
      isAdmin: role === 'admin',
      hasActiveSubscription: Boolean(userAccess?.hasActiveSubscription),
      enrolledCourses: userAccess?.enrolledCourses || [],
      enrolledPracticeSheets: userAccess?.enrolledPracticeSheets || [],
    },
  });
});

// Login endpoint with plan verification
router.post('/login', async (req, res) => {
  try {
    const { email, password, plan } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const userEmail = email.trim().toLowerCase();

    // 1. Look up in MongoDB if available
    let userAccess = null;
    if (mongoose.connection.readyState === 1) {
      try {
        userAccess = await UserAccess.findOne({ email: userEmail }).maxTimeMS(3000);
      } catch (dbErr) {
        console.warn('[Auth Login] DB query error, using memory fallback:', dbErr.message);
      }
    }

    // 2. Fallback to inMemoryUsers
    if (!userAccess) {
      userAccess = inMemoryUsers.get(userEmail);
    }

    if (!userAccess) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email. Please create an account first.',
      });
    }

    if (password && userAccess.password && !verifyPassword(password, userAccess.password)) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please verify and try again.',
      });
    }

    const isEnvAdmin = process.env.ADMIN_EMAIL && userEmail === process.env.ADMIN_EMAIL.toLowerCase();
    let role = userAccess.role || (isEnvAdmin ? 'admin' : 'user');

    const uid = userAccess.userId || `usr_${Date.now()}`;
    const token = signSessionToken({ uid, email: userEmail, role });

    // Check if user already owns the opted course
    const targetPlan = plan || 'masterclass';
    const alreadyOwnsCourse =
      userAccess.enrolledCourses?.some((c) => c.courseId === targetPlan) ||
      (userAccess.hasActiveSubscription && targetPlan === 'masterclass');

    if (mongoose.connection.readyState === 1) {
      ActivityLog.create({
        userId: uid,
        userEmail,
        action: 'LOGIN',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Client-Login',
        metaData: { plan: targetPlan, alreadyOwnsCourse },
      }).catch(() => {});
    }

    return res.json({
      success: true,
      token,
      alreadyPaid: Boolean(alreadyOwnsCourse),
      accessUrl: alreadyOwnsCourse ? `/products/${targetPlan}/access` : null,
      user: {
        id: uid,
        email: userEmail,
        name: userAccess.name || userEmail.split('@')[0],
        role: role,
        isAdmin: role === 'admin',
        enrolledCourses: userAccess.enrolledCourses || [],
        enrolledPracticeSheets: userAccess.enrolledPracticeSheets || [],
      },
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Login failed: ' + err.message, error: err.message });
  }
});

// Registration endpoint with existing account check and automatic session start
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, plan } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const userEmail = email.trim().toLowerCase();

    // 1. Look up existing in DB or memory
    let existingUser = null;
    if (mongoose.connection.readyState === 1) {
      try {
        existingUser = await UserAccess.findOne({ email: userEmail }).maxTimeMS(3000);
      } catch (dbErr) {
        console.warn('[Auth Register] DB query error, checking memory:', dbErr.message);
      }
    }
    if (!existingUser) {
      existingUser = inMemoryUsers.get(userEmail);
    }

    // If an account already exists, redirect user to login and check if they already bought the course
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

    const newUserRecord = {
      userId: uid,
      email: userEmail,
      name: userName,
      password: hashedPassword,
      role: 'user',
      hasActiveSubscription: false,
      watermarkIdentifier: `${userEmail} | ${uid.slice(0, 6)}`,
      enrolledCourses: [],
      enrolledPracticeSheets: [],
    };

    // Store in-memory immediately for zero-downtime resilience
    inMemoryUsers.set(userEmail, newUserRecord);

    // Persist to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await UserAccess.create(newUserRecord);
        await UserProfile.findOneAndUpdate(
          { email: userEmail },
          {
            userId: uid,
            email: userEmail,
            name: userName,
            targetCompanies: ['Zomato', 'Blinkit', 'Hyperpure', 'District', 'Porter', 'Amazon', 'Flipkart', 'Swiggy'],
          },
          { upsert: true, new: true }
        );
        ActivityLog.create({
          userId: uid,
          userEmail,
          action: 'LOGIN',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Client-Register',
          metaData: { action: 'ACCOUNT_CREATED', plan },
        }).catch(() => {});
      } catch (dbWriteErr) {
        console.warn('[Auth Register] DB write failed, saved in memory cache:', dbWriteErr.message);
      }
    }

    const token = signSessionToken({ uid, email: userEmail, role: 'user' });

    return res.status(201).json({
      success: true,
      token,
      alreadyPaid: false,
      message: 'Account registered successfully.',
      user: {
        id: uid,
        email: userEmail,
        name: userName,
        role: 'user',
        isAdmin: false,
        enrolledCourses: [],
        enrolledPracticeSheets: [],
      },
    });
  } catch (err) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ success: false, message: 'Registration failed: ' + err.message, error: err.message });
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
        user = await UserAccess.findOne({ email: userEmail }).maxTimeMS(3000);
      } catch (dbErr) {
        console.warn('[Forgot Password] DB query error, checking memory:', dbErr.message);
      }
    }

    if (!user) {
      user = inMemoryUsers.get(userEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour validity

    // Update in-memory user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = expiresAt;
    inMemoryUsers.set(userEmail, user);

    // Update in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        if (typeof user.save === 'function') {
          await user.save();
        } else {
          await UserAccess.updateOne(
            { email: userEmail },
            { $set: { resetPasswordToken: resetToken, resetPasswordExpires: expiresAt } }
          );
        }
      } catch (dbSaveErr) {
        console.warn('[Forgot Password] DB save notice, preserved in memory:', dbSaveErr.message);
      }
    }

    const resetUrl = `/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`;

    return res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken,
      resetUrl,
    });
  } catch (err) {
    console.error('[Forgot Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Password reset request failed: ' + err.message, error: err.message });
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
        user = await UserAccess.findOne({
          email: userEmail,
          ...(token ? { resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } } : {}),
        }).maxTimeMS(3000);
      } catch (dbErr) {
        console.warn('[Reset Password] DB query error, checking memory:', dbErr.message);
      }
    }

    if (!user) {
      const memUser = inMemoryUsers.get(userEmail);
      if (memUser) {
        if (token && memUser.resetPasswordToken && memUser.resetPasswordToken !== token) {
          return res.status(400).json({ success: false, message: 'Password reset token is invalid or does not match.' });
        }
        if (token && memUser.resetPasswordExpires && new Date(memUser.resetPasswordExpires) < new Date()) {
          return res.status(400).json({ success: false, message: 'Password reset token has expired. Please request a new link.' });
        }
        user = memUser;
      }
    }

    if (!user && token) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const hashedPassword = hashPassword(newPassword);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    inMemoryUsers.set(userEmail, user);

    if (mongoose.connection.readyState === 1) {
      try {
        if (typeof user.save === 'function') {
          await user.save();
        } else {
          await UserAccess.updateOne(
            { email: userEmail },
            { $set: { password: hashedPassword, resetPasswordToken: null, resetPasswordExpires: null } }
          );
        }
      } catch (dbErr) {
        console.warn('[Reset Password] DB save notice, preserved in memory:', dbErr.message);
      }
    }

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new credentials.',
    });
  } catch (err) {
    console.error('[Reset Password Error]:', err);
    return res.status(500).json({ success: false, message: 'Password reset failed: ' + err.message, error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
