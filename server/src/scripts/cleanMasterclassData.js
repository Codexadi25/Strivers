const fs = require('fs');
const path = require('path');

const coursesFilePath = path.join(__dirname, '..', 'data', 'courses.json');

const raw = fs.readFileSync(coursesFilePath, 'utf8');
const courses = JSON.parse(raw);

const masterclassIdx = courses.findIndex(c => c.productId === 'masterclass');
if (masterclassIdx === -1) {
  console.error('Masterclass course not found!');
  process.exit(1);
}

const mc = courses[masterclassIdx];

// Clean, realistic timing slots with upcoming dates in Nov / Dec 2026
const cleanSlots = [
  {
    slotId: 'slot_sun_masterclass',
    title: 'Live ATS Resume Roasting & Technical Interview Strategy',
    date: 'Sunday, 29 Nov 2026',
    dateTime: 'Sunday, 29 Nov 2026 · 11:00 AM - 01:30 PM IST',
    startTime: '11:00 AM',
    endTime: '01:30 PM',
    timezone: 'IST',
    mentorName: 'Aditya Sahu & Lead Mentors',
    mentorRole: 'Ex Startek (Zomato Executive) & Tech Mahindra (Flipkart CRM)',
    capacity: 200,
    isActive: true,
    active: true,
    agenda: [
      { time: '11:00 AM - 11:45 AM', topic: 'Live ATS Resume Roast & Keyword Architecture' },
      { time: '11:45 AM - 12:30 PM', topic: 'Naukri & LinkedIn Recruiter Search Algorithm Hacks' },
      { time: '12:30 PM - 01:15 PM', topic: 'Cold Outreach Templates & Direct HR Escalation' },
      { time: '01:15 PM - 01:30 PM', topic: 'Live Student Q&A and 1-on-1 Mock Breakdown' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    slotId: 'slot_tue_system_design',
    title: 'High-Concurrency Backend & Distributed Systems Architecture',
    date: 'Tuesday, 01 Dec 2026',
    dateTime: 'Tuesday, 01 Dec 2026 · 08:00 PM - 09:30 PM IST',
    startTime: '08:00 PM',
    endTime: '09:30 PM',
    timezone: 'IST',
    mentorName: 'Alex Morgan',
    mentorRole: 'Ex-Google · SDE-2 @ Blinkit',
    capacity: 150,
    isActive: true,
    active: true,
    agenda: [
      { time: '08:00 PM - 08:40 PM', topic: 'Event-Driven Microservices & Redis Caching Strategies' },
      { time: '08:40 PM - 09:15 PM', topic: 'Surge Traffic Handling & Database Sharding Patterns' },
      { time: '09:15 PM - 09:30 PM', topic: 'System Design Mock Interview & Q&A' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    slotId: 'slot_thu_dsa_patterns',
    title: 'Core DSA Graph & Dynamic Programming Patterns for Unicorn Rounds',
    date: 'Thursday, 03 Dec 2026',
    dateTime: 'Thursday, 03 Dec 2026 · 08:30 PM - 10:00 PM IST',
    startTime: '08:30 PM',
    endTime: '10:00 PM',
    timezone: 'IST',
    mentorName: 'Priya Sharma',
    mentorRole: 'Staff Engineer @ Zomato',
    capacity: 150,
    isActive: true,
    active: true,
    agenda: [
      { time: '08:30 PM - 09:15 PM', topic: 'Top 5 Graph Traversal & Shortest Path Unicorn Problems' },
      { time: '09:15 PM - 09:45 PM', topic: 'Dynamic Programming Memoization vs Tabulation Mental Models' },
      { time: '09:45 PM - 10:00 PM', topic: 'Live Code Review & Optimization' }
    ],
    updatedAt: new Date().toISOString()
  }
];

const note1Html = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 740px; margin: 0 auto; line-height: 1.6; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">STRIVERS MASTERCLASS: ATS RESUME BLUEPRINT</h1>
  <p style="font-size: 0.95rem; color: #64748b; font-weight: 600;">CONFIDENTIAL CANDIDATE PREPARATION GUIDE · STAGE 1</p>
  
  <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 14px 18px; margin: 20px 0; border-radius: 6px;">
    <strong style="color: #1e40af;">📌 The 6-Second Screen Rule:</strong>
    <p style="margin: 4px 0 0; color: #334155;">Recruiters review over 400+ resumes daily through Applicant Tracking Systems. Multi-column canvas files or tables fail parsing over 65% of the time. Use single-column linear flow.</p>
  </div>

  <h2 style="color: #0f172a; margin-top: 20px;">Golden Formatting Directives:</h2>
  <ol style="padding-left: 20px; color: #334155;">
    <li><strong>Structure:</strong> Header &rarr; Summary &rarr; Experience &rarr; Projects &rarr; Skills &rarr; Education.</li>
    <li><strong>Standard Section Names:</strong> Use "Work Experience" instead of "Career Milestones".</li>
    <li><strong>Font standard:</strong> Arial, Calibri, or Inter (Minimum 10.5pt).</li>
    <li><strong>Quantified Impact Formula:</strong> Accomplished [X], as measured by [Y], by doing [Z].</li>
  </ol>
</div>`;

const note2Html = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 740px; margin: 0 auto; line-height: 1.6; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #059669; padding-bottom: 8px;">QUICK COMMERCE & DARK STORE OPERATIONS PLAYBOOK</h1>
  <p style="font-size: 0.95rem; color: #64748b; font-weight: 600;">OPERATIONS, SUPPLY CHAIN & METRIC ESCALATION FRAMEWORKS</p>

  <h2 style="color: #0f172a; margin-top: 20px;">1. Critical Operational Metrics (Every Candidate Must Know)</h2>
  <ul style="padding-left: 20px; color: #334155;">
    <li><strong>OTD (On-Time Delivery):</strong> Target &gt; 98.8% within 10-15 minute SLA window.</li>
    <li><strong>Picker Latency:</strong> Order ping to bag sealed &lt; 85 seconds.</li>
    <li><strong>Fill Rate & Stockout Delta:</strong> Cart items fulfilled without substitution &gt; 99.2%.</li>
    <li><strong>Dynamic Geofence Scaling:</strong> 1.8km - 3.2km radius depending on fleet rider availability and weather surge.</li>
  </ul>

  <h2 style="color: #0f172a; margin-top: 20px;">2. Surge & Bottleneck Escalation Protocol</h2>
  <div style="background: #f0fdf4; border-left: 4px solid #059669; padding: 14px 18px; margin: 16px 0; border-radius: 6px;">
    <strong>Step 1: Geofence Contraction</strong> &mdash; Reduce delivery radius to protect rider safety and avoid SLA penalty.<br/>
    <strong>Step 2: SKU Throttling</strong> &mdash; Temporarily de-prioritize heavy water/grocery packs for faster rider transit.<br/>
    <strong>Step 3: Customer Notification</strong> &mdash; Push proactive ETA updates with automated wallet courtesy credits.
  </div>
</div>`;

const note3Html = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 740px; margin: 0 auto; line-height: 1.6; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #7c3aed; padding-bottom: 8px;">TOP 25 SYSTEM DESIGN & MICROSERVICES CHEATSHEET</h1>
  <p style="font-size: 0.95rem; color: #64748b; font-weight: 600;">DISTRIBUTED SYSTEMS, CACHING, CONSISTENCY & SCALE ARCHITECTURE</p>

  <h2 style="color: #0f172a; margin-top: 20px;">1. Distributed Caching Strategies</h2>
  <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9rem;">
    <thead>
      <tr style="background: #f8fafc; text-align: left;">
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Pattern</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Pros</th>
        <th style="padding: 10px; border: 1px solid #cbd5e1;">Cons</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>Cache-Aside</strong></td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Only caches requested data; resilient to cache failure</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Cache misses incur 3 network round-trips</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>Write-Through</strong></td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Data is always fresh in cache; strict read consistency</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Higher write latency; unused data gets cached</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #cbd5e1;"><strong>Write-Behind</strong></td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Fastest write performance; batch database writes</td>
        <td style="padding: 10px; border: 1px solid #cbd5e1;">Risk of data loss on cache node crash</td>
      </tr>
    </tbody>
  </table>

  <h2 style="color: #0f172a; margin-top: 20px;">2. Rate Limiting Algorithms</h2>
  <ul style="padding-left: 20px; color: #334155;">
    <li><strong>Token Bucket:</strong> Allows temporary burst traffic while enforcing average rate. (Industry Standard)</li>
    <li><strong>Leaky Bucket:</strong> Smooths out traffic spikes by processing requests at a strictly constant rate.</li>
    <li><strong>Sliding Window Counter:</strong> Memory-efficient approximation preventing edge-boundary double bursts.</li>
  </ul>
</div>`;

const note4Html = `<div style="font-family: system-ui, -apple-system, sans-serif; max-width: 740px; margin: 0 auto; line-height: 1.6; color: #1e293b;">
  <h1 style="color: #0f172a; border-bottom: 2px solid #ea580c; padding-bottom: 8px;">UNICORN ENGINEERING &amp; OPERATIONS INTERVIEW Q&amp;A</h1>
  <p style="font-size: 0.95rem; color: #64748b; font-weight: 600;">BEHAVIORAL, INCIDENT ROOT CAUSE &amp; LEADERSHIP QUESTIONS</p>

  <div style="background: #fff7ed; border-left: 4px solid #ea580c; padding: 14px 18px; margin: 16px 0; border-radius: 6px;">
    <strong style="color: #c2410c;">Q: How do you handle an unannounced payment gateway downtime during peak flash sale?</strong>
    <p style="margin: 6px 0 0; color: #431407;">
      <strong>Answer:</strong> First, verify circuit breaker state &mdash; automatically route subsequent checkouts to secondary PG fallback (e.g. Razorpay &rarr; Cashfree/PayU) within 5 seconds. Second, surface clear user-facing banner preventing duplicate debit attempts. Third, trigger reconciliation webhook queue to verify pending authorizations before marking failed orders.
    </p>
  </div>

  <div style="background: #f8fafc; border-left: 4px solid #475569; padding: 14px 18px; margin: 16px 0; border-radius: 6px;">
    <strong style="color: #0f172a;">Q: Tell me about a time you had a technical disagreement with senior management.</strong>
    <p style="margin: 6px 0 0; color: #334155;">
      <strong>Answer:</strong> Frame around data-driven trade-offs. Present benchmark numbers, latency simulations, and financial unit economics rather than opinions. Disagree and commit once the decision is reached with clear rollback milestones.
    </p>
  </div>
</div>`;

const cleanNotes = [
  {
    materialId: 'mat_ats_blueprint',
    title: 'ATS Resume Blueprint & Action Verb Matrix',
    description: 'Single-column ATS keyword structure, high-impact action verbs, and quantitative bullet formulas for tech & operations.',
    fileType: 'notes',
    mimeType: 'text/html',
    fileData: Buffer.from(note1Html).toString('base64'),
    fileSize: Buffer.byteLength(note1Html),
    viewOnly: true,
    drmLevel: 'DRM_ENFORCED',
    uploadedAt: '2026-11-28T10:00:00.000Z'
  },
  {
    materialId: 'mat_darkstore_playbook',
    title: 'Quick Commerce & Dark Store Operations Playbook',
    description: 'Key metrics, unit economics, rider fleet balancing, and surge case study solutions for Zomato, Blinkit, and Swiggy interviews.',
    fileType: 'cheatsheet',
    mimeType: 'text/html',
    fileData: Buffer.from(note2Html).toString('base64'),
    fileSize: Buffer.byteLength(note2Html),
    viewOnly: true,
    drmLevel: 'DRM_ENFORCED',
    uploadedAt: '2026-11-28T10:00:00.000Z'
  },
  {
    materialId: 'mat_system_design_cheat',
    title: 'Top 25 System Design & Microservices Cheatsheet',
    description: 'Distributed caching architectures, rate limiting token buckets, database partitioning, and idempotency keys.',
    fileType: 'html',
    mimeType: 'text/html',
    fileData: Buffer.from(note3Html).toString('base64'),
    fileSize: Buffer.byteLength(note3Html),
    viewOnly: true,
    drmLevel: 'DRM_ENFORCED',
    uploadedAt: '2026-11-28T10:00:00.000Z'
  },
  {
    materialId: 'mat_interview_qa_compendium',
    title: 'Unicorn Engineering & Operations Interview Q&A Compendium',
    description: 'Curated behavioral leadership, production incident response, and root-cause analysis solutions for top unicorn rounds.',
    fileType: 'html',
    mimeType: 'text/html',
    fileData: Buffer.from(note4Html).toString('base64'),
    fileSize: Buffer.byteLength(note4Html),
    viewOnly: true,
    drmLevel: 'DRM_ENFORCED',
    uploadedAt: '2026-11-28T10:00:00.000Z'
  }
];

// Update masterclass
mc.timingSlots = cleanSlots;
mc.notesAndPdfs = cleanNotes;
mc.sessionDate = 'Sunday, 29 Nov 2026, 11:00 AM IST';
mc.targetCountdown = '2026-11-29T05:30:00.000Z';
mc.updatedAt = new Date().toISOString();

fs.writeFileSync(coursesFilePath, JSON.stringify(courses, null, 2), 'utf8');
console.log('Successfully cleaned masterclass in courses.json:');
console.log(`- Timing Slots count: ${cleanSlots.length}`);
console.log(`- Study Materials count: ${cleanNotes.length}`);
console.log(`- Target Countdown: ${mc.targetCountdown}`);
