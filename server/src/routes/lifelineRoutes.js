const router = require('express').Router();
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const UserProfile = require('../models/UserProfile');
const Product = require('../models/Product');
const PracticeSheet = require('../models/PracticeSheet');
const ActivityLog = require('../models/ActivityLog');

function formatCurrency(val) {
  const n = Number(val) || 0;
  return '₹ ' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(d) {
  if (!d) return 'N/A';
  const dateObj = new Date(d);
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }) + ', ' + dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function resolveStatusInfo(p) {
  if (!p) return { status: 'created', label: 'Payment Canceled', badgeClass: 'badge-canceled' };
  if (p.status === 'captured') {
    return { status: 'captured', label: 'Success', badgeClass: 'badge-success' };
  }
  if (p.status === 'canceled' || p.status === 'created') {
    return { status: 'canceled', label: 'PG Failure: Payment Canceled', badgeClass: 'badge-canceled' };
  }
  if (p.status === 'failed') {
    return { status: 'failed', label: 'PG Failure', badgeClass: 'badge-failed' };
  }
  if (p.status === 'refunded') {
    return { status: 'refunded', label: 'Refunded', badgeClass: 'badge-refunded' };
  }
  return { status: p.status, label: p.status, badgeClass: 'badge-other' };
}

/**
 * Resolves precise component failure, cancelation stage, and diagnostic root cause
 */
function resolveDiagnostics(p) {
  if (!p || p.status === 'captured') {
    return {
      isFailedOrCanceled: false,
      failureCategory: 'Captured Successfully',
      failedComponent: 'None (Captured)',
      failureStage: 'Payment Verified & Entitlement Granted',
      errorCode: null,
      errorDescription: null,
      errorSource: null,
      errorStep: null,
      failureReason: null,
      diagnosticSummary: 'Payment captured and verified on server without error.',
    };
  }

  const code = (p.errorCode || '').toUpperCase();
  const desc = (p.errorDescription || p.remark || '').toLowerCase();
  const reason = (p.failureReason || '').toLowerCase();
  const source = (p.errorSource || '').toLowerCase();
  const step = (p.errorStep || '').toLowerCase();

  let category = 'Gateway Failure';
  let failedComponent = 'Razorpay Payment Gateway';
  let summary = '';

  // 1. User Canceled Midway
  if (
    p.status === 'canceled' ||
    source === 'user_action' ||
    code.includes('CANCEL') ||
    reason.includes('cancel') ||
    desc.includes('cancel') ||
    desc.includes('dismiss') ||
    step.includes('modal')
  ) {
    category = 'User Canceled Midway';
    failedComponent = 'User Checkout Action';
    summary = 'User voluntarily closed/dismissed the Razorpay checkout modal before completing PIN/OTP authorization.';
  }
  // 2. Network Issues
  else if (
    code.includes('NETWORK') ||
    code.includes('TIMEOUT') ||
    desc.includes('network') ||
    desc.includes('timeout') ||
    desc.includes('socket') ||
    desc.includes('connection')
  ) {
    category = 'Network Issues';
    failedComponent = 'Client / Gateway Network Transport';
    summary = 'Network connection dropped or timed out midway during payment transmission.';
  }
  // 3. Bank / Issuer Failure
  else if (
    source === 'bank' ||
    code.includes('BANK') ||
    code.includes('DECLINE') ||
    desc.includes('insufficient') ||
    desc.includes('bank') ||
    desc.includes('otp') ||
    desc.includes('pin')
  ) {
    category = 'Bank / Issuer Failure';
    failedComponent = 'Issuing Bank / UPI Switch';
    summary = p.errorDescription || p.remark || 'Customer issuing bank declined authorization or OTP entry expired.';
  }
  // 4. Server Failure
  else if (
    source === 'server' ||
    code.includes('INTERNAL') ||
    code.includes('SERVER') ||
    desc.includes('internal server') ||
    desc.includes('signature')
  ) {
    category = 'Server Failure';
    failedComponent = 'Strivers Backend / Verification API';
    summary = 'Server encountered an internal processing timeout or signature verification exception.';
  }
  // 5. Gateway Failure (Default PG issue)
  else {
    category = 'Gateway Failure';
    failedComponent = 'Razorpay Payment Gateway';
    if (reason.includes('risk') || desc.includes('website does not match')) {
      summary = 'PG Risk Check Blocked: Website domain mismatch with Razorpay registered merchant URL.';
    } else {
      summary = p.errorDescription || p.remark || 'Payment gateway failed to initialize or authorize the transaction.';
    }
  }

  const stageLabel =
    step === 'payment_checkout'
      ? 'Checkout Modal Stage'
      : step === 'payment_initiation'
      ? 'Initiation Handshake Stage'
      : step === 'payment_authorization'
      ? 'Bank / UPI Authorization Stage'
      : step === 'payment_verification'
      ? 'Signature Verification Stage'
      : step ? step.replace(/_/g, ' ') : 'Gateway Processing Stage';

  return {
    isFailedOrCanceled: true,
    failureCategory: category,
    failedComponent,
    failureStage: stageLabel,
    errorCode: p.errorCode || (p.status === 'canceled' ? 'PAYMENT_CANCELLED' : 'BAD_REQUEST_ERROR'),
    errorDescription: p.errorDescription || summary,
    errorSource: p.errorSource || (category === 'User Canceled Midway' ? 'user_action' : 'gateway'),
    errorStep: p.errorStep || (category === 'User Canceled Midway' ? 'payment_checkout' : 'payment_initiation'),
    failureReason: p.failureReason || (p.status === 'canceled' ? 'payment_canceled_midway' : 'payment_risk_check_failed'),
    diagnosticSummary: summary,
  };
}

/**
 * Ensures benchmark demo orders and candidate profiles exist in MongoDB
 */
async function ensureSeedData() {
  try {
    const kamaldeep = await Payment.findOne({
      $or: [{ razorpayOrderId: '8431432921' }, { razorpayOrderId: 'order_8431432921' }],
    });
    if (!kamaldeep) {
      await Payment.create({
        userId: '312795448',
        userEmail: 'kamaldeep@gmail.com',
        customerName: 'Kamaldeep',
        customerPhone: '+91 98765 55543',
        razorpayOrderId: '8431432921',
        razorpayPaymentId: 'pay_P92kLm99120',
        receipt: 'rcpt_8431432921',
        amount: 285.03,
        currency: 'INR',
        status: 'captured',
        planId: 'masterclass',
        paymentMethod: 'CARD',
        bankRrn: '20260803210490000291165696461809404',
        tags: ['Fast-track', 'Priority', 'Direct Web'],
        createdAt: new Date('2026-08-03T22:31:00.000Z'),
        paidAt: new Date('2026-08-03T22:31:00.000Z'),
      });

      // Also create an associated failed / canceled payment for this customer for diagnosis testing
      await Payment.create({
        userId: '312795448',
        userEmail: 'kamaldeep@gmail.com',
        customerName: 'Kamaldeep',
        customerPhone: '+91 98765 55543',
        razorpayOrderId: 'order_cancel_84314',
        razorpayPaymentId: 'pay_cancel_9921',
        receipt: 'rcpt_cancel_9921',
        amount: 285.03,
        currency: 'INR',
        status: 'canceled',
        planId: 'masterclass',
        paymentMethod: 'UPI',
        errorCode: 'PAYMENT_CANCELLED',
        errorDescription: 'PG Failure: Payment Canceled midway by user closing checkout modal',
        errorSource: 'user_action',
        errorStep: 'payment_checkout',
        failureReason: 'payment_canceled_midway',
        tags: ['Midway Canceled'],
        createdAt: new Date('2026-08-03T22:15:00.000Z'),
      });
    }

    const userKamal = await UserAccess.findOne({
      $or: [{ email: 'kamaldeep@gmail.com' }, { userId: '312795448' }],
    });
    if (!userKamal) {
      await UserAccess.create({
        userId: '312795448',
        email: 'kamaldeep@gmail.com',
        name: 'Kamaldeep',
        role: 'user',
        hasActiveSubscription: true,
        watermarkIdentifier: 'KAMALDEEP | kamaldeep@gmail.com',
        enrolledCourses: [
          {
            courseId: 'masterclass',
            courseTitle: 'Strivers Masterclass - Live Mentorship',
            orderId: '8431432921',
            paymentId: 'pay_P92kLm99120',
            referenceId: 'rcpt_8431432921',
            amount: 285.03,
            paidAt: new Date('2026-08-03T22:31:00.000Z'),
            isPermanent: true,
          },
        ],
      });
    }
  } catch (seedErr) {
    console.warn('[Lifeline Seed Notice]:', seedErr.message);
  }
}

// Run initial seed check
ensureSeedData();

/**
 * GET /api/v1/lifeline/search
 * Comprehensive Lifeline Search by Order ID, Email ID, Txn ID, Ref ID, or Phone.
 */
router.get('/search', async (req, res) => {
  try {
    const rawType = (req.query.type || 'orderId').trim();
    const rawQ = (req.query.q || '').trim();

    // Clean query: strip leading '#' and spaces
    const cleanQ = rawQ.replace(/^[#\s]+/, '').trim();
    const digitsOnly = cleanQ.replace(/\D/g, '');

    let payment = null;
    let userAccess = null;
    let userProfile = null;
    let allUserPayments = [];

    if (cleanQ) {
      const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const cleanRegex = new RegExp(escapeRegex(cleanQ), 'i');

      // Flexible phone regex allowing spaces/dashes between digits
      let phoneRegex = null;
      if (digitsOnly.length >= 4) {
        phoneRegex = new RegExp(digitsOnly.split('').join('\\D*'), 'i');
      }

      // Step 1: Query based on specific dropdown selector
      if (rawType === 'orderId') {
        payment = await Payment.findOne({
          $or: [
            { razorpayOrderId: cleanRegex },
            { razorpayOrderId: cleanQ },
            { razorpayOrderId: `order_${cleanQ}` },
            { receipt: cleanRegex },
          ],
        }).sort({ createdAt: -1 });

        if (!payment) {
          userAccess = await UserAccess.findOne({
            $or: [
              { activeOrderId: cleanRegex },
              { 'enrolledCourses.orderId': cleanRegex },
            ],
          });
        }
      } else if (rawType === 'email') {
        payment = await Payment.findOne({ userEmail: cleanRegex }).sort({ createdAt: -1 });
        userAccess = await UserAccess.findOne({ email: cleanRegex });
        if (!userAccess) {
          userProfile = await UserProfile.findOne({ email: cleanRegex });
        }
      } else if (rawType === 'txnId') {
        payment = await Payment.findOne({
          $or: [
            { razorpayPaymentId: cleanRegex },
            { razorpayPaymentId: `pay_${cleanQ}` },
          ],
        }).sort({ createdAt: -1 });

        if (!payment) {
          userAccess = await UserAccess.findOne({ 'enrolledCourses.paymentId': cleanRegex });
        }
      } else if (rawType === 'refId') {
        payment = await Payment.findOne({
          $or: [
            { receipt: cleanRegex },
            { receipt: `rcpt_${cleanQ}` },
            { bankRrn: cleanRegex },
          ],
        }).sort({ createdAt: -1 });

        if (!payment) {
          userAccess = await UserAccess.findOne({ 'enrolledCourses.referenceId': cleanRegex });
        }
      } else if (rawType === 'phone') {
        const phoneConds = [{ customerPhone: cleanRegex }];
        if (phoneRegex) phoneConds.push({ customerPhone: phoneRegex });

        payment = await Payment.findOne({ $or: phoneConds }).sort({ createdAt: -1 });
      }

      // Step 2: Universal Fallback Search if specific type didn't match
      if (!payment && !userAccess) {
        const universalPaymentConds = [
          { razorpayOrderId: cleanRegex },
          { razorpayOrderId: `order_${cleanQ}` },
          { userEmail: cleanRegex },
          { razorpayPaymentId: cleanRegex },
          { receipt: cleanRegex },
          { bankRrn: cleanRegex },
          { userId: cleanRegex },
          { customerName: cleanRegex },
        ];
        if (phoneRegex) {
          universalPaymentConds.push({ customerPhone: phoneRegex });
        } else {
          universalPaymentConds.push({ customerPhone: cleanRegex });
        }

        payment = await Payment.findOne({ $or: universalPaymentConds }).sort({ createdAt: -1 });

        userAccess = await UserAccess.findOne({
          $or: [
            { email: cleanRegex },
            { userId: cleanRegex },
            { name: cleanRegex },
            { activeOrderId: cleanRegex },
            { 'enrolledCourses.orderId': cleanRegex },
            { 'enrolledCourses.paymentId': cleanRegex },
          ],
        });
      }

      // Step 3: Link Payment and UserAccess together
      if (payment && !userAccess) {
        userAccess = await UserAccess.findOne({
          $or: [
            { email: payment.userEmail.toLowerCase() },
            { userId: payment.userId },
          ],
        });
      }

      if (userAccess && !payment) {
        payment = await Payment.findOne({
          $or: [
            { userEmail: userAccess.email.toLowerCase() },
            { userId: userAccess.userId },
          ],
        }).sort({ createdAt: -1 });
      }
    }

    // Default Fallback ONLY when query is completely empty (initial view)
    if (!cleanQ && !payment && !userAccess) {
      payment = await Payment.findOne({
        $or: [{ razorpayOrderId: '8431432921' }, { razorpayOrderId: 'order_8431432921' }],
      }).sort({ createdAt: -1 });

      if (!payment) {
        payment = await Payment.findOne().sort({ createdAt: -1 });
      }

      if (payment) {
        userAccess = await UserAccess.findOne({
          $or: [{ email: payment.userEmail.toLowerCase() }, { userId: payment.userId }],
        });
      }
    }

    // Check if search was performed but absolutely nothing matched
    const hasSearchQuery = Boolean(cleanQ);
    const isNotFound = hasSearchQuery && !payment && !userAccess;

    if (isNotFound) {
      return res.json({
        success: true,
        notFound: true,
        query: { type: rawType, q: rawQ },
        message: `No customer record or order was found matching "${rawQ}". Please verify the identifier or try searching by email or phone.`,
        courses: [],
        masterclasses: [],
        studyMaterials: [],
        transactions: [],
      });
    }

    const email = (payment?.userEmail || userAccess?.email || userProfile?.email || 'creedracer111@gmail.com').toLowerCase();
    const userId = payment?.userId || userAccess?.userId || 'usr_client_312795448';

    // Retrieve all payment transactions for this customer
    allUserPayments = await Payment.find({
      $or: [{ userEmail: email }, { userId }],
    }).sort({ createdAt: -1 });

    // Calculate Total Spent
    const totalSpent = allUserPayments
      .filter((p) => p.status === 'captured')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Fetch all catalog products (Courses & Masterclasses)
    const allProducts = await Product.find().lean();
    const masterclassProducts = allProducts.filter((p) => p.isMasterclass || p.category === 'masterclass' || p.productType === 'masterclass');
    const courseProducts = allProducts.filter((p) => !p.isMasterclass && p.category !== 'masterclass' && p.productType !== 'masterclass');

    // Fetch all practice sheets
    const allPracticeSheets = await PracticeSheet.find().lean();

    // Map enrolled courses
    const enrolledCoursesMap = new Map();
    (userAccess?.enrolledCourses || []).forEach((c) => {
      enrolledCoursesMap.set(c.courseId, c);
    });

    const coursesData = courseProducts.map((prod) => {
      const enrollment = enrolledCoursesMap.get(prod.productId);
      const isEnrolled = Boolean(enrollment || (userAccess?.hasActiveSubscription && prod.price <= 0));
      return {
        productId: prod.productId,
        title: prod.title,
        price: prod.price,
        formattedPrice: formatCurrency(prod.price),
        status: isEnrolled ? 'Active Lifetime Access' : 'No Active Access',
        isEnrolled,
        orderId: enrollment?.orderId || payment?.razorpayOrderId || null,
        txnId: enrollment?.paymentId || payment?.razorpayPaymentId || null,
        refId: enrollment?.referenceId || payment?.receipt || null,
        paidAt: enrollment?.paidAt ? formatDate(enrollment.paidAt) : null,
        amountPaid: enrollment?.amount ? formatCurrency(enrollment.amount) : (isEnrolled ? formatCurrency(prod.price) : '₹ 0.00'),
      };
    });

    // Map enrolled masterclasses
    const masterclassesData = masterclassProducts.map((mc) => {
      const isEnrolled = Boolean(
        userAccess?.hasActiveSubscription ||
        userAccess?.enrolledCourses?.some((c) => c.courseId === mc.productId || c.courseId === 'masterclass')
      );
      return {
        productId: mc.productId,
        title: mc.title,
        price: mc.price,
        formattedPrice: formatCurrency(mc.price),
        sessionStatus: mc.sessionStatus || 'upcoming',
        activeMeetingLink: mc.activeMeetingLink || 'https://meet.google.com/strivers-live',
        meetingPlatform: mc.meetingPlatform || 'Google Meet',
        isEnrolled,
        timingSlots: mc.timingSlots || [],
        mentors: mc.mentors || [],
        accessStatus: isEnrolled ? 'Enrolled & Room Access Granted' : 'Access Locked (Enrollment Required)',
        amountPaid: isEnrolled ? formatCurrency(mc.price || 499) : '₹ 0.00',
      };
    });

    // Map Study Materials & Practice Sheets
    const studyMaterialsData = allPracticeSheets.map((ps) => {
      const isEnrolled = Boolean(
        userAccess?.enrolledPracticeSheets?.some((s) => s.sheetId === ps.sheetId) ||
        (userAccess?.hasActiveSubscription && ps.price === 0)
      );
      return {
        sheetId: ps.sheetId,
        title: ps.title,
        roleType: ps.roleType,
        price: ps.price,
        formattedPrice: formatCurrency(ps.price),
        isEnrolled,
        accessStatus: isEnrolled ? 'Unlocked & Active' : 'Not Enrolled',
        amountPaid: isEnrolled ? formatCurrency(ps.price) : '₹ 0.00',
      };
    });

    // Format current order details matching media_1793284863595_e35360ae.png
    const statusInfo = resolveStatusInfo(payment);
    const orderDiagnostics = resolveDiagnostics(payment);
    const orderData = payment
      ? {
          orderId: payment.razorpayOrderId,
          displayOrderId: `#${payment.razorpayOrderId.replace(/^order_/, '')}`,
          dateFormatted: formatDate(payment.createdAt),
          amount: payment.amount,
          amountFormatted: formatCurrency(payment.amount),
          currency: payment.currency || 'INR',
          status: payment.status,
          statusLabel: statusInfo.label,
          statusBadgeClass: statusInfo.badgeClass,
          selectedMode: payment.paymentMethod?.toLowerCase().includes('card') ? 'Online' : 'Online',
          paidVia: payment.paymentMethod?.toUpperCase().includes('CARD')
            ? 'CREDIT'
            : payment.paymentMethod?.toUpperCase().includes('UPI')
            ? 'UPI'
            : 'CREDIT',
          txnId: payment.razorpayPaymentId || 'N/A',
          refId: payment.receipt || 'N/A',
          bankRrn: payment.bankRrn || 'N/A',
          failureReason: payment.failureReason,
          tags: Array.isArray(payment.tags) && payment.tags.length > 0 ? payment.tags : ['Standard Checkout', 'Direct Web'],
          comments: Array.isArray(payment.comments) ? payment.comments : [],
          diagnostics: orderDiagnostics,
        }
      : {
          orderId: userAccess?.activeOrderId || 'NO_ORDER_ON_FILE',
          displayOrderId: userAccess?.activeOrderId ? `#${userAccess.activeOrderId.replace(/^order_/, '')}` : 'No Active Order',
          dateFormatted: userAccess ? formatDate(userAccess.createdAt) : 'N/A',
          amount: 0,
          amountFormatted: '₹ 0.00',
          currency: 'INR',
          status: 'none',
          statusLabel: 'No Direct Payment',
          statusBadgeClass: 'badge-other',
          selectedMode: 'N/A',
          paidVia: 'NONE',
          txnId: 'N/A',
          refId: 'N/A',
          tags: ['Account User'],
          comments: [],
          diagnostics: {
            isFailedOrCanceled: false,
            failureCategory: 'None',
            failedComponent: 'None',
            failureStage: 'N/A',
            diagnosticSummary: 'Customer account found. No direct Razorpay order recorded.',
          },
        };

    const customerData = {
      customerId: userAccess?.userId ? userAccess.userId.replace(/^usr_/, '') : (payment?.userId ? payment.userId.replace(/^usr_/, '') : '312795448'),
      rawCustomerId: userAccess?.userId || payment?.userId || 'usr_client_312795448',
      name: payment?.customerName || userAccess?.name || 'Kamaldeep',
      email: email,
      phone: payment?.customerPhone || '+91 98765 55543',
      maskedPhone: (payment?.customerPhone || '+91 98765 55543').replace(/\d(?=\d{4})/g, 'X'),
      maskedEmail: email ? email.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => gp2 + 'XXXXXXX') : 'XXXXXXX',
      role: userAccess?.role || 'User',
      hasActiveSubscription: userAccess?.hasActiveSubscription || false,
      totalSpentFormatted: formatCurrency(totalSpent),
    };

    const transactionsData = allUserPayments.map((p) => {
      const s = resolveStatusInfo(p);
      const diag = resolveDiagnostics(p);
      return {
        orderId: p.razorpayOrderId,
        txnId: p.razorpayPaymentId || 'N/A',
        refId: p.receipt || 'N/A',
        amount: formatCurrency(p.amount),
        rawAmount: p.amount,
        status: p.status,
        statusLabel: s.label,
        statusBadgeClass: s.badgeClass,
        paymentMethod: p.paymentMethod || 'Online',
        paidAt: formatDate(p.createdAt),
        diagnostics: diag,
      };
    });

    return res.json({
      success: true,
      query: { type: rawType, q: rawQ },
      order: orderData,
      customer: customerData,
      courses: coursesData,
      masterclasses: masterclassesData,
      studyMaterials: studyMaterialsData,
      transactions: transactionsData,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lifeline search failed', error: err.message });
  }
});

/**
 * POST /api/v1/lifeline/toggle-course-access
 * Toggle or mutate course access for a user directly in MongoDB
 */
router.post('/toggle-course-access', async (req, res) => {
  try {
    const { email, courseId, action } = req.body;
    if (!email || !courseId) {
      return res.status(400).json({ success: false, message: 'Email and courseId required' });
    }

    const user = await UserAccess.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const product = await Product.findOne({ productId: courseId });
    const courseTitle = product?.title || courseId;

    if (action === 'grant') {
      const exists = user.enrolledCourses.some((c) => c.courseId === courseId);
      if (!exists) {
        user.enrolledCourses.push({
          courseId,
          courseTitle,
          orderId: `order_manual_${Date.now()}`,
          paymentId: `pay_manual_${Date.now()}`,
          referenceId: `ref_${Date.now()}`,
          amount: product?.price || 0,
          paidAt: new Date(),
          isPermanent: true,
        });
        await user.save();
      }
      return res.json({ success: true, message: `Access granted for "${courseTitle}".`, enrolled: true });
    } else {
      user.enrolledCourses = user.enrolledCourses.filter((c) => c.courseId !== courseId);
      await user.save();
      return res.json({ success: true, message: `Access revoked for "${courseTitle}".`, enrolled: false });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update course access', error: err.message });
  }
});

/**
 * POST /api/v1/lifeline/add-order-tag
 */
router.post('/add-order-tag', async (req, res) => {
  try {
    const { orderId, tag } = req.body;
    if (!orderId || !tag) return res.status(400).json({ success: false, message: 'Missing orderId or tag' });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (payment) {
      if (!Array.isArray(payment.tags)) payment.tags = [];
      if (!payment.tags.includes(tag)) {
        payment.tags.push(tag);
        await payment.save();
      }
    }
    return res.json({ success: true, tags: payment?.tags || [tag] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add tag', error: err.message });
  }
});

/**
 * POST /api/v1/lifeline/add-order-comment
 */
router.post('/add-order-comment', async (req, res) => {
  try {
    const { orderId, text, author } = req.body;
    if (!orderId || !text) return res.status(400).json({ success: false, message: 'Missing orderId or comment text' });

    const payment = await Payment.findOne({ razorpayOrderId: orderId });
    if (payment) {
      if (!Array.isArray(payment.comments)) payment.comments = [];
      payment.comments.push({
        text,
        author: author || 'Admin',
        createdAt: new Date(),
      });
      await payment.save();
    }
    return res.json({ success: true, comments: payment?.comments || [] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to add comment', error: err.message });
  }
});

module.exports = router;
