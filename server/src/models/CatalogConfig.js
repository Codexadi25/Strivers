const mongoose = require('mongoose');

const catalogConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default_catalog',
      unique: true,
      index: true,
    },
    hero: {
      badge: {
        type: String,
        default: 'LIVE INDUSTRY PROGRAMS & PLACEMENT TRACKS',
      },
      title: {
        type: String,
        default: 'Level Up Your Career with Unicorn Mentors',
      },
      subtitle: {
        type: String,
        default:
          'Direct, hands-on masterclasses designed to bridge the gap between college education and real tech hiring standards. ATS resumes, live portfolios, and verified recruiter channels.',
      },
      stats: [
        {
          label: { type: String, default: 'Candidate Rating' },
          value: { type: String, default: '4.9/5' },
          icon: { type: String, default: 'star' },
        },
        {
          label: { type: String, default: 'Live Sunday Google Meet Sessions' },
          value: { type: String, default: 'Interactive' },
          icon: { type: String, default: 'livetv' },
        },
        {
          label: { type: String, default: 'Permanent Lifetime Access' },
          value: { type: String, default: 'Lifetime' },
          icon: { type: String, default: 'shield' },
        },
      ],
    },
    faqs: [
      {
        q: { type: String, required: true },
        a: { type: String, required: true },
      },
    ],
    compareTable: {
      title: { type: String, default: 'Compare Strivers Programs' },
      subtitle: {
        type: String,
        default: 'Everything you need to land your tech & non-tech placement shortlists.',
      },
      headers: {
        type: [String],
        default: [
          'Curriculum & Benefits',
          'Strivers Masterclass',
          'Paid Job Channel',
          'Full-Stack Track',
        ],
      },
      rows: [
        {
          feature: { type: String, default: '' },
          values: { type: [String], default: [] },
        },
      ],
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const DEFAULT_FAQS = [
  {
    q: 'How do I access the live masterclass or classroom after enrolling?',
    a: 'Once your payment is confirmed, your account is immediately granted lifetime access. Simply navigate to "My Access" or click "Start Learning" to enter your Classroom with direct Google Meet links, DRM-protected notes, and schedule timings.',
  },
  {
    q: 'Can I download the study materials and session PDFs?',
    a: 'Study materials (ATS templates, cheatsheets, and ops playbooks) are stored securely in MongoDB and rendered inside our DRM Canvas Viewer with candidate watermarks. Direct file downloads and copying are disabled to protect intellectual property.',
  },
  {
    q: 'What if I miss the live Sunday session?',
    a: 'Your enrollment gives you permanent access to the upcoming sessions, curriculum agendas, and full DRM notes vault. You can attend the subsequent live Sunday session anytime.',
  },
  {
    q: 'What is the refund policy if a payment drops or errors occur?',
    a: 'We provide full payment reconciliation. If an amount was deducted but payment failed at the gateway, Razorpay automatically pushes a reversal within 5-7 business days. You can also raise an instant dispute ticket from your student portal.',
  },
];

const DEFAULT_COMPARE_ROWS = [
  {
    feature: 'Live Sunday Google Meet with Unicorn Mentors',
    values: ['✓ Live interactive', '✓ Vacancy briefing', '—'],
  },
  {
    feature: 'ATS Resume Blueprint & Action Verb Matrix',
    values: ['✓ Included', '✓ Review pack', '✓ Included'],
  },
  {
    feature: 'Portfolio Project Hosting & Live Domain Link',
    values: ['✓ Included', '—', '✓ 5 Capstones'],
  },
  {
    feature: 'Direct HR Meeting Links & Vacancy Feed',
    values: ['—', '✓ Direct HR links', '—'],
  },
  {
    feature: 'DRM-Protected In-App Study Notes & Cheatsheets',
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
];

catalogConfigSchema.statics.getOrSeedConfig = async function () {
  if (mongoose.connection.readyState !== 1) {
    return {
      key: 'default_catalog',
      faqs: DEFAULT_FAQS,
      compareTable: {
        title: 'Compare Strivers Programs',
        subtitle: 'Everything you need to land your tech & non-tech placement shortlists.',
        headers: ['Curriculum & Benefits', 'Strivers Masterclass', 'Paid Job Channel', 'Full-Stack Track'],
        rows: DEFAULT_COMPARE_ROWS,
      },
    };
  }
  let config = await this.findOne({ key: 'default_catalog' }).maxTimeMS(1500);
  if (!config) {
    config = await this.create({
      key: 'default_catalog',
      faqs: DEFAULT_FAQS,
      compareTable: {
        title: 'Compare Strivers Programs',
        subtitle: 'Everything you need to land your tech & non-tech placement shortlists.',
        headers: ['Curriculum & Benefits', 'Strivers Masterclass', 'Paid Job Channel', 'Full-Stack Track'],
        rows: DEFAULT_COMPARE_ROWS,
      },
    });
  }
  return config;
};

module.exports = mongoose.model('CatalogConfig', catalogConfigSchema);

