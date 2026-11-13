const router = require('express').Router();
const mongoose = require('mongoose');
const UserAccess = require('../models/UserAccess');
const Course = require('../models/Course');
const CourseStore = require('../utils/courseStore');
const CatalogStore = require('../utils/catalogStore');
const UserStore = require('../utils/userStore');
const ActivityOrderStore = require('../utils/activityOrderStore');
const { verifyFirebaseToken, verifyAdmin } = require('../middlewares/authMiddleware');
const { updateCoursePrice } = require('../controllers/adminController');
const { DEFAULT_COURSES } = require('../config/seedCourses');

function formatPublicCourse(c) {
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
    duration: c.duration || 'Flexible Pace',
    level: c.level || 'All Levels',
    whatYouWillLearn: Array.isArray(c.whatYouWillLearn) ? c.whatYouWillLearn : [],
    curriculum: Array.isArray(c.curriculum) ? c.curriculum : [],
    features: c.features || [],
    category: c.category || 'masterclass',
    isMasterclass: Boolean(c.isMasterclass ?? (c.category === 'masterclass' || c.productId === 'masterclass')),
    courseType: c.courseType || c.category || 'masterclass',
    sessionStatus: c.sessionStatus || 'upcoming',
    sessionDate: c.sessionDate || 'Sunday, 11:00 AM IST',
    targetCountdown: c.targetCountdown || null,
    secretPasscode: c.secretPasscode || 'STRIVERS2026',
    mentors:
      c.mentors && c.mentors.length > 0
        ? c.mentors
        : [
            {
              name: 'Alex Morgan',
              role: 'Ex-Google · SDE-2 @ Blinkit',
              company: 'Blinkit',
              avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
            },
            {
              name: 'Priya Sharma',
              role: 'Staff Engineer @ Zomato',
              company: 'Zomato',
              avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
            },
            {
              name: 'Rahul Verma',
              role: 'Engineering Lead @ Porter',
              company: 'Porter',
              avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
            },
          ],
    activeMeetingLink: c.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
    meetingCode: c.meetingCode || 'strivers-placement-live',
    meetingPlatform: c.meetingPlatform || 'Google Meet',
    timingSlots: (c.timingSlots || []).map((s) => ({
      slotId: s.slotId,
      title: s.title || s.dateTime || 'Live Session Slot',
      date: s.date || s.dateTime || 'Upcoming',
      startTime: s.startTime || '',
      endTime: s.endTime || '',
      timezone: s.timezone || 'IST',
      mentorName: s.mentorName || 'Unicorn Mentors',
      mentorRole: s.mentorRole || '',
      agenda: s.agenda || [],
    })),
    materialsCount: (c.notesAndPdfs || []).length,
    isActive: c.isActive !== false,
  };
}

async function resolveUserEnrollment(uid, email) {
  let access = null;
  if (mongoose.connection.readyState === 1 && (uid || email)) {
    try {
      access = await UserAccess.findOne({
        $or: [
          ...(uid && uid !== 'guest' ? [{ userId: uid }] : []),
          ...(email ? [{ email }] : []),
        ],
      }).maxTimeMS(1500);
    } catch (_) {}
  }
  if (!access && (email || uid)) {
    access = UserStore.findRaw(email || uid);
  }
  return access;
}

// 1. List active courses/masterclasses along with dynamic catalog meta (/api/courses)
router.get('/', async (req, res) => {
  try {
    const catalogMeta = CatalogStore.getConfig();
    const storeActive = CourseStore.getActive();
    if (storeActive && storeActive.length > 0) {
      return res.json({
        success: true,
        courses: storeActive.map(formatPublicCourse),
        catalogMeta,
      });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const dbCourses = await Course.find({ isActive: true }).sort({ orderIndex: 1, price: 1 }).maxTimeMS(1500);
        if (dbCourses && dbCourses.length > 0) {
          return res.json({
            success: true,
            courses: dbCourses.map(formatPublicCourse),
            catalogMeta,
          });
        }
      } catch (_) {}
    }

    return res.json({
      success: true,
      courses: DEFAULT_COURSES.map(formatPublicCourse),
      catalogMeta,
    });
  } catch (err) {
    return res.json({
      success: true,
      courses: CourseStore.getActive().map(formatPublicCourse),
      catalogMeta: CatalogStore.getConfig(),
    });
  }
});

// Dynamic Catalog Metadata endpoint (/api/courses/catalog/meta)
router.get('/catalog/meta', async (req, res) => {
  try {
    return res.json({ success: true, catalogMeta: CatalogStore.getConfig() });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/catalog/meta', verifyFirebaseToken, verifyAdmin, async (req, res) => {
  try {
    const updated = CatalogStore.updateConfig(req.body);
    return res.json({ success: true, message: 'Catalog configuration updated.', catalogMeta: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update course price & attributes directly via /courses/:id/price
router.put('/:id/price', verifyFirebaseToken, verifyAdmin, updateCoursePrice);
router.put('/:id', verifyFirebaseToken, verifyAdmin, updateCoursePrice);

// 2. Get specific course/masterclass by ID
router.get('/:id', async (req, res) => {
  try {
    const queryId = (req.params.id || '').trim();
    const localC = CourseStore.getById(queryId);
    if (localC) {
      return res.json({ success: true, course: formatPublicCourse(localC) });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const course = await Course.findOne({
          $or: [{ productId: queryId }, { productId: queryId.toLowerCase() }],
          isActive: true,
        }).maxTimeMS(1500);
        if (course) {
          return res.json({ success: true, course: formatPublicCourse(course) });
        }
      } catch (_) {}
    }

    const defaultC = CourseStore.getActive()[0] || DEFAULT_COURSES[0];
    return res.json({ success: true, course: formatPublicCourse(defaultC) });
  } catch (err) {
    const localC = CourseStore.getById(req.params.id) || CourseStore.getActive()[0] || DEFAULT_COURSES[0];
    return res.json({ success: true, course: formatPublicCourse(localC) });
  }
});

// 3. Gated Course & Masterclass Classroom Access
router.get('/:id/access', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid || 'guest';
    const email = (req.user?.email || req.query?.email || '').trim().toLowerCase();
    const courseId = req.params.id || 'masterclass';

    const access = await resolveUserEnrollment(uid, email);

    const isAdmin = Boolean(req.user?.role === 'admin' || req.user?.isAdmin);
    const isEnrolledInCourse =
      isAdmin ||
      Boolean(
        access?.enrolledCourses?.some(
          (c) => String(c.courseId).toLowerCase() === String(courseId).toLowerCase()
        )
      );

    let activeData = CourseStore.getById(courseId);
    if (!activeData && mongoose.connection.readyState === 1) {
      try {
        activeData = await Course.findOne({ productId: courseId }).maxTimeMS(1500);
      } catch (_) {}
    }
    if (!activeData) {
      activeData = DEFAULT_COURSES.find((c) => c.productId === courseId) || DEFAULT_COURSES[0];
    }

    const watermarkIdentifier = access?.watermarkIdentifier || `${email || 'user'} | ${uid.slice(0, 8)}`;

    const materialsList = (activeData.notesAndPdfs || []).map((m) => ({
      materialId: m.materialId,
      title: m.title,
      description: m.description,
      fileType: m.fileType,
      mimeType: m.mimeType,
      fileSize: m.fileSize,
      viewOnly: true,
      uploadedAt: m.uploadedAt || m.addedAt,
    }));

    const userEnrollment = access?.enrolledCourses?.find((c) => c.courseId === courseId);

    return res.json({
      success: true,
      isEnrolled: Boolean(isEnrolledInCourse),
      enrollmentDetails: userEnrollment
        ? {
            orderId: userEnrollment.orderId,
            txnId: userEnrollment.paymentId,
            paymentId: userEnrollment.paymentId,
            refId: userEnrollment.referenceId,
            referenceId: userEnrollment.referenceId,
            paidAt: userEnrollment.paidAt,
            amount: userEnrollment.amount,
            currency: userEnrollment.currency || 'INR',
            isPermanent: true,
          }
        : null,
      course: {
        productId: activeData.productId,
        title: activeData.title,
        description: activeData.description,
        badge: activeData.badge,
        imageUrl: activeData.imageUrl || '',
        duration: activeData.duration || '',
        level: activeData.level || '',
        whatYouWillLearn: activeData.whatYouWillLearn || [],
        curriculum: activeData.curriculum || [],
        category: activeData.category,
        activeMeetingLink: activeData.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
        meetingCode: activeData.meetingCode || 'strivers-placement-live',
        meetingPlatform: activeData.meetingPlatform || 'Google Meet',
        sessionStatus: activeData.sessionStatus || 'upcoming',
        sessionDate: activeData.sessionDate || 'Sunday, 11:00 AM IST',
        whatsappGroupLink: activeData.whatsappGroupLink || 'https://chat.whatsapp.com/strivers-placement-masterclass',
        mentors: activeData.mentors || [],
        timingSlots: activeData.timingSlots || [],
        notesAndPdfs: materialsList,
      },
      access: {
        type: 'url',
        value: activeData.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
        watermark: watermarkIdentifier,
      },
    });
  } catch (err) {
    console.error('Course access error:', err);
    return res.status(500).json({ success: false, error: 'Failed to retrieve course classroom access' });
  }
});

// 4. Secure Gated Study Material Delivery (View-Only DRM)
router.get('/:id/materials/:materialId', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    const email = (req.user?.email || '').trim().toLowerCase();
    const { id: courseId, materialId } = req.params;

    const access = await resolveUserEnrollment(uid, email);

    const isAdmin = Boolean(req.user?.role === 'admin' || req.user?.isAdmin);
    const isEnrolled =
      isAdmin ||
      Boolean(
        access?.enrolledCourses?.some(
          (c) => String(c.courseId).toLowerCase() === String(courseId).toLowerCase()
        )
      );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Active enrollment required to access this study document.',
      });
    }

    let targetCourse = CourseStore.getById(courseId);
    if (!targetCourse && mongoose.connection.readyState === 1) {
      try {
        targetCourse = await Course.findOne({ productId: courseId }).maxTimeMS(1500);
      } catch (_) {}
    }
    if (!targetCourse) {
      targetCourse = DEFAULT_COURSES.find((c) => c.productId === courseId);
    }

    if (!targetCourse) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const targetMaterialId = String(materialId || '').trim();
    let material = (targetCourse.notesAndPdfs || []).find(
      (m) => String(m.materialId || '').trim() === targetMaterialId || String(m._id || '').trim() === targetMaterialId
    );

    if (!material && mongoose.connection.readyState === 1) {
      try {
        const DownloadableNote = require('../models/DownloadableNote');
        const dNote = await DownloadableNote.findOne({
          $or: [
            { noteId: targetMaterialId.toLowerCase() },
            { noteId: targetMaterialId },
            { _id: mongoose.isValidObjectId(targetMaterialId) ? targetMaterialId : null },
          ],
        }).maxTimeMS(1500);
        if (dNote) {
          material = {
            materialId: dNote.noteId,
            title: dNote.title,
            description: dNote.subtitle,
            fileType: dNote.fileType,
            mimeType: dNote.mimeType,
            fileData: dNote.fileData,
            fileSize: dNote.fileSize,
          };
        }
      } catch (_) {}
    }

    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material document not found.' });
    }

    ActivityOrderStore.addLog({
      event: 'SECURE_DOCUMENT_VIEW',
      userEmail: email || 'student@example.com',
      ip: req.ip || '127.0.0.1',
      metadata: { courseId, materialId, documentTitle: material.title },
      tag: 'DOC',
    });

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline');

    const dynamicWatermark = `${(email || 'STUDENT').toUpperCase()} • STRIVERS LICENSED COPY`;

    return res.json({
      success: true,
      material: {
        materialId: material.materialId,
        title: material.title,
        description: material.description,
        fileType: material.fileType,
        mimeType: material.mimeType,
        fileData: material.fileData,
        fileSize: material.fileSize,
        watermark: dynamicWatermark,
        userEmail: email,
        viewOnly: true,
      },
    });
  } catch (err) {
    console.error('Material retrieval error:', err);
    return res.status(500).json({ success: false, message: 'Error retrieving secure study material.' });
  }
});

module.exports = router;

