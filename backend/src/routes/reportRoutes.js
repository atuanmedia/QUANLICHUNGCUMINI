// backend/src/routes/reportRoutes.js
const express = require('express');
const {
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getStats,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/stats', protect, authorize('admin'), getStats);
router.route('/')
    .get(protect, authorize('admin', 'resident'), getReports)
    .post(protect, authorize('resident'), createReport); // Only residents can create reports

router.route('/:id')
    .get(protect, authorize('admin', 'resident'), getReportById)
    .put(protect, authorize('admin', 'resident'), updateReport) // Admin can change status, Resident can edit pending reports
    .delete(protect, authorize('admin'), deleteReport);


module.exports = router;