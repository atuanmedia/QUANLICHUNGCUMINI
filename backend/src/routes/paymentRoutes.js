// backend/src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { generateDemoQR } = require("../controllers/paymentController");

// 🟢 Route tạo QR demo
router.get("/qr-demo/:id", protect, generateDemoQR);

module.exports = router;
