const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');
const Course = require('../models/Course');
const CourseStore = require('../utils/courseStore');
const UserStore = require('../utils/userStore');
const ActivityOrderStore = require('../utils/activityOrderStore');

/**
 * Helper to get an active Razorpay client instance
 */
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID || (process.env.NODE_ENV === 'test' ? 'rzp_test_simulated' : null);
  const key_secret = process.env.RAZORPAY_KEY_SECRET || (process.env.NODE_ENV === 'test' ? 'rzp_secret_simulated' : null);

  if (!key_id || !key_secret) {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
}

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request body: { amount (in paise), currency, receipt, [planId/plan/productId, name, phone, email] }
 * Return: { order_id, amount, currency, ... }
 */
exports.createOrder = async (req, res, next) => {
  try {
    const { planId, plan, productId, name, phone } = req.body;
    let { amount, currency, receipt } = req.body;

    const targetPlan = planId || plan || productId || 'masterclass';
    const customerEmail = (req.body.email || req.user?.email || 'student@example.com').trim().toLowerCase();
    const uid = req.user?.uid || req.body.userId || `guest_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;

    // Dynamic server-side price resolution from live unified course catalog
    const liveProduct = CourseStore.getById(targetPlan);
    if (liveProduct && liveProduct.price) {
      amount = Math.round(liveProduct.price * 100);
    } else if (mongoose.connection.readyState === 1) {
      try {
        const dbProduct = await Course.findOne({
          $or: [
            { productId: targetPlan },
            { productId: targetPlan.toLowerCase() },
          ],
          isActive: true,
        });
        if (dbProduct && dbProduct.price) {
          amount = Math.round(dbProduct.price * 100);
        }
      } catch (dbErr) {
        console.warn('[Course Lookup Notice]:', dbErr.message);
      }
    }

    if (!amount) {
      if (targetPlan === 'channel') {
        amount = 17400; // ₹174 in paise
      } else if (targetPlan === 'masterclass_bundle') {
        amount = 18300; // ₹183 in paise
      } else {
        amount = 2100; // ₹21 in paise
      }
    } else {
      amount = Number(amount);
    }

    // Amount Validation: must be valid number and >= 100 paise (Razorpay minimum ₹1.00)
    if (isNaN(amount) || amount < 100) {
      return res.status(400).json({
        success: false,
        error: 'Amount is required and must be at least 100 paise (₹1.00 minimum for Razorpay).',
      });
    }

    // Check if user already owns PERMANENT access to this specific course
    if (mongoose.connection.readyState === 1) {
      try {
        const existingUser = await UserAccess.findOne({
          $or: [{ userId: uid }, { email: customerEmail }],
        });

        const alreadyOwnsCourse =
          existingUser?.enrolledCourses?.some((c) => c.courseId === targetPlan) ||
          (existingUser?.hasActiveSubscription && targetPlan === 'masterclass');

        if (alreadyOwnsCourse) {
          return res.status(200).json({
            alreadyPaid: true,
            message: 'You already have permanent access to this course.',
            accessUrl: `/courses/${targetPlan}/access`,
          });
        }
      } catch (dbErr) {
        console.warn('[User Access Check Notice]:', dbErr.message);
      }
    }

    // Receipt ID (max 40 chars)
    const receiptId = (receipt || `rcpt_${uid.slice(-6)}_${Date.now()}`).slice(0, 40);
    const orderCurrency = currency || 'INR';

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.status(401).json({
        success: false,
        error: 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.',
      });
    }

    const options = {
      amount: Math.round(amount), // integer in paise
      currency: orderCurrency,
      receipt: receiptId,
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr) {
      // In test, development, or offline sandbox environments, simulate order creation
      if (
        process.env.NODE_ENV === 'test' ||
        process.env.NODE_ENV === 'development' ||
        rzpErr.code === 'ENOTFOUND' ||
        rzpErr.type === 'system' ||
        rzpErr.statusCode === 401 ||
        !rzpErr.statusCode
      ) {
        order = {
          id: `order_sim_${Date.now()}`,
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
        };
      } else {
        console.error('[Razorpay Order Creation Error]:', rzpErr);
        const statusCode = rzpErr.statusCode || rzpErr.status;
        if (statusCode === 401) {
          return res.status(401).json({
            success: false,
            error: 'Razorpay authentication failed. Please check your Key ID and Secret.',
          });
        }
        return res.status(500).json({
          success: false,
          error: rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed',
        });
      }
    }

    // Record payment init in unified store
    const courseProduct = CourseStore.getById(targetPlan);
    ActivityOrderStore.recordOrder({
      orderId: order.id,
      txnId: 'N/A',
      refId: options.receipt,
      date: new Date().toLocaleString('en-IN'),
      createdAt: new Date().toISOString(),
      customerEmail,
      customerName: name || customerEmail.split('@')[0],
      customerPhone: phone || '',
      userId: uid,
      planId: targetPlan.toUpperCase(),
      courseTitle: courseProduct?.title || targetPlan,
      amount: order.amount / 100,
      currency: order.currency,
      paidVia: 'GATEWAY',
      status: 'PAYMENT CANCELED',
      remark: 'Checkout Initiated (Pending Completion)',
    });

    ActivityOrderStore.addLog({
      event: 'PAYMENT_INIT',
      userEmail: customerEmail,
      ip: req.ip || '127.0.0.1',
      metadata: { orderId: order.id, amount: order.amount / 100, targetPlan, currency: order.currency },
      tag: 'TXN',
    });

    // Save payment record in MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      try {
        await Payment.create({
          userId: uid,
          userEmail: customerEmail,
          razorpayOrderId: order.id,
          receipt: options.receipt,
          amount: order.amount / 100, // INR in record
          currency: order.currency,
          planId: targetPlan,
          status: 'created',
        });
      } catch (dbErr) {
        console.warn('[Payment Record Notice]:', dbErr.message);
      }
    }

    // Return order details (order_id, amount, currency) as required
    return res.status(201).json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      key_id: process.env.RAZORPAY_KEY_ID,
      keyId: process.env.RAZORPAY_KEY_ID,
      key: process.env.RAZORPAY_KEY_ID,
      productTitle: courseProduct?.title || (targetPlan === 'channel' ? 'Strivers Job Channel' : 'Strivers Masterclass'),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * STEP 3: BACKEND - Verify Payment Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const razorpay_order_id = req.body.razorpay_order_id || req.body.order_id || req.body.orderId;
    const razorpay_payment_id = req.body.razorpay_payment_id || req.body.payment_id || req.body.paymentId;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;

    // Missing fields: return 400
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters. razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({
        success: false,
        error: 'Razorpay Key Secret is not configured on server.',
      });
    }

    // HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    // Signature mismatch: return 400, do NOT mark as paid
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment signature. Verification failed.',
      });
    }

    let existingPayment = null;
    let targetCourseId = req.body.planId || req.body.plan || 'masterclass';
    let courseEnrollment = null;

    const existingOrderRecord = ActivityOrderStore.getOrders(razorpay_order_id)[0];
    if (existingOrderRecord && existingOrderRecord.planId) {
      targetCourseId = existingOrderRecord.planId.toLowerCase();
    }

    const userEmail = (
      req.user?.email ||
      req.body.email ||
      existingOrderRecord?.customerEmail ||
      'student@example.com'
    ).trim().toLowerCase();

    const uid = req.user?.uid || existingOrderRecord?.userId || req.body.userId || `usr_${Date.now()}`;
    const paidTimestamp = new Date();
    const matchedProduct = CourseStore.getById(targetCourseId);
    const targetCourseTitle = matchedProduct?.title || (targetCourseId === 'channel' ? 'Paid Job Channel' : 'Strivers Placement Masterclass');
    const resolvedAmountInr = existingOrderRecord?.amount || matchedProduct?.price || 21;

    courseEnrollment = {
      courseId: targetCourseId,
      courseTitle: targetCourseTitle,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      referenceId: existingOrderRecord?.refId || `rcpt_${Date.now()}`,
      amount: resolvedAmountInr,
      currency: 'INR',
      paidAt: paidTimestamp.toISOString(),
      isPermanent: true,
    };

    // Update UserStore & OrderStore immediately so Telemetry + Access stay synchronized
    const currentUserRaw = UserStore.findRaw(userEmail) || { userId: uid, email: userEmail, enrolledCourses: [] };
    const updatedCourses = [...(currentUserRaw.enrolledCourses || [])];
    const exIdx = updatedCourses.findIndex((c) => c.courseId === targetCourseId);
    if (exIdx >= 0) updatedCourses[exIdx] = courseEnrollment;
    else updatedCourses.push(courseEnrollment);

    UserStore.upsert({
      ...currentUserRaw,
      userId: currentUserRaw.userId || uid,
      email: userEmail,
      hasActiveSubscription: true,
      expiresAt: null,
      activeOrderId: razorpay_order_id,
      enrolledCourses: updatedCourses,
    });

    ActivityOrderStore.recordOrder({
      orderId: razorpay_order_id,
      txnId: razorpay_payment_id,
      refId: courseEnrollment.referenceId,
      date: paidTimestamp.toLocaleString('en-IN'),
      createdAt: paidTimestamp.toISOString(),
      customerEmail: userEmail,
      planId: targetCourseId.toUpperCase(),
      courseTitle: targetCourseTitle,
      amount: resolvedAmountInr,
      status: 'CAPTURED',
      remark: 'Payment Captured & Verified via HMAC-SHA256',
    });

    ActivityOrderStore.addLog({
      event: 'PAYMENT_SUCCESS',
      userEmail,
      ip: req.ip || '127.0.0.1',
      metadata: { paymentId: razorpay_payment_id, orderId: razorpay_order_id, courseId: targetCourseId, amount: resolvedAmountInr },
      tag: 'TXN',
    });

    // If database is connected, also persist payment document
    if (mongoose.connection.readyState === 1) {
      try {
        existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id }).maxTimeMS(1500);
        await Payment.findOneAndUpdate(
          { razorpayOrderId: razorpay_order_id },
          {
            userId: uid,
            userEmail,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            status: 'captured',
            paidAt: paidTimestamp,
          },
          { new: true, upsert: true }
        ).maxTimeMS(1500);
      } catch (dbErr) {
        console.warn('[Payment Verification DB Notice]:', dbErr.message);
      }
    }

    const referenceId =
      courseEnrollment.referenceId || existingPayment?.receipt || `rcpt_${Date.now()}`;

    return res.status(200).json({
      success: true,
      message: 'Payment verified and access granted successfully.',
      order_id: razorpay_order_id,
      orderId: razorpay_order_id,
      payment_id: razorpay_payment_id,
      txn_id: razorpay_payment_id,
      txnId: razorpay_payment_id,
      ref_id: referenceId,
      refId: referenceId,
      referenceId,
      receipt: referenceId,
      status: 'captured',
      statusLabel: 'Captured (Success)',
      accessUrl: `/courses/${targetCourseId}/access?txnId=${encodeURIComponent(razorpay_payment_id)}&refId=${encodeURIComponent(referenceId)}`,
    });
  } catch (error) {
    next(error);
  }
};
