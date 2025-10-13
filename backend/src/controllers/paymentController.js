const Invoice = require("../models/Invoice");

// ✅ Demo QR thanh toán (không cần MoMo API)
const generateDemoQR = async (req, res) => {
  try {
    const { id } = req.params; // ID hóa đơn
    const invoice = await Invoice.findById(id).populate("apartment", "apartmentCode name");

    if (!invoice) {
      return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
    }

    // 🧾 Thông tin hóa đơn
    const amount = invoice.totalAmount || 0;
    const info = `TT ${invoice.apartment.apartmentCode} ${invoice.month}/${invoice.year}`;

    // 🏦 Thông tin tài khoản nhận tiền (Techcombank)
    const bankBin = "970422";
    const accountNo = "88884112005";
    const accountName = "NGUYEN DUY ANH TUAN";

    // 🔗 Link QR động từ VietQR.io
    const qrUrl = `https://img.vietqr.io/image/${bankBin}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
      info
    )}&accountName=${encodeURIComponent(accountName)}`;

    // ✅ Trả dữ liệu cho frontend hiển thị
    res.json({
      success: true,
      qrUrl,
      bank: "MBbank",
      accountNo,
      accountName,
      amount,
      info,
    });
  } catch (err) {
    console.error("❌ Lỗi tạo QR:", err);
    res.status(500).json({ message: "Lỗi tạo QR thanh toán demo" });
  }
};

// ✅ Export đúng cách
module.exports = { generateDemoQR };
