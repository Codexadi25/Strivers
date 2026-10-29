const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true, lowercase: true, trim: true },
    razorpayOrderId: { type: String, required: true, unique: true },
    razorpayPaymentId: { type: String, default: null, index: true }, // Txn ID
    razorpaySignature: { type: String, default: null },
    receipt: { type: String, default: null }, // Reference ID
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded', 'canceled'],
      default: 'created',
      index: true,
    },
    planId: { type: String, required: true },
    paidAt: { type: Date, default: null },

    // PG Payment Mode & Gateway Metadata
    paymentMethod: { type: String, default: 'UPI' }, // e.g. 'UPI (8081866712@ptaxis)', 'BANK', 'WALLET', 'CARD'
    bankRrn: { type: String, default: null }, // Bank RRN / UTR
    customerPhone: { type: String, default: null }, // e.g. '+91 7985 693955'
    customerName: { type: String, default: null },
    remark: { type: String, default: '-' },
    tags: { type: [String], default: [] },
    comments: [
      {
        text: { type: String, required: true },
        author: { type: String, default: 'Admin' },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // PG Failure Diagnostics (e.g. payment_risk_check_failed)
    failureReason: { type: String, default: null, index: true }, // e.g. 'payment_risk_check_failed'
    errorCode: { type: String, default: null }, // e.g. 'BAD_REQUEST_ERROR'
    errorDescription: { type: String, default: null }, // 'Payment blocked as website does not match registered website(s)'
    errorSource: { type: String, default: null }, // 'internal', 'gateway', 'bank'
    errorStep: { type: String, default: null }, // 'payment_initiation'
    failedAt: { type: Date, default: null },

    // Refund Tracking Information
    hasRefund: { type: Boolean, default: false },
    refundId: { type: String, default: null },
    refundAmount: { type: Number, default: 0 },
    refundStatus: { type: String, default: 'none' }, // 'none', 'processed', 'pending'
    refundedAt: { type: Date, default: null },
    refundedBy: { type: String, default: null }, // 'Razorpay Auto Reversal', 'Admin', etc.
    refundedItemTitle: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);
