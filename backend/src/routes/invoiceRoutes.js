const express = require('express');
const {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoicePdf,
    getInvoicesByResident
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ Route cụ thể phải đặt trước
router.get('/resident/:id', protect, authorize('admin', 'resident'), getInvoicesByResident);

router.route('/')
    .get(protect, authorize('admin', 'resident'), getInvoices)
    .post(protect, authorize('admin'), createInvoice);

router.route('/:id')
    .get(protect, authorize('admin', 'resident'), getInvoiceById)
    .put(protect, authorize('admin', 'resident'), updateInvoice)
    .delete(protect, authorize('admin'), deleteInvoice);

router.get('/:id/pdf', protect, authorize('admin', 'resident'), generateInvoicePdf);

module.exports = router;
