const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Invoice = require("../models/Invoice");
const Report = require("../models/Report");
const Resident = require("../models/Resident");

// 🔑 Kiểm tra key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("🔑 GEMINI_API_KEY loaded:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");

// 🧠 Route chính
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) {
      return res.status(400).json({ message: "Thiếu nội dung câu hỏi!" });
    }

    // Lấy dữ liệu thực tế (giới hạn để tránh overload)
    const [invoices, reports, residents] = await Promise.all([
      Invoice.find().populate("apartment resident").limit(5),
      Report.find().populate("apartment resident").limit(5),
      Resident.find().limit(5),
    ]);

    // Gắn ngữ cảnh
    const context = `
🏢 Chung cư Mini - Dữ liệu gần nhất:
🧾 Hóa đơn:
${invoices
  .map(
    (i) =>
      `• Phòng ${i.apartment?.code || "?"}, tháng ${i.month}/${i.year}, tổng ${i.totalAmount}₫, trạng thái: ${i.status}`
  )
  .join("\n")}

🚨 Báo cáo:
${reports
  .map((r) => `• "${r.title}" (${r.status}) - Phòng ${r.apartment?.code || "?"}`)
  .join("\n")}

👥 Cư dân:
${residents.map((r) => r.fullName).join(", ")}
`;

    // 🧠 Dùng Gemini 2.5 flash (mới nhất, nhanh & free quota)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Bạn là trợ lý ảo của hệ thống quản lý Chung cư Mini.
Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn và thân thiện.
Nếu câu hỏi liên quan tới dữ liệu, hãy trả lời dựa trên thông tin dưới đây:

${context}

Câu hỏi của người dùng:
"${message}"
`;

    // ✅ Gọi API
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (error) {
    console.error("❌ Lỗi Gemini chatbot:", error);
    res
      .status(500)
      .json({
        message: "Không thể xử lý câu hỏi AI.",
        error: error.message,
      });
  }
});

module.exports = router;
