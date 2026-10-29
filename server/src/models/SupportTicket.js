const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, default: null },
    userEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    userPhone: { type: String, required: true, trim: true },
    customerName: { type: String, default: 'Student' },

    // PG Reference IDs
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, default: null, index: true },
    bankRrn: { type: String, default: null }, // UTR / Bank Reference Number

    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    issueType: {
      type: String,
      enum: [
        'amount_debited_payment_failed', // Money deducted but payment marked failed
        'refund_not_received_7_days',    // Refund delayed beyond 7 working days
        'website_risk_check_blocked',   // Domain whitelist failure (payment_risk_check_failed)
        'double_debit',                 // Amount debited twice
        'access_not_granted',           // Payment success but course not unlocked
        'other',
      ],
      default: 'amount_debited_payment_failed',
      index: true,
    },
    failureReason: { type: String, default: 'payment_risk_check_failed' },
    description: { type: String, default: '' },

    status: {
      type: String,
      enum: [
        'open',                  // Received, awaiting verification / 7-day bank window
        'under_investigation',   // Being checked with Razorpay bank gateway
        'refund_verified_pg',    // Verified auto-refund initiated by Razorpay
        'manual_refund_done',    // Manually refunded to student's UPI / Bank
        'access_granted',        // Course unlocked per student request
        'resolved',              // Successfully resolved
        'closed',                // Closed
      ],
      default: 'open',
      index: true,
    },

    slaDeadline: { type: Date, required: true }, // Expected resolution date (7 working days)
    adminRemarks: { type: String, default: '' },
    resolvedAt: { type: Date, default: null },
    resolvedBy: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SupportTicket', supportTicketSchema);

