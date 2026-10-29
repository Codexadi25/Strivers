const mongoose = require('mongoose');

const enrolledCourseSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    courseTitle: { type: String, required: true },
    orderId: { type: String, default: null },
    paymentId: { type: String, default: null }, // Txn ID
    referenceId: { type: String, default: null }, // Ref ID (receipt)
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    paidAt: { type: Date, default: Date.now },
    isPermanent: { type: Boolean, default: true },
  },
  { _id: false }
);

const enrolledPracticeSheetSchema = new mongoose.Schema(
  {
    sheetId: { type: String, required: true },
    sheetTitle: { type: String, required: true },
    roleType: { type: String, enum: ['non-tech', 'tech'], default: 'non-tech' },
    feePaid: { type: Number, default: 0 },
    enrolledAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userAccessSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    name: { type: String, default: 'Student' },
    password: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    hasActiveSubscription: { type: Boolean, default: false },
    activeOrderId: { type: String, default: null },
    expiresAt: { type: Date, default: null }, // null = Permanent / Lifetime Access
    watermarkIdentifier: { type: String, required: true },
    enrolledCourses: { type: [enrolledCourseSchema], default: [] },
    enrolledPracticeSheets: { type: [enrolledPracticeSheetSchema], default: [] },
    maxPracticeSheetsAllowed: { type: Number, default: 2 },
    unlockedNotes: { type: [String], default: [] }, // Note IDs unlocked via secret code or purchase
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserAccess', userAccessSchema);