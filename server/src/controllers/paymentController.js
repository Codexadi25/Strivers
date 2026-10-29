const crypto = require('crypto');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');

/**
 * Helper to get an active Razorpay client instance
 */
function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

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

    // Dynamic price resolution if amount was not provided directly
    if (amount === undefined || amount === null || amount === '') {
      if (mongoose.connection.readyState === 1) {
        try {
          const dbProduct = await Product.findOne({ productId: targetPlan, isActive: true });
          if (dbProduct) {
            amount = Math.round(dbProduct.price * 100); // convert INR to paise
          }
        } catch (dbErr) {
          console.warn('[Product Lookup Notice]:', dbErr.message);
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
            accessUrl: `/products/${targetPlan}/access`,
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

    // Save payment record and activity log if database is connected
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

        await ActivityLog.create({
          userId: uid,
          userEmail: customerEmail,
          action: 'PAYMENT_INIT',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Local-Client',
          metaData: { orderId: order.id, amount: order.amount, targetPlan, name, phone },
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
      productTitle: targetPlan === 'channel' ? 'Strivers Job Channel' : 'Strivers Masterclass',
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
    let targetCourseId = 'masterclass';

    // If database is connected, persist captured payment and grant access
    if (mongoose.connection.readyState === 1) {
      try {
        existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

        const userEmail = (
          req.user?.email ||
          req.body.email ||
          existingPayment?.userEmail ||
          'student@example.com'
        ).trim().toLowerCase();

        const uid = req.user?.uid || existingPayment?.userId || req.body.userId || `usr_${Date.now()}`;
        const paidTimestamp = new Date();

        const payment = await Payment.findOneAndUpdate(
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
        );

        targetCourseId = payment?.planId || 'masterclass';
        const targetCourseTitle =
          targetCourseId === 'channel'
            ? 'Strivers Paid Job Channel'
            : (targetCourseId === 'masterclass_bundle'
                ? 'Placement Masterclass + Job Channel Bundle'
                : 'Strivers Placement Masterclass');

        const courseEnrollment = {
          courseId: targetCourseId,
          courseTitle: targetCourseTitle,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id,
          referenceId: payment.receipt || `rcpt_${Date.now()}`,
          amount: payment.amount,
          currency: payment.currency || 'INR',
          paidAt: paidTimestamp,
          isPermanent: true,
        };

        // Grant permanent User Access (expiresAt = null)
        let userDoc = await UserAccess.findOne({
          $or: [{ userId: uid }, { email: userEmail }],
        });

        if (!userDoc) {
          userDoc = new UserAccess({
            userId: uid,
            email: userEmail,
            watermarkIdentifier: `${userEmail} | ${uid.slice(0, 6)}`,
          });
        }

        userDoc.hasActiveSubscription = true;
        userDoc.expiresAt = null;
        userDoc.activeOrderId = razorpay_order_id;
        userDoc.watermarkIdentifier = `${userEmail} | ${uid.slice(0, 6)}`;

        const existingIdx = userDoc.enrolledCourses.findIndex((c) => c.courseId === targetCourseId);
        if (existingIdx >= 0) {
          userDoc.enrolledCourses[existingIdx] = courseEnrollment;
        } else {
          userDoc.enrolledCourses.push(courseEnrollment);
        }

        await userDoc.save();

        await ActivityLog.create({
          userId: uid,
          userEmail,
          action: 'PAYMENT_SUCCESS',
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Local-Client',
          metaData: {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            referenceId: courseEnrollment.referenceId,
            courseId: targetCourseId,
            amount: payment.amount,
            isPermanent: true,
            paidAt: paidTimestamp,
          },
        });
      } catch (dbErr) {
        console.warn('[Payment Verification DB Notice]:', dbErr.message);
      }
    }

    const referenceId =
      courseEnrollment?.referenceId || existingPayment?.receipt || `rcpt_${Date.now()}`;

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
      accessUrl: `/products/${targetCourseId}/access?txnId=${encodeURIComponent(razorpay_payment_id)}&refId=${encodeURIComponent(referenceId)}`,
    });
  } catch (error) {
    next(error);
  }
};
