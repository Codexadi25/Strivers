// Everything editable about the page lives here.
const getEnv = (key, fallback = '') => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[`REACT_APP_${key}`] !== undefined) return process.env[`REACT_APP_${key}`];
    if (process.env[`VITE_${key}`] !== undefined) return process.env[`VITE_${key}`];
    if (process.env[key] !== undefined) return process.env[key];
  }
  return fallback;
};

export const BRAND = {
  name: 'Strivers',
  siteUrl: (getEnv('SITE_URL') || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, ''),
  phone: getEnv('CONTACT_PHONE', ''),
  email: getEnv('CONTACT_EMAIL', ''),
};

// ---- Pricing (display only; the server is the source of truth) ----
export const PRICES = { early: 9, regular: 21, channel: 174 };
export const EARLY_BIRD_HOURS = 48;
export const LAUNCH_AT = getEnv('LAUNCH_AT') ? new Date(getEnv('LAUNCH_AT')).getTime() : null;
export const EARLY_BIRD_ENDS_AT = LAUNCH_AT ? LAUNCH_AT + EARLY_BIRD_HOURS * 3600e3 : null;

export const SESSION_TIME = getEnv('SESSION_TIME', '11:00 AM IST');

export function nextSessionLabel(now = new Date()) {
  let d;
  const sessionDate = getEnv('SESSION_DATE');
  if (sessionDate) {
    d = new Date(`${sessionDate}T00:00:00`);
  } else {
    d = new Date(now);
    d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); // upcoming Sunday
  }
  const date = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
  return `${date}, ${SESSION_TIME}`;
}

export const PLANS = {
  masterclass: {
    id: 'masterclass',
    title: 'Strivers Masterclass',
    blurb: 'Live online session, basics to advanced.',
    points: [
      'Live online session every Sunday',
      'Resume, portfolio, LinkedIn & Naukri',
      'Cold emails and data skills for placement',
    ],
  },
  channel: {
    id: 'channel',
    title: 'Paid Job Channel',
    blurb: 'Per upcoming job vacancy.',
    points: [
      'Interview meeting links shared in the channel',
      'Enrol per upcoming vacancy',
      'Prepare with the same mentors',
    ],
  },
};

// Receipt in the hero. "~" = approximate; edit freely.
export const RECEIPT_ITEMS = [
  ['Pizza', '~₹299'],
  ['Burger', '~₹149'],
  ['Cold coffee', '~₹120'],
  ['Kurkure packet', '~₹10'],
];

// Mentor companies
export const COMPANIES = ['Zomato', 'Blinkit', 'Porter', 'Hyperpure', 'Genpact', 'Coforge'];

export const TOPICS = [
  { title: 'A resume that gets shortlisted', points: ['ATS-friendly structure', 'Achievements with numbers', 'Versions for different roles'] },
  { title: 'A portfolio that proves it', points: ['Projects recruiters actually open', 'Case-study write-ups', 'Free hosting, live link'] },
  { title: 'LinkedIn & Naukri.com', points: ['Headline and About that get found', 'Naukri keywords and profile freshness', 'Being visible to recruiters'] },
  { title: 'Cold emails that get replies', points: ['Subject lines that get opened', 'A 5-line template', 'Follow-ups without nagging'] },
  { title: 'Data extraction & visualization', points: ['Pull and clean data', 'Charts and dashboards', 'Show them in interviews'] },
  { title: 'Placement and work from home', points: ['Where vacancies get posted', 'Interview prep with live meeting links', 'First steps to earn remotely'] },
];

export const PILLARS = [
  { title: 'Mentors from working teams', text: 'Learn from professionals who work in the companies you want to join, not from slides written years ago.' },
  { title: 'Basics to advanced', text: 'Start from zero. Each session builds one placement skill you can use the same week.' },
  { title: 'Practical, not theory', text: 'You leave with a finished resume, a live portfolio and a cold email you can send today.' },
];

export const REVIEWS = [];

// ---- Share ads (WhatsApp / Telegram / X / Facebook / Instagram caption) ----
export function adTemplates({ price, url, session, early }) {
  const ads = [
    {
      id: 'pizza',
      label: 'Pizza, burger, Kurkure',
      text: `🍕 Less than a pizza.\n🍔 Less than a burger.\n🥔 Less than a Kurkure packet.\n\nSecure your placement prep for ₹${price}.\nStrivers Masterclass: resume, portfolio, LinkedIn & Naukri, cold emails, data skills.\n\nLive: ${session}\n👉 ${url}`,
    },
    {
      id: 'hinglish',
      label: 'Hinglish',
      text: `Ek Kurkure ke packet se bhi kam mein apna career plan shuru karo! 🎯\n\nStrivers Masterclass sirf ₹${price} mein:\n✅ Strong resume\n✅ Portfolio\n✅ LinkedIn & Naukri\n✅ Cold email\n\nOnline session: ${session}\n👉 ${url}`,
    },
    {
      id: 'companies',
      label: 'Mentors',
      text: `Seekho unse jo Zomato, Blinkit, Porter, Hyperpure, Genpact aur Coforge jaisi teams mein kaam karte hain. 💼\n\nBasics se advanced tak, ₹${price} mein.\n${url}`,
    },
    {
      id: 'wfh',
      label: 'Work from home',
      text: `Ghar baithe seekho. Ghar baithe kamao. 🏠💻\n\nStrivers Masterclass: placement skills + remote-work guidance for ₹${price}.\n${session}\n${url}`,
    },
    {
      id: 'channel',
      label: 'Job channel ₹174',
      text: `Job vacancy aayi hai? Interview ka meeting link seedha channel mein. 🔗\n\nStrivers Paid Job Channel: ₹${PRICES.channel} per vacancy.\n${url}`,
    },
  ];
  if (early) {
    ads.unshift({
      id: 'early',
      label: 'Early-bird urgency',
      text: `⏰ Sirf pehle 2 din: ₹${PRICES.early}.\nPhir ₹${PRICES.regular}.\n\nStrivers Masterclass: placement prep, ${session}.\n👉 ${url}`,
    });
  }
  return ads;
}

export function shareLinks(text, url) {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  return {
    WhatsApp: `https://wa.me/?text=${t}`,
    Telegram: `https://t.me/share/url?url=${u}&text=${t}`,
    X: `https://twitter.com/intent/tweet?text=${t}`,
    Facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
  };
}
