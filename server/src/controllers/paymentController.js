const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');


const Product = require('../models/Product');

exports.createOrder = async (req, res, next) => {
  try {
    const { planId, plan, productId, name, phone } = req.body;
    let { amount } = req.body;
    const customerEmail = (req.body.email || req.user?.email || 'student@example.com').trim().toLowerCase();
    const uid = req.user?.uid || req.body.userId || `guest_${customerEmail.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}`;
    const email = req.user?.email || customerEmail;

    const targetPlan = planId || plan || productId || 'masterclass';

    // Server-side dynamic price resolution from Product model
    const dbProduct = await Product.findOne({ productId: targetPlan, isActive: true });
    if (dbProduct) {
      amount = dbProduct.price;
    } else if (!amount) {
      if (targetPlan === 'channel') {
        amount = 174;
      } else if (targetPlan === 'masterclass_bundle') {
        amount = 183;
      } else {
        amount = 21;
      }
    }

    // Check if user already owns PERMANENT access to this specific course
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

    const receiptId = `rcpt_${uid.slice(-6)}_${Date.now()}`.slice(0, 40);
    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: 'INR',
      receipt: receiptId,
    };

    let order;
    const isMockKey =
      !process.env.RAZORPAY_KEY_ID ||
      process.env.RAZORPAY_KEY_ID.includes('XXXX') ||
      process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_mock');

    if (!isMockKey && razorpay) {
      try {
        order = await razorpay.orders.create(options);
      } catch (err) {
        console.warn('[Razorpay API Warning] Real order creation failed, falling back to simulated order:', err.message);
        order = {
          id: `order_dev_${Date.now()}`,
          amount: options.amount,
          currency: 'INR',
        };
      }
    } else {
      order = {
        id: `order_dev_${Date.now()}`,
        amount: options.amount,
        currency: 'INR',
      };
    }

    await Payment.create({
      userId: uid,
      userEmail: customerEmail,
      razorpayOrderId: order.id,
      receipt: options.receipt,
      amount: options.amount / 100,
      currency: 'INR',
      planId: targetPlan,
      status: 'created',
    });

    await ActivityLog.create({
      userId: uid,
      userEmail: customerEmail,
      action: 'PAYMENT_INIT',
      ipAddress: req.ip || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Local-Client',
      metaData: { orderId: order.id, amount, targetPlan, name, phone },
    });

    return res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123456789',
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock123456789',
      productTitle: targetPlan === 'channel' ? 'Strivers Job Channel' : 'Strivers Masterclass',
      isSimulated: order.id.startsWith('order_dev_') || order.id.startsWith('demo_'),
      demoMode: order.id.startsWith('order_dev_') || isMockKey,
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id) {
      return res.status(400).json({ success: false, message: 'Missing Razorpay order or payment ID.' });
    }

    const isSimulatedOrder = razorpay_order_id.startsWith('order_dev_') || razorpay_order_id.startsWith('demo_');
    const secret = process.env.RAZORPAY_KEY_SECRET || 'mockSecret123456789';

    if (!isSimulatedOrder) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: 'Invalid payment signature verification failed.' });
      }
    }

    // Lookup payment to get customer email & userId from checkout creation
    const existingPayment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    const userEmail = (req.user?.email || req.body.email || existingPayment?.userEmail || 'student@example.com').trim().toLowerCase();
    const uid = req.user?.uid || existingPayment?.userId || req.body.userId || `usr_${Date.now()}`;

    const paidTimestamp = new Date();

    // Update payment record with Txn ID & timestamp
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        userId: uid,
        userEmail,
        razorpayPaymentId: razorpay_payment_id, // Txn ID
        razorpaySignature: razorpay_signature || 'simulated_sig',
        status: 'captured',
        paidAt: paidTimestamp,
      },
      { new: true, upsert: true }
    );

    const targetCourseId = payment?.planId || 'masterclass';
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
      paymentId: razorpay_payment_id, // Txn ID
      referenceId: payment.receipt || `rcpt_${Date.now()}`, // Ref ID
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
    userDoc.expiresAt = null; // PERMANENT ACCESS
    userDoc.activeOrderId = razorpay_order_id;
    userDoc.watermarkIdentifier = `${userEmail} | ${uid.slice(0, 6)}`;

    // Add or update enrolled course record
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

    return res.status(200).json({
      success: true,
      message: 'Payment verified and access granted successfully.',
      accessUrl: `/products/${payment?.planId || 'masterclass'}/access`,
    });
  } catch (error) {
    next(error);
  }
};
