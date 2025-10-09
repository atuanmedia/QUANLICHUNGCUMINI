const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 🧭 Kiểm tra header Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log("🔐 Token nhận từ frontend:", token);

      // 🔍 Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decode:", decoded);

      // 🧠 Tìm user trong DB
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log("⚠️ Không tìm thấy user trong DB");
        return res.status(401).json({ message: "User not found" });
      }

      req.user = user; // ✅ user có đầy đủ role/email/id
      console.log("👤 Đã xác thực:", user.email, "| Role:", user.role);

      next();
    } catch (error) {
      console.error("❌ Lỗi xác thực token:", error.message);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "No token, authorization denied" });
  }
});

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("👤 Role hiện tại:", req.user?.role);
    console.log("🎯 Vai trò được phép:", roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' không có quyền truy cập`,
      });
    }
     console.log("✅ Role hợp lệ, đi tiếp...");
    next();
  };
};

module.exports = { protect, authorize };
