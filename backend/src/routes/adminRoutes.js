const express = require("express");
const router = express.Router();
const { getRecentActivities } = require("../controllers/activityController");
const { verifyToken, isAdmin } = require("../middleware/authMiddleware");

router.get("/activities/recent", verifyToken, isAdmin, getRecentActivities);

module.exports = router;
