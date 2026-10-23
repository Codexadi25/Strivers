const mongoose = require('mongoose');

// Sub-schema for individual timing slots & sessions
const timingSlotSchema = new mongoose.Schema(
  {
    slotId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true, // e.g. "Sunday, 25 Oct 2026"
    },
    startTime: {
      type: String,
      required: true, // e.g. "11:00 AM"
    },
    endTime: {
      type: String,
      default: '01:30 PM',
    },
    timezone: {
      type: String,
      default: 'IST',
    },
    mentorName: {
      type: String,
      default: '',
    },
    mentorRole: {
      type: String,
      default: '',
    },
    agenda: [
      {
        time: { type: String, default: '' },
        topic: { type: String, default: '' },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

// Sub-schema for Notes & PDFs stored directly in MongoDB (Strict View-Only DRM)
const studyMaterialSchema = new mongoose.Schema(
  {
    materialId: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    fileType: {
      type: String,
      enum: ['pdf', 'notes', 'cheatsheet', 'document'],
      default: 'notes',
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    fileData: {
      type: String,
      required: true, // Base64 encoded payload stored directly in MongoDB
    },
    fileSize: {
      type: Number,
      default: 0, // In bytes
    },
    viewOnly: {
      type: Boolean,
      default: true, // Anti-download DRM enforced
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    priceInPaise: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    originalPrice: {
      type: Number,
      default: null,
    },
    badge: {
      type: String,
      default: '',
    },
    features: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['masterclass', 'channel', 'course', 'workshop'],
      default: 'masterclass',
    },

    // Dynamic Live Meeting & Session Management
    activeMeetingLink: {
      type: String,
      default: 'https://meet.google.com/strivers-masterclass-live',
      trim: true,
    },
    meetingCode: {
      type: String,
      default: 'strivers-live',
      trim: true,
    },
    meetingPlatform: {
      type: String,
      default: 'Google Meet',
    },
    sessionStatus: {
      type: String,
      enum: ['upcoming', 'live', 'completed'],
      default: 'upcoming',
    },

    // Session Timing Slots
    timingSlots: {
      type: [timingSlotSchema],
      default: [],
    },

    // Shared Study Materials, Notes & PDFs (Stored in MongoDB, Download Prohibited)
    notesAndPdfs: {
      type: [studyMaterialSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    orderIndex: {
      type: Number,
      default: 0,
    },
    updatedBy: {
      type: String,
      default: 'admin',
    },
  },
  { timestamps: true }
);

// Pre-validate hook to keep price and priceInPaise synchronized
productSchema.pre('validate', function (next) {
  if (this.price !== undefined) {
    this.priceInPaise = Math.round(this.price * 100);
  } else if (this.priceInPaise !== undefined) {
    this.price = this.priceInPaise / 100;
  }
  next();
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
module.exports = Product;
