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
      currentStreak: { type: Number, default: 8 },
      bestStreak: { type: Number, default: 14 },
      totalActiveDays: { type: Number, default: 16 },
      lastActiveDate: { type: Date, default: Date.now },
      weeklyMinutes: { type: Number, default: 1355 }, // 22h 35m
      activeDates: {
        type: [String],
        default: [
          '2026-10-02',
          '2026-10-05',
          '2026-10-08',
          '2026-10-12',
          '2026-10-15',
          '2026-10-19',
          '2026-10-22',
          '2026-10-23',
          '2026-10-24',
          '2026-10-25',
          '2026-10-26',
          '2026-10-27',
          '2026-10-28',
          '2026-10-29',
        ],
      },
      dailySubmissions: {
        type: Map,
        of: Number,
        default: {
          '2026-10-29': 4,
          '2026-10-28': 3,
          '2026-10-27': 5,
          '2026-10-26': 2,
          '2026-10-25': 6,
          '2026-10-24': 3,
          '2026-10-23': 4,
          '2026-10-22': 2,
          '2026-10-19': 3,
          '2026-10-15': 2,
          '2026-10-12': 4,
          '2026-10-08': 1,
          '2026-10-05': 3,
          '2026-10-02': 2,
        },
      },
      weeklyDistribution: {
        type: [
          {
            day: String, // 'S', 'M', 'T', 'W', 'T', 'F', 'S'
            dayIndex: Number, // 0..6
            minutes: Number,
            time: String,
          },
        ],
        default: [
          { day: 'S', dayIndex: 0, minutes: 90, time: '1h 30m' },
          { day: 'M', dayIndex: 1, minutes: 195, time: '3h 15m' },
          { day: 'T', dayIndex: 2, minutes: 160, time: '2h 40m' },
          { day: 'W', dayIndex: 3, minutes: 250, time: '4h 10m' },
          { day: 'T', dayIndex: 4, minutes: 170, time: '2h 50m' },
          { day: 'F', dayIndex: 5, minutes: 210, time: '3h 30m' },
          { day: 'S', dayIndex: 6, minutes: 270, time: '4h 30m' },
        ],
      },
      currentWeek: { type: Number, default: 5 },
      bestWeek: { type: Number, default: 7 },
      currentMonth: { type: Number, default: 14 },
      bestMonth: { type: Number, default: 28 },
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
