// backend/src/server.js
require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const app = require("./app");

// ✅ Model lưu tin nhắn (tạo file ở: src/models/ChatMessage.js)
const ChatMessage = require("./src/models/ChatMessage");

// PORT mặc định
const PORT = process.env.PORT || 5000;

// ✅ Tạo HTTP server từ Express app
const server = http.createServer(app);

// ✅ Khởi tạo Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc domain FE của bạn: "https://quanlichungcumini.vercel.app"
    methods: ["GET", "POST"],
  },
});

// 🧠 Khi client kết nối
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // 📩 Khi client gửi tin nhắn
  socket.on("send_message", async (data) => {
    console.log("💬 New message:", data);

    // ✅ Phát lại cho tất cả client đang online
    io.emit("receive_message", data);

    // ✅ Lưu tin nhắn vào MongoDB nếu kết nối còn mở
    try {
      if (mongoose.connection.readyState === 1) {
        await ChatMessage.create({
          sender: data.sender, // "resident" | "admin"
          content: data.content,
          createdAt: new Date(),
        });
      }
    } catch (err) {
      console.error("❌ Error saving chat message:", err.message);
    }
  });

  // ❌ Khi client ngắt kết nối
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// 🚀 Start server
server.listen(PORT, () => {
  console.log(`🚀 Server + Socket.IO running on port ${PORT}`);
});
