const PracticeSheet = require('../models/PracticeSheet');

const DEFAULT_SHEETS = [
  {
    sheetId: 'non-tech-ops-zomato-blinkit',
    title: 'Quick Commerce & Dark Store Operations Lead (Zomato, Blinkit, Swiggy)',
    roleType: 'non-tech',
    targetRole: 'Store Operations Associate / Dark Store Lead / Logistics Executive',
    targetCompanies: ['Zomato', 'Blinkit', 'Hyperpure', 'Swiggy', 'District'],
    description: 'Comprehensive interview & operational problem-solving curriculum for quick-commerce dark stores: 10-minute SLA order fulfillment, picker dispatch, rider batching, and inventory shrinkage control.',
    price: 0.0, // ₹0.00 Free Enrollment
    isFree: true,
    isTemplate: false,
    topics: [
      {
        topicId: 'ops-1',
        topicTitle: 'Dark Store Fulfillment & 10-Minute SLA Metrics',
        summary: 'Master the core fulfillment engine of Blinkit and Swiggy Instamart.',
        problems: [
          {
            id: 'nt-1-1',
            title: 'Picker Route Optimization during 8 PM Grocery Surge',
            company: 'Blinkit',
            difficulty: 'Medium',
            type: 'Operational Math',
            scenario: 'During the 8:00 PM peak, your dark store receives 140 orders/hour with only 6 pickers. Average picking time is 180 seconds per order. Calculate the backlog buildup rate and structure an emergency order-batching workflow to keep customer dispatch SLA below 6 minutes.',
            solutionGuidance: 'Apply 2-tier batching: Group orders sharing cold-storage aisles. Reassign 2 packing staff to pre-bag high-frequency SKUs (milk, bread, eggs). This reduces average picking cycle from 180s to 110s, clearing 32 additional orders/hour.',
            keyTakeaway: 'In quick commerce interviews, always prioritize aisle cluster batching over simple FIFO queue processing.',
            acceptanceRate: '92%',
          },
          {
            id: 'nt-1-2',
            title: 'Rider Idle Time vs Customer Delivery Time Optimization',
            company: 'Zomato',
            difficulty: 'Easy',
            type: 'Partner Logistics',
            scenario: 'In an urban sector, 18 delivery partners are waiting outside a partner restaurant hub with an average wait time of 14 minutes. How would you calibrate delivery radius and restaurant preparation triggers to bring rider idle wait times under 5 minutes without causing cold food deliveries?',
            solutionGuidance: 'Shift from static dispatch (calling rider on order acceptance) to dynamic kitchen hand-off triggers (dispatching rider when kitchen marks "Ready in 4 mins"). Reallocate waiting riders to nearby fast-food nodes.',
            keyTakeaway: 'Demonstrates deep understanding of Kitchen Prep Time (KPT) calibration.',
            acceptanceRate: '89%',
          },
          {
            id: 'nt-1-3',
            title: 'Perishable Produce Shrinkage & Daily Expiry Mitigation',
            company: 'Hyperpure',
            difficulty: 'Hard',
            type: 'Inventory Management',
            scenario: 'Hyperpure b2b supply reports a 4.8% waste shrink on fresh green vegetables delivered to restaurant partners. Design a 3-tier inspection and discount-bundling protocol for day+1 stock that reduces net inventory loss below 1.5%.',
            solutionGuidance: 'Institute dynamic price reductions for early-morning bulk kitchen buyers, introduce vacuum-sealed grading at harvest drop-off, and channel residual grade-B items to high-consumption cloud kitchen clients.',
            keyTakeaway: 'Crucial for Hyperpure and Blinkit supply chain executive roles.',
            acceptanceRate: '78%',
          },
        ],
      },
      {
        topicId: 'ops-2',
        topicTitle: 'Customer Escalations, District Events & Partner Quality Assurance',
        summary: 'Handling merchant disputes, live event tickets (District by Zomato), and rider SLAs.',
        problems: [
          {
            id: 'nt-2-1',
            title: 'Monsoon Spike & Surge Delivery Radius Throttling',
            company: 'Zomato',
            difficulty: 'Medium',
            type: 'Emergency Protocol',
            scenario: 'Heavy downpour causes 40% of active riders to go offline while incoming food orders surge by 85%. Formulate an automated dispatch throttling criteria to prevent extreme 90-minute delivery delays and brand backlash.',
            solutionGuidance: 'Activate monsoon geofencing: Shrink customer delivery radius from 7km to 2.8km around cluster kitchens. Pause acceptances for low-margin single item carts. Introduce high-priority wet weather rider incentive bonuses.',
            keyTakeaway: 'Direct interview question for Zomato City Operations Associates.',
            acceptanceRate: '94%',
          },
          {
            id: 'nt-2-2',
            title: 'Live Event Ticketing & Crowd Turnstile Flow Control',
            company: 'District (Zomato)',
            difficulty: 'Medium',
            type: 'Event Operations',
            scenario: 'District is managing a 12,000 attendee concert in Bengaluru. Turnstiles at Gate 2 experience a scanner network lag of 12 seconds per barcode. How do you prevent crowd stampede risks and maintain verified admissions?',
            solutionGuidance: 'Switch entry scanners to offline cryptographic cached token verification. Deploy 4 manual paper backup wristband lanes for attendees with valid booking SMS/QR receipts.',
            keyTakeaway: 'Highlights rapid crisis mitigation in experiential event operations.',
            acceptanceRate: '86%',
          },
        ],
      },
    ],
  },
  {
    sheetId: 'non-tech-logistics-porter-amazon',
    title: 'Intracity Fleet Dispatch, Freight & Logistics Operations (Porter, Amazon)',
    roleType: 'non-tech',
    targetRole: 'Fleet Operations Lead / Last-Mile Hub Coordinator / Dispatch Specialist',
    targetCompanies: ['Porter', 'Amazon Delivery', 'Flipkart Logistics', 'Delhivery'],
    description: 'Practical scenarios on intracity freight dispatch, 3-wheeler/Tata Ace fleet turnaround, driver retention, delivery dispute arbitration, and Amazon last-mile hub economics.',
    price: 0.0, // ₹0.00 Free Enrollment
    isFree: true,
    isTemplate: false,
    topics: [
      {
        topicId: 'fleet-1',
        topicTitle: 'Intracity Commercial Truck Fleet & Driver SLA (Porter)',
        summary: 'Managing Tata Ace, 3-wheelers, and commercial vehicle driver partners.',
        problems: [
          {
            id: 'nt-3-1',
            title: 'Driver Cancellation Arbitration for Bulky Commercial Cargo',
            company: 'Porter',
            difficulty: 'Medium',
            type: 'Partner Management',
            scenario: 'A micro-business books a Tata Ace for 400kg machinery. The driver arrives, claims the cargo exceeds vehicle tailgate height, and demands an extra cash fee of ₹400 off the app. How do you resolve this dispute while retaining both customer and driver partner?',
            solutionGuidance: 'Review photo upload from driver app. If overweight, bill standard volumetric weight adjustment through the official app invoice to protect cargo insurance, giving driver standard incentive while avoiding unauthorized cash bribes.',
            keyTakeaway: 'Focuses on fair partner policies and policy adherence in logistics.',
            acceptanceRate: '91%',
          },
          {
            id: 'nt-3-2',
            title: 'Unloading Wait Time Compensation & Idle Fleet Repositioning',
            company: 'Porter',
            difficulty: 'Easy',
            type: 'Fleet Utilization',
            scenario: 'A fleet of 25 mini-trucks in an industrial warehouse district faces an average 75-minute customer unloading wait. Structure an automated waiting fee structure that incentivizes swift warehouse turnaround.',
            solutionGuidance: 'Provide first 25 mins free; apply per-minute tiered waiting charges automatically added to digital trip receipt. Re-dispatch awaiting vehicles to adjacent industrial estates.',
            keyTakeaway: 'Core metric for Porter City Team Operations.',
            acceptanceRate: '95%',
          },
        ],
      },
      {
        topicId: 'fleet-2',
        topicTitle: 'Last-Mile Fulfillment & High-Value RTO Prevention (Amazon & Flipkart)',
        summary: 'Hub sortation, First Attempt Delivery Rate (FADR), and return fraud control.',
        problems: [
          {
            id: 'nt-4-1',
            title: 'Maximizing First-Attempt Delivery Rate (FADR) during Big Billion Days',
            company: 'Flipkart',
            difficulty: 'Medium',
            type: 'Hub Operations',
            scenario: 'During festive sale peaks, delivery associates report a 16% fake "Customer Unavailable" non-delivery rate to avoid late shifts. Detail a geo-tagged OTP verification mechanism to audit driver hub compliance.',
            solutionGuidance: 'Enforce mandatory geo-fencing: Delivery associate must be within 50 meters of customer pin coordinate before triggering "Undelivered" status. Trigger instant automated IVR call to customer.',
            keyTakeaway: 'Standard Amazon & Flipkart logistics operational audit check.',
            acceptanceRate: '87%',
          },
        ],
      },
    ],
  },
  {
    sheetId: 'non-tech-category-management-flipkart',
    title: 'E-Commerce Category Growth, Margin Negotiation & Brand Alliances (Flipkart, Amazon)',
    roleType: 'non-tech',
    targetRole: 'Category Associate / Vendor Manager / Key Account Executive',
    targetCompanies: ['Flipkart', 'Amazon India', 'Swiggy Mini', 'Blinkit'],
    description: 'Real-world business cases on Gross Merchandise Value (GMV) expansion, brand margin negotiations, competitor price matching, stock cover days, and return-on-ad-spend (ROAS) analysis.',
    price: 49.0, // Premium Practice Track
    isFree: false,
    isTemplate: false,
    topics: [
      {
        topicId: 'cat-1',
        topicTitle: 'Category GMV Expansion & Brand Margin Negotiations',
        summary: 'Commercial contracts, take-rates, and vendor SLA management.',
        problems: [
          {
            id: 'nt-5-1',
            title: 'Negotiating Exclusive Product Launch Terms with FMCG Brands',
            company: 'Blinkit',
            difficulty: 'Hard',
            type: 'Vendor Negotiation',
            scenario: 'An artisan beverage brand wants prominent hero banner placement on Blinkit for their new cold-brew coffee. They offer a 16% margin against your category standard of 24%. Formulate a performance-linked margin step-up contract.',
            solutionGuidance: 'Offer 18% base margin for week 1 with mandatory co-funded sampling coupons. If daily orders exceed 250 units, margin steps up to 22%. Include penalty SLA for stockout hours.',
            keyTakeaway: 'Essential for Category Manager and Brand Alliance interviews.',
            acceptanceRate: '82%',
          },
        ],
      },
    ],
  },
  {
    sheetId: 'tech-dsa-striver-template',
    title: 'Striver Technical SDE Preparation Master Sheet (Template)',
    roleType: 'tech',
    targetRole: 'Software Development Engineer (SDE-1 / SDE-2)',
    targetCompanies: ['Amazon', 'Flipkart', 'Zomato', 'Coforge', 'Cognizant', 'TCS'],
    description: 'Preserved technical curriculum template covering Arrays, Two Pointers, Dynamic Programming, and Graph Traversals for technical background candidates.',
    price: 0.0,
    isFree: true,
    isTemplate: true, // Marked as template for future use
    topics: [
      {
        topicId: 'tech-1',
        topicTitle: 'Arrays & Two Pointers (Core SDE Template)',
        summary: 'Classic algorithms foundation preserved for technical tracks.',
        problems: [
          {
            id: 'tech-1-1',
            title: 'Set Matrix Zeroes In-Place',
            company: 'Amazon',
            difficulty: 'Medium',
            type: 'Technical Problem',
            scenario: 'Given an m x n integer matrix, if an element is 0, set its entire row and column to 0. Do it in-place using O(1) extra space.',
            solutionGuidance: 'Use first row and column as flag indicators, maintaining a separate variable for col0 state.',
            keyTakeaway: 'Standard SDE interview question.',
            acceptanceRate: '54%',
          },
          {
            id: 'tech-1-2',
            title: 'Pascal Triangle Row Generation',
            company: 'Flipkart',
            difficulty: 'Easy',
            type: 'Technical Problem',
            scenario: 'Generate the Nth row of Pascals Triangle in O(N) time without calculating previous rows.',
            solutionGuidance: 'Calculate each element using the combination relation: element = element * (row - col) / col.',
            keyTakeaway: 'Combinatorics in programming.',
            acceptanceRate: '68%',
          },
        ],
      },
    ],
  },
];

async function seedPracticeSheetsIfEmpty() {
  try {
    const count = await PracticeSheet.countDocuments();
    if (count === 0) {
      await PracticeSheet.insertMany(DEFAULT_SHEETS);
      console.log('[Practice Sheets] Initialized default Non-Tech and Tech practice tracks.');
    }
  } catch (err) {
    console.warn('[Practice Sheets] Seeding check warning:', err.message);
  }
}

module.exports = { seedPracticeSheetsIfEmpty, DEFAULT_SHEETS };
