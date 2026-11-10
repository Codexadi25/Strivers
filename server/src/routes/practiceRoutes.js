const router = require('express').Router();
const mongoose = require('mongoose');
const PracticeSheet = require('../models/PracticeSheet');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const PracticeStore = require('../utils/practiceStore');
const UserStore = require('../utils/userStore');
const ActivityOrderStore = require('../utils/activityOrderStore');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

// Get all practice sheets categorized by job requirement (/api/practice/sheets)
router.get('/sheets', async (req, res) => {
  try {
    let sheets = PracticeStore.getAll();
    if ((!sheets || sheets.length === 0) && mongoose.connection.readyState === 1) {
      try {
        sheets = await PracticeSheet.find().sort({ roleType: 1, price: 1, createdAt: 1 }).maxTimeMS(1500);
      } catch (_) {}
    }

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
    const fallback = PracticeStore.getAll();
    return res.json({
      success: true,
      sheets: fallback,
      categorized: {
        nonTech: fallback.filter((s) => s.roleType === 'non-tech'),
        tech: fallback.filter((s) => s.roleType === 'tech'),
      },
    });
  }
});

// Get a single practice sheet by ID (/api/practice/sheets/:sheetId)
router.get('/sheets/:sheetId', async (req, res) => {
  try {
    const sheetId = (req.params.sheetId || '').toLowerCase();
    let sheet = PracticeStore.getById(sheetId);
    if (!sheet && mongoose.connection.readyState === 1) {
      try {
        sheet = await PracticeSheet.findOne({ sheetId }).maxTimeMS(1500);
      } catch (_) {}
    }
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found' });
    }
    return res.json({ success: true, sheet });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch practice sheet', error: err.message });
  }
});

// Enroll in a practice sheet (/api/practice/enroll)
router.post('/enroll', verifyFirebaseToken, async (req, res) => {
  try {
    const { sheetId } = req.body;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required to enroll in practice sheets.' });
    }

    const sheet = PracticeStore.getById(sheetId);
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    const userRaw = UserStore.findRaw(req.user.email || req.user.uid);
    if (!userRaw) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    const enrolledSheets = userRaw.enrolledPracticeSheets || [];
    const alreadyEnrolled = enrolledSheets.some((s) => s.sheetId === sheet.sheetId);
    if (alreadyEnrolled) {
      return res.json({
        success: true,
        alreadyEnrolled: true,
        message: 'You are already enrolled in this practice track.',
        sheet,
      });
    }

    const maxAllowed = userRaw.maxPracticeSheetsAllowed || 2;
    if (enrolledSheets.length >= maxAllowed) {
      return res.status(403).json({
        success: false,
        limitReached: true,
        maxAllowed,
        message: `Practice Sheet enrollment limit reached (${enrolledSheets.length}/${maxAllowed}). Contact mentorship support or manage your active tracks.`,
      });
    }

    const isUnlockedByCourse = Boolean(
      sheet.linkedCourseId &&
        (userRaw.enrolledCourses?.some((c) => c.courseId === sheet.linkedCourseId) ||
          (userRaw.hasActiveSubscription && (sheet.linkedCourseId === 'masterclass' || sheet.linkedCourseId === 'all')))
    );

    if (sheet.price === 0 || sheet.isFree || isUnlockedByCourse) {
      enrolledSheets.push({
        sheetId: sheet.sheetId,
        sheetTitle: sheet.title,
        roleType: sheet.roleType,
        feePaid: 0,
        unlockedByCourse: isUnlockedByCourse ? sheet.linkedCourseId : null,
        enrolledAt: new Date().toISOString(),
      });

      UserStore.upsert({
        email: userRaw.email,
        enrolledPracticeSheets: enrolledSheets,
      });

      PracticeStore.update(sheet.sheetId, { enrolledCount: (sheet.enrolledCount || 0) + 1 });

      ActivityOrderStore.addLog({
        event: 'ACCESS_GRANTED',
        userEmail: userRaw.email,
        ip: req.ip || '127.0.0.1',
        metadata: {
          sheetId: sheet.sheetId,
          sheetTitle: sheet.title,
          fee: 0,
          type: isUnlockedByCourse ? `COURSE_BUNDLE_${sheet.linkedCourseId.toUpperCase()}` : 'FREE_ENROLLMENT',
        },
        tag: 'PRACTICE',
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
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyFirebaseToken(req, res, next);
  }
  return next();
};

// Update practice problem progress (/api/practice/progress)
router.post('/progress', optionalAuth, async (req, res) => {
  try {
    const { problemId, solved, note, solvedProblems, starredProblems, problemNotes } = req.body;
    const email = (req.user?.email || req.headers['x-user-email'] || 'guest@strivers.tech').trim().toLowerCase();
    const userId = req.user?.uid || req.user?.id || 'demo_student';

    if (mongoose.connection.readyState === 1) {
      try {
        let profile = await UserProfile.findOne({ $or: [{ userId }, { email }] }).maxTimeMS(1500);
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
          if (solved && !profile.solvedProblems.includes(problemId)) {
            profile.solvedProblems.push(problemId);
          } else if (!solved) {
            profile.solvedProblems = profile.solvedProblems.filter((id) => id !== problemId);
          }
        }
        if (Array.isArray(starredProblems)) profile.starredProblems = starredProblems;
        if (problemNotes && typeof problemNotes === 'object') {
          profile.problemNotes = problemNotes;
        } else if (note !== undefined && problemId) {
          if (!profile.problemNotes) profile.problemNotes = new Map();
          profile.problemNotes.set(problemId, note);
        }
        const todayDateStr = new Date().toISOString().slice(0, 10);
        const activeDates = Array.isArray(profile.streak?.activeDates) ? profile.streak.activeDates : [];
        if (!activeDates.includes(todayDateStr)) {
          activeDates.push(todayDateStr);
          profile.set('streak.activeDates', activeDates);
        }
        await profile.save();
        return res.json({
          success: true,
          message: 'Practice progress synchronized.',
          profile,
          solvedCount: profile.solvedProblems.length,
        });
      } catch (_) {}
    }

    return res.json({
      success: true,
      message: 'Practice progress cached.',
      solvedCount: Array.isArray(solvedProblems) ? solvedProblems.length : 1,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update progress', error: err.message });
  }
});

module.exports = router;
