const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./src/config/db");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

// 🧩 Import models cho route hoạt động gần đây
const Invoice = require("./src/models/Invoice");
const Report = require("./src/models/Report");
const Announcement = require("./src/models/Announcement");

// ===============================
// ⚙️ Load environment & connect DB
// ===============================
dotenv.config();
connectDB();

const app = express();

// ===============================
// ✅ Middleware
// ===============================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ✅ Cho phép truy cập file tĩnh (ảnh upload)
app.use("/uploads", express.static(path.join(__dirname, "src/uploads")));

// ===============================
// ✅ Routes chính
// ===============================
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/apartments", require("./src/routes/apartmentRoutes"));
app.use("/api/residents", require("./src/routes/residentRoutes"));
app.use("/api/invoices", require("./src/routes/invoiceRoutes"));
app.use("/api/reports", require("./src/routes/reportRoutes"));
app.use("/api/announcements", require("./src/routes/announcementRoutes"));
app.use("/api/temp-residence", require("./src/routes/tempResidenceRoutes"));
app.use("/api/payment", require("./src/routes/paymentRoutes"));
app.use("/api/chat", require("./src/routes/chatRoutes"));

// ✅ Route AI Chatbot
app.use("/api/ai", require("./src/routes/aiChatRoutes"));

// ===============================
// 🆕 ROUTE: Hoạt động gần đây (cho Dashboard Admin)
// ===============================
app.get("/api/admin/activities/recent", async (req, res) => {
  try {
    const [invoices, reports, announcements] = await Promise.all([
      Invoice.find()
        .populate("apartment", "name code")
        .sort({ createdAt: -1 })
        .limit(1),
      Report.find()
        .populate("apartment", "name code")
        .populate("resident", "fullName")
        .sort({ createdAt: -1 })
        .limit(1),
      Announcement.find()
        .populate("issuedBy", "fullName")
        .sort({ createdAt: -1 })
        .limit(1),
    ]);

    const activities = [
      ...invoices.map((i) => ({
        id: `inv-${i._id}`,
        type: "invoice",
        text: `🧾 Hóa đơn tháng ${i.month}/${i.year} (${i.apartment?.code || "N/A"}) - ${
          i.status === "paid" ? "đã thanh toán" : "chưa thanh toán"
        }.`,
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
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    res.json(activities);
  } catch (error) {
    console.error("❌ Lỗi khi lấy hoạt động gần đây:", error);
    res.status(500).json({
      message: "Không thể tải danh sách hoạt động gần đây.",
      error: error.message,
    });
  }
});

// ===============================
// 🧱 Error Handling
// ===============================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
