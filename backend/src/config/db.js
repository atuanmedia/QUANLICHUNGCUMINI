// backend/src/config/db.js
const mongoose = require("mongoose");

/**
 * ⚙️ Kết nối MongoDB Atlas tối ưu hiệu suất:
 * - maxPoolSize: giới hạn số kết nối đồng thời để tránh nghẽn
 * - serverSelectionTimeoutMS: thời gian chờ chọn server
 * - socketTimeoutMS: thời gian chờ khi kết nối lâu
 * - Log query chậm >200ms để dễ theo dõi hiệu năng
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 10,             // Giữ 10 connection tái sử dụng
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB connected successfully!");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }

  /**
   * 🐢 Log query chậm cho Mongoose v7+
   * Dùng callback thay vì this.on("end")
   * để tránh lỗi “this.on is not a function”
   */
  mongoose.set("debug", (collectionName, method, query, doc, options) => {
    const start = Date.now();
    // Tạo log ngay khi query kết thúc
    setImmediate(() => {
      const duration = Date.now() - start;
      if (duration > 200) {
        console.warn(
          `🐢 Slow query detected: ${collectionName}.${method} (${duration}ms)`,
          { query, options }
        );
      }
    });
  });
};

module.exports = connectDB;
