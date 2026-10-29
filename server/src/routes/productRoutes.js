const router = require('express').Router();
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');
const { verifyFirebaseToken } = require('../middlewares/authMiddleware');
const Product = require('../models/Product');
const { DEFAULT_PRODUCTS } = require('../config/seedProducts');

// Helper to sanitize product data for public catalog (excluding raw heavy fileData)
function formatPublicProduct(p) {
  return {
    _id: p.productId,
    productId: p.productId,
    title: p.title,
    description: p.description,
    price: p.price,
    priceInPaise: p.priceInPaise,
    originalPrice: p.originalPrice,
    currency: p.currency,
    badge: p.badge,
    features: p.features || [],
    category: p.category || 'masterclass',
    isMasterclass: Boolean(p.isMasterclass ?? (p.category === 'masterclass' || p.productId === 'masterclass')),
    productType: p.productType || p.category || 'masterclass',
    sessionStatus: p.sessionStatus || 'upcoming',
    sessionDate: p.sessionDate || 'Sunday, 11:00 AM IST',
    targetCountdown: p.targetCountdown || null,
    secretPasscode: p.secretPasscode || 'STRIVERS2026',
    mentors: (p.mentors && p.mentors.length > 0)
      ? p.mentors
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
    activeMeetingLink: p.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
    meetingCode: p.meetingCode || 'strivers-placement-live',
    meetingPlatform: p.meetingPlatform || 'Google Meet',
    timingSlots: (p.timingSlots || []).map((s) => ({
      slotId: s.slotId,
      title: s.title,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      timezone: s.timezone,
      mentorName: s.mentorName,
      mentorRole: s.mentorRole,
      agenda: s.agenda || [],
    })),
    materialsCount: (p.notesAndPdfs || []).length,
    isActive: p.isActive,
  };
}

// 1. List active products/masterclasses for landing and catalog
router.get('/', async (req, res) => {
  try {
    const dbProducts = await Product.find({ isActive: true }).sort({ orderIndex: 1, price: 1 });
    if (dbProducts && dbProducts.length > 0) {
      return res.json({ products: dbProducts.map(formatPublicProduct) });
    }
    // Fallback to seeded defaults
    res.json({
      products: DEFAULT_PRODUCTS.map((p) => ({ ...p, _id: p.productId })),
    });
  } catch (err) {
    res.json({
      products: DEFAULT_PRODUCTS.map((p) => ({ ...p, _id: p.productId })),
    });
  }
});

// 2. Get specific product/masterclass by ID
router.get('/:id', async (req, res) => {
  try {
    const queryId = (req.params.id || '').trim();
    const product = await Product.findOne({
      $or: [
        { productId: queryId },
        { productId: queryId.toLowerCase() },
      ],
      isActive: true,
    });
    if (product) {
      return res.json({ product: formatPublicProduct(product) });
    }
    const count = await Product.countDocuments();
    if (count === 0) {
      const defaultP = DEFAULT_PRODUCTS.find((p) => p.productId === queryId) || DEFAULT_PRODUCTS[0];
      return res.json({ product: { ...defaultP, _id: defaultP.productId } });
    }
    return res.status(404).json({ success: false, message: 'Masterclass or course not found.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Gated Course & Masterclass Classroom Access (Meeting link, Timing Slots, Materials Metadata)
router.get('/:id/access', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid || 'guest';
    const email = (req.user?.email || req.query?.email || '').trim().toLowerCase();
    const courseId = req.params.id || 'masterclass';

    // Verify user enrollment or active subscription
    const access = await UserAccess.findOne({
      $or: [
        ...(uid && uid !== 'guest' ? [{ userId: uid }] : []),
        ...(email ? [{ email }] : [{ email: '__no_guest_email__' }]),
      ],
    });

    const isAdmin = Boolean(req.user?.role === 'admin' || req.user?.isAdmin);
    const isEnrolledInCourse =
      isAdmin ||
      (access &&
        (access.enrolledCourses?.some((c) => c.courseId === courseId) ||
          (access.hasActiveSubscription && (!access.expiresAt || new Date(access.expiresAt) > new Date()))));

    // Fetch dynamic course data from MongoDB
    const course = await Product.findOne({ productId: courseId });
    const fallbackCourse = DEFAULT_PRODUCTS.find((p) => p.productId === courseId) || DEFAULT_PRODUCTS[0];
    const activeData = course || fallbackCourse;

    const watermarkIdentifier = access?.watermarkIdentifier || `${email || 'user'} | ${uid.slice(0, 8)}`;

    // Prepare safe study materials list (excluding raw fileData)
    const materialsList = (activeData.notesAndPdfs || []).map((m) => ({
      materialId: m.materialId,
      title: m.title,
      description: m.description,
      fileType: m.fileType,
      mimeType: m.mimeType,
      fileSize: m.fileSize,
      viewOnly: true,
      uploadedAt: m.uploadedAt,
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
        category: activeData.category,
        activeMeetingLink: activeData.activeMeetingLink || 'https://meet.google.com/strivers-placement-live',
        meetingCode: activeData.meetingCode || 'strivers-placement-live',
        meetingPlatform: activeData.meetingPlatform || 'Google Meet',
        sessionStatus: activeData.sessionStatus || 'upcoming',
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
    res.status(500).json({ success: false, error: 'Failed to retrieve course classroom access' });
  }
});

// 4. Secure Gated Study Material Delivery (View-Only DRM, Download Prohibited)
router.get('/:id/materials/:materialId', verifyFirebaseToken, async (req, res) => {
  try {
    const uid = req.user?.uid;
    const email = (req.user?.email || '').trim().toLowerCase();
    const { id: courseId, materialId } = req.params;

    // Check enrollment
    const access = await UserAccess.findOne({
      $or: [{ userId: uid }, { email }],
    });

    const isAdmin = Boolean(req.user?.role === 'admin' || req.user?.isAdmin);
    const isEnrolled =
      isAdmin ||
      (access &&
        (access.enrolledCourses?.some((c) => c.courseId === courseId) ||
          (access.hasActiveSubscription && (!access.expiresAt || new Date(access.expiresAt) > new Date()))));

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'Active enrollment required to access this study document.',
      });
    }

    // Find course & material in MongoDB
    const course = await Product.findOne({ productId: courseId });
    const fallbackCourse = DEFAULT_PRODUCTS.find((p) => p.productId === courseId);
    const targetCourse = course || fallbackCourse;

    if (!targetCourse) {
      return res.status(404).json({ success: false, message: 'Course not found.' });
    }

    const material = (targetCourse.notesAndPdfs || []).find((m) => m.materialId === materialId);
    if (!material) {
      return res.status(404).json({ success: false, message: 'Study material document not found.' });
    }

    // Log the protected view in Audit Log
    try {
      await ActivityLog.create({
        userId: uid,
        userEmail: email,
        action: 'SECURE_DOCUMENT_VIEW',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        metaData: { courseId, materialId, documentTitle: material.title },
      });
    } catch {}

    // Security headers forbidding caching and download triggers
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'inline'); // NEVER attachment!

    const dynamicWatermark = `${email.toUpperCase()} • LICENSED STUDENT • COPYING/DOWNLOAD PROHIBITED • ${new Date().toISOString().slice(0, 10)}`;

    return res.json({
      success: true,
      material: {
        materialId: material.materialId,
        title: material.title,
        description: material.description,
        fileType: material.fileType,
        mimeType: material.mimeType,
        fileData: material.fileData, // Base64 payload from MongoDB
        fileSize: material.fileSize,
        watermark: dynamicWatermark,
        userEmail: email,
        viewOnly: true,
      },
    });
  } catch (err) {
    console.error('Material retrieval error:', err);
    res.status(500).json({ success: false, message: 'Error retrieving secure study material.' });
  }
});

module.exports = router;
