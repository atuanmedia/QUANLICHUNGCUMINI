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
const upload = require('../middleware/uploadMiddleware'); // ✅ Thêm dòng này

const router = express.Router();

// 📊 Admin xem thống kê
router.get('/stats', protect, authorize('admin'), getStats);

// 🧾 Quản lý phản ánh
router.route('/')
  .get(protect, authorize('admin', 'resident'), getReports)
  // ✅ Chỉ resident được tạo phản ánh, có thể upload ảnh
  .post(
    protect,
    authorize('resident'),
    upload.single('image'), // ✅ Multer xử lý file
    createReport
  );

router.route('/:id')
  .get(protect, authorize('admin', 'resident'), getReportById)
  .put(protect, authorize('admin', 'resident'), updateReport)
  .delete(protect, authorize('admin'), deleteReport);

module.exports = router;
