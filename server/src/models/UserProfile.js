const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, index: true },
    name: { type: String, default: 'Aditya Sahu' },
    handle: { type: String, default: '@adi2828' },
    roleTitle: { type: String, default: 'Software Development Engineer (SDE-1)' },
    college: { type: String, default: 'Indian Institute of Technology' },
    graduationYear: { type: Number, default: 2026 },
    targetCompanies: {
      type: [String],
      default: ['Zomato', 'Blinkit', 'Flipkart', 'Amazon', 'Coforge', 'Cognizant'],
    },
    solvedProblems: {
      type: [String],
      default: ['dsa-1-1', 'dsa-1-2', 'dsa-2-1'],
    },
    starredProblems: {
      type: [String],
      default: ['dsa-1-1', 'dsa-3-1'],
    },
    problemNotes: {
      type: Map,
      of: String,
      default: {},
    },
    streak: {
      currentStreak: { type: Number, default: 2 },
      bestStreak: { type: Number, default: 5 },
      totalActiveDays: { type: Number, default: 12 },
      lastActiveDate: { type: Date, default: Date.now },
      weeklyMinutes: { type: Number, default: 1355 }, // ~22h 35m
    },
    studyPlan: {
      dailyGoal: { type: Number, default: 3 },
      targetDays: { type: Number, default: 45 },
      completedDays: { type: [Number], default: [1, 2] },
    },
    preferences: {
      theme: { type: String, default: 'light' },
      dailyReminder: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserProfile', userProfileSchema);
