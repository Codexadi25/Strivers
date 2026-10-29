const router = require('express').Router();
const PracticeSheet = require('../models/PracticeSheet');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const ActivityLog = require('../models/ActivityLog');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

// Get all practice sheets categorized by job requirement
router.get('/sheets', async (req, res) => {
  try {
    const sheets = await PracticeSheet.find().sort({ roleType: 1, price: 1, createdAt: 1 });
    const nonTech = sheets.filter((s) => s.roleType === 'non-tech');
    const tech = sheets.filter((s) => s.roleType === 'tech');

    return res.json({
      success: true,
      sheets,
      categorized: {
        nonTech,
        tech,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch practice sheets', error: err.message });
  }
});

// Get a single practice sheet by ID
router.get('/sheets/:sheetId', async (req, res) => {
  try {
    const sheet = await PracticeSheet.findOne({ sheetId: req.params.sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found' });
    }
    return res.json({ success: true, sheet });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch practice sheet', error: err.message });
  }
});

// Enroll in a practice sheet (100% Free if price is ₹0.00)
router.post('/enroll', verifyFirebaseToken, async (req, res) => {
  try {
    const { sheetId } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to enroll in practice sheets.' });
    }

    const sheet = await PracticeSheet.findOne({ sheetId: (sheetId || '').toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    const userDoc = await UserAccess.findOne({
      $or: [{ userId: req.user.uid }, { email: req.user.email }],
    });

    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    // Check if user is already enrolled
    const alreadyEnrolled = userDoc.enrolledPracticeSheets?.some((s) => s.sheetId === sheet.sheetId);
    if (alreadyEnrolled) {
      return res.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this practice track.',
        sheet,
      });
    }

    // Enforce Limited Practice Sheet Access per user
    const maxAllowed = userDoc.maxPracticeSheetsAllowed || 2;
    if (userDoc.enrolledPracticeSheets && userDoc.enrolledPracticeSheets.length >= maxAllowed) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        maxAllowed,
        message: `Practice Sheet enrollment limit reached (${userDoc.enrolledPracticeSheets.length}/${maxAllowed}). Limited Practice Sheet Access is granted per user. Contact mentorship support or manage your active tracks.`,
      });
    }

    // Check if unlocked for free by mapped masterclass / course
    const isUnlockedByCourse = Boolean(
      sheet.linkedCourseId && (
        userDoc.enrolledCourses?.some((c) => c.courseId === sheet.linkedCourseId) ||
        (userDoc.hasActiveSubscription && (sheet.linkedCourseId === 'masterclass' || sheet.linkedCourseId === 'all'))
      )
    );

    // Free Enrollment (Price === 0 or unlocked by enrolled course)
    if (sheet.price === 0 || sheet.isFree || isUnlockedByCourse) {
      userDoc.enrolledPracticeSheets.push({
        sheetId: sheet.sheetId,
        sheetTitle: sheet.title,
        roleType: sheet.roleType,
        feePaid: 0,
        unlockedByCourse: isUnlockedByCourse ? sheet.linkedCourseId : null,
        enrolledAt: new Date(),
      });
      await userDoc.save();

      sheet.enrolledCount = (sheet.enrolledCount || 0) + 1;
      await sheet.save();

      await ActivityLog.create({
        userId: userDoc.userId,
        userEmail: userDoc.email,
        action: 'ACCESS_GRANTED',
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || 'Client-Practice',
        metaData: {
          sheetId: sheet.sheetId,
          sheetTitle: sheet.title,
          fee: 0,
          type: isUnlockedByCourse ? `COURSE_BUNDLE_${sheet.linkedCourseId.toUpperCase()}` : 'FREE_ENROLLMENT',
        },
      });

      return res.json({
        success: true,
        message: isUnlockedByCourse
          ? `🎉 Practice track unlocked for free via your enrolled course (${sheet.linkedCourseId})!`
          : `Enrolled in "${sheet.title}" for free!`,
        sheet,
        unlockedByCourse,
      });
    }

    // Paid Practice Sheet: Require payment
    return res.status(402).json({
      success: false,
      paymentRequired: true,
      price: sheet.price,
      message: `This specialized practice track requires a nominal fee of ₹${sheet.price}.`,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Enrollment failed', error: err.message });
  }
});

// Middleware to optionally extract user if token exists
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('Session '))) {
    return verifyFirebaseToken(req, res, next);
  }
  return next();
};

// Update practice problem progress (Single problem or Bulk sync)
router.post('/progress', optionalAuth, async (req, res) => {
  try {
    const { problemId, solved, note, solvedProblems, starredProblems, problemNotes } = req.body;
    const email = (req.user?.email || req.headers['x-user-email'] || 'creedracer111@gmail.com').trim().toLowerCase();
    const userId = req.user?.uid || req.user?.id || 'demo_student';

    let profile = await UserProfile.findOne({
      $or: [{ userId }, { email }],
    });

    if (!profile) {
      profile = new UserProfile({
        userId,
        email,
        name: req.user?.name || email.split('@')[0],
        solvedProblems: [],
      });
    }

    if (Array.isArray(solvedProblems)) {
      profile.solvedProblems = solvedProblems;
    } else if (problemId) {
      if (solved) {
        if (!profile.solvedProblems.includes(problemId)) {
          profile.solvedProblems.push(problemId);
        }
      } else {
        profile.solvedProblems = profile.solvedProblems.filter((id) => id !== problemId);
      }
    }

    if (Array.isArray(starredProblems)) {
      profile.starredProblems = starredProblems;
    }

    if (problemNotes && typeof problemNotes === 'object') {
      profile.problemNotes = problemNotes;
    } else if (note !== undefined && problemId) {
      if (!profile.problemNotes) profile.problemNotes = new Map();
      profile.problemNotes.set(problemId, note);
    }

    // Advance active streak date & daily submissions in MongoDB
    const todayDateStr = new Date().toISOString().slice(0, 10);
    const activeDates = Array.isArray(profile.streak?.activeDates) ? profile.streak.activeDates : [];
    if (!activeDates.includes(todayDateStr)) {
      activeDates.push(todayDateStr);
      profile.set('streak.activeDates', activeDates);
    }

    const dailySubmissions = profile.streak?.dailySubmissions
      ? Object.fromEntries(profile.streak.dailySubmissions instanceof Map ? profile.streak.dailySubmissions : Object.entries(profile.streak.dailySubmissions))
      : {};
    dailySubmissions[todayDateStr] = (dailySubmissions[todayDateStr] || 0) + 1;
    profile.set('streak.dailySubmissions', dailySubmissions);

    await profile.save();

    return res.json({
      success: true,
      message: 'Practice progress synchronized.',
      profile,
      solvedCount: profile.solvedProblems.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update progress', error: err.message });
  }
});

module.exports = router;
