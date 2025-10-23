require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const morgan = require("morgan");
const NodeCache = require("node-cache");
const express = require("express"); // 🆕 cần cho router phụ
const app = require("./app");
const connectDB = require("./src/config/db");
const ChatMessage = require("./src/models/ChatMessage");

// 🆕 Import model để hoạt động gần đây
const Invoice = require("./src/models/Invoice");
const Report = require("./src/models/Report");
const Announcement = require("./src/models/Announcement");

const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://quanlichungcumini.vercel.app";

// ✅ Khởi tạo cache (sử dụng lại cho router)
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
app.set("cache", cache);

// ✅ Kết nối MongoDB tối ưu
connectDB();

// ✅ Logging cơ bản
app.use(morgan("tiny"));

// ===============================
// 🆕 ROUTE HOẠT ĐỘNG GẦN ĐÂY
// ===============================
app.get("/api/admin/activities/recent", async (req, res) => {
  try {
    const [invoices, reports, announcements] = await Promise.all([
      Invoice.find()
        .populate("apartment", "name code")
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
      .slice(0, 10);

    res.json(activities);
  } catch (error) {
    console.error("❌ Lỗi khi lấy hoạt động gần đây:", error);
    res.status(500).json({ message: "Không thể tải danh sách hoạt động gần đây." });
  }
});

// ===============================
// 🧠 SOCKET CHAT (GIỮ NGUYÊN)
// ===============================
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

const onlineUsers = new Map();
let adminSocket = null;

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("resident_join", (userInfo) => {
    onlineUsers.set(socket.id, userInfo);
    console.log(`🏠 Resident joined: ${userInfo.fullName}`);
    if (adminSocket) {
      io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
    }
  });

  socket.on("admin_join", () => {
    adminSocket = socket.id;
    console.log("👑 Admin joined chat");
    io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
  });

  socket.on("send_message", async (data) => {
    console.log("💬 Tin nhắn:", data);
    if (data.sender === "resident") {
      if (adminSocket) io.to(adminSocket).emit("receive_message", data);
      io.to(socket.id).emit("receive_message", data);
    }

    if (data.sender === "admin") {
      const target = [...onlineUsers.entries()].find(
        ([, u]) => u._id === data.receiverId
      );
      if (target) io.to(target[0]).emit("receive_message", data);
      io.to(socket.id).emit("receive_message", data);
    }

    try {
      if (mongoose.connection.readyState === 1) {
        await ChatMessage.create({
          sender: data.sender,
          senderId: data.senderId,
          receiverId: data.receiverId,
          content: data.content,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("❌ Lỗi lưu tin nhắn:", err.message);
    }
  });

  socket.on("disconnect", () => {
    if (onlineUsers.has(socket.id)) {
      console.log(`🔴 Resident left: ${onlineUsers.get(socket.id).fullName}`);
      onlineUsers.delete(socket.id);
    }
    if (socket.id === adminSocket) {
      console.log("⚠️ Admin disconnected");
      adminSocket = null;
    }
    if (adminSocket) {
      io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO chạy tại cổng ${PORT}`);
  console.log(`🌐 FE được phép truy cập: ${FRONTEND_URL}`);
});
