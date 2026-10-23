require('dotenv').config();
const mongoose = require('mongoose');
const Payment = require('../models/Payment');
const UserAccess = require('../models/UserAccess');
const ActivityLog = require('../models/ActivityLog');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/strivers';
    console.log(`Connecting to ${mongoUri}...`);
    await mongoose.connect(mongoUri);
    console.log('[Seed] MongoDB Connected successfully.');

    // Clear existing sample collections
    await Payment.deleteMany({});
    await UserAccess.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log('[Seed] Cleared existing data.');

    // Insert sample Payments
    const payments = await Payment.insertMany([
      {
        userId: 'user_101',
        userEmail: 'alex.morgan@example.com',
        razorpayOrderId: 'order_seed_001',
        razorpayPaymentId: 'pay_seed_001',
        razorpaySignature: 'sig_mock_1',
        amount: 499,
        currency: 'INR',
        status: 'captured',
        planId: 'plan_pro_access',
      },
      {
        userId: 'user_102',
        userEmail: 'priya.sharma@example.com',
        razorpayOrderId: 'order_seed_002',
        razorpayPaymentId: 'pay_seed_002',
        razorpaySignature: 'sig_mock_2',
        amount: 499,
        currency: 'INR',
        status: 'captured',
        planId: 'plan_pro_access',
      },
      {
        userId: 'user_103',
        userEmail: 'dev.tester@example.com',
        razorpayOrderId: 'order_seed_003',
        razorpayPaymentId: 'pay_seed_003',
        razorpaySignature: 'sig_mock_3',
        amount: 499,
        currency: 'INR',
        status: 'captured',
        planId: 'plan_pro_access',
      },
      {
        userId: 'user_104',
        userEmail: 'guest.viewer@example.com',
        razorpayOrderId: 'order_seed_004',
        amount: 499,
        currency: 'INR',
        status: 'created',
        planId: 'plan_pro_access',
      },
    ]);

    // Insert active user access
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await UserAccess.insertMany([
      {
        userId: 'admin_master',
        email: 'admin@yourdomain.com',
        role: 'admin',
        hasActiveSubscription: true,
        expiresAt: expiry,
        watermarkIdentifier: 'ADMIN MASTER | admin@yourdomain.com',
      },
      {
        userId: 'user_101',
        email: 'alex.morgan@example.com',
        role: 'user',
        hasActiveSubscription: true,
        activeOrderId: 'order_seed_001',
        expiresAt: expiry,
        watermarkIdentifier: 'alex.morgan@example.com | user_1',
      },
      {
        userId: 'user_102',
        email: 'priya.sharma@example.com',
        role: 'user',
        hasActiveSubscription: true,
        activeOrderId: 'order_seed_002',
        expiresAt: expiry,
        watermarkIdentifier: 'priya.sharma@example.com | user_1',
      },
    ]);


    // Insert sample activities
    await ActivityLog.insertMany([
      {
        userId: 'user_101',
        userEmail: 'alex.morgan@example.com',
        action: 'PAYMENT_SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metaData: { paymentId: 'pay_seed_001', orderId: 'order_seed_001' },
      },
      {
        userId: 'user_101',
        userEmail: 'alex.morgan@example.com',
        action: 'CONTENT_VIEW',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        userId: 'user_102',
        userEmail: 'priya.sharma@example.com',
        action: 'PAYMENT_SUCCESS',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        metaData: { paymentId: 'pay_seed_002', orderId: 'order_seed_002' },
      },
      {
        userId: 'user_105_attacker',
        userEmail: 'unknown.leak@threat.net',
        action: 'SECURITY_BREACH_ATTEMPT',
        ipAddress: '192.168.1.45',
        userAgent: 'HeadlessChrome/120.0',
        metaData: { reason: 'Blocked Hotkey Trigger: PrintScreen' },
      },
    ]);

    console.log('[Seed] Database seeded with sample payments, subscribers, and activity logs!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]', error);
    process.exit(1);
  }
};

seedData();
