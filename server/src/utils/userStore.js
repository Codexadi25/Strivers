const mongoose = require('mongoose');
const { loadJsonFile, saveJsonFile } = require('./jsonStore');
const { hashPassword } = require('./password');

const USERS_FILE = 'users.json';

function buildSeedUsers() {
  return [
    {
      _id: 'usr_creedracer',
      userId: 'usr_creedracer_01',
      email: 'creedracer111@gmail.com',
      name: 'Root Administrator',
      phone: '+91 9999999999',
      password: hashPassword('admin123'),
      role: 'admin',
      hasActiveSubscription: true,
      expiresAt: null,
      watermarkIdentifier: 'creedracer111@gmail.com | ADMIN',
      enrolledCourses: [
        { courseId: 'masterclass', courseTitle: 'Strivers Placement Masterclass', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
        { courseId: 'channel', courseTitle: 'Paid Job Channel', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
        { courseId: 'course_fullstack', courseTitle: 'Full-Stack Software Engineering', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
      ],
      enrolledPracticeSheets: [],
      maxPracticeSheetsAllowed: 5,
      createdAt: '2026-10-01T08:00:00.000Z',
    },
    {
      _id: 'usr_admin',
      userId: 'admin_root',
      email: 'artisahu6880@gmail.com',
      name: 'Aditya Sahu',
      phone: '+91 9876545543',
      password: hashPassword('admin123'),
      role: 'admin',
      hasActiveSubscription: true,
      expiresAt: null,
      watermarkIdentifier: 'artisahu6880@gmail.com | ADMIN',
      enrolledCourses: [
        { courseId: 'masterclass', courseTitle: 'Strivers Placement Masterclass', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
        { courseId: 'channel', courseTitle: 'Paid Job Channel', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
        { courseId: 'course_fullstack', courseTitle: 'Full-Stack Software Engineering', isPermanent: true, paidAt: '2026-10-01T08:00:00.000Z' },
      ],
      enrolledPracticeSheets: [],
      maxPracticeSheetsAllowed: 5,
      createdAt: '2026-10-01T08:00:00.000Z',
    },
    {
      _id: 'usr_312795448',
      userId: '#312795448',
      email: 'kamaldeep@gmail.com',
      name: 'Kamaldeep',
      phone: '+91 9876545543',
      password: hashPassword('student123'),
      role: 'user',
      hasActiveSubscription: true,
      expiresAt: null,
      watermarkIdentifier: 'kamaldeep@gmail.com | #312795',
      enrolledCourses: [
        { courseId: 'masterclass', courseTitle: 'Strivers Placement Masterclass', isPermanent: true, paidAt: '2026-10-15T12:00:00.000Z' },
      ],
      enrolledPracticeSheets: [],
      maxPracticeSheetsAllowed: 2,
      createdAt: '2026-10-15T12:00:00.000Z',
    },
  ];
}

let usersCache = loadJsonFile(USERS_FILE, buildSeedUsers);

async function syncUserToMongo(user) {
  if (mongoose.connection.readyState !== 1 || !user?.email) return;
  try {
    const UserAccess = require('../models/UserAccess');
    const cleanEmail = user.email.trim().toLowerCase();
    const { _id, ...payload } = user;
    await UserAccess.findOneAndUpdate(
      { email: cleanEmail },
      { $set: { ...payload, email: cleanEmail } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).maxTimeMS(2000);
  } catch (_) {}
}

function sanitizePublicUser(u) {
  if (!u) return null;
  const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
}

const UserStore = {
  getAll({ q = '', role = 'all', subscription = 'all' } = {}) {
    let list = [...usersCache];
    if (role && role !== 'all') {
      list = list.filter((u) => u.role === role);
    }
    if (subscription === 'active') {
      list = list.filter((u) => u.hasActiveSubscription && (!u.expiresAt || new Date(u.expiresAt) > new Date()));
    } else if (subscription === 'expired') {
      list = list.filter((u) => !u.hasActiveSubscription || (u.expiresAt && new Date(u.expiresAt) <= new Date()));
    }
    if (q) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (u) =>
          (u.email || '').toLowerCase().includes(term) ||
          (u.name || '').toLowerCase().includes(term) ||
          (u.userId || '').toLowerCase().includes(term) ||
          (u.phone || '').toLowerCase().includes(term)
      );
    }
    return list.map(sanitizePublicUser);
  },

  findRaw(identifier) {
    if (!identifier) return null;
    const term = String(identifier).trim().toLowerCase();
    return (
      usersCache.find(
        (u) =>
          (u.email && u.email.toLowerCase() === term) ||
          (u.userId && u.userId.toLowerCase() === term) ||
          (u._id && String(u._id).toLowerCase() === term) ||
          (u.phone && u.phone.replace(/\D/g, '').endsWith(term.replace(/\D/g, '')) && term.replace(/\D/g, '').length >= 8)
      ) || null
    );
  },

  findPublic(identifier) {
    return sanitizePublicUser(this.findRaw(identifier));
  },

  upsert(data) {
    const email = (data.email || '').trim().toLowerCase();
    if (!email) return null;
    const idx = usersCache.findIndex((u) => u.email.toLowerCase() === email);
    const nowIso = new Date().toISOString();

    if (idx !== -1) {
      const merged = {
        ...usersCache[idx],
        ...data,
        email,
        updatedAt: nowIso,
      };
      usersCache[idx] = merged;
      saveJsonFile(USERS_FILE, usersCache);
      syncUserToMongo(merged);
      return sanitizePublicUser(merged);
    }

    const uid = data.userId || `usr_${Date.now()}`;
    const newUser = {
      _id: uid,
      userId: uid,
      email,
      name: data.name || email.split('@')[0],
      phone: data.phone || '',
      password: data.password || '',
      role: data.role || 'user',
      hasActiveSubscription: Boolean(data.hasActiveSubscription),
      expiresAt: data.expiresAt || null,
      watermarkIdentifier: data.watermarkIdentifier || `${email} | ${uid.slice(0, 6)}`,
      enrolledCourses: Array.isArray(data.enrolledCourses) ? data.enrolledCourses : [],
      enrolledPracticeSheets: Array.isArray(data.enrolledPracticeSheets) ? data.enrolledPracticeSheets : [],
      maxPracticeSheetsAllowed: data.maxPracticeSheetsAllowed || 2,
      unlockedNotes: Array.isArray(data.unlockedNotes) ? data.unlockedNotes : [],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    usersCache.unshift(newUser);
    saveJsonFile(USERS_FILE, usersCache);
    syncUserToMongo(newUser);
    return sanitizePublicUser(newUser);
  },

  updateByIdOrEmail(identifier, updates) {
    const existing = this.findRaw(identifier);
    if (!existing) return null;
    return this.upsert({ ...existing, ...updates, email: existing.email });
  },

  countActiveSubscribers() {
    const now = new Date();
    return usersCache.filter((u) => u.hasActiveSubscription && (!u.expiresAt || new Date(u.expiresAt) > now)).length;
  },

  purgeByEmail(email) {
    const clean = String(email || '').trim().toLowerCase();
    if (!clean) return false;
    const before = usersCache.length;
    usersCache = usersCache.filter((u) => String(u.email || '').toLowerCase() !== clean);
    if (usersCache.length !== before) {
      saveJsonFile(USERS_FILE, usersCache);
      return true;
    }
    return false;
  },

  deleteByIdOrEmail(identifier) {
    const existing = this.findRaw(identifier);
    if (!existing) return null;
    const targetEmail = String(existing.email || '').trim().toLowerCase();
    const targetUid = String(existing.userId || existing._id || '').trim().toLowerCase();
    usersCache = usersCache.filter((u) => {
      const em = String(u.email || '').trim().toLowerCase();
      const uid = String(u.userId || '').trim().toLowerCase();
      const oid = String(u._id || '').trim().toLowerCase();
      return em !== targetEmail && uid !== targetUid && oid !== targetUid;
    });
    saveJsonFile(USERS_FILE, usersCache);
    if (mongoose.connection.readyState === 1) {
      try {
        const UserAccess = require('../models/UserAccess');
        UserAccess.deleteOne({
          $or: [{ email: targetEmail }, { userId: existing.userId }],
        })
          .maxTimeMS(2000)
          .catch(() => {});
      } catch (_) {}
    }
    return sanitizePublicUser(existing);
  },
};

module.exports = UserStore;
