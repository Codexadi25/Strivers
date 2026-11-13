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
      required: true,
    },
    startTime: {
      type: String,
      required: true,
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
      enum: ['pdf', 'notes', 'cheatsheet', 'document', 'html'],
      default: 'notes',
    },
    mimeType: {
      type: String,
      default: 'application/pdf',
    },
    fileData: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    viewOnly: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
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
    imageUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: 'Self-Paced / Live',
    },
    level: {
      type: String,
      default: 'All Levels',
    },
    whatYouWillLearn: {
      type: [String],
      default: [],
    },
    curriculum: [
      {
        moduleTitle: { type: String, default: '' },
        duration: { type: String, default: '' },
        lessons: { type: [String], default: [] },
      },
    ],
    features: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      enum: ['masterclass', 'channel', 'course', 'workshop'],
      default: 'masterclass',
      index: true,
    },
    isMasterclass: {
      type: Boolean,
      default: function () {
        return this.category === 'masterclass' || this.productId === 'masterclass';
      },
      index: true,
    },
    courseType: {
      type: String,
      enum: ['masterclass', 'course', 'channel', 'workshop'],
      default: 'masterclass',
      index: true,
    },
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
      enum: ['upcoming', 'live', 'completed', 'ended'],
      default: 'upcoming',
    },
    whatsappGroupLink: {
      type: String,
      default: 'https://chat.whatsapp.com/strivers-placement-masterclass',
      trim: true,
    },
    sessionDate: {
      type: String,
      default: 'Sunday, 11:00 AM IST',
    },
    targetCountdown: {
      type: Date,
      default: null,
    },
    mentors: [
      {
        name: { type: String, default: '' },
        role: { type: String, default: '' },
        company: { type: String, default: '' },
        avatar: { type: String, default: '' },
      },
    ],
    secretPasscode: {
      type: String,
      default: 'STRIVERS2026',
      trim: true,
    },
    timingSlots: {
      type: [timingSlotSchema],
      default: [],
    },
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

courseSchema.pre('validate', function (next) {
  if (this.price !== undefined) {
    this.priceInPaise = Math.round(this.price * 100);
  } else if (this.priceInPaise !== undefined) {
    this.price = this.priceInPaise / 100;
  }

  if (this.category === 'masterclass' || this.productId === 'masterclass') {
    this.isMasterclass = true;
    this.courseType = 'masterclass';
  } else {
    this.isMasterclass = false;
    this.courseType = this.category || 'course';
  }

  next();
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
module.exports = Course;

