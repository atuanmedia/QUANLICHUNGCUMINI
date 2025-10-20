// backend/src/routes/chatRoutes.js
const express = require("express");
const ChatMessage = require("../models/ChatMessage");
const router = express.Router();

// 📜 Lấy toàn bộ lịch sử chat (admin hoặc resident đều có thể xem)
router.get("/", async (req, res) => {
  try {
    const messages = await ChatMessage.find().sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("❌ Lỗi tải lịch sử chat:", err.message);
    res.status(500).json({ message: "Lỗi khi tải lịch sử chat" });
  }
});

module.exports = router;
