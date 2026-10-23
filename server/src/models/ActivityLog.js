const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    userEmail: { type: String, required: true },
    action: {
      type: String,
      enum: [
        'LOGIN',
        'ADMIN_LOGIN',
        'PAYMENT_INIT',
        'PAYMENT_SUCCESS',
        'CONTENT_VIEW',
        'SECURE_DOCUMENT_VIEW',
        'SECURITY_BREACH_ATTEMPT',
        'ACCESS_GRANTED',
        'ACCESS_REVOKED',
        'ROLE_UPDATED',
        'REFUND_PROCESSED',
        'PRICE_UPDATED',
        'COURSE_UPSERTED',
        'COURSE_DELETED',
        'MEETING_LINK_UPDATED',
        'TIMING_SLOT_UPDATED',
        'TIMING_SLOT_DELETED',
        'STUDY_MATERIAL_UPLOADED',
        'STUDY_MATERIAL_DELETED',
        'PASSWORD_RESET',
        'PRACTICE_SHEET_CREATED',
        'PRACTICE_SHEET_UPDATED',
        'PRACTICE_SHEET_DELETED',
      ],
      default: 'LOGIN',
      required: true,
    },
    ipAddress: { type: String, default: 'N/A' },
    userAgent: { type: String, default: 'N/A' },
    metaData: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);