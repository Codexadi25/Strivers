const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, default: 'Zomato' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    type: {
      type: String,
      default: 'Operational Scenario',
    },
    scenario: { type: String, required: true },
    solutionGuidance: { type: String, default: '' },
    keyTakeaway: { type: String, default: '' },
    resourceLink: { type: String, default: '' },
    videoUrl: { type: String, default: '' },
    starterCode: { type: String, default: '' },
    acceptanceRate: { type: String, default: '88%' },
    orderIndex: { type: Number, default: 0 },
  },
  { _id: false }
);

const topicSchema = new mongoose.Schema(
  {
    topicId: { type: String, required: true },
    topicTitle: { type: String, required: true },
    summary: { type: String, default: '' },
    orderIndex: { type: Number, default: 0 },
    problems: { type: [problemSchema], default: [] },
  },
  { _id: false }
);

const practiceSheetSchema = new mongoose.Schema(
  {
    sheetId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    roleType: {
      type: String,
      enum: ['non-tech', 'tech', 'analytics', 'product'],
      default: 'non-tech',
      index: true,
    },
    targetRole: {
      type: String,
      default: 'Operations & Growth Specialist',
    },
    targetCompanies: {
      type: [String],
      default: ['Zomato', 'Blinkit', 'Hyperpure', 'District', 'Porter', 'Amazon', 'Flipkart', 'Swiggy'],
    },
    description: {
      type: String,
      default: '',
    },
    badge: {
      type: String,
      default: '', // e.g. "Free Enrollment", "Must Do", "Trending"
    },
    difficultyLevel: {
      type: String,
      enum: ['All Levels', 'Beginner', 'Intermediate', 'Advanced'],
      default: 'All Levels',
    },
    price: {
      type: Number,
      default: 0.0, // ₹0.00 = Free Enrollment!
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    isTemplate: {
      type: Boolean,
      default: false, // For keeping Tech sheets as templates
    },
    // Uploaded HTML / EJS Practice Sheet Support
    htmlContent: {
      type: String,
      default: '', // HTML / EJS source content or interactive template
    },
    fileType: {
      type: String,
      enum: ['standard', 'html', 'ejs', 'react'],
      default: 'standard',
    },
    fileName: {
      type: String,
      default: '',
    },
    // Dynamic Mapping to Courses / Masterclasses
    linkedCourseId: {
      type: String,
      default: '', // If set, users enrolled in this course unlock this sheet for FREE
    },
    requiresCourseOrPurchase: {
      type: Boolean,
      default: false,
    },
    enrolledCount: {
      type: Number,
      default: 0,
    },
    topics: {
      type: [topicSchema],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: 'admin@yourdomain.com',
    },
    updatedBy: {
      type: String,
      default: 'admin@yourdomain.com',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for total problems count across all topics
practiceSheetSchema.virtual('totalProblemsCount').get(function () {
  return (this.topics || []).reduce((acc, topic) => acc + (topic.problems ? topic.problems.length : 0), 0);
});

practiceSheetSchema.pre('save', function (next) {
  this.isFree = Number(this.price) === 0;
  next();
});

module.exports = mongoose.model('PracticeSheet', practiceSheetSchema);
