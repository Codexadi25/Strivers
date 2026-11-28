const express = require('express');
const router = express.Router();
const integrationStore = require('../utils/integrationStore');
const { verifyAdityaServerAuth } = require('../middlewares/integrationAuth');
const ActivityOrderStore = require('../utils/activityOrderStore');
const CourseStore = require('../utils/courseStore');
const UserStore = require('../utils/userStore');

// =========================================================================
// A. SERVERCLIENT GUI CONFIGURATION ENDPOINTS (Only configured via GUI)
// =========================================================================

/**
 * GET /api/v2/integration/config
 * Retrieves integration status, API Key, masked Secret, and target URL.
 */
router.get('/config', (req, res) => {
  try {
    const config = integrationStore.getPublicConfig();
    res.json({
      success: true,
      config,
      message: 'Integration configuration retrieved successfully'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v2/integration/config
 * Updates the API Key, Secret Token, and Aditya Server URL via the GUI.
 */
router.post('/config', (req, res) => {
  try {
    const { apiKey, secretToken, adityaServerUrl } = req.body || {};
    if (!apiKey || !secretToken) {
      return res.status(400).json({
        success: false,
        error: 'Both API Key and Secret Token must be supplied via the GUI.'
      });
    }

    const updated = integrationStore.saveConfig({
      apiKey,
      secretToken,
      adityaServerUrl,
      configuredBy: req.body.configuredBy || 'Strivers serverClient GUI'
    });

    res.json({
      success: true,
      message: 'Integration credentials saved successfully from GUI.',
      config: updated
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/v2/integration/generate-keys
 * Auto-generates a pair of cryptographically strong API Key and Secret Token.
 */
router.post('/generate-keys', (req, res) => {
  try {
    const generated = integrationStore.generateRandomCredentials();
    res.json({
      success: true,
      ...generated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================================================================
// B. ADITYATECHNDEVOOPS SERVER-TO-SERVER INTEGRATION ENDPOINTS
// Protected by API Key and Secret Token handshake
// =========================================================================

/**
 * GET /api/v2/integration/test-handshake
 * Handshake test called by AdityaTechnDevoops Server.
 */
router.get('/test-handshake', verifyAdityaServerAuth, (req, res) => {
  res.json({
    success: true,
    platform: 'Strivers Educational Platform & LMS',
    service: 'Strivers Core Server',
    status: 'ONLINE',
    serverTime: new Date().toISOString(),
    handshake: 'AUTHENTICATED_OK',
    message: 'Handshake verified. Strivers server is ready to communicate with AdityaTechnDevoops OS.'
  });
});

/**
 * GET /api/v2/integration/data
 * Business data extraction endpoint called by AdityaTechnDevoops Server.
 * Exposes orders, revenue, users, courses, and tickets for centralized management.
 */
router.get('/data', verifyAdityaServerAuth, async (req, res) => {
  try {
    // 1. Fetch Orders & Revenue Stats
    const allOrders = ActivityOrderStore.getOrders();
    const revStats = ActivityOrderStore.computeRevenueStats();

    // 2. Compute Order Status Counts
    const captured = allOrders.filter((o) => String(o.status).toUpperCase() === 'CAPTURED');
    const canceled = allOrders.filter((o) => String(o.status).toUpperCase().includes('CANCEL'));
    const refunded = allOrders.filter((o) => String(o.status).toUpperCase() === 'REFUNDED');

    // 3. Courses & Catalog
    const courses = CourseStore.getCourses ? CourseStore.getCourses() : [];

    // 4. User Stats
    const allUsers = UserStore.getAll ? UserStore.getAll() : [];
    const activeUsers = allUsers.filter((u) => u.isActive !== false);

    // 5. Support Tickets & Disputes
    const tickets = ActivityOrderStore.getTickets();
    const openTickets = tickets.filter((t) => t.status !== 'resolved');

    res.json({
      success: true,
      platform: {
        name: 'Strivers Platform',
        version: '2.4.0',
        environment: process.env.NODE_ENV || 'development',
        serverPort: process.env.PORT || 8080,
        syncedAt: new Date().toISOString()
      },
      businessMetrics: {
        totalRevenue: revStats.totalRevenueNum || 0,
        currency: 'INR',
        formattedRevenue: revStats.totalRevenueFormatted || '₹0',
        totalOrders: allOrders.length,
        successfulOrders: captured.length,
        canceledOrders: canceled.length,
        refundedOrders: refunded.length,
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        publishedCourses: courses.length,
        totalTickets: tickets.length,
        openTickets: openTickets.length
      },
      recentOrders: allOrders.slice(0, 15).map((ord) => ({
        orderId: ord.orderId,
        customerName: ord.customerName || 'Student',
        customerEmail: ord.customerEmail,
        courseTitle: ord.courseTitle || 'Masterclass',
        amount: ord.amount,
        currency: ord.currency || 'INR',
        status: ord.status,
        paidVia: ord.paidVia || 'UPI',
        date: ord.createdAt || ord.date
      })),
      recentTickets: openTickets.slice(0, 5).map((t) => ({
        ticketId: t.ticketId,
        studentContact: t.studentContact,
        issueCategory: t.issueCategory,
        status: t.status,
        slaDeadline: t.slaDeadline
      }))
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Failed to aggregate Strivers business data: ' + err.message
    });
  }
});

/**
 * POST /api/v2/integration/heartbeat
 * Heartbeat receiver called by AdityaTechnDevoops Server.
 */
router.post('/heartbeat', verifyAdityaServerAuth, (req, res) => {
  res.json({
    success: true,
    acknowledgedAt: new Date().toISOString(),
    status: 'ACTIVE_COMMUNICATION'
  });
});

module.exports = router;
