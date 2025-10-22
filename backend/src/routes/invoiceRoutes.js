const express = require('express');
const {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePdf,
  getInvoicesByResident,
  getMonthlyFinanceStats, // ✅ Thêm mới
  getYearlyFinanceStats   // ✅ Thêm mới
} = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// =========================
// 🧾 CÁC ROUTE THỐNG KÊ THU - CHI
// =========================

// 📊 Thống kê tổng thu - chi theo tháng (chỉ Admin)
router.get('/stats/monthly', protect, authorize('admin'), getMonthlyFinanceStats);

// 📆 Thống kê tổng thu - chi theo năm (chỉ Admin)
router.get('/stats/yearly', protect, authorize('admin'), getYearlyFinanceStats);

// =========================
// 🧍 ROUTE CƯ DÂN / HÓA ĐƠN
// =========================

// ✅ Lấy hóa đơn theo cư dân (Resident hoặc Admin)
router.get('/resident/:id', protect, authorize('admin', 'resident'), getInvoicesByResident);

// ✅ CRUD Hóa đơn
router.route('/')
  .get(protect, authorize('admin', 'resident'), getInvoices)
  .post(protect, authorize('admin'), createInvoice);

router.route('/:id')
  .get(protect, authorize('admin', 'resident'), getInvoiceById)
  .put(protect, authorize('admin', 'resident'), updateInvoice)
  .delete(protect, authorize('admin'), deleteInvoice);

// ✅ Xuất PDF (Admin + Resident)
router.get('/:id/pdf', protect, authorize('admin', 'resident'), generateInvoicePdf);

module.exports = router;
