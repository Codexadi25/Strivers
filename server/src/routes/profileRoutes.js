const router = require('express').Router();
const mongoose = require('mongoose');
const UserProfile = require('../models/UserProfile');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const { loadJsonFile, saveJsonFile } = require('../utils/jsonStore');

const PROFILES_FILE = 'profiles.json';

function isMongoReady() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

function defaultStreak() {
  return {
    currentStreak: 0,
    bestStreak: 0,
    totalActiveDays: 0,
    lastActiveDate: null,
    weeklyMinutes: 0,
    activeDates: [],
    dailySubmissions: {},
    weeklyDistribution: [
      { day: 'S', dayIndex: 0, minutes: 0, time: '0h 0m' },
      { day: 'M', dayIndex: 1, minutes: 0, time: '0h 0m' },
      { day: 'T', dayIndex: 2, minutes: 0, time: '0h 0m' },
      { day: 'W', dayIndex: 3, minutes: 0, time: '0h 0m' },
      { day: 'T', dayIndex: 4, minutes: 0, time: '0h 0m' },
      { day: 'F', dayIndex: 5, minutes: 0, time: '0h 0m' },
      { day: 'S', dayIndex: 6, minutes: 0, time: '0h 0m' },
    ],
    currentWeek: 0,
    bestWeek: 0,
    currentMonth: 0,
    bestMonth: 0,
  };
}

function buildDefaultProfile(user) {
  const email = (user.email || '').trim().toLowerCase();
  return {
    userId: user.uid || user.id || email,
    email,
    name: user.name || email.split('@')[0] || 'Student',
    handle: `@${email.split('@')[0] || 'student'}`,
    roleTitle: 'Software Development Engineer',
    college: '',
    graduationYear: 2026,
    targetCompanies: ['Zomato', 'Blinkit', 'Swiggy', 'Porter', 'Flipkart', 'Amazon'],
    solvedProblems: [],
    starredProblems: [],
    problemNotes: {},
    streak: defaultStreak(),
  };
}

function readLocalProfiles() {
  const data = loadJsonFile(PROFILES_FILE, () => []);
  return Array.isArray(data) ? data : [];
}

function findLocalProfile(userId, email) {
  const profiles = readLocalProfiles();
  return profiles.find(
    (p) => (email && p.email === email) || (userId && p.userId === userId)
  );
}

function upsertLocalProfile(userId, email, patchFn) {
  const profiles = readLocalProfiles();
  const idx = profiles.findIndex(
    (p) => (email && p.email === email) || (userId && p.userId === userId)
  );
  const existing = idx >= 0 ? profiles[idx] : { userId, email };
  const updated = patchFn(existing);
  if (idx >= 0) {
    profiles[idx] = updated;
  } else {
    profiles.push(updated);
  }
  saveJsonFile(PROFILES_FILE, profiles);
  return updated;
}

// GET /api/v1/profile/me - Requires valid authenticated student/admin session
router.get('/me', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userId = req.user.uid || req.user.id || req.user.email;
    const email = (req.user.email || '').trim().toLowerCase();

    let profile = null;
    if (isMongoReady()) {
      profile = await UserProfile.findOne({ $or: [{ userId }, { email }] }).lean();
      if (!profile) {
        const created = await UserProfile.create(buildDefaultProfile(req.user));
        profile = created.toObject ? created.toObject() : created;
      }
    }

    if (!profile) {
      profile = findLocalProfile(userId, email);
      if (!profile) {
        profile = upsertLocalProfile(userId, email, () => buildDefaultProfile(req.user));
      }
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

// PUT /api/v1/profile/me - Update authenticated profile metadata
router.put('/me', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userId = req.user.uid || req.user.id || req.user.email;
    const email = (req.user.email || '').trim().toLowerCase();

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

    const localUpdated = upsertLocalProfile(userId, email, (existing) => ({
      ...buildDefaultProfile(req.user),
      ...existing,
      ...updateFields,
    }));

    let profile = localUpdated;
    if (isMongoReady()) {
      profile = await UserProfile.findOneAndUpdate(
        { $or: [{ userId }, { email }] },
        { $set: updateFields },
        { new: true, upsert: true }
      ).lean();
    }

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

// POST /api/v1/profile/progress - Sync solved/starred problems for authenticated user
router.post('/progress', verifyFirebaseToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    const userId = req.user.uid || req.user.id || req.user.email;
    const email = (req.user.email || '').trim().toLowerCase();
    const { solvedProblems, starredProblems, problemNotes } = req.body;

    const updateFields = {};
    if (Array.isArray(solvedProblems)) updateFields.solvedProblems = solvedProblems;
    if (Array.isArray(starredProblems)) updateFields.starredProblems = starredProblems;
    if (problemNotes && typeof problemNotes === 'object') updateFields.problemNotes = problemNotes;

    const localUpdated = upsertLocalProfile(userId, email, (existing) => {
      const base = existing.streak ? existing : buildDefaultProfile(req.user);
      const streak = { ...(base.streak || defaultStreak()) };
      const today = new Date().setHours(0, 0, 0, 0);
      const todayDateStr = new Date().toISOString().slice(0, 10);
      const lastActive = streak.lastActiveDate
        ? new Date(streak.lastActiveDate).setHours(0, 0, 0, 0)
        : null;

      const activeDates = Array.isArray(streak.activeDates) ? [...streak.activeDates] : [];
      if (!activeDates.includes(todayDateStr)) {
        activeDates.push(todayDateStr);
      }
      streak.activeDates = activeDates;

      const dailySubmissions = { ...(streak.dailySubmissions || {}) };
      dailySubmissions[todayDateStr] = (dailySubmissions[todayDateStr] || 0) + 1;
      streak.dailySubmissions = dailySubmissions;

      const dayIndex = new Date().getDay();
      const weeklyDist = Array.isArray(streak.weeklyDistribution) && streak.weeklyDistribution.length === 7
        ? streak.weeklyDistribution.map((d) => ({ ...d }))
        : defaultStreak().weeklyDistribution;
      weeklyDist[dayIndex].minutes = (weeklyDist[dayIndex].minutes || 0) + 15;
      const h = Math.floor(weeklyDist[dayIndex].minutes / 60);
      const m = weeklyDist[dayIndex].minutes % 60;
      weeklyDist[dayIndex].time = `${h}h ${m}m`;
      streak.weeklyDistribution = weeklyDist;
      streak.weeklyMinutes = (streak.weeklyMinutes || 0) + 15;

      if (!lastActive || today > lastActive) {
        streak.totalActiveDays = (streak.totalActiveDays || 0) + 1;
        streak.currentStreak = (streak.currentStreak || 0) + 1;
        if (streak.currentStreak > (streak.bestStreak || 0)) {
          streak.bestStreak = streak.currentStreak;
        }
        streak.lastActiveDate = new Date().toISOString();
      }

      return {
        ...base,
        ...updateFields,
        streak,
      };
    });

    let updated = localUpdated;
    if (isMongoReady()) {
      const mongoDoc = await UserProfile.findOneAndUpdate(
        { $or: [{ userId }, { email }] },
        {
          $set: {
            ...updateFields,
            streak: localUpdated.streak,
          },
        },
        { new: true, upsert: true }
      ).lean();
      if (mongoDoc) updated = mongoDoc;
    }

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
