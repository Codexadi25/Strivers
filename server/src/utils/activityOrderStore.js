const mongoose = require('mongoose');
const { loadJsonFile, saveJsonFile } = require('./jsonStore');

const ORDERS_FILE = 'payments.json';
const TICKETS_FILE = 'tickets.json';
const REFUNDS_FILE = 'refunds.json';
const LOGS_FILE = 'audit_logs.json';

const SEED_ORDERS = [
  {
    orderId: 'order_TyAgCeDPvmTPOX',
    txnId: 'pay_TyAgCeDPvmTPOX_1',
    refId: 'rcpt_al_dev_1794247929950',
    date: '9/11/2026, 11:42:10 pm',
    createdAt: '2026-11-09T23:42:10.000Z',
    customerEmail: 'admin@yourdomain.com',
    customerName: 'Admin Operator',
    customerPhone: '+91 9000000001',
    userId: 'usr_admin_001',
    planId: 'CHANNEL',
    courseTitle: 'Paid Job Channel',
    amount: 174,
    currency: 'INR',
    paidVia: 'UPI',
    status: 'PAYMENT CANCELED',
    remark: 'User Canceled Midway at Gateway',
  },
  {
    orderId: 'order_TyAg2Ra7PZJtZv',
    txnId: 'pay_TyAg2Ra7PZJtZv_1',
    refId: 'rcpt_al_dev_1794247920408',
    date: '9/11/2026, 11:42:00 pm',
    createdAt: '2026-11-09T23:42:00.000Z',
    customerEmail: 'admin@yourdomain.com',
    customerName: 'Admin Operator',
    customerPhone: '+91 9000000001',
    userId: 'usr_admin_001',
    planId: 'MASTERCLASS',
    courseTitle: 'Strivers Placement Masterclass',
    amount: 74,
    currency: 'INR',
    paidVia: 'CARD',
    status: 'PAYMENT CANCELED',
    remark: 'User Canceled Midway at Gateway',
  },
  {
    orderId: 'order_TyAg7891238910',
    txnId: 'pay_TyAg7891238910_1',
    refId: 'rcpt_al_dev_1794247812999',
    date: '9/11/2026, 10:15:30 pm',
    createdAt: '2026-11-09T22:15:30.000Z',
    customerEmail: 'kamaldeep@gmail.com',
    customerName: 'Kamaldeep',
    customerPhone: '+91 9876545543',
    userId: '#312795448',
    planId: 'MASTERCLASS',
    courseTitle: 'Strivers Masterclass',
    amount: 111,
    currency: 'INR',
    paidVia: 'UPI',
    status: 'CAPTURED',
    remark: 'Payment Captured Successfully via UPI',
  },
  {
    orderId: 'order_Kml2837192011',
    txnId: 'pay_Kml2837192011_1',
    refId: 'rcpt_al_dev_1794246100111',
    date: '8/11/2026, 04:12:00 pm',
    createdAt: '2026-11-08T16:12:00.000Z',
    customerEmail: 'kamaldeep@gmail.com',
    customerName: 'Kamaldeep',
    customerPhone: '+91 9876545543',
    userId: '#312795448',
    planId: 'CHANNEL',
    courseTitle: 'Paid Job Channel',
    amount: 174,
    currency: 'INR',
    paidVia: 'CREDIT',
    status: 'CAPTURED',
    remark: 'Payment Captured Successfully via Credit Card',
  },
  {
    orderId: 'order_Kml2837192012',
    txnId: 'pay_Kml2837192012_1',
    refId: 'rcpt_al_dev_1794245000222',
    date: '2/11/2026, 11:05:00 am',
    createdAt: '2026-11-02T11:05:00.000Z',
    customerEmail: 'kamaldeep@gmail.com',
    customerName: 'Kamaldeep',
    customerPhone: '+91 9876545543',
    userId: '#312795448',
    planId: 'COURSE_FULLSTACK',
    courseTitle: 'Full-Stack Software Engineering',
    amount: 499,
    currency: 'INR',
    paidVia: 'NETBANKING',
    status: 'CAPTURED',
    remark: 'Payment Captured Successfully via NetBanking',
  },
  {
    orderId: 'order_Kml2837192013',
    txnId: 'pay_Kml2837192013_1',
    refId: 'rcpt_al_dev_1794244000333',
    date: '1/11/2026, 09:40:00 pm',
    createdAt: '2026-11-01T21:40:00.000Z',
    customerEmail: 'kamaldeep@gmail.com',
    customerName: 'Kamaldeep',
    customerPhone: '+91 9876545543',
    userId: '#312795448',
    planId: 'MASTERCLASS',
    courseTitle: 'Strivers Placement Masterclass',
    amount: 21,
    currency: 'INR',
    paidVia: 'UPI',
    status: 'PAYMENT CANCELED',
    remark: 'User Canceled Midway at Gateway',
  },
  {
    orderId: 'order_TyAg9918239011',
    txnId: 'pay_TyAg9918239011_1',
    refId: 'rcpt_al_dev_1794247710200',
    date: '9/11/2026, 08:30:15 pm',
    createdAt: '2026-11-09T20:30:15.000Z',
    customerEmail: 'artisahu6880@gmail.com',
    customerName: 'Aditya Sahu',
    customerPhone: '+91 9876545543',
    userId: 'admin_root',
    planId: 'COURSE_FULLSTACK',
    courseTitle: 'Full-Stack Software Engineering',
    amount: 499,
    currency: 'INR',
    paidVia: 'NETBANKING',
    status: 'CAPTURED',
    remark: 'Payment Captured Successfully via NetBanking',
  },
];

const SEED_TICKETS = [
  {
    ticketId: 'tkt_8431432921',
    createdAt: '2026-11-09T18:42:00.000Z',
    studentContact: 'kamaldeep@gmail.com (+91 9876545543)',
    userEmail: 'kamaldeep@gmail.com',
    customerName: 'Kamaldeep',
    orderId: 'order_TyAg2Ra7PZJtZv',
    bankRrn: 'UTR_BANK_9918237190',
    amount: 74,
    issueCategory: 'amount_debited_payment_failed',
    status: 'under_investigation',
    slaDeadline: 'Nov 16, 2026 (7 Business Days)',
    action: 'Verify Bank Reversal',
  },
  {
    ticketId: 'tkt_8431432922',
    createdAt: '2026-11-09T16:20:00.000Z',
    studentContact: 'student@example.com (+91 9123456789)',
    userEmail: 'student@example.com',
    customerName: 'Rohan Sharma',
    orderId: 'order_TyAg9918239011',
    bankRrn: 'UTR_BANK_7718290111',
    amount: 111,
    issueCategory: 'website_risk_check_blocked',
    status: 'resolved',
    slaDeadline: 'Nov 14, 2026',
    action: 'Access Granted Manually',
  },
];

const SEED_REFUNDS = [
  {
    refundId: 'rfnd_8431432921_01',
    orderId: 'order_TyAg2Ra7PZJtZv',
    paymentId: 'pay_TyAg2Ra7PZJtZv_1',
    customerEmail: 'kamaldeep@gmail.com',
    amount: 74,
    status: 'PROCESSED',
    arn: 'ARN_BANK_8819230111',
    date: 'Nov 09, 2026',
    mode: 'Razorpay Auto Reversal',
  },
];

const SEED_LOGS = [
  {
    event: 'SECURE_DOCUMENT_VIEW',
    action: 'SECURE_DOCUMENT_VIEW',
    userEmail: 'admin@yourdomain.com',
    ip: '::1',
    ipAddress: '::1',
    time: '9/11/2026, 11:48:35 pm',
    createdAt: '2026-11-09T23:48:35.000Z',
    metadata: { courseId: 'masterclass', materialId: 'mat_ats_blueprint', type: 'DRM_CANVAS' },
    metaData: { courseId: 'masterclass', materialId: 'mat_ats_blueprint', type: 'DRM_CANVAS' },
    tag: 'DOC',
  },
  {
    event: 'PAYMENT_INIT',
    action: 'PAYMENT_INIT',
    userEmail: 'admin@yourdomain.com',
    ip: '::1',
    ipAddress: '::1',
    time: '9/11/2026, 11:42:10 pm',
    createdAt: '2026-11-09T23:42:10.000Z',
    metadata: { orderId: 'order_TyAgCeDPvmTPOX', amount: 174, currency: 'INR' },
    metaData: { orderId: 'order_TyAgCeDPvmTPOX', amount: 174, currency: 'INR' },
    tag: 'TXN',
  },
  {
    event: 'PAYMENT_SUCCESS',
    action: 'PAYMENT_SUCCESS',
    userEmail: 'kamaldeep@gmail.com',
    ip: '::1',
    ipAddress: '::1',
    time: '9/11/2026, 10:15:30 pm',
    createdAt: '2026-11-09T22:15:30.000Z',
    metadata: { orderId: 'order_TyAg7891238910', amount: 111, currency: 'INR' },
    metaData: { orderId: 'order_TyAg7891238910', amount: 111, currency: 'INR' },
    tag: 'TXN',
  },
  {
    event: 'LOGIN',
    action: 'LOGIN',
    userEmail: 'creedracer111@gmail.com',
    ip: '::1',
    ipAddress: '::1',
    time: '9/11/2026, 8:00:43 pm',
    createdAt: '2026-11-09T20:00:43.000Z',
    metadata: { plan: 'masterclass', alreadyOwnsCourse: true },
    metaData: { plan: 'masterclass', alreadyOwnsCourse: true },
    tag: 'AUTH',
  },
];

let ordersCache = loadJsonFile(ORDERS_FILE, SEED_ORDERS);
let ticketsCache = loadJsonFile(TICKETS_FILE, SEED_TICKETS);
let refundsCache = loadJsonFile(REFUNDS_FILE, SEED_REFUNDS);
let logsCache = loadJsonFile(LOGS_FILE, SEED_LOGS);

const ActivityOrderStore = {
  getOrders(q = '') {
    let list = [...ordersCache];
    if (q) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (o) =>
          (o.orderId || '').toLowerCase().includes(term) ||
          (o.customerEmail || '').toLowerCase().includes(term) ||
          (o.txnId || '').toLowerCase().includes(term) ||
          (o.refId || '').toLowerCase().includes(term) ||
          (o.customerPhone || '').toLowerCase().includes(term) ||
          (o.userId || '').toLowerCase().includes(term)
      );
    }
    return list;
  },

  recordOrder(order) {
    const idx = ordersCache.findIndex((o) => o.orderId === order.orderId);
    if (idx !== -1) {
      ordersCache[idx] = { ...ordersCache[idx], ...order };
    } else {
      ordersCache.unshift(order);
    }
    saveJsonFile(ORDERS_FILE, ordersCache);
    return order;
  },

  computeRevenueStats() {
    const captured = ordersCache.filter((o) => String(o.status).toUpperCase() === 'CAPTURED');
    const totalRevenueNum = captured.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
    return {
      totalRevenueNum,
      totalRevenueFormatted: `₹${totalRevenueNum.toLocaleString('en-IN')}`,
      successfulTxns: captured.length,
    };
  },

  getTickets() {
    return [...ticketsCache];
  },

  addTicket(ticket) {
    ticketsCache.unshift(ticket);
    saveJsonFile(TICKETS_FILE, ticketsCache);
    return ticket;
  },

  updateTicketStatus(id, status) {
    const t = ticketsCache.find((x) => x.ticketId === id || x._id === id);
    if (t) {
      t.status = status || 'resolved';
      saveJsonFile(TICKETS_FILE, ticketsCache);
    }
    return t || null;
  },

  getRefunds() {
    return [...refundsCache];
  },

  addRefund(refund) {
    refundsCache.unshift(refund);
    saveJsonFile(REFUNDS_FILE, refundsCache);
    const matchingOrder = ordersCache.find((o) => o.orderId === refund.orderId);
    if (matchingOrder) {
      matchingOrder.status = 'REFUNDED';
      matchingOrder.remark = `Refunded ₹${refund.amount} (${refund.arn})`;
      saveJsonFile(ORDERS_FILE, ordersCache);
    }
    return refund;
  },

  getLogs({ q = '', action = 'all', page = 1, limit = 50 } = {}) {
    let list = [...logsCache];
    if (action && action !== 'all') {
      list = list.filter((l) => String(l.action || l.event).toUpperCase() === action.toUpperCase());
    }
    if (q) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        (l) =>
          (l.event || l.action || '').toLowerCase().includes(term) ||
          (l.userEmail || '').toLowerCase().includes(term) ||
          (l.ip || '').toLowerCase().includes(term)
      );
    }
    const p = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Number(limit) || 50);
    const total = list.length;
    const sliced = list.slice((p - 1) * lim, p * lim);
    return {
      logs: sliced,
      total,
      page: p,
      limit: lim,
      totalPages: Math.max(1, Math.ceil(total / lim)),
    };
  },

  addLog({ event, action, userEmail, ip = '::1', metadata = {}, tag = 'SYSTEM' }) {
    const ev = event || action || 'SYSTEM_EVENT';
    const now = new Date();
    const entry = {
      event: ev,
      action: ev,
      userEmail: userEmail || 'admin@yourdomain.com',
      ip,
      ipAddress: ip,
      time: now.toLocaleString('en-IN'),
      createdAt: now.toISOString(),
      metadata,
      metaData: metadata,
      tag,
    };
    logsCache.unshift(entry);
    if (logsCache.length > 500) logsCache = logsCache.slice(0, 500);
    saveJsonFile(LOGS_FILE, logsCache);

    if (mongoose.connection.readyState === 1) {
      try {
        const ActivityLog = require('../models/ActivityLog');
        ActivityLog.create({
          userId: userEmail || 'system',
          userEmail: entry.userEmail,
          action: ev,
          ipAddress: ip,
          metaData: metadata,
        }).catch(() => {});
      } catch (_) {}
    }

    return entry;
  },
};

module.exports = ActivityOrderStore;
