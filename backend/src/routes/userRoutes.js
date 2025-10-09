// backend/src/routes/userRoutes.js
const express = require('express');
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAdminSummaryReports,
    getMonthlyInvoiceSummary,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');
const router = express.Router();

// User management (Admin only)
router.route('/')
    .get(protect, authorize('admin'), getUsers);

router.route('/:id')
    .get(protect, authorize('admin'), getUserById)
    .put(protect, authorize('admin'), updateUser)
    .delete(protect, authorize('admin'), deleteUser);

// Admin Reports
router.get('/reports/admin-summary', protect, authorize('admin'), getAdminSummaryReports);
router.get('/reports/monthly-invoice-summary', protect, authorize('admin'), getMonthlyInvoiceSummary);


module.exports = router;