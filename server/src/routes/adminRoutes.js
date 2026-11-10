const router = require('express').Router();
const {
  adminLogin,
  getDashboardStats,
  getOrders,
  getUsers,
  grantAccess,
  revokeAccess,
  updateUserRole,
  deleteUser,
  getRefunds,
  processRefund,
  getActivityLogs,
  getAdminCourses,
  getAdminMasterclasses,
  updateCoursePrice,
  createOrUpdateCourse,
  deleteCourse,
  updateMasterclassSession,
  addOrUpdateTimingSlot,
  deleteTimingSlot,
  uploadStudyMaterial,
  deleteStudyMaterial,
  resetUserPassword,
  getAdminPracticeSheets,
  updatePracticeSheetPrice,
  createOrUpdatePracticeSheet,
  deletePracticeSheet,
  addOrUpdateSheetTopic,
  deleteSheetTopic,
  addOrUpdateSheetProblem,
  deleteSheetProblem,
} = require('../controllers/adminController');
const {
  getTransactionAnalytics,
  getOrderTransactionDetails,
  getAdminTickets,
  updateAdminTicket,
} = require('../controllers/ticketController');
const {
  adminUploadNote,
  adminUpdateNote,
  adminDeleteNote,
} = require('../controllers/noteController');
const { verifyFirebaseToken, verifyAdmin } = require('../middlewares/authMiddleware');

// Public Admin Authentication Endpoint
router.post('/login', adminLogin);

// Protected Admin Management Endpoints
router.get('/metrics', verifyFirebaseToken, verifyAdmin, getDashboardStats);
router.get(['/telemetry', '/admin/telemetry'], verifyFirebaseToken, verifyAdmin, getDashboardStats);
router.get('/analytics/transactions', verifyFirebaseToken, verifyAdmin, getTransactionAnalytics);
router.get('/orders/:orderId/details', verifyFirebaseToken, verifyAdmin, getOrderTransactionDetails);

// Support & PG Dispute Tickets
router.get('/tickets', verifyFirebaseToken, verifyAdmin, getAdminTickets);
router.patch('/tickets/:id', verifyFirebaseToken, verifyAdmin, updateAdminTicket);

// Specifically Get Only Masterclasses (Distinguished from Courses in Schema)
router.get('/masterclasses', verifyFirebaseToken, verifyAdmin, getAdminMasterclasses);
router.delete('/masterclasses/:id', verifyFirebaseToken, verifyAdmin, deleteCourse);
router.put('/masterclasses/:id/session', verifyFirebaseToken, verifyAdmin, updateMasterclassSession);
router.post('/masterclasses/:id/timing-slots', verifyFirebaseToken, verifyAdmin, addOrUpdateTimingSlot);
router.delete('/masterclasses/:id/timing-slots/:slotId', verifyFirebaseToken, verifyAdmin, deleteTimingSlot);
router.post('/masterclasses/:id/slots', verifyFirebaseToken, verifyAdmin, addOrUpdateTimingSlot);
router.delete('/masterclasses/:id/slots/:slotId', verifyFirebaseToken, verifyAdmin, deleteTimingSlot);
router.post('/masterclasses/:id/materials', verifyFirebaseToken, verifyAdmin, uploadStudyMaterial);
router.delete('/masterclasses/:id/materials/:materialId', verifyFirebaseToken, verifyAdmin, deleteStudyMaterial);

// Courses / Masterclass Management
router.get('/courses', verifyFirebaseToken, verifyAdmin, getAdminCourses);
router.post('/courses', verifyFirebaseToken, verifyAdmin, createOrUpdateCourse);
router.put('/courses/:id/price', verifyFirebaseToken, verifyAdmin, updateCoursePrice);
router.delete('/courses/:id', verifyFirebaseToken, verifyAdmin, deleteCourse);
router.put('/courses/:id/session', verifyFirebaseToken, verifyAdmin, updateMasterclassSession);
router.post('/courses/:id/timing-slots', verifyFirebaseToken, verifyAdmin, addOrUpdateTimingSlot);
router.delete('/courses/:id/timing-slots/:slotId', verifyFirebaseToken, verifyAdmin, deleteTimingSlot);
router.post('/courses/:id/slots', verifyFirebaseToken, verifyAdmin, addOrUpdateTimingSlot);
router.delete('/courses/:id/slots/:slotId', verifyFirebaseToken, verifyAdmin, deleteTimingSlot);
router.post('/courses/:id/materials', verifyFirebaseToken, verifyAdmin, uploadStudyMaterial);
router.delete('/courses/:id/materials/:materialId', verifyFirebaseToken, verifyAdmin, deleteStudyMaterial);
router.delete('/materials/:materialId', verifyFirebaseToken, verifyAdmin, deleteStudyMaterial);

router.get('/orders', verifyFirebaseToken, verifyAdmin, getOrders);
router.get('/users', verifyFirebaseToken, verifyAdmin, getUsers);
router.post('/users/grant-access', verifyFirebaseToken, verifyAdmin, grantAccess);
router.post('/users/revoke-access', verifyFirebaseToken, verifyAdmin, revokeAccess);
router.post('/users/set-role', verifyFirebaseToken, verifyAdmin, updateUserRole);
router.post('/users/reset-password', verifyFirebaseToken, verifyAdmin, resetUserPassword);
router.delete('/users/:id', verifyFirebaseToken, verifyAdmin, deleteUser);

// Practice Sheet Curriculum & Pricing Management Endpoints
router.get('/practice/sheets', verifyFirebaseToken, verifyAdmin, getAdminPracticeSheets);
router.post('/practice/sheets', verifyFirebaseToken, verifyAdmin, createOrUpdatePracticeSheet);
router.put('/practice/sheets/:sheetId/price', verifyFirebaseToken, verifyAdmin, updatePracticeSheetPrice);
router.delete('/practice/sheets/:sheetId', verifyFirebaseToken, verifyAdmin, deletePracticeSheet);

// Practice Sheet Curriculum Topics & Problems
router.post('/practice/sheets/:sheetId/topics', verifyFirebaseToken, verifyAdmin, addOrUpdateSheetTopic);
router.delete('/practice/sheets/:sheetId/topics/:topicId', verifyFirebaseToken, verifyAdmin, deleteSheetTopic);
router.post('/practice/sheets/:sheetId/topics/:topicId/problems', verifyFirebaseToken, verifyAdmin, addOrUpdateSheetProblem);
router.delete('/practice/sheets/:sheetId/topics/:topicId/problems/:problemId', verifyFirebaseToken, verifyAdmin, deleteSheetProblem);

// Downloadable Notes Management (PDF & HTML up to 10MB in MongoDB, Free & Paid, Secret Passcode)
router.post('/notes', verifyFirebaseToken, verifyAdmin, adminUploadNote);
router.put('/notes/:noteId', verifyFirebaseToken, verifyAdmin, adminUpdateNote);
router.delete('/notes/:noteId', verifyFirebaseToken, verifyAdmin, adminDeleteNote);

router.get('/refunds', verifyFirebaseToken, verifyAdmin, getRefunds);
router.post('/refunds', verifyFirebaseToken, verifyAdmin, processRefund);
router.get(['/logs', '/admin/logs', '/activity-logs'], verifyFirebaseToken, verifyAdmin, getActivityLogs);

module.exports = router;
