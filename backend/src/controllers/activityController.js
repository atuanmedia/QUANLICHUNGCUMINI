// backend/src/controllers/activityController.js
const Invoice = require("../models/Invoice");
const Report = require("../models/Report");
const Announcement = require("../models/Announcement");

exports.getRecentActivities = async (req, res) => {
  try {
    // 🔹 Lấy các hoạt động mới nhất từ 3 collection
    const [invoices, reports, announcements] = await Promise.all([
      Invoice.find()
        .populate("apartment", "name code")
        .populate("resident", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
      Report.find()
        .populate("apartment", "name code")
        .populate("resident", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
      Announcement.find()
        .populate("issuedBy", "fullName")
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    // 🔹 Chuẩn hóa dữ liệu về chung một format
    const activities = [
      ...invoices.map((i) => ({
        id: `inv-${i._id}`,
        type: "invoice",
        text: `🧾 Hóa đơn tháng ${i.month}/${i.year} (${i.apartment?.code || "N/A"}) - ${i.status === "paid" ? "đã thanh toán" : "chưa thanh toán"}.`,
        createdAt: i.createdAt,
      })),
      ...reports.map((r) => ({
        id: `rep-${r._id}`,
        type: "report",
        text: `🚨 Báo cáo mới: ${r.title} (${r.apartment?.code || "N/A"})`,
        createdAt: r.createdAt,
      })),
      ...announcements.map((a) => ({
        id: `ann-${a._id}`,
        type: "announcement",
        text: `📢 Thông báo: ${a.title}`,
        createdAt: a.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // sắp xếp mới nhất
      .slice(0, 10); // lấy tối đa 10 hoạt động

    res.json(activities);
  } catch (error) {
    console.error("❌ Lỗi khi lấy hoạt động gần đây:", error);
    res.status(500).json({ message: "Không thể tải danh sách hoạt động gần đây." });
  }
};
