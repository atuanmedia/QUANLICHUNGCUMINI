const express = require("express");
const router = express.Router();
const {
  getAllRecords,
  createRecord,
  exportPDF,
  deleteRecord,
} = require("../controllers/tempResidenceController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Kiểm tra API
router.get("/test", (req, res) => res.send("TempResidence API connected!"));

// CRUD
router.route("/")
  .get(protect, authorize("admin"), getAllRecords)
  .post(protect, createRecord);

router.get("/:id/export", protect, authorize("admin"), exportPDF);
router.delete("/:id", protect, authorize("admin"), deleteRecord); // ✅ thêm dòng này

module.exports = router;
