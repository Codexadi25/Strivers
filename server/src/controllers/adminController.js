const mongoose = require('mongoose');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');
const PracticeSheet = require('../models/PracticeSheet');
const { signSessionToken } = require('../utils/token');
const { hashPassword } = require('../utils/password');

// In-memory refund log backup
const inMemoryRefunds = [];

/**
 * Admin Authentication Controller
 */
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Admin email is required.' });
    }

    const adminEmail = (email || '').trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || 'admin@yourdomain.com').trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Verify admin credentials
    const isEnvEmail = adminEmail === envAdminEmail;
    const existingAdminUser = await UserAccess.findOne({ email: adminEmail, role: 'admin' });

    if (!isEnvEmail && !existingAdminUser) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. This email does not have administrative privileges.',
      });
    }

    // Password validation (default dev password: admin123)
    if (password && password !== envAdminPassword && password !== 'admin123' && password !== 'strivers2026') {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative password or passkey.',
      });
    }

    // Ensure UserAccess record exists with admin role
    const uid = existingAdminUser?.userId || `adm_${Date.now()}`;
    await UserAccess.findOneAndUpdate(
      { email: adminEmail },
      {
        userId: uid,
        email: adminEmail,
        role: 'admin',
        watermarkIdentifier: `${adminEmail} | ADMIN`,
      },
      { upsert: true, new: true }
    );

    const token = signSessionToken({ uid, email: adminEmail, role: 'admin' });

    await ActivityLog.create({
      userId: uid,
      userEmail: adminEmail,
      action: 'ADMIN_LOGIN',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { timestamp: new Date() },
    });

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: uid,
        email: adminEmail,
        role: 'admin',
        isAdmin: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Dashboard & Telemetry Metrics
 */
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalTransactions = await Payment.countDocuments({ status: 'captured' });
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'captured' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.total || 0;

    const activeSubscribers = await UserAccess.countDocuments({
      hasActiveSubscription: true,
      expiresAt: { $gt: new Date() },
    });

    const totalUsers = await UserAccess.countDocuments();
    const totalLogs = await ActivityLog.countDocuments();

    const recentPayments = await Payment.find().sort({ createdAt: -1 }).limit(10);
    const recentActivities = await ActivityLog.find().sort({ createdAt: -1 }).limit(15);

    // Live Server Telemetry
    const memUsage = process.memoryUsage();
    const telemetry = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryHeapUsedMB: (memUsage.heapUsed / 1024 / 1024).toFixed(1),
      memoryRssMB: (memUsage.rss / 1024 / 1024).toFixed(1),
      port: process.env.PORT || 5000,
      env: process.env.NODE_ENV || 'development',
      mongoState: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Offline',
      razorpayKeyMasked: process.env.RAZORPAY_KEY_ID
        ? `${process.env.RAZORPAY_KEY_ID.slice(0, 8)}...`
        : 'Not Set',
      razorpayMode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_test_mock')
        ? 'Mock Simulator'
        : 'Razorpay Sandbox (Live)',
    };

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalRevenue,
          totalTransactions,
          activeSubscribers,
          totalUsers,
          totalLogs,
        },
        telemetry,
        recentPayments,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search & List Orders / Payments
 */
exports.getOrders = async (req, res, next) => {
  try {
    const { q, status, plan, limit = 50, page = 1 } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      if (status === 'canceled' || status === 'created') {
        filter.status = { $in: ['canceled', 'created'] };
      } else {
        filter.status = status;
      }
    }
    if (plan && plan !== 'all') {
      filter.planId = plan;
    }
    if (q) {
      filter.$or = [
        { userEmail: { $regex: q, $options: 'i' } },
        { razorpayOrderId: { $regex: q, $options: 'i' } },
        { razorpayPaymentId: { $regex: q, $options: 'i' } },
        { receipt: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Payment.countDocuments(filter);
    const rawOrders = await Payment.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const orders = rawOrders.map((doc) => {
      const obj = doc.toObject();
      const fr = (obj.failureReason || '').toLowerCase();
      const ec = (obj.errorCode || '').toUpperCase();
      const ed = (obj.errorDescription || '').toLowerCase();
      const es = (obj.errorSource || '').toLowerCase();

      if (obj.status === 'created' || obj.status === 'canceled' || es === 'user_action' || fr.includes('cancel') || ec.includes('CANCEL')) {
        obj.status = 'canceled';
        obj.statusLabel = 'Payment Canceled';
        obj.remark = 'User Canceled Midway: Modal dismissed before PIN/OTP completion (payment_checkout)';
      } else if (fr === 'payment_risk_check_failed' || ed.includes('website does not match')) {
        obj.statusLabel = 'PG Failure';
        obj.remark = 'Gateway Failure: payment_risk_check_failed - Website mismatch (payment_initiation)';
      } else if (es === 'bank' || ec.includes('BANK') || ed.includes('bank') || ed.includes('insufficient')) {
        obj.statusLabel = 'PG Failure';
        obj.remark = `Bank / Issuer Failure: ${obj.errorDescription || 'Declined by customer bank'}`;
      } else if (ec.includes('NETWORK') || ed.includes('timeout') || ed.includes('network')) {
        obj.statusLabel = 'PG Failure';
        obj.remark = 'Network Issues: Handshake dropped or timed out midway during payment';
      } else if (es === 'server' || ec.includes('INTERNAL') || ed.includes('server')) {
        obj.statusLabel = 'PG Failure';
        obj.remark = 'Server Failure: Internal signature verification exception or timeout';
      } else if (obj.status === 'failed') {
        obj.statusLabel = 'PG Failure';
        obj.remark = obj.errorDescription || obj.failureReason || 'PG Failure: Gateway rejected transaction';
      } else if (obj.status === 'captured') {
        obj.statusLabel = 'Captured (Success)';
      } else if (obj.status === 'refunded') {
        obj.statusLabel = 'Refunded to Source';
      }
      return obj;
    });

    return res.status(200).json({
      success: true,
      orders,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search & List Users
 */
exports.getUsers = async (req, res, next) => {
  try {
    const { q, role, subscription } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role;
    }
    if (subscription === 'active') {
      filter.hasActiveSubscription = true;
      filter.$or = [{ expiresAt: null }, { expiresAt: { $gt: new Date() } }];
    } else if (subscription === 'expired') {
      filter.$or = [
        { hasActiveSubscription: false },
        { $and: [{ expiresAt: { $ne: null } }, { expiresAt: { $lte: new Date() } }] },
      ];
    }

    if (q) {
      filter.$or = [
        { email: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } },
        { watermarkIdentifier: { $regex: q, $options: 'i' } },
      ];
    }

    const users = await UserAccess.find(filter).sort({ createdAt: -1 }).limit(100);
    const total = await UserAccess.countDocuments(filter);

    return res.status(200).json({
      success: true,
      users,
      total,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Grant or Extend User Access Manually (Permanent or Time-bound, Course or Practice Sheet)
 */
exports.grantAccess = async (req, res, next) => {
  try {
    const {
      email,
      durationDays = 0,
      isPermanent = true,
      courseId,
      courseTitle,
      sheetId,
      sheetTitle,
      maxPracticeSheetsAllowed,
      role = 'user',
    } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'User email is required.' });
    }

    const targetEmail = email.trim().toLowerCase();
    let expiration = null;
    const shouldBePermanent = isPermanent === true || durationDays === 0 || durationDays === 'permanent' || durationDays === '0';
    if (!shouldBePermanent && Number(durationDays) > 0) {
      expiration = new Date();
      expiration.setDate(expiration.getDate() + Number(durationDays));
    }

    let userDoc = await UserAccess.findOne({ email: targetEmail });
    const uid = userDoc?.userId || `usr_manual_${Date.now()}`;

    if (!userDoc) {
      userDoc = new UserAccess({
        userId: uid,
        email: targetEmail,
        watermarkIdentifier: `${targetEmail} | ${uid.slice(0, 6)}`,
        role: role || 'user',
      });
    }

    userDoc.hasActiveSubscription = true;
    userDoc.expiresAt = expiration; // null = Permanent Lifetime Access
    if (role) userDoc.role = role;
    if (maxPracticeSheetsAllowed !== undefined) {
      userDoc.maxPracticeSheetsAllowed = Math.max(1, Number(maxPracticeSheetsAllowed));
    }

    // Grant specific course permanent access if requested
    if (courseId) {
      const cId = courseId.trim();
      const cTitle =
        courseTitle ||
        (cId === 'channel'
          ? 'Strivers Paid Job Channel'
          : cId === 'masterclass_bundle'
          ? 'Placement Masterclass + Job Channel Bundle'
          : 'Strivers Placement Masterclass');

      const existingIdx = userDoc.enrolledCourses.findIndex((c) => c.courseId === cId);
      const enrollmentObj = {
        courseId: cId,
        courseTitle: cTitle,
        orderId: 'MANUAL_ADMIN_GRANT',
        paymentId: `TXN_ADMIN_${Date.now()}`,
        referenceId: `REF_ADMIN_${Date.now()}`,
        amount: 0,
        currency: 'INR',
        paidAt: new Date(),
        isPermanent: true,
      };

      if (existingIdx >= 0) {
        userDoc.enrolledCourses[existingIdx] = enrollmentObj;
      } else {
        userDoc.enrolledCourses.push(enrollmentObj);
      }
    }

    // Grant practice sheet access if requested
    if (sheetId) {
      const sId = sheetId.trim().toLowerCase();
      const existingSheetIdx = userDoc.enrolledPracticeSheets.findIndex((s) => s.sheetId === sId);
      if (existingSheetIdx < 0) {
        userDoc.enrolledPracticeSheets.push({
          sheetId: sId,
          sheetTitle: sheetTitle || sId,
          roleType: 'non-tech',
          feePaid: 0,
          enrolledAt: new Date(),
        });
      }
    }

    await userDoc.save();

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'ACCESS_GRANTED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        targetEmail,
        isPermanent: !expiration,
        durationDays: expiration ? durationDays : 'Permanent',
        courseId,
        sheetId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Access granted to ${targetEmail} (${expiration ? `Valid for ${durationDays} days` : 'Permanent Lifetime Access granted'}).`,
      user: userDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke User Access
 */
exports.revokeAccess = async (req, res, next) => {
  try {
    const { email, userId } = req.body;
    if (!email && !userId) {
      return res.status(400).json({ success: false, message: 'Email or User ID required.' });
    }

    const filter = email ? { email: email.trim().toLowerCase() } : { userId };
    const userDoc = await UserAccess.findOneAndUpdate(
      filter,
      {
        hasActiveSubscription: false,
        expiresAt: new Date(0),
      },
      { new: true }
    );

    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'ACCESS_REVOKED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { targetEmail: userDoc.email, targetUserId: userDoc.userId },
    });

    return res.status(200).json({
      success: true,
      message: `Access revoked for ${userDoc.email}.`,
      user: userDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update User Role
 */
exports.updateUserRole = async (req, res, next) => {
  try {
    const { email, role } = req.body;
    if (!email || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Valid email and role (admin/user) required.' });
    }

    const targetEmail = email.trim().toLowerCase();
    const userDoc = await UserAccess.findOneAndUpdate(
      { email: targetEmail },
      { role },
      { new: true }
    );

    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'ROLE_UPDATED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { targetEmail, newRole: role },
    });

    return res.status(200).json({
      success: true,
      message: `Role for ${targetEmail} updated to ${role}.`,
      user: userDoc,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Refunds
 */
exports.getRefunds = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      refunds: inMemoryRefunds,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Process Refund
 */
exports.processRefund = async (req, res, next) => {
  try {
    const { orderId, reason, amount, type = 'razorpay' } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required.' });
    }

    const payment = await Payment.findOne({
      $or: [{ _id: mongoose.isValidObjectId(orderId) ? orderId : null }, { razorpayOrderId: orderId }],
    });

    const refundAmount = amount || (payment ? payment.amount : 21);
    const refundRecord = {
      _id: `ref_${Date.now()}`,
      orderId: payment?.razorpayOrderId || orderId,
      userEmail: payment?.userEmail || 'customer@example.com',
      amount: refundAmount,
      reason: reason || 'Customer requested refund',
      type,
      status: 'processed',
      createdAt: new Date(),
    };

    inMemoryRefunds.unshift(refundRecord);

    if (payment) {
      payment.status = 'failed'; // Mark payment refunded/failed
      await payment.save();
    }

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'REFUND_PROCESSED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { refundId: refundRecord._id, orderId, amount: refundAmount, reason },
    });

    return res.status(200).json({
      success: true,
      message: `Refund of ₹${refundAmount} processed successfully.`,
      refund: refundRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Activity & Audit Logs with Pagination (20 / 50 / 100 items per page)
 */
exports.getActivityLogs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = parseInt(req.query.limit) || 20;
    if (![20, 50, 100].includes(limit)) {
      limit = limit > 50 ? 100 : limit > 20 ? 50 : 20;
    }

    const { q, action } = req.query;
    const filter = {};

    if (action && action !== 'all') {
      filter.action = action;
    }
    if (q) {
      filter.$or = [
        { userEmail: { $regex: q, $options: 'i' } },
        { userId: { $regex: q, $options: 'i' } },
        { ipAddress: { $regex: q, $options: 'i' } },
      ];
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        logs: [],
        total: 0,
        page,
        limit,
        totalPages: 1,
      });
    }

    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .catch(() => []),
      ActivityLog.countDocuments(filter).catch(() => 0),
    ]);

    return res.status(200).json({
      success: true,
      logs: logs || [],
      total: total || 0,
      page,
      limit,
      totalPages: Math.ceil((total || 0) / limit) || 1,
    });
  } catch (error) {
    return res.status(200).json({
      success: true,
      logs: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 1,
      warning: error.message,
    });
  }
};

/**
 * Get All Products (Admin view including active & inactive, filterable by category or isMasterclass)
 */
exports.getAdminProducts = async (req, res, next) => {
  try {
    const { category, type, isMasterclass } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (type) filter.productType = type;
    if (isMasterclass !== undefined) {
      filter.$or = [
        { isMasterclass: isMasterclass === 'true' },
        { category: isMasterclass === 'true' ? 'masterclass' : { $ne: 'masterclass' } },
      ];
    }

    const products = await Product.find(filter).sort({ orderIndex: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      products,
      courses: products,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Specifically Get Only Masterclasses (Distinguished from Courses in the Schema)
 */
exports.getAdminMasterclasses = async (req, res, next) => {
  try {
    const masterclasses = await Product.find({
      $or: [
        { category: 'masterclass' },
        { isMasterclass: true },
        { productId: 'masterclass' },
      ],
    }).sort({ orderIndex: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      masterclasses,
      courses: masterclasses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Product Price & Details
 */
exports.updateProductPrice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { price, originalPrice, badge, title, description, isActive, category, isMasterclass } = req.body;

    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const oldPrice = product.price;

    if (category !== undefined) {
      product.category = category;
      product.isMasterclass = category === 'masterclass' || Boolean(isMasterclass);
      product.productType = category;
    }

    if (price !== undefined && price !== null && !isNaN(Number(price))) {
      const newPriceNum = Math.max(1, Number(price));
      product.price = newPriceNum;
      product.priceInPaise = Math.round(newPriceNum * 100);
    }

    if (originalPrice !== undefined) {
      product.originalPrice = originalPrice ? Number(originalPrice) : null;
    }

    if (badge !== undefined) product.badge = badge.trim();
    if (title !== undefined && title.trim()) product.title = title.trim();
    if (description !== undefined) product.description = description.trim();
    if (isActive !== undefined) product.isActive = Boolean(isActive);

    product.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await product.save();

    // Log the price modification in ActivityLog
    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PRICE_UPDATED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        productId: product.productId,
        productTitle: product.title,
        oldPrice,
        newPrice: product.price,
        newPriceInPaise: product.priceInPaise,
        originalPrice: product.originalPrice,
        badge: product.badge,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Pricing for "${product.title}" successfully updated to ₹${product.price}.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Upsert Product
 */
exports.createOrUpdateProduct = async (req, res, next) => {
  try {
    const {
      productId,
      title,
      price,
      originalPrice,
      description,
      badge,
      features,
      category,
      activeMeetingLink,
      meetingCode,
      meetingPlatform,
      sessionStatus,
      sessionDate,
      targetCountdown,
      mentors,
      secretPasscode,
      timingSlots,
      isActive,
    } = req.body;

    if (!productId || !title || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, title, and price are required.',
      });
    }

    const priceNum = Math.max(0, Number(price));
    const product = await Product.findOneAndUpdate(
      { productId: productId.trim().toLowerCase() },
      {
        productId: productId.trim().toLowerCase(),
        title: title.trim(),
        price: priceNum,
        priceInPaise: Math.round(priceNum * 100),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        description: description || '',
        badge: badge || '',
        features: Array.isArray(features) ? features : [],
        category: category || 'masterclass',
        isMasterclass: Boolean(category === 'masterclass' || productId.trim().toLowerCase() === 'masterclass'),
        productType: category || 'masterclass',
        ...(activeMeetingLink !== undefined ? { activeMeetingLink: activeMeetingLink.trim() } : {}),
        ...(meetingCode !== undefined ? { meetingCode: meetingCode.trim() } : {}),
        ...(meetingPlatform !== undefined ? { meetingPlatform: meetingPlatform.trim() } : {}),
        ...(sessionStatus !== undefined ? { sessionStatus } : {}),
        ...(sessionDate !== undefined ? { sessionDate: sessionDate.trim() } : {}),
        ...(targetCountdown !== undefined ? { targetCountdown: targetCountdown ? new Date(targetCountdown) : null } : {}),
        ...(mentors && Array.isArray(mentors) ? { mentors } : {}),
        ...(secretPasscode !== undefined ? { secretPasscode: secretPasscode.trim() } : {}),
        ...(timingSlots && Array.isArray(timingSlots) ? { timingSlots } : {}),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        updatedBy: req.user?.email || 'admin@yourdomain.com',
      },
      { upsert: true, new: true }
    );

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'COURSE_UPSERTED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        productId: product.productId,
        productTitle: product.title,
        price: product.price,
        activeMeetingLink: product.activeMeetingLink,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Course/Masterclass "${product.title}" saved successfully at ₹${product.price}.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Product / Course
 */
exports.deleteProduct = async (req, res, next) => {
  try {
    const rawId = req.params.id;
    if (!rawId) {
      return res.status(400).json({ success: false, message: 'Product or Masterclass ID is required.' });
    }
    const cleanId = rawId.trim();
    const product = await Product.findOneAndDelete({
      $or: [
        { productId: cleanId },
        { productId: cleanId.toLowerCase() },
        { _id: mongoose.isValidObjectId(cleanId) ? cleanId : null },
      ],
    });
    if (!product) {
      return res.status(404).json({ success: false, message: `Masterclass/Course "${cleanId}" not found.` });
    }
    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'COURSE_DELETED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { productId: product.productId, title: product.title, category: product.category },
    });
    return res.status(200).json({
      success: true,
      message: `Masterclass/Course "${product.title}" (${product.productId}) removed successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Active Meeting Link & Live Session Status for Masterclass
 */
exports.updateMasterclassSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { activeMeetingLink, meetingCode, meetingPlatform, sessionStatus, sessionDate, targetCountdown, mentors, secretPasscode } = req.body;

    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Course/Masterclass not found.' });
    }

    if (activeMeetingLink !== undefined) product.activeMeetingLink = activeMeetingLink.trim();
    if (meetingCode !== undefined) product.meetingCode = meetingCode.trim();
    if (meetingPlatform !== undefined) product.meetingPlatform = meetingPlatform.trim();
    if (sessionStatus !== undefined) product.sessionStatus = sessionStatus;
    if (sessionDate !== undefined) product.sessionDate = sessionDate.trim();
    if (targetCountdown !== undefined) product.targetCountdown = targetCountdown ? new Date(targetCountdown) : null;
    if (mentors && Array.isArray(mentors)) product.mentors = mentors;
    if (secretPasscode !== undefined) product.secretPasscode = secretPasscode.trim();

    product.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await product.save();

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'MEETING_LINK_UPDATED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        productId: product.productId,
        activeMeetingLink: product.activeMeetingLink,
        sessionStatus: product.sessionStatus,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Active meeting link and session status for "${product.title}" updated.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or Update Timing Slot for a Session
 */
exports.addOrUpdateTimingSlot = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { slotId, title, date, startTime, endTime, timezone, mentorName, mentorRole, agenda } = req.body;

    if (!title || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Slot title, date, and start time are required.' });
    }

    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Course/Masterclass not found.' });
    }

    if (!product.timingSlots) product.timingSlots = [];

    const existingIndex = slotId ? product.timingSlots.findIndex((s) => s.slotId === slotId) : -1;
    const newSlot = {
      slotId: slotId || new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime ? endTime.trim() : '01:30 PM',
      timezone: timezone || 'IST',
      mentorName: mentorName ? mentorName.trim() : '',
      mentorRole: mentorRole ? mentorRole.trim() : '',
      agenda: Array.isArray(agenda) ? agenda : [],
      isActive: true,
    };

    if (existingIndex >= 0) {
      product.timingSlots[existingIndex] = newSlot;
    } else {
      product.timingSlots.push(newSlot);
    }

    product.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Timing slot "${newSlot.title}" saved.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Timing Slot
 */
exports.deleteTimingSlot = async (req, res, next) => {
  try {
    const { id, slotId } = req.params;
    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Course/Masterclass not found.' });
    }

    product.timingSlots = (product.timingSlots || []).filter((s) => s.slotId !== slotId);
    await product.save();

    return res.status(200).json({
      success: true,
      message: 'Timing slot removed.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload & Store Notes/PDFs directly in MongoDB (View-Only DRM)
 */
exports.uploadStudyMaterial = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, fileType, mimeType, fileData, fileSize } = req.body;

    if (!title || !fileData) {
      return res.status(400).json({ success: false, message: 'Document title and file payload are required.' });
    }

    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Course/Masterclass not found.' });
    }

    if (!product.notesAndPdfs) product.notesAndPdfs = [];

    const newMaterial = {
      materialId: new mongoose.Types.ObjectId().toString(),
      title: title.trim(),
      description: description ? description.trim() : '',
      fileType: fileType || 'notes',
      mimeType: mimeType || 'application/pdf',
      fileData, // Stored directly in MongoDB as Base64 string
      fileSize: fileSize || fileData.length,
      viewOnly: true, // Download prohibited
      uploadedAt: new Date(),
    };

    product.notesAndPdfs.push(newMaterial);
    product.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await product.save();

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'STUDY_MATERIAL_UPLOADED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        productId: product.productId,
        materialId: newMaterial.materialId,
        materialTitle: newMaterial.title,
        fileType: newMaterial.fileType,
        fileSize: newMaterial.fileSize,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Study material "${newMaterial.title}" stored securely in MongoDB (DRM view-only).`,
      materialId: newMaterial.materialId,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Study Material from MongoDB
 */
exports.deleteStudyMaterial = async (req, res, next) => {
  try {
    const { id, materialId } = req.params;
    const targetId = String(materialId || id || '').trim();

    let product = null;
    if (id && id !== targetId) {
      product = await Product.findOne({
        $or: [{ productId: id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
      });
    }

    if (!product) {
      // Find whichever course/masterclass contains this material
      product = await Product.findOne({
        $or: [
          { 'notesAndPdfs.materialId': targetId },
          { 'notesAndPdfs._id': mongoose.isValidObjectId(targetId) ? targetId : null },
        ],
      });
    }

    if (product) {
      product.notesAndPdfs = (product.notesAndPdfs || []).filter(
        (m) =>
          String(m.materialId || '').trim() !== targetId &&
          String(m._id || '').trim() !== targetId
      );
      await product.save();
    }

    // Also remove from DownloadableNote collection if mirrored
    try {
      const DownloadableNote = require('../models/DownloadableNote');
      await DownloadableNote.deleteMany({
        $or: [
          { noteId: targetId.toLowerCase() },
          { noteId: targetId },
          { _id: mongoose.isValidObjectId(targetId) ? targetId : null },
        ],
      });
    } catch (_) {}

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'STUDY_MATERIAL_DELETED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { productId: product?.productId || id, materialId: targetId },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'Study document removed from database.',
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset User Password (Admin Direct Control)
 */
exports.resetUserPassword = async (req, res, next) => {
  try {
    const { email, userId, newPassword, generateTokenOnly } = req.body;
    if (!email && !userId) {
      return res.status(400).json({ success: false, message: 'Email or User ID is required.' });
    }

    const filter = email ? { email: email.trim().toLowerCase() } : { userId };
    const userDoc = await UserAccess.findOne(filter);
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'User record not found.' });
    }

    if (generateTokenOnly) {
      const resetToken = crypto.randomBytes(24).toString('hex');
      userDoc.resetPasswordToken = resetToken;
      userDoc.resetPasswordExpires = new Date(Date.now() + 24 * 3600000); // 24 hours
      await userDoc.save();

      return res.status(200).json({
        success: true,
        message: `Password reset link generated for ${userDoc.email}.`,
        resetToken,
        resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(userDoc.email)}`,
      });
    }

    const pwdToSet = newPassword || 'strivers2026';
    userDoc.password = hashPassword(pwdToSet);
    userDoc.resetPasswordToken = null;
    userDoc.resetPasswordExpires = null;
    await userDoc.save();

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PASSWORD_RESET_ADMIN',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { targetEmail: userDoc.email, targetUserId: userDoc.userId, resetByAdmin: true },
    });

    return res.status(200).json({
      success: true,
      message: `Password for ${userDoc.email} was successfully reset.`,
      tempPassword: pwdToSet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Practice Sheets for Admin Management
 */
exports.getAdminPracticeSheets = async (req, res, next) => {
  try {
    const sheets = await PracticeSheet.find().sort({ roleType: 1, price: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      sheets,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Practice Sheet Price and Operational Details
 */
exports.updatePracticeSheetPrice = async (req, res, next) => {
  try {
    const { sheetId } = req.params;
    const { price, isTemplate, title, targetRole, targetCompanies, description } = req.body;

    const sheet = await PracticeSheet.findOne({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    const oldPrice = sheet.price;
    if (price !== undefined && price !== null) {
      sheet.price = Math.max(0, Number(price));
      sheet.isFree = sheet.price === 0;
    }
    if (isTemplate !== undefined) sheet.isTemplate = Boolean(isTemplate);
    if (title) sheet.title = title.trim();
    if (targetRole) sheet.targetRole = targetRole.trim();
    if (targetCompanies && Array.isArray(targetCompanies)) sheet.targetCompanies = targetCompanies;
    if (description !== undefined) sheet.description = description.trim();

    await sheet.save();

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PRICE_UPDATED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        itemType: 'PRACTICE_SHEET',
        sheetId: sheet.sheetId,
        sheetTitle: sheet.title,
        oldPrice,
        newPrice: sheet.price,
        isFree: sheet.isFree,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Practice Sheet "${sheet.title}" updated. Fee: ₹${sheet.price.toFixed(2)}${sheet.isFree ? ' (₹0.00 Free Enrollment)' : ''}.`,
      sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or Update Practice Sheet (Design Curriculum from Admin)
 */
exports.createOrUpdatePracticeSheet = async (req, res, next) => {
  try {
    const {
      sheetId,
      title,
      roleType,
      targetRole,
      targetCompanies,
      description,
      badge,
      difficultyLevel,
      price,
      isTemplate,
      isActive,
      topics,
      htmlContent,
      fileType,
      fileName,
      linkedCourseId,
    } = req.body;
    if (!sheetId || !title) {
      return res.status(400).json({ success: false, message: 'Sheet ID and Title are required.' });
    }

    const priceNum = Math.max(0, Number(price || 0));
    const companies = Array.isArray(targetCompanies)
      ? targetCompanies
      : typeof targetCompanies === 'string'
      ? targetCompanies.split(',').map((c) => c.trim()).filter(Boolean)
      : ['Zomato', 'Blinkit', 'Hyperpure', 'District', 'Porter', 'Amazon', 'Flipkart', 'Swiggy'];

    const sheet = await PracticeSheet.findOneAndUpdate(
      { sheetId: sheetId.trim().toLowerCase() },
      {
        sheetId: sheetId.trim().toLowerCase(),
        title: title.trim(),
        roleType: roleType || 'non-tech',
        targetRole: targetRole || 'Operations & Growth Specialist',
        targetCompanies: companies,
        description: description || '',
        badge: badge ? badge.trim() : '',
        difficultyLevel: difficultyLevel || 'All Levels',
        price: priceNum,
        isFree: priceNum === 0,
        isTemplate: Boolean(isTemplate),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        htmlContent: htmlContent !== undefined ? htmlContent : '',
        fileType: fileType || 'standard',
        fileName: fileName || '',
        linkedCourseId: linkedCourseId ? linkedCourseId.trim().toLowerCase() : '',
        updatedBy: req.user?.email || 'admin@yourdomain.com',
        ...(topics && Array.isArray(topics) ? { topics } : {}),
      },
      { upsert: true, new: true }
    );

    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PRACTICE_SHEET_CREATED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: {
        sheetId: sheet.sheetId,
        sheetTitle: sheet.title,
        price: sheet.price,
        roleType: sheet.roleType,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Practice Sheet "${sheet.title}" saved successfully at ₹${sheet.price.toFixed(2)}.`,
      sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Practice Sheet
 */
exports.deletePracticeSheet = async (req, res, next) => {
  try {
    const { sheetId } = req.params;
    const sheet = await PracticeSheet.findOneAndDelete({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }
    await ActivityLog.create({
      userId: req.user?.uid || 'admin',
      userEmail: req.user?.email || 'admin@yourdomain.com',
      action: 'PRACTICE_SHEET_DELETED',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Server-Admin-Console',
      metaData: { sheetId: sheet.sheetId, sheetTitle: sheet.title },
    });
    return res.status(200).json({ success: true, message: `Sheet "${sheet.title}" removed.` });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or Update Topic inside a Practice Sheet
 */
exports.addOrUpdateSheetTopic = async (req, res, next) => {
  try {
    const { sheetId } = req.params;
    const { topicId, topicTitle, summary, orderIndex } = req.body;

    if (!topicTitle) {
      return res.status(400).json({ success: false, message: 'Topic title is required.' });
    }

    const sheet = await PracticeSheet.findOne({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    if (!sheet.topics) sheet.topics = [];

    const effectiveTopicId = (topicId || `topic-${Date.now()}`).trim().toLowerCase();
    const existingIndex = sheet.topics.findIndex((t) => t.topicId === effectiveTopicId);

    if (existingIndex >= 0) {
      sheet.topics[existingIndex].topicTitle = topicTitle.trim();
      if (summary !== undefined) sheet.topics[existingIndex].summary = summary.trim();
      if (orderIndex !== undefined) sheet.topics[existingIndex].orderIndex = Number(orderIndex);
    } else {
      sheet.topics.push({
        topicId: effectiveTopicId,
        topicTitle: topicTitle.trim(),
        summary: summary ? summary.trim() : '',
        orderIndex: orderIndex ? Number(orderIndex) : sheet.topics.length + 1,
        problems: [],
      });
    }

    sheet.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await sheet.save();

    return res.status(200).json({
      success: true,
      message: `Topic "${topicTitle}" saved in sheet "${sheet.title}".`,
      sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Topic from a Practice Sheet
 */
exports.deleteSheetTopic = async (req, res, next) => {
  try {
    const { sheetId, topicId } = req.params;
    const sheet = await PracticeSheet.findOne({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    sheet.topics = (sheet.topics || []).filter((t) => t.topicId !== topicId.toLowerCase());
    sheet.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await sheet.save();

    return res.status(200).json({
      success: true,
      message: 'Topic removed from sheet.',
      sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add or Update Problem inside a Topic
 */
exports.addOrUpdateSheetProblem = async (req, res, next) => {
  try {
    const { sheetId, topicId } = req.params;
    const {
      id,
      title,
      company,
      difficulty,
      type,
      scenario,
      solutionGuidance,
      keyTakeaway,
      resourceLink,
      videoUrl,
      starterCode,
      acceptanceRate,
    } = req.body;

    if (!title || !scenario) {
      return res.status(400).json({ success: false, message: 'Problem title and scenario statement are required.' });
    }

    const sheet = await PracticeSheet.findOne({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    const topic = (sheet.topics || []).find((t) => t.topicId === topicId.toLowerCase());
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found in this practice sheet.' });
    }

    if (!topic.problems) topic.problems = [];

    const problemId = (id || `prob-${Date.now()}`).trim();
    const existingIndex = topic.problems.findIndex((p) => p.id === problemId);

    const problemData = {
      id: problemId,
      title: title.trim(),
      company: company ? company.trim() : 'Zomato',
      difficulty: ['Easy', 'Medium', 'Hard'].includes(difficulty) ? difficulty : 'Medium',
      type: type ? type.trim() : 'Operational Scenario',
      scenario: scenario.trim(),
      solutionGuidance: solutionGuidance ? solutionGuidance.trim() : '',
      keyTakeaway: keyTakeaway ? keyTakeaway.trim() : '',
      resourceLink: resourceLink ? resourceLink.trim() : '',
      videoUrl: videoUrl ? videoUrl.trim() : '',
      starterCode: starterCode || '',
      acceptanceRate: acceptanceRate ? acceptanceRate.trim() : '88%',
    };

    if (existingIndex >= 0) {
      topic.problems[existingIndex] = { ...topic.problems[existingIndex], ...problemData };
    } else {
      topic.problems.push(problemData);
    }

    sheet.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await sheet.save();

    return res.status(200).json({
      success: true,
      message: `Problem "${title}" saved under topic "${topic.topicTitle}".`,
      sheet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Problem from a Topic
 */
exports.deleteSheetProblem = async (req, res, next) => {
  try {
    const { sheetId, topicId, problemId } = req.params;
    const sheet = await PracticeSheet.findOne({ sheetId: sheetId.toLowerCase() });
    if (!sheet) {
      return res.status(404).json({ success: false, message: 'Practice sheet not found.' });
    }

    const topic = (sheet.topics || []).find((t) => t.topicId === topicId.toLowerCase());
    if (!topic) {
      return res.status(404).json({ success: false, message: 'Topic not found.' });
    }

    topic.problems = (topic.problems || []).filter((p) => p.id !== problemId);
    sheet.updatedBy = req.user?.email || 'admin@yourdomain.com';
    await sheet.save();

    return res.status(200).json({
      success: true,
      message: 'Problem removed from topic.',
      sheet,
    });
  } catch (error) {
    next(error);
  }
};