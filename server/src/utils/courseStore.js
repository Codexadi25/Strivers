const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { DEFAULT_COURSES } = require('../config/seedCourses');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'courses.json');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  console.warn('[CourseStore] Notice creating data dir:', e.message);
}

let coursesCache = [];

function loadFromFile() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        coursesCache = parsed;
        return;
      }
    }
  } catch (err) {
    console.warn('[CourseStore] Notice reading courses.json:', err.message);
  }

  coursesCache = JSON.parse(JSON.stringify(DEFAULT_COURSES));
  saveToFile();
}

function saveToFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(coursesCache, null, 2), 'utf8');
  } catch (err) {
    console.warn('[CourseStore] Notice writing courses.json:', err.message);
  }
}

loadFromFile();

async function syncToMongo(course) {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const Course = require('../models/Course');
    const query = {
      $or: [
        { productId: course.productId },
        { productId: (course.productId || '').toLowerCase() },
      ],
    };
    await Course.findOneAndUpdate(query, course, { upsert: true, new: true, setDefaultsOnInsert: true }).maxTimeMS(2500);
  } catch (_) {
    // Non-fatal: local JSON persistence is guaranteed
  }
}

const CourseStore = {
  getAll() {
    return [...coursesCache];
  },

  getActive() {
    return coursesCache.filter((c) => c.isActive !== false);
  },

  getById(id) {
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    return (
      coursesCache.find(
        (c) =>
          (c.productId && c.productId.toLowerCase() === clean) ||
          (c._id && String(c._id).toLowerCase() === clean)
      ) || null
    );
  },

  update(id, updates = {}) {
    const clean = String(id || '').trim().toLowerCase();
    let idx = coursesCache.findIndex(
      (c) =>
        (c.productId && c.productId.toLowerCase() === clean) ||
        (c._id && String(c._id).toLowerCase() === clean)
    );

    let course;
    if (idx === -1) {
      course = {
        productId: clean,
        title: updates.title || id,
        price: Number(updates.price) || 21,
        priceInPaise: Math.round((Number(updates.price) || 21) * 100),
        currency: 'INR',
        category: updates.category || 'masterclass',
        isActive: true,
      };
      coursesCache.push(course);
      idx = coursesCache.length - 1;
    } else {
      course = coursesCache[idx];
    }

    const price = updates.price !== undefined && updates.price !== null ? Number(updates.price) : course.price;
    const priceNum = Math.max(1, isNaN(price) ? 21 : price);

    const updated = {
      ...course,
      ...updates,
      price: priceNum,
      priceInPaise: Math.round(priceNum * 100),
      originalPrice:
        updates.originalPrice !== undefined
          ? updates.originalPrice
            ? Number(updates.originalPrice)
            : null
          : course.originalPrice,
      title: updates.title !== undefined ? String(updates.title).trim() : course.title,
      description: updates.description !== undefined ? String(updates.description).trim() : course.description,
      badge: updates.badge !== undefined ? String(updates.badge).trim() : course.badge,
      imageUrl: updates.imageUrl !== undefined ? String(updates.imageUrl).trim() : (course.imageUrl || ''),
      duration: updates.duration !== undefined ? String(updates.duration).trim() : (course.duration || ''),
      level: updates.level !== undefined ? String(updates.level).trim() : (course.level || ''),
      whatYouWillLearn: Array.isArray(updates.whatYouWillLearn)
        ? updates.whatYouWillLearn
        : (course.whatYouWillLearn || []),
      curriculum: Array.isArray(updates.curriculum)
        ? updates.curriculum
        : (course.curriculum || []),
      sessionDate: updates.sessionDate !== undefined ? String(updates.sessionDate).trim() : course.sessionDate,
      activeMeetingLink:
        updates.activeMeetingLink !== undefined
          ? String(updates.activeMeetingLink).trim()
          : updates.meetingLink !== undefined
          ? String(updates.meetingLink).trim()
          : course.activeMeetingLink,
      meetingLink:
        updates.meetingLink !== undefined
          ? String(updates.meetingLink).trim()
          : updates.activeMeetingLink !== undefined
          ? String(updates.activeMeetingLink).trim()
          : course.meetingLink || course.activeMeetingLink,
      meetingCode: updates.meetingCode !== undefined ? String(updates.meetingCode).trim() : course.meetingCode,
      secretPasscode: updates.secretPasscode !== undefined ? String(updates.secretPasscode).trim() : course.secretPasscode || 'STRIVERS2026',
      timingSlots: Array.isArray(updates.timingSlots) ? updates.timingSlots : course.timingSlots || [],
      notesAndPdfs: Array.isArray(updates.notesAndPdfs) ? updates.notesAndPdfs : course.notesAndPdfs || [],
      category: updates.category || course.category || 'masterclass',
      isMasterclass:
        updates.category === 'masterclass' ||
        course.category === 'masterclass' ||
        course.productId === 'masterclass',
      features: Array.isArray(updates.features) ? updates.features : course.features || [],
      mentors: Array.isArray(updates.mentors) ? updates.mentors : course.mentors || [],
      isActive: updates.isActive !== undefined ? Boolean(updates.isActive) : course.isActive !== false,
      updatedAt: new Date().toISOString(),
    };

    coursesCache[idx] = updated;
    saveToFile();
    syncToMongo(updated);

    return updated;
  },

  create(data = {}) {
    const productId = String(data.productId || data.courseId || `course_${Date.now()}`).trim().toLowerCase();
    const existing = this.getById(productId);
    if (existing) {
      return this.update(productId, data);
    }

    const price = Number(data.price) || 21;
    const newCourse = {
      productId,
      title: data.title ? String(data.title).trim() : productId,
      description: data.description ? String(data.description).trim() : '',
      price,
      priceInPaise: Math.round(price * 100),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : null,
      currency: 'INR',
      badge: data.badge ? String(data.badge).trim() : '',
      imageUrl: data.imageUrl ? String(data.imageUrl).trim() : '',
      duration: data.duration ? String(data.duration).trim() : 'Self-Paced / Live',
      level: data.level ? String(data.level).trim() : 'All Levels',
      whatYouWillLearn: Array.isArray(data.whatYouWillLearn) ? data.whatYouWillLearn : [],
      curriculum: Array.isArray(data.curriculum) ? data.curriculum : [],
      category: data.category || 'masterclass',
      isMasterclass: data.category === 'masterclass' || productId.includes('masterclass'),
      courseType: data.category || 'masterclass',
      sessionDate: data.sessionDate ? String(data.sessionDate).trim() : 'Upcoming Live Session',
      activeMeetingLink: data.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
      meetingCode: data.meetingCode || 'strivers-placement-live',
      meetingPlatform: 'Google Meet',
      features: Array.isArray(data.features) ? data.features : [],
      mentors: Array.isArray(data.mentors) ? data.mentors : [],
      isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    coursesCache.push(newCourse);
    saveToFile();
    syncToMongo(newCourse);
    return newCourse;
  },

  delete(id) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = coursesCache.findIndex(
      (c) =>
        (c.productId && c.productId.toLowerCase() === clean) ||
        (c._id && String(c._id).toLowerCase() === clean)
    );
    if (idx !== -1) {
      coursesCache[idx].isActive = false;
      saveToFile();
      syncToMongo(coursesCache[idx]);
      return true;
    }
    return false;
  },

  purge(id) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = coursesCache.findIndex(
      (c) =>
        (c.productId && c.productId.toLowerCase() === clean) ||
        (c._id && String(c._id).toLowerCase() === clean)
    );
    if (idx !== -1) {
      coursesCache.splice(idx, 1);
      saveToFile();
      return true;
    }
    return false;
  },

  formatPublic(c) {
    return {
      _id: c.productId,
      productId: c.productId,
      title: c.title,
      description: c.description,
      price: c.price,
      priceInPaise: c.priceInPaise,
      originalPrice: c.originalPrice,
      currency: c.currency || 'INR',
      badge: c.badge,
      imageUrl: c.imageUrl || '',
      duration: c.duration || 'Self-Paced / Live',
      level: c.level || 'All Levels',
      whatYouWillLearn: Array.isArray(c.whatYouWillLearn) ? c.whatYouWillLearn : [],
      curriculum: Array.isArray(c.curriculum) ? c.curriculum : [],
      features: c.features || [],
      category: c.category || 'masterclass',
      isMasterclass: Boolean(c.isMasterclass ?? (c.category === 'masterclass' || c.productId === 'masterclass')),
      courseType: c.courseType || c.category || 'masterclass',
      sessionStatus: c.sessionStatus || 'upcoming',
      sessionDate: c.sessionDate || 'Sunday, 11:00 AM IST',
      mentors: c.mentors && c.mentors.length > 0 ? c.mentors : [],
      activeMeetingLink: c.activeMeetingLink,
      meetingCode: c.meetingCode,
      meetingPlatform: c.meetingPlatform || 'Google Meet',
      materialsCount: (c.notesAndPdfs || []).length,
      isActive: c.isActive !== false,
    };
  },
};

module.exports = CourseStore;

