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
    // const payments = await Payment.insertMany([
    //   {
    //     userId: 'user_101',
    //     userEmail: 'alex.morgan@example.com',
    //     razorpayOrderId: 'order_seed_001',
    //     razorpayPaymentId: 'pay_seed_001',
    //     razorpaySignature: 'sig_mock_1',
    //     amount: 499,
    //     currency: 'INR',
    //     status: 'captured',
    //     planId: 'plan_pro_access',
    //   },

    // ]);

    // Insert active user access
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);

    await UserAccess.insertMany([
      {
        userId: 'admin_master',
        email: 'admin@domain.com',
        role: 'admin',
        hasActiveSubscription: true,
        expiresAt: expiry,
        watermarkIdentifier: 'ADMIN MASTER | admin@domain.com',
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
