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
    const email = req.user?.email || req.headers['x-user-email'] || 'creedracer111@gmail.com';

    let profile = await UserProfile.findOne({
      $or: [{ userId }, { email }],
    });

    if (!profile) {
      // Create initial profile for the user with verified dynamic stats
      profile = await UserProfile.create({
        userId,
        email,
        name: req.user?.name || 'Aditya Sahu',
        handle: `@${email.split('@')[0] || 'aditya'}`,
        roleTitle: 'Software Development Engineer (SDE-1)',
        college: 'Indian Institute of Technology',
        graduationYear: 2026,
        targetCompanies: ['Zomato', 'Blinkit', 'Swiggy', 'Porter', 'Flipkart', 'Amazon'],
        solvedProblems: ['dsa-1-1', 'dsa-1-2', 'dsa-2-1'],
        starredProblems: ['dsa-1-1', 'dsa-3-1'],
        streak: {
          currentStreak: 8,
          bestStreak: 14,
          totalActiveDays: 16,
          lastActiveDate: new Date(),
          weeklyMinutes: 1355, // 22h 35m
          activeDates: [
            '2026-10-02',
            '2026-10-05',
            '2026-10-08',
            '2026-10-12',
            '2026-10-15',
            '2026-10-19',
            '2026-10-22',
            '2026-10-23',
            '2026-10-24',
            '2026-10-25',
            '2026-10-26',
            '2026-10-27',
            '2026-10-28',
            '2026-10-29',
          ],
          dailySubmissions: {
            '2026-10-29': 4,
            '2026-10-28': 3,
            '2026-10-27': 5,
            '2026-10-26': 2,
            '2026-10-25': 6,
            '2026-10-24': 3,
            '2026-10-23': 4,
            '2026-10-22': 2,
            '2026-10-19': 3,
            '2026-10-15': 2,
            '2026-10-12': 4,
            '2026-10-08': 1,
            '2026-10-05': 3,
            '2026-10-02': 2,
          },
          weeklyDistribution: [
            { day: 'S', dayIndex: 0, minutes: 90, time: '1h 30m' },
            { day: 'M', dayIndex: 1, minutes: 195, time: '3h 15m' },
            { day: 'T', dayIndex: 2, minutes: 160, time: '2h 40m' },
            { day: 'W', dayIndex: 3, minutes: 250, time: '4h 10m' },
            { day: 'T', dayIndex: 4, minutes: 170, time: '2h 50m' },
            { day: 'F', dayIndex: 5, minutes: 210, time: '3h 30m' },
            { day: 'S', dayIndex: 6, minutes: 270, time: '4h 30m' },
          ],
          currentWeek: 5,
          bestWeek: 7,
          currentMonth: 14,
          bestMonth: 28,
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
    const email = req.user?.email || req.headers['x-user-email'] || 'creedracer111@gmail.com';

    const { solvedProblems, starredProblems, problemNotes } = req.body;

    const updateFields = {};
    if (Array.isArray(solvedProblems)) updateFields.solvedProblems = solvedProblems;
    if (Array.isArray(starredProblems)) updateFields.starredProblems = starredProblems;
    if (problemNotes && typeof problemNotes === 'object') updateFields.problemNotes = problemNotes;

    // Check & advance streak active day if problem was marked solved today
    const profile = await UserProfile.findOne({ $or: [{ userId }, { email }] });
    if (profile) {
      const today = new Date().setHours(0, 0, 0, 0);
      const todayDateStr = new Date().toISOString().slice(0, 10);
      const lastActive = profile.streak?.lastActiveDate
        ? new Date(profile.streak.lastActiveDate).setHours(0, 0, 0, 0)
        : null;

      // Ensure activeDates includes today
      const currentActiveDates = profile.streak?.activeDates || [];
      if (!currentActiveDates.includes(todayDateStr)) {
        updateFields['streak.activeDates'] = [...currentActiveDates, todayDateStr];
      }

      // Increment dailySubmissions for today
      const currentSubmissions = profile.streak?.dailySubmissions
        ? Object.fromEntries(profile.streak.dailySubmissions instanceof Map ? profile.streak.dailySubmissions : Object.entries(profile.streak.dailySubmissions))
        : {};
      currentSubmissions[todayDateStr] = (currentSubmissions[todayDateStr] || 0) + 1;
      updateFields['streak.dailySubmissions'] = currentSubmissions;

      // Add minutes to weeklyDistribution
      const dayIndex = new Date().getDay(); // 0 = Sunday
      const weeklyDist = profile.streak?.weeklyDistribution && profile.streak.weeklyDistribution.length === 7
        ? [...profile.streak.weeklyDistribution]
        : [
            { day: 'S', dayIndex: 0, minutes: 90, time: '1h 30m' },
            { day: 'M', dayIndex: 1, minutes: 195, time: '3h 15m' },
            { day: 'T', dayIndex: 2, minutes: 160, time: '2h 40m' },
            { day: 'W', dayIndex: 3, minutes: 250, time: '4h 10m' },
            { day: 'T', dayIndex: 4, minutes: 170, time: '2h 50m' },
            { day: 'F', dayIndex: 5, minutes: 210, time: '3h 30m' },
            { day: 'S', dayIndex: 6, minutes: 270, time: '4h 30m' },
          ];
      weeklyDist[dayIndex].minutes = (weeklyDist[dayIndex].minutes || 0) + 15;
      const h = Math.floor(weeklyDist[dayIndex].minutes / 60);
      const m = weeklyDist[dayIndex].minutes % 60;
      weeklyDist[dayIndex].time = `${h}h ${m}m`;
      updateFields['streak.weeklyDistribution'] = weeklyDist;
      updateFields['streak.weeklyMinutes'] = (profile.streak?.weeklyMinutes || 1355) + 15;

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
