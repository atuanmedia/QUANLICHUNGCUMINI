require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const morgan = require("morgan");
const NodeCache = require("node-cache");

const app = require("./app");
const connectDB = require("./src/config/db");
const ChatMessage = require("./src/models/ChatMessage");

// 🧩 Import thêm các model cần thiết
const Invoice = require("./src/models/Invoice");
const Report = require("./src/models/Report");
const Announcement = require("./src/models/Announcement");

// ===============================
// ⚙️ Cấu hình cơ bản
// ===============================
const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://quanlichungcumini.vercel.app";

// ✅ Middleware đảm bảo Express parse JSON (phòng trường hợp app.js chưa set)
app.use(express.json());

// ✅ Logging cho backend
app.use(morgan("tiny"));

// ✅ Cache cho router
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });
app.set("cache", cache);

// ✅ Kết nối MongoDB
connectDB();

// ===============================


// ===============================
// 💬 SOCKET CHAT
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

  // 🏠 Cư dân tham gia
  socket.on("resident_join", (userInfo) => {
    onlineUsers.set(socket.id, userInfo);
    console.log(`🏠 Resident joined: ${userInfo.fullName}`);
    if (adminSocket) {
      io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
    }
  });

  // 👑 Admin tham gia
  socket.on("admin_join", () => {
    adminSocket = socket.id;
    console.log("👑 Admin joined chat");
    io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
  });

  // 💬 Gửi tin nhắn
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

  // ❌ Ngắt kết nối
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

// ===============================
// 🚀 Khởi chạy Server
// ===============================
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO chạy tại cổng ${PORT}`);
  console.log(`🌐 FE được phép truy cập: ${FRONTEND_URL}`);
});
