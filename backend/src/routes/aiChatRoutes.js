const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Invoice = require("../models/Invoice");
const Report = require("../models/Report");
const Resident = require("../models/Resident");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Thiếu nội dung câu hỏi!" });

    const [invoices, reports, residents] = await Promise.all([
      Invoice.find().populate("apartment resident").limit(5),
      Report.find().populate("apartment resident").limit(5),
      Resident.find().limit(5),
    ]);

    const context = `
      🏢 Chung cư mini - dữ liệu gần nhất:
      🧾 Hóa đơn: ${invoices
        .map(
          (i) =>
            `Phòng ${i.apartment?.code || "?"}, tháng ${i.month}/${i.year}, tổng ${i.totalAmount}₫, trạng thái: ${i.status}`
        )
        .join("\n")}
      🚨 Báo cáo: ${reports
        .map((r) => `Báo cáo "${r.title}" (${r.status}) - Phòng ${r.apartment?.code || "?"}`)
        .join("\n")}
      👥 Cư dân: ${residents.map((r) => r.fullName).join(", ")}
    `;

    // 🧠 Sử dụng model Gemini-Pro
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
      Bạn là trợ lý ảo của hệ thống quản lý chung cư mini.
      Trả lời ngắn gọn, chính xác và bằng tiếng Việt.
      Dữ liệu hiện tại:
      ${context}

      Câu hỏi của người dùng:
      ${message}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("❌ Lỗi Gemini chatbot:", error);
    res.status(500).json({ message: "Không thể xử lý câu hỏi AI." });
  }
});

module.exports = router;
