const mongoose = require('mongoose');
const { loadJsonFile, saveJsonFile } = require('./jsonStore');

const CATALOG_FILE = 'catalog.json';

const DEFAULT_CATALOG = {
  key: 'default_catalog',
  hero: {
    badge: 'LIVE INDUSTRY PROGRAMS & PLACEMENT TRACKS',
    title: 'Level Up Your Career with Unicorn Mentors',
    subtitle:
      'Direct, hands-on masterclasses designed to bridge the gap between college education and real tech hiring standards. ATS resumes, live portfolios, and verified recruiter channels.',
    stats: [
      { label: 'Candidate Rating', value: '4.9/5', icon: 'star' },
      { label: 'Live Sunday Google Meet Sessions', value: 'Interactive', icon: 'livetv' },
      { label: 'Permanent Lifetime Access', value: 'Lifetime', icon: 'shield' },
    ],
  },
  faqs: [
    {
      q: 'How do I access the live masterclass or classroom after enrolling?',
      a: 'Once your payment is confirmed, your account is immediately granted lifetime access. Simply navigate to "My Access" or click "Start Learning" to enter your Classroom with direct Google Meet links, DRM-protected notes, and schedule timings.',
    },
    {
      q: 'Can I read the study materials and session guides online?',
      a: 'Study materials, templates, and interview playbooks are available directly inside our in-app reader for enrolled learners so everything stays organized in one place.',
    },
    {
      q: 'What if I miss the live Sunday session?',
      a: 'Your enrollment gives you lifetime access to upcoming live sessions, curriculum schedules, and the full study notes library.',
    },
    {
      q: 'What is the refund policy if a payment fails?',
      a: 'If an amount is debited during an interrupted checkout, an automatic reversal is initiated back to your source payment method within 5–7 business days. You can also submit a support request directly from the portal.',
    },
  ],
  compareTable: {
    title: 'Compare Strivers Programs',
    subtitle: 'Everything you need to land your tech & non-tech placement shortlists.',
    headers: ['Curriculum & Benefits', 'Strivers Masterclass', 'Paid Job Channel', 'Full-Stack Track'],
    rows: [
      {
        feature: 'Live Sunday Sessions with Industry Mentors',
        values: ['✓ Live interactive', '✓ Vacancy briefing', '—'],
      },
      {
        feature: 'ATS Resume Blueprint & Action Verb Matrix',
        values: ['✓ Included', '✓ Review pack', '✓ Included'],
      },
      {
        feature: 'Portfolio Project Showcase & Career Review',
        values: ['✓ Included', '—', '✓ 5 Capstones'],
      },
      {
        feature: 'Direct HR Meeting Links & Vacancy Feed',
        values: ['—', '✓ Direct HR links', '—'],
      },
      {
        feature: 'In-App Study Notes & Preparation Guides',
        values: ['✓ Full access', '✓ Interview vault', '✓ Architecture guides'],
      },
      {
        feature: 'Unit Economics & Operations Case Studies',
        values: ['✓ Included', '✓ High-frequency', '✓ System design'],
      },
      {
        feature: 'Lifetime Account Access & Meeting Re-entry',
        values: ['✓ Lifetime', '✓ Lifetime', '✓ Lifetime'],
      },
    ],
  },
  companies: ['Zomato', 'Blinkit', 'Porter', 'Hyperpure', 'Genpact', 'Coforge'],
  updatedAt: new Date().toISOString(),
};

let catalogCache = loadJsonFile(CATALOG_FILE, DEFAULT_CATALOG);

async function syncCatalogToMongo(cfg) {
  if (mongoose.connection.readyState !== 1) return;
  try {
    const CatalogConfig = require('../models/CatalogConfig');
    const { _id, ...payload } = cfg;
    await CatalogConfig.findOneAndUpdate(
      { key: 'default_catalog' },
      { $set: payload },
      { upsert: true, new: true }
    ).maxTimeMS(2000);
  } catch (_) {}
}

const CatalogStore = {
  getConfig() {
    return JSON.parse(JSON.stringify(catalogCache));
  },

  updateConfig(updates = {}) {
    const current = this.getConfig();
    if (updates.hero) {
      current.hero = {
        ...current.hero,
        ...updates.hero,
        stats: Array.isArray(updates.hero.stats) ? updates.hero.stats : current.hero.stats,
      };
    }
    if (Array.isArray(updates.faqs)) {
      current.faqs = updates.faqs.filter((f) => f && (f.q || f.a));
    }
    if (updates.compareTable) {
      current.compareTable = {
        ...current.compareTable,
        ...updates.compareTable,
        headers: Array.isArray(updates.compareTable.headers)
          ? updates.compareTable.headers
          : current.compareTable.headers,
        rows: Array.isArray(updates.compareTable.rows)
          ? updates.compareTable.rows
          : current.compareTable.rows,
      };
    }
    if (Array.isArray(updates.companies)) {
      current.companies = updates.companies.filter(Boolean);
    }
    current.updatedAt = new Date().toISOString();
    catalogCache = current;
    saveJsonFile(CATALOG_FILE, catalogCache);
    syncCatalogToMongo(catalogCache);
    return this.getConfig();
  },
};

module.exports = CatalogStore;
