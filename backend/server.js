require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./app");
const ChatMessage = require("./src/models/ChatMessage");

const PORT = process.env.PORT || 5000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://quanlichungcumini.vercel.app";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// ===============================
// 🧠 Quản lý socket kết nối
// ===============================

const onlineUsers = new Map(); // { socket.id -> userInfo }
let adminSocket = null;

// 🔗 Khi client kết nối
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // 🏠 Cư dân join
  socket.on("resident_join", (userInfo) => {
    onlineUsers.set(socket.id, userInfo);
    console.log(`🏠 Resident joined: ${userInfo.fullName}`);

    // Gửi danh sách user cho admin
    if (adminSocket) {
      io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
    }
  });

  // 👑 Admin join
  socket.on("admin_join", () => {
    adminSocket = socket.id;
    console.log("👑 Admin joined chat");
    // Gửi danh sách cư dân đang online
    io.to(adminSocket).emit("user_list", Array.from(onlineUsers.values()));
  });

  // 💬 Khi có tin nhắn mới
  socket.on("send_message", async (data) => {
    console.log("💬 Tin nhắn:", data);

    // ✅ Nếu cư dân gửi → gửi cho admin + phản hồi lại chính họ
    if (data.sender === "resident") {
      if (adminSocket) io.to(adminSocket).emit("receive_message", data);
      io.to(socket.id).emit("receive_message", data); // cư dân thấy ngay tin mình
    }

    // ✅ Nếu admin gửi → tìm đúng cư dân nhận + phản hồi lại cho admin
    if (data.sender === "admin") {
      const target = [...onlineUsers.entries()].find(
        ([, u]) => u._id === data.receiverId
      );
      if (target) io.to(target[0]).emit("receive_message", data);
      io.to(socket.id).emit("receive_message", data); // admin thấy ngay tin mình
    }

    // ✅ Lưu DB
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

  // 🔴 Khi ngắt kết nối
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

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO đang chạy tại cổng ${PORT}`);
  console.log(`🌐 Cho phép FE: ${FRONTEND_URL}`);
});
