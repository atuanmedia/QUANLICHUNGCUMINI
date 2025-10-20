const express = require("express");
const ChatMessage = require("../models/ChatMessage");
const router = express.Router();

// 📜 Lấy lịch sử chat của 1 cư dân
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await ChatMessage.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("❌ Lỗi tải lịch sử chat:", err.message);
    res.status(500).json({ message: "Lỗi khi tải lịch sử chat" });
  }
});

module.exports = router;
