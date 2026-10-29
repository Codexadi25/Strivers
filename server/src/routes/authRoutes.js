const router = require('express').Router();
const crypto = require('crypto');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const ActivityLog = require('../models/ActivityLog');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { signSessionToken } = require('../utils/token');
const { hashPassword, verifyPassword } = require('../utils/password');

// Get current user session
router.get('/me', verifyFirebaseToken, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      user: null,
      message: 'Not authenticated',
    });
  }

  const userAccess = await UserAccess.findOne({
    $or: [{ userId: req.user.uid }, { email: req.user.email }],
  });

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

    // Look up in UserAccess
    const userAccess = await UserAccess.findOne({ email: userEmail });
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

    await ActivityLog.create({
      userId: uid,
      userEmail,
      action: 'LOGIN',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Client-Login',
      metaData: { plan: targetPlan, alreadyOwnsCourse },
    });

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
    return res.status(500).json({ success: false, message: 'Login failed', error: err.message });
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
    const existingUser = await UserAccess.findOne({ email: userEmail });

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

    // Create UserAccess
    const newUser = await UserAccess.create({
      userId: uid,
      email: userEmail,
      name: name?.trim() || userEmail.split('@')[0],
      password: hashedPassword,
      role: 'user',
      hasActiveSubscription: false,
      watermarkIdentifier: `${userEmail} | ${uid.slice(0, 6)}`,
      enrolledCourses: [],
      enrolledPracticeSheets: [],
    });

    // Create UserProfile
    await UserProfile.findOneAndUpdate(
      { email: userEmail },
      {
        userId: uid,
        email: userEmail,
        name: newUser.name,
        targetCompanies: ['Zomato', 'Blinkit', 'Hyperpure', 'District', 'Porter', 'Amazon', 'Flipkart', 'Swiggy'],
      },
      { upsert: true, new: true }
    );

    const token = signSessionToken({ uid, email: userEmail, role: 'user' });

    await ActivityLog.create({
      userId: uid,
      userEmail,
      action: 'LOGIN',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Client-Register',
      metaData: { action: 'ACCOUNT_CREATED', plan },
    });

    return res.status(201).json({
      success: true,
      token,
      alreadyPaid: false,
      message: 'Account registered successfully.',
      user: {
        id: uid,
        email: userEmail,
        name: newUser.name,
        role: 'user',
        isAdmin: false,
        enrolledCourses: [],
        enrolledPracticeSheets: [],
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Registration failed', error: err.message });
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
    const user = await UserAccess.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    const resetToken = crypto.randomBytes(24).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour validity
    await user.save();

    return res.json({
      success: true,
      message: 'Password reset link generated successfully.',
      resetToken,
      resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(userEmail)}`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset request failed', error: err.message });
  }
});

// Password Reset Execution
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email and new password are required.' });
    }

    const userEmail = email.trim().toLowerCase();
    const user = await UserAccess.findOne({
      email: userEmail,
      ...(token ? { resetPasswordToken: token, resetPasswordExpires: { $gt: new Date() } } : {}),
    });

    if (!user && token) {
      return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.password = hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.json({
      success: true,
      message: 'Password has been reset successfully. Please sign in with your new credentials.',
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Password reset failed', error: err.message });
  }
});

router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
