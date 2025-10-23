const express = require("express");
const router = express.Router();
const OpenAI = require("openai");

const Invoice = require("../models/Invoice");
const Report = require("../models/Report");
const Resident = require("../models/Resident");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Bạn là trợ lý ảo của hệ thống quản lý chung cư mini, hãy trả lời ngắn gọn, chính xác và bằng tiếng Việt.",
        },
        {
          role: "user",
          content: `${context}\n\nCâu hỏi: ${message}`,
        },
      ],
    });

    res.json({ answer: completion.choices[0].message.content });
  } catch (error) {
    console.error("❌ Lỗi chatbot:", error);
    res.status(500).json({ message: "Không thể xử lý câu hỏi AI." });
  }
});

module.exports = router;
