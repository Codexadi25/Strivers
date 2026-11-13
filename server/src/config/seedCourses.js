const Course = require('../models/Course');

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

const DEFAULT_COURSES = [
  {
    productId: 'masterclass',
    title: 'Strivers Placement Masterclass',
    description: 'Live interactive weekend cohort with industry mentors covering ATS resumes, portfolio architecture, cold outreach, and real case interviews.',
    price: 74,
    priceInPaise: 7400,
    originalPrice: 399,
    badge: 'Live Session Every Sunday',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    duration: 'Weekend Live Cohort',
    level: 'Freshers & Professionals',
    currency: 'INR',
    category: 'masterclass',
    isMasterclass: true,
    courseType: 'masterclass',
    activeMeetingLink: 'https://meet.google.com/strivers-placement-live',
    meetingCode: 'strivers-placement-live',
    meetingPlatform: 'Google Meet',
    sessionStatus: 'upcoming',
    sessionDate: 'Sunday, 15 Nov, 11:00 AM IST',
    whatsappGroupLink: 'https://chat.whatsapp.com/strivers-placement-masterclass',
    secretPasscode: 'STRIVERS2026',
    mentors: [
      {
        name: 'Alex Morgan',
        role: 'Ex-Google · SDE-2 @ Blinkit',
        company: 'Blinkit',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      {
        name: 'Priya Sharma',
        role: 'Staff Engineer @ Zomato',
        company: 'Zomato',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
      },
      {
        name: 'Rahul Verma',
        role: 'Engineering Lead @ Porter',
        company: 'Porter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      },
    ],
    whatYouWillLearn: [
      'Craft ATS-compliant single-column resumes using recruiter-tested impact formulas',
      'Build and launch a live personal portfolio with recruiter-friendly project breakdowns',
      'Master LinkedIn & Naukri search algorithms to multiply inbound interview calls',
      'Write high-response cold outreach messages for hiring managers and founders',
      'Solve real-world operations, analytics & product case rounds with confidence',
    ],
    curriculum: [
      {
        moduleTitle: 'Module 1: ATS Resume Architecture & Action Verbs',
        duration: 'Week 1 • 45 Mins',
        lessons: [
          'Why 65% of multi-column templates fail automated screening',
          'Converting academic/work tasks into quantitative business bullets',
          'Live ATS audit and line-by-line resume teardown',
        ],
      },
      {
        moduleTitle: 'Module 2: Portfolio & Recruiter Search Optimization',
        duration: 'Week 1 • 45 Mins',
        lessons: [
          'Structuring capstone projects for 6-second hiring scans',
          'Optimizing LinkedIn headline, skills & recruiter keywords',
          'Setting up high-signal job alert workflows',
        ],
      },
      {
        moduleTitle: 'Module 3: Cold Outreach & Case Study Frameworks',
        duration: 'Week 2 • 60 Mins',
        lessons: [
          'Proven cold email templates with direct HR response tactics',
          'Dark store unit economics & SLA escalation breakdowns',
          'Live Q&A and 1-on-1 mock screening feedback',
        ],
      },
    ],
    features: [
      'Live interactive session every Sunday with working mentors',
      'ATS-friendly resume structure & quantitative bullet formulas',
      'Personal portfolio layout & project presentation blueprints',
      'Cold email templates & LinkedIn recruiter search hacks',
      'Curated in-app study notes, cheat sheets & interview Q&A',
      'Lifetime portal access to updated session guides',
    ],
    timingSlots: [
      {
        slotId: 'slot_sun_masterclass',
        title: 'Sunday Unicorn Placement Masterclass',
        date: 'Sunday, 15 Nov 2026',
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
    description: 'Curated vacancy feed with direct interview scheduling links, role-specific preparation briefs, and mentor shortlisting reviews.',
    price: 174,
    priceInPaise: 17400,
    originalPrice: 1999,
    badge: 'Direct Vacancy Feed',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80',
    duration: 'Ongoing Access',
    level: 'Job Seekers',
    currency: 'INR',
    category: 'channel',
    activeMeetingLink: 'https://meet.google.com/strivers-channel-interviews',
    meetingCode: 'strivers-channel-interviews',
    meetingPlatform: 'Google Meet',
    sessionStatus: 'upcoming',
    sessionDate: 'Active Vacancy Feed Updated Daily',
    secretPasscode: 'STRIVERS2026',
    whatYouWillLearn: [
      'Gain early visibility into active high-intent engineering and operations openings',
      'Prepare tailored role briefs matching each company interview rubric',
      'Refine interview pitches and salary negotiation strategies with mentors',
    ],
    curriculum: [
      {
        moduleTitle: 'Module 1: Verified Vacancy Feed & Role Briefing',
        duration: 'Updated Daily',
        lessons: [
          'Curated hiring openings across product & quick-commerce firms',
          'Direct scheduling links & coordinator briefings',
        ],
      },
      {
        moduleTitle: 'Module 2: Company Case Packs & Interview Prep',
        duration: 'Twice Weekly Live',
        lessons: [
          'Role-specific problem walkthroughs with working mentors',
          'Shortlist resume calibration & offer negotiation playbook',
        ],
      },
    ],
    mentors: [
      {
        name: 'Alex Morgan',
        role: 'Ex-Google · SDE-2 @ Blinkit',
        company: 'Blinkit',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      {
        name: 'Priya Sharma',
        role: 'Staff Engineer @ Zomato',
        company: 'Zomato',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&h=200&q=80',
      },
    ],
    features: [
      'Curated job vacancies with direct HR interview meeting links',
      'Enrol per upcoming vacancy with tailored prep packs',
      'Prepare directly with the same unicorn mentor network',
      'Unit economics & dark store logistics problem breakdowns',
      'Early-bird notification feed for high-intent applications',
      '1-on-1 shortlist guidance and offer negotiation tips',
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
  {
    productId: 'course_fullstack',
    title: 'Full-Stack Software Engineering',
    description: 'Comprehensive modular program covering full-stack web architecture, relational & NoSQL databases, scalable APIs, and production deployments.',
    price: 499,
    priceInPaise: 49900,
    originalPrice: 2999,
    badge: 'Self-Paced Track',
    imageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=900&q=80',
    duration: '16 Weeks • Self-Paced',
    level: 'Beginner to Advanced',
    currency: 'INR',
    category: 'course',
    isMasterclass: false,
    courseType: 'course',
    sessionDate: 'Instant Self-Paced Access',
    mentors: [
      {
        name: 'Alex Morgan',
        role: 'Ex-Google · SDE-2 @ Blinkit',
        company: 'Blinkit',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      },
      {
        name: 'Rahul Verma',
        role: 'Engineering Lead @ Porter',
        company: 'Porter',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      },
    ],
    whatYouWillLearn: [
      'Architect modern component-driven frontends with responsive UI patterns',
      'Design scalable REST APIs, database schemas, and caching strategies',
      'Build end-to-end authentication, validation, and cloud deployments',
      'Practice structured problem solving with curated engineering sheets',
    ],
    curriculum: [
      {
        moduleTitle: 'Module 1: Modern UI & State Architecture',
        duration: 'Weeks 1 – 5',
        lessons: [
          'Semantic HTML, Responsive Layouts & Accessible UI Components',
          'Component Composition, Hooks & Client-Side Routing',
          'Performance Profiling & Production Bundling',
        ],
      },
      {
        moduleTitle: 'Module 2: Backend Systems & Data Modeling',
        duration: 'Weeks 6 – 11',
        lessons: [
          'RESTful API Design, Validation & Error Handling',
          'Relational & Document Data Modeling at Scale',
          'Session Security, Role-Based Access & Rate Limiting',
        ],
      },
      {
        moduleTitle: 'Module 3: System Design & Capstone Deployment',
        duration: 'Weeks 12 – 16',
        lessons: [
          'Caching, Message Queues & High-Availability Patterns',
          'Containerization, CI/CD & Production Monitoring',
          'End-to-End Portfolio Capstone Project Review',
        ],
      },
    ],
    features: [
      '200+ modular self-paced video lessons & source repositories',
      'End-to-end architecture across Frontend, Backend, Databases & Containers',
      'Curated coding problems with editorial walkthroughs',
      'In-app architecture blueprints & system design guides',
      'Lifetime course access & structured topic notes',
      'Verified Certificate of Completion',
    ],
    isActive: true,
  },
];

async function seedCoursesIfEmpty() {
  try {
    const count = await Course.countDocuments();
    if (count === 0) {
      await Course.insertMany(DEFAULT_COURSES);
      console.log('[Course Catalog] Initialized default courses, meeting links & protected study materials.');
    } else {
      for (const defC of DEFAULT_COURSES) {
        const existing = await Course.findOne({ productId: defC.productId });
        if (!existing) {
          await Course.create(defC);
          console.log(`[Course Catalog] Backfilled default course: ${defC.productId} (${defC.title})`);
        } else {
          let needsSave = false;
          if (!existing.timingSlots || existing.timingSlots.length === 0) {
            existing.timingSlots = defC.timingSlots;
            needsSave = true;
          }
          if (existing.notesAndPdfs === undefined || existing.notesAndPdfs === null) {
            existing.notesAndPdfs = defC.notesAndPdfs;
            needsSave = true;
          }
          if (!existing.activeMeetingLink) {
            existing.activeMeetingLink = defC.activeMeetingLink;
            needsSave = true;
          }
          if (!existing.priceInPaise || existing.priceInPaise !== Math.round(existing.price * 100)) {
            existing.priceInPaise = Math.round(existing.price * 100);
            needsSave = true;
          }
          if (needsSave) {
            await existing.save();
            console.log(`[Course Catalog] Synchronized ${defC.productId} fields & price in paise.`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Course Catalog] Seeding check warning:', err.message);
  }
}

module.exports = { seedCoursesIfEmpty, DEFAULT_COURSES };
