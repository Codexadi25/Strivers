const Product = require('../models/Product');

// Sample Base64 encoded note documents stored directly into MongoDB
const SAMPLE_ATS_NOTE_B64 = Buffer.from(`
# STRIVERS MASTERCLASS: ATS RESUME BLUEPRINT (CONFIDENTIAL)
*Author: Senior Mentors (ex-Zomato, Blinkit, Coforge)*

## 1. The 6-Second Screen Rule
Recruiters filter over 400+ applications per day using Applicant Tracking Systems (ATS). If your file is a graphic canvas or multi-column table, parsing failure rate exceeds 65%.

### Golden Formatting Directives:
1. Single-column, clean linear flow (Header -> Summary -> Experience -> Projects -> Skills -> Education).
2. Standard Section Titles: Use "Work Experience" NOT "Career Milestones".
3. Font standard: Arial, Calibri, or Inter. Minimum 10pt.
4. Format: Plain text compatible. Never use text boxes, icons, or progress bars for skills.

## 2. High-Impact Action Verb Matrix:
- **Operations & Logistics**: Spearheaded, Streamlined, Orchestrated, Optimized, Accelerated.
- **Tech & SDE**: Architected, Engineered, Deployed, Benchmarked, Refactored.
- **Metrics Formula**: Accomplished [X], as measured by [Y], by doing [Z].
  *Example*: "Reduced average dark-store order dispatch latency by 32% (from 4.2m to 2.8m) by reorganizing high-velocity SKU picking stations."

---
*PROTECTED STUDY MATERIAL — REPRODUCTION OR DOWNLOAD STRICTLY PROHIBITED*
`).toString('base64');

const SAMPLE_DARKSTORE_OPS_B64 = Buffer.from(`
# QUICK COMMERCE & DARK STORE OPERATIONS PLAYBOOK
*Confidential Prep Guide for Zomato, Blinkit, Hyperpure & Swiggy Interviews*

## 1. Core KPIs Every Candidate Must Know:
1. **OTD (On-Time Delivery)**: Percentage of orders delivered within target SLA (typically 10-15 mins). Target: >98.8%.
2. **Picker Time**: Time taken from order ping to bag handed to rider. Target: < 90 seconds.
3. **Fill Rate & Stockout Rate**: Percentage of customer cart items fulfilled without substitution. Target: > 99%.
4. **Order Burn Cost vs Delivery Radius**: Geo-fencing dynamically scales between 1.8km and 3.5km based on active rider fleet density and weather alerts.

## 2. The 3-Bucket Escalation Framework:
When an interviewer asks: *"Dark store order delays jumped 40% in South Delhi during 7-9 PM rain. How do you respond?"*
- **Step 1: Geofence Contraction**: Reduce radius to 1.5km immediately to protect rider safety and contain SLA blowout.
- **Step 2: SKU Throttling**: Temporarily hide heavy/bulky SKUs (>5kg water/flour) to allow two-wheeler fleet faster transit.
- **Step 3: Customer Communication**: Proactive push notification apologizing with auto-applied ₹50 convenience wallet credit.

---
*STRIVERS LICENSED RESOURCE — FOR IN-APP REVIEW ONLY*
`).toString('base64');

const DEFAULT_PRODUCTS = [
  {
    productId: 'masterclass',
    title: 'Strivers Masterclass',
    description: 'Live online session, basics to advanced. Live Sunday interactive workshop on resume, portfolio, LinkedIn/Naukri & cold emails.',
    price: 21,
    priceInPaise: 2100,
    originalPrice: 999,
    badge: 'Live Session Every Sunday',
    currency: 'INR',
    category: 'masterclass',
    activeMeetingLink: 'https://meet.google.com/strivers-placement-live',
    meetingCode: 'strivers-placement-live',
    meetingPlatform: 'Google Meet',
    sessionStatus: 'upcoming',
    features: [
      'Live online session every Sunday',
      'Resume, portfolio, LinkedIn & Naukri',
      'Cold emails and data skills for placement',
      'Exclusive Mentorship Q&A Room',
      'Permanent Lifetime Account Access',
    ],
    timingSlots: [
      {
        slotId: 'slot_sun_masterclass',
        title: 'Sunday Unicorn Placement Masterclass',
        date: 'Sunday, 25 Oct 2026',
        startTime: '11:00 AM',
        endTime: '01:30 PM',
        timezone: 'IST',
        mentorName: 'Aditya & Guest Unicorn Leads',
        mentorRole: 'Operations & Engineering Mentors',
        agenda: [
          { time: '11:00 AM - 11:45 AM', topic: 'Live ATS Resume Roast & Keyword Architecture' },
          { time: '11:45 AM - 12:30 PM', topic: 'Naukri & LinkedIn Recruiter Search Algorithm Hacks' },
          { time: '12:30 PM - 01:15 PM', topic: 'Cold Outreach Templates & Direct HR Escalation' },
          { time: '01:15 PM - 01:30 PM', topic: 'Live Student Q&A and 1-on-1 Mock Breakdown' },
        ],
        isActive: true,
      },
    ],
    notesAndPdfs: [
      {
        materialId: 'mat_ats_blueprint',
        title: 'ATS Resume Blueprint & Action Verb Matrix',
        description: 'Single-column parsing guide with 50+ metric-driven bullet points for operations & tech candidates.',
        fileType: 'notes',
        mimeType: 'text/markdown',
        fileData: SAMPLE_ATS_NOTE_B64,
        fileSize: SAMPLE_ATS_NOTE_B64.length,
        viewOnly: true,
        uploadedAt: new Date(),
      },
      {
        materialId: 'mat_darkstore_playbook',
        title: 'Quick Commerce & Dark Store Operations Playbook',
        description: 'Key metrics, unit economics, rider balancing, and case study solutions for Zomato/Blinkit/Swiggy.',
        fileType: 'cheatsheet',
        mimeType: 'text/markdown',
        fileData: SAMPLE_DARKSTORE_OPS_B64,
        fileSize: SAMPLE_DARKSTORE_OPS_B64.length,
        viewOnly: true,
        uploadedAt: new Date(),
      },
    ],
    isActive: true,
  },
  {
    productId: 'channel',
    title: 'Paid Job Channel',
    description: 'Per upcoming job vacancy. Interview meeting links shared in the channel with direct HR access.',
    price: 174,
    priceInPaise: 17400,
    originalPrice: 1999,
    badge: 'Direct Vacancy Feed',
    currency: 'INR',
    category: 'channel',
    activeMeetingLink: 'https://meet.google.com/strivers-channel-interviews',
    meetingCode: 'strivers-channel-interviews',
    meetingPlatform: 'Google Meet',
    sessionStatus: 'upcoming',
    features: [
      'Interview meeting links shared in the channel',
      'Enrol per upcoming vacancy',
      'Prepare with the same mentors',
      'Direct HR WhatsApp & Email Intimations',
      'Immediate Referral Pool Access',
    ],
    timingSlots: [
      {
        slotId: 'slot_channel_weekly',
        title: 'Upcoming Vacancies & Direct Walk-in Briefing',
        date: 'Wednesday & Saturday',
        startTime: '07:00 PM',
        endTime: '08:00 PM',
        timezone: 'IST',
        mentorName: 'HR Coordination Team',
        mentorRole: 'Talent Acquisition Partners',
        agenda: [
          { time: '07:00 PM - 07:25 PM', topic: 'Review of 8+ Active Immediate Joining Roles' },
          { time: '07:25 PM - 07:50 PM', topic: 'Meeting Links & Direct Interview Schedule Distribution' },
          { time: '07:50 PM - 08:00 PM', topic: 'Rapid Document Verification Checklist' },
        ],
        isActive: true,
      },
    ],
    notesAndPdfs: [
      {
        materialId: 'mat_channel_briefing',
        title: 'Verified Hiring Roster & Interview Tips',
        description: 'Comprehensive hiring criteria, CTC packages, and interview round breakdown.',
        fileType: 'notes',
        mimeType: 'text/markdown',
        fileData: SAMPLE_ATS_NOTE_B64,
        fileSize: SAMPLE_ATS_NOTE_B64.length,
        viewOnly: true,
        uploadedAt: new Date(),
      },
    ],
    isActive: true,
  },
];

async function seedProductsIfEmpty() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(DEFAULT_PRODUCTS);
      console.log('[Course Catalog] Initialized default courses, meeting links & protected study materials.');
    } else {
      // Ensure existing default products have timingSlots and notesAndPdfs populated
      for (const defP of DEFAULT_PRODUCTS) {
        const existing = await Product.findOne({ productId: defP.productId });
        if (!existing) {
          await Product.create(defP);
          console.log(`[Course Catalog] Created default course ${defP.productId} in MongoDB.`);
        } else {
          let needsSave = false;
          if (!existing.timingSlots || existing.timingSlots.length === 0) {
            existing.timingSlots = defP.timingSlots;
            needsSave = true;
          }
          if (!existing.notesAndPdfs || existing.notesAndPdfs.length === 0) {
            existing.notesAndPdfs = defP.notesAndPdfs;
            needsSave = true;
          }
          if (!existing.activeMeetingLink) {
            existing.activeMeetingLink = defP.activeMeetingLink;
            needsSave = true;
          }
          if (needsSave) {
            await existing.save();
            console.log(`[Course Catalog] Updated ${defP.productId} with timing slots and MongoDB notes.`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Course Catalog] Seeding check warning:', err.message);
  }
}

module.exports = { seedProductsIfEmpty, DEFAULT_PRODUCTS };
