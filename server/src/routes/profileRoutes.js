const router = require('express').Router();
const UserProfile = require('../models/UserProfile');
const UserAccess = require('../models/UserAccess');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');

// Middleware to optionally extract user if token exists, but not fail if not authenticated
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && (authHeader.startsWith('Bearer ') || authHeader.startsWith('Session '))) {
    return verifyFirebaseToken(req, res, next);
  }
  return next();
};

// GET /api/v1/profile/me - Fetch user profile (cached / fetched once on mount)
router.get('/me', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || 'demo_student';
    const email = req.user?.email || 'aditya.sahu@example.com';

    let profile = await UserProfile.findOne({
      $or: [{ userId }, { email }],
    });

    if (!profile) {
      // Create initial profile for the user
      profile = await UserProfile.create({
        userId,
        email,
        name: req.user?.name || (email.split('@')[0].replace('.', ' ') || 'Aditya Sahu'),
        handle: `@${email.split('@')[0] || 'adi2828'}`,
        roleTitle: 'Software Development Engineer (SDE-1)',
        college: 'Indian Institute of Technology',
        graduationYear: 2026,
        targetCompanies: ['Zomato', 'Blinkit', 'Flipkart', 'Amazon', 'Coforge', 'Cognizant'],
        solvedProblems: ['dsa-1-1', 'dsa-1-2', 'dsa-2-1'],
        starredProblems: ['dsa-1-1', 'dsa-3-1'],
        streak: {
          currentStreak: 2,
          bestStreak: 5,
          totalActiveDays: 12,
          lastActiveDate: new Date(),
          weeklyMinutes: 1355,
        },
      });
    }

    return res.json({
      success: true,
      profile,
    });
  } catch (err) {
    console.error('Error fetching profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: err.message,
    });
  }
});

// PUT /api/v1/profile/me - Update profile metadata (target companies, role, name, etc.)
router.put('/me', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || 'demo_student';
    const email = req.user?.email || 'aditya.sahu@example.com';

    const {
      name,
      handle,
      roleTitle,
      college,
      graduationYear,
      targetCompanies,
      studyPlan,
      preferences,
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (handle !== undefined) updateFields.handle = handle;
    if (roleTitle !== undefined) updateFields.roleTitle = roleTitle;
    if (college !== undefined) updateFields.college = college;
    if (graduationYear !== undefined) updateFields.graduationYear = graduationYear;
    if (targetCompanies !== undefined) updateFields.targetCompanies = targetCompanies;
    if (studyPlan !== undefined) updateFields.studyPlan = studyPlan;
    if (preferences !== undefined) updateFields.preferences = preferences;

    const profile = await UserProfile.findOneAndUpdate(
      { $or: [{ userId }, { email }] },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      profile,
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: err.message,
    });
  }
});

// POST /api/v1/profile/progress - On-demand sync for solved/starred problems and notes (NO polling loops)
router.post('/progress', optionalAuth, async (req, res) => {
  try {
    const userId = req.user?.uid || req.user?.id || 'demo_student';
    const email = req.user?.email || 'aditya.sahu@example.com';

    const { solvedProblems, starredProblems, problemNotes } = req.body;

    const updateFields = {};
    if (Array.isArray(solvedProblems)) updateFields.solvedProblems = solvedProblems;
    if (Array.isArray(starredProblems)) updateFields.starredProblems = starredProblems;
    if (problemNotes && typeof problemNotes === 'object') updateFields.problemNotes = problemNotes;

    // Check & advance streak active day if problem was marked solved today
    const profile = await UserProfile.findOne({ $or: [{ userId }, { email }] });
    if (profile) {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastActive = profile.streak?.lastActiveDate
        ? new Date(profile.streak.lastActiveDate).setHours(0, 0, 0, 0)
        : null;

      if (!lastActive || today > lastActive) {
        updateFields['streak.totalActiveDays'] = (profile.streak?.totalActiveDays || 0) + 1;
        updateFields['streak.currentStreak'] = (profile.streak?.currentStreak || 0) + 1;
        if (updateFields['streak.currentStreak'] > (profile.streak?.bestStreak || 0)) {
          updateFields['streak.bestStreak'] = updateFields['streak.currentStreak'];
        }
        updateFields['streak.lastActiveDate'] = new Date();
      }
    }

    const updated = await UserProfile.findOneAndUpdate(
      { $or: [{ userId }, { email }] },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Progress synced successfully',
      profile: updated,
    });
  } catch (err) {
    console.error('Error saving progress:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to sync progress',
      error: err.message,
    });
  }
});

module.exports = router;
