// backend/src/controllers/apartmentController.js
const asyncHandler = require('express-async-handler');
const Apartment = require('../models/Apartment');
const Resident = require('../models/Resident'); // Để cập nhật residentsCount

// =============================
// 📌 Lấy danh sách tất cả căn hộ
// =============================
const getApartments = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  let query = {};

  if (status) query.status = status;

  if (search) {
    query.$or = [
      { apartmentCode: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
    ];
  }

  const apartments = await Apartment.find(query).sort({ apartmentCode: 1 });
  res.json(apartments);
});

// =============================
// 📌 Lấy chi tiết 1 căn hộ theo ID
// =============================
const getApartmentById = asyncHandler(async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404);
    throw new Error('Apartment not found');
  }
  res.json(apartment);
});

// =============================
// 📌 Tạo căn hộ mới
// =============================
const createApartment = asyncHandler(async (req, res) => {
  try {
    console.log("📦 Body nhận được:", req.body);
    const { apartmentCode, name, area, floor, status } = req.body;

    // 🔍 Kiểm tra dữ liệu đầu vào
    if (!apartmentCode || !name || !area || !floor) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ: mã, tên, diện tích và tầng." });
    }

    // Ép kiểu numeric
    const numericArea = Number(area);
    const numericFloor = Number(floor);

    if (isNaN(numericArea) || isNaN(numericFloor)) {
      return res.status(400).json({ message: "Diện tích và tầng phải là số hợp lệ." });
    }

    // Kiểm tra trùng mã căn hộ
    const existing = await Apartment.findOne({ apartmentCode });
    if (existing) {
      return res.status(400).json({ message: "Mã căn hộ đã tồn tại." });
    }

    // ✅ Tạo mới
    const apartment = new Apartment({
      apartmentCode,
      name,
      area: numericArea,
      floor: numericFloor,
      status: status || "empty",
    });

    await apartment.save();
    console.log("✅ Tạo căn hộ thành công:", apartment.apartmentCode);
    res.status(201).json(apartment);
  } catch (err) {
    console.error("❌ Lỗi tạo căn hộ:", err);
    res.status(500).json({ message: err.message || "Lỗi server khi tạo căn hộ" });
  }
});

// =============================
// 📌 Cập nhật căn hộ
// =============================
const updateApartment = asyncHandler(async (req, res) => {
  const { apartmentCode, name, area, floor, status } = req.body;
  const apartment = await Apartment.findById(req.params.id);

  if (!apartment) {
    res.status(404);
    throw new Error("Apartment not found");
  }

  // Kiểm tra trùng mã (nếu có đổi)
  if (apartmentCode && apartmentCode !== apartment.apartmentCode) {
    const exists = await Apartment.findOne({ apartmentCode });
    if (exists) {
      res.status(400);
      throw new Error("Apartment code already exists");
    }
  }

  // Cập nhật thông tin
  apartment.apartmentCode = apartmentCode || apartment.apartmentCode;
  apartment.name = name || apartment.name;
  apartment.area = area || apartment.area;
  apartment.floor = floor || apartment.floor;
  apartment.status = status || apartment.status;

  const updated = await apartment.save();

  // Cập nhật residentsCount nếu cần
  if (status && (status === 'occupied' || status === 'empty')) {
    const residentsCount = await Resident.countDocuments({ apartment: apartment._id });
    updated.residentsCount = residentsCount;
    await updated.save();
  }

  res.json(updated);
});

// =============================
// 📌 Xóa căn hộ
// =============================
const deleteApartment = asyncHandler(async (req, res) => {
  const apartment = await Apartment.findById(req.params.id);
  if (!apartment) {
    res.status(404);
    throw new Error("Apartment not found");
  }

  const residentsCount = await Resident.countDocuments({ apartment: apartment._id });
  if (residentsCount > 0) {
    res.status(400);
    throw new Error("Không thể xóa căn hộ đang có cư dân. Hãy chuyển hoặc xóa cư dân trước.");
  }

  await Apartment.deleteOne({ _id: apartment._id });
  res.json({ message: "Apartment removed successfully" });
});

// =============================
// 📌 Lấy danh sách cư dân trong căn hộ
// =============================
const getApartmentResidents = asyncHandler(async (req, res) => {
  const apartmentId = req.params.id;

  // Nếu role là resident thì kiểm tra quyền
  if (req.user.role === "resident") {
    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident || resident.apartment.toString() !== apartmentId) {
      res.status(403);
      throw new Error("Not authorized to view residents of this apartment");
    }
  }

  const residents = await Resident.find({ apartment: apartmentId }).populate("user", "name email");
  res.json(residents);
});

// =============================
// 📌 Hàm nội bộ: Cập nhật số cư dân
// =============================
const updateApartmentResidentsCount = asyncHandler(async (apartmentId) => {
  const apartment = await Apartment.findById(apartmentId);
  if (apartment) {
    const count = await Resident.countDocuments({ apartment: apartmentId });
    apartment.residentsCount = count;
    apartment.status = count > 0 ? "occupied" : "empty";
    await apartment.save();
  }
});

module.exports = {
  getApartments,
  getApartmentById,
  createApartment,
  updateApartment,
  deleteApartment,
  getApartmentResidents,
  updateApartmentResidentsCount,
};
