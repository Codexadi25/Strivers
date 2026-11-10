const mongoose = require('mongoose');
const { loadJsonFile, saveJsonFile } = require('./jsonStore');
const { DEFAULT_SHEETS } = require('../config/seedPracticeSheets');

const PRACTICE_FILE = 'practice.json';

function buildInitialSheets() {
  const base = JSON.parse(JSON.stringify(DEFAULT_SHEETS));
  const hasTech = base.some((s) => s.roleType === 'tech');
  if (!hasTech) {
    base.push({
      sheetId: 'tech-sde-dsa-75',
      title: 'SDE Core: Data Structures & Algorithms Top 75',
      roleType: 'tech',
      targetRole: 'SDE-1 / SDE-2',
      targetCompanies: ['Google', 'Blinkit', 'Zomato', 'Amazon'],
      description: 'Structured interview coding preparation covering Arrays, Linked Lists, Trees, Graphs, Dynamic Programming, and System Design patterns.',
      badge: 'Free Enrollment',
      difficultyLevel: 'Intermediate',
      price: 0,
      isFree: true,
      isTemplate: false,
      totalProblems: 75,
      topics: [
        {
          topicId: 'day-1',
          topicTitle: 'Day 1: Array (Part 1)',
          summary: 'Core in-place matrix & subarray optimizations asked across top tech firms.',
          problems: [
            {
              id: 'p-1-1',
              title: 'Set Matrix Zeroes',
              company: 'Amazon',
              difficulty: 'Medium',
              type: 'Arrays',
              scenario: 'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0 in-place O(1) extra space.',
              solutionGuidance: 'Use the first row and first column as O(1) flag markers, processing reverse from bottom-right.',
              keyTakeaway: 'Optimized in-place O(1) space avoids auxiliary O(m+n) boolean arrays.',
              resourceLink: 'https://leetcode.com/problems/set-matrix-zeroes/',
              videoUrl: 'https://www.youtube.com/watch?v=N0MgLvLSXMM',
              acceptanceRate: '56%',
            },
            {
              id: 'p-1-2',
              title: "Kadane's Algorithm (Maximum Subarray)",
              company: 'Microsoft',
              difficulty: 'Medium',
              type: 'Arrays',
              scenario: 'Find the contiguous subarray with the largest sum in O(N) linear time.',
              solutionGuidance: 'Carry running sum while positive and reset to zero when sum drops below 0.',
              keyTakeaway: 'Track global max even when all elements are negative.',
              resourceLink: 'https://leetcode.com/problems/maximum-subarray/',
              videoUrl: 'https://www.youtube.com/watch?v=AHZpyENo7k4',
              acceptanceRate: '51%',
            },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    });
  }
  return base.map((s) => ({
    ...s,
    id: s.sheetId,
    totalProblems:
      s.totalProblems ||
      (s.topics || []).reduce((acc, t) => acc + ((t.problems || []).length), 0) ||
      20,
    companyTags: s.targetCompanies || s.companyTags || [],
    roleTag: s.targetRole || s.roleTag || 'All Roles',
    category: s.roleType === 'tech' ? 'Engineering' : s.roleType === 'analytics' ? 'Analytics' : 'Operations',
  }));
}

let sheetsCache = loadJsonFile(PRACTICE_FILE, buildInitialSheets);

async function syncSheetToMongo(sheet) {
  if (mongoose.connection.readyState !== 1 || !sheet?.sheetId) return;
  try {
    const PracticeSheet = require('../models/PracticeSheet');
    const { _id, id, companyTags, roleTag, category, totalProblems, ...dbFields } = sheet;
    await PracticeSheet.findOneAndUpdate(
      { sheetId: sheet.sheetId.toLowerCase() },
      { $set: { ...dbFields, sheetId: sheet.sheetId.toLowerCase() } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).maxTimeMS(2000);
  } catch (_) {}
}

function normalizeSheet(s) {
  const totalCount = (s.topics || []).reduce((sum, t) => sum + ((t.problems || []).length), 0);
  return {
    ...s,
    id: s.sheetId,
    sheetId: s.sheetId,
    roleType: s.roleType || (String(s.category || '').toLowerCase() === 'engineering' ? 'tech' : 'non-tech'),
    targetRole: s.targetRole || s.roleTag || 'Operations & Tech Roles',
    roleTag: s.roleTag || s.targetRole || 'All Roles',
    targetCompanies: s.targetCompanies || s.companyTags || [],
    companyTags: s.companyTags || s.targetCompanies || [],
    totalProblems: totalCount > 0 ? totalCount : s.totalProblems || 20,
    category: s.category || (s.roleType === 'tech' ? 'Engineering' : s.roleType === 'analytics' ? 'Analytics' : 'Operations'),
    isActive: s.isActive !== false,
  };
}

const PracticeStore = {
  getAll() {
    return sheetsCache.filter((s) => s.isActive !== false).map(normalizeSheet);
  },

  getById(id) {
    if (!id) return null;
    const clean = String(id).trim().toLowerCase();
    const found = sheetsCache.find((s) => s.sheetId.toLowerCase() === clean || String(s.id || '').toLowerCase() === clean);
    return found ? normalizeSheet(found) : null;
  },

  create(data = {}) {
    const sheetId = String(
      data.sheetId ||
      data.id ||
      `${(data.roleType || 'track').toLowerCase()}_${Date.now()}`
    ).trim().toLowerCase();

    const roleType = data.roleType || (String(data.category || '').toLowerCase() === 'engineering' ? 'tech' : 'non-tech');
    const newSheet = normalizeSheet({
      sheetId,
      title: data.title || 'New Practice Track',
      roleType,
      targetRole: data.targetRole || data.roleTag || 'General Role',
      targetCompanies: Array.isArray(data.targetCompanies)
        ? data.targetCompanies
        : Array.isArray(data.companyTags)
        ? data.companyTags
        : [],
      description: data.description || 'Structured interview practice track curated by mentors.',
      badge: data.badge || (Number(data.price) > 0 ? 'Pro Track' : 'Free Enrollment'),
      difficultyLevel: data.difficultyLevel || data.difficulty || 'Intermediate',
      price: Number(data.price) || 0,
      isFree: !data.price || Number(data.price) === 0,
      totalProblems: Number(data.totalProblems) || 20,
      topics: Array.isArray(data.topics) ? data.topics : [],
      linkedCourseId: data.linkedCourseId || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    });

    const idx = sheetsCache.findIndex((s) => s.sheetId === sheetId);
    if (idx >= 0) {
      sheetsCache[idx] = newSheet;
    } else {
      sheetsCache.unshift(newSheet);
    }
    saveJsonFile(PRACTICE_FILE, sheetsCache);
    syncSheetToMongo(newSheet);
    return newSheet;
  },

  update(id, updates = {}) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = sheetsCache.findIndex((s) => s.sheetId.toLowerCase() === clean);
    if (idx === -1) return null;

    const merged = normalizeSheet({
      ...sheetsCache[idx],
      ...updates,
      sheetId: sheetsCache[idx].sheetId,
      updatedAt: new Date().toISOString(),
    });
    sheetsCache[idx] = merged;
    saveJsonFile(PRACTICE_FILE, sheetsCache);
    syncSheetToMongo(merged);
    return merged;
  },

  delete(id) {
    const clean = String(id || '').trim().toLowerCase();
    const idx = sheetsCache.findIndex((s) => s.sheetId.toLowerCase() === clean);
    if (idx === -1) return false;
    sheetsCache.splice(idx, 1);
    saveJsonFile(PRACTICE_FILE, sheetsCache);
    if (mongoose.connection.readyState === 1) {
      try {
        const PracticeSheet = require('../models/PracticeSheet');
        PracticeSheet.deleteOne({ sheetId: clean }).catch(() => {});
      } catch (_) {}
    }
    return true;
  },

  addTopic(sheetId, topicData) {
    const sheet = this.getById(sheetId);
    if (!sheet) return null;
    const topics = [...(sheet.topics || [])];
    const newTopic = {
      topicId: topicData.topicId || `topic_${Date.now()}`,
      topicTitle: topicData.topicTitle || 'New Module',
      summary: topicData.summary || '',
      problems: Array.isArray(topicData.problems) ? topicData.problems : [],
    };
    topics.push(newTopic);
    return this.update(sheetId, { topics });
  },

  addProblem(sheetId, topicId, problemData) {
    const sheet = this.getById(sheetId);
    if (!sheet) return null;
    const topics = (sheet.topics || []).map((t) => {
      if (t.topicId !== topicId) return t;
      const problems = [...(t.problems || [])];
      problems.push({
        id: problemData.id || `prob_${Date.now()}`,
        title: problemData.title || 'New Problem',
        company: problemData.company || 'Zomato',
        difficulty: problemData.difficulty || 'Medium',
        type: problemData.type || 'Scenario',
        scenario: problemData.scenario || '',
        solutionGuidance: problemData.solutionGuidance || '',
        keyTakeaway: problemData.keyTakeaway || '',
        resourceLink: problemData.resourceLink || '',
        acceptanceRate: problemData.acceptanceRate || '88%',
      });
      return { ...t, problems };
    });
    return this.update(sheetId, { topics });
  },
};

module.exports = PracticeStore;
