const asyncHandler = require("express-async-handler");
const TemporaryResidence = require("../models/TemporaryResidence");
const PDFDocument = require("pdfkit");
const path = require("path");
const fs = require("fs");

/**
 * 📋 Lấy danh sách hồ sơ tạm trú / tạm vắng
 * GET /api/temp-residence
 */
const getAllRecords = asyncHandler(async (req, res) => {
  const records = await TemporaryResidence.find()
    .populate("resident", "fullName phoneNumber apartment")
    .populate({
      path: "resident",
      populate: { path: "apartment", select: "apartmentCode floor" },
    })
    .sort({ createdAt: -1 });

  res.json(records);
});

/**
 * ➕ Tạo hồ sơ mới
 * POST /api/temp-residence
 */
const createRecord = asyncHandler(async (req, res) => {
  try {
    const { resident, type, fromDate, toDate, reason, place } = req.body;

    if (!resident || !type || !fromDate || !toDate || !reason || !place) {
      res.status(400);
      throw new Error("Vui lòng nhập đầy đủ thông tin tạm trú / tạm vắng");
    }

    const newRecord = await TemporaryResidence.create({
      resident,
      type,
      fromDate,
      toDate,
      reason,
      place,
      createdBy: req.user ? req.user._id : null,
    });

    const populated = await TemporaryResidence.findById(newRecord._id)
      .populate("resident", "fullName phoneNumber")
      .populate({
        path: "resident",
        populate: { path: "apartment", select: "apartmentCode floor" },
      });

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Lỗi trong createRecord:", err);
    res.status(500).json({ message: err.message || "Lỗi khi tạo hồ sơ" });
  }
});

/**
 * 📄 Xuất giấy tạm trú / tạm vắng (PDF)
 * GET /api/temp-residence/:id/export
 */
const exportPDF = asyncHandler(async (req, res) => {
  try {
    const record = await TemporaryResidence.findById(req.params.id)
      .populate("resident", "fullName dateOfBirth phoneNumber apartment")
      .populate({
        path: "resident",
        populate: { path: "apartment", select: "apartmentCode floor" },
      });

    if (!record) {
      return res.status(404).json({ message: "Không tìm thấy hồ sơ" });
    }

    const fontPath = path.join(__dirname, "../../fonts/TimesNewRoman_1.ttf");
    if (!fs.existsSync(fontPath)) {
      console.error("⚠️ Font không tồn tại:", fontPath);
      return res.status(500).json({
        message: "Không tìm thấy font TimesNewRoman_1.ttf trong thư mục fonts/",
      });
    }

    const cleanName = record.resident.fullName
      ?.normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    const filename = `to_khai_cu_tru_${cleanName}.pdf`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(filename)}"`
    );

    const doc = new PDFDocument({ size: "A4", margin: 50 });
    doc.registerFont("TimesVN", fontPath);
    doc.font("TimesVN");
    doc.pipe(res);

    // ===== PHẦN ĐẦU =====
    doc.fontSize(12).text("Mẫu CT01 ban hành theo Thông tư số 66/2023/TT-BCA", {
      align: "center",
    });
    doc.text("ngày 17/11/2023 của Bộ trưởng Bộ Công an", { align: "center" });
    doc.moveDown(1);

    doc
      .fontSize(16)
      .text("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", { align: "center" });
    doc
      .fontSize(14)
      .text("Độc lập - Tự do - Hạnh phúc", { align: "center", underline: true });
    doc.moveDown(1.5);

    doc
      .fontSize(16)
      .text("TỜ KHAI THAY ĐỔI THÔNG TIN CƯ TRÚ", { align: "center", bold: true });
    doc.moveDown(2);

    // ===== NỘI DUNG =====
    const r = record.resident || {};
    doc.fontSize(12);
    doc.text(`1. Họ và tên: ${r.fullName || ".........................................."}`);
    doc.text(
      `2. Ngày, tháng, năm sinh: ${
        r.dateOfBirth
          ? new Date(r.dateOfBirth).toLocaleDateString("vi-VN")
          : "..............."
      }    3. Giới tính: ...........`
    );
    doc.text(
      `4. Số điện thoại liên hệ: ${
        r.phoneNumber || ".........................."
      }    5. Email: .....................................`
    );
    doc.text(
      `6. Căn hộ: ${r.apartment?.apartmentCode || "N/A"} (Tầng ${
        r.apartment?.floor || "?"
      })`
    );
    doc.text(
      `7. Loại khai báo: ${record.type === "tam_tru" ? "Tạm trú" : "Tạm vắng"}`
    );
    doc.text(
      `8. Thời gian: ${new Date(record.fromDate).toLocaleDateString(
        "vi-VN"
      )} → ${new Date(record.toDate).toLocaleDateString("vi-VN")}`
    );
    doc.text(`9. Lý do: ${record.reason}`);
    doc.text(
      `10. Nơi ${record.type === "tam_tru" ? "tạm trú" : "đến"}: ${
        record.place
      }`
    );

    // ===== PHẦN CHỮ KÝ =====
    const pageWidth = doc.page.width;
    const margin = 50;
    const colWidth = (pageWidth - margin * 2) / 2;
    const spacing = 20;

    const today = new Date();
    const dateText = `..., ngày ${today.getDate()} tháng ${
      today.getMonth() + 1
    } năm ${today.getFullYear()}`;

    doc.moveDown(3);
    doc.fontSize(12).text(dateText, margin + colWidth, doc.y, { align: "center" });
    doc.moveDown(1.5);

    const startY = doc.y;

    // Cột trái
    doc.text("Người khai ký và ghi rõ họ tên", margin, startY, { align: "center" });
    doc.text("(Ký, ghi rõ họ tên)", margin, startY + spacing, { align: "center" });

    // Cột phải
    doc.text("Xác nhận của Ban quản lý", margin + colWidth, startY, { align: "center" });
    doc.text("(Ký, ghi rõ họ tên, đóng dấu nếu có)", margin + colWidth, startY + spacing, { align: "center" });

    // Khung ký
    const rectY = startY + spacing * 2;
    doc.rect(margin + 30, rectY, colWidth - 60, 60).stroke();
    doc.rect(margin + colWidth + 30, rectY, colWidth - 60, 60).stroke();

    doc.end();
  } catch (err) {
    console.error("❌ Lỗi trong exportPDF:", err);
    res.status(500).json({ message: err.message || "Lỗi khi xuất PDF" });
  }
});

/**
 * ❌ Xóa hồ sơ tạm trú / tạm vắng
 * DELETE /api/temp-residence/:id
 */
const deleteRecord = asyncHandler(async (req, res) => {
  try {
    const record = await TemporaryResidence.findById(req.params.id);
    if (!record) {
      res.status(404);
      throw new Error("Không tìm thấy hồ sơ tạm trú/tạm vắng");
    }

    await record.deleteOne();
    res.json({ message: "Hồ sơ đã được xóa thành công" });
  } catch (err) {
    console.error("❌ Lỗi trong deleteRecord:", err);
    res.status(500).json({ message: err.message || "Lỗi khi xóa hồ sơ" });
  }
});

module.exports = {
  getAllRecords,
  createRecord,
  exportPDF,
  deleteRecord,
};
