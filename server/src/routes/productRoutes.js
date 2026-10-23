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
    sessionStatus: p.sessionStatus || 'upcoming',
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
    const product = await Product.findOne({ productId: req.params.id, isActive: true });
    if (product) {
      return res.json({ product: formatPublicProduct(product) });
    }
    const defaultP = DEFAULT_PRODUCTS.find((p) => p.productId === req.params.id) || DEFAULT_PRODUCTS[0];
    res.json({ product: { ...defaultP, _id: defaultP.productId } });
  } catch (err) {
    const defaultP = DEFAULT_PRODUCTS.find((p) => p.productId === req.params.id) || DEFAULT_PRODUCTS[0];
    res.json({ product: { ...defaultP, _id: defaultP.productId } });
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

    return res.json({
      success: true,
      isEnrolled: Boolean(isEnrolledInCourse),
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
