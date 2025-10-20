const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Tạo thư mục lưu nếu chưa có
const uploadPath = path.join(__dirname, "../uploads/reports");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ Cấu hình nơi lưu + tên file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// ✅ Chỉ cho phép ảnh
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

module.exports = multer({ storage, fileFilter });
