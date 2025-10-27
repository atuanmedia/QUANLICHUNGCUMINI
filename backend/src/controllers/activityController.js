// backend/src/controllers/activityController.js
const Invoice = require("../models/Invoice");
const Report = require("../models/Report");
const Announcement = require("../models/Announcement");
exports.getRecentActivities = async (req, res) => {
  try {
    // 🔹 Lấy dữ liệu mới nhất từ 3 collection
    const [invoices, reports, announcements] = await Promise.all([
      Invoice.find()
        .populate("apartment", "name apartmentCode")
        .populate("resident", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find()
        .populate("apartment", "name apartmentCode")
        .populate("resident", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
      Announcement.find()
        .populate("issuedBy", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // 🔹 Chuẩn hóa dữ liệu
    const activities = [
      ...invoices.map((i) => ({
        id: `inv-${i._id}`,
        type: "invoice",
        text: `🧾 Hóa đơn tháng ${i.month}/${i.year} – Phòng ${i.apartment?.apartmentCode || "Chưa gắn"
          } – ${i.status === "paid" ? "ĐÃ thanh toán" : "CHƯA thanh toán"}.`,
        createdAt: i.createdAt,
      })),
      ...reports.map((r) => ({
        id: `rep-${r._id}`,
        type: "report",
        text: `🚨 Báo cáo mới: "${r.title}" – Phòng ${r.apartment?.apartmentCode || "Chưa gắn"
          } (${r.status}).`,
        createdAt: r.createdAt,
      })),
      ...announcements.map((a) => ({
        id: `ann-${a._id}`,
        type: "announcement",
        text: `📢 Thông báo: ${a.title}.`,
        createdAt: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error("❌ Lỗi khi lấy hoạt động gần đây:", error);
    res.status(500).json({ message: "Không thể tải danh sách hoạt động gần đây." });
  }
};
