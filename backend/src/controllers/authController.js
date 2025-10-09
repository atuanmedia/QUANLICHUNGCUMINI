// backend/src/controllers/authController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Resident = require('../models/Resident');
const generateToken = require('../utils/generateToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --------------------------------------
// Đăng nhập người dùng thông thường
// --------------------------------------
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      residentId: user.resident,
      token: generateToken(user),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// --------------------------------------
// Đăng nhập admin
// --------------------------------------
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized: Admin only' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('loginAdmin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------------------------------------
// Đăng ký admin
// --------------------------------------
const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role: 'admin',
    });

    res.status(201).json({
      message: 'Register success',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// --------------------------------------
// Đăng ký người dùng
// --------------------------------------
const registerUser = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    apartmentId,
    dateOfBirth,
    phoneNumber,
    idCardNumber,
    isHeadOfHousehold,
  } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  let userRole = role || 'resident';
  if (userRole === 'admin' && (!req.user || req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('Only admins can register other admins.');
  }

  const user = await User.create({
    name,
    email,
    password,
    role: userRole,
  });

  let residentData = null;
  if (userRole === 'resident') {
    if (!apartmentId || !dateOfBirth || !phoneNumber || !idCardNumber) {
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error('Please provide all required resident details.');
    }

    const residentExists = await Resident.findOne({
      $or: [{ phoneNumber }, { idCardNumber }, { email }],
    });
    if (residentExists) {
      await User.findByIdAndDelete(user._id);
      res.status(400);
      throw new Error('Resident with this data already exists.');
    }

    residentData = await Resident.create({
      user: user._id,
      fullName: name,
      dateOfBirth,
      phoneNumber,
      idCardNumber,
      email,
      apartment: apartmentId,
      isHeadOfHousehold: isHeadOfHousehold || false,
    });

    user.resident = residentData._id;
    await user.save();
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    residentId: user.resident,
    token: generateToken(user),
    residentDetails: residentData
      ? {
          _id: residentData._id,
          apartment: residentData.apartment,
          isHeadOfHousehold: residentData.isHeadOfHousehold,
        }
      : undefined,
  });
});

// --------------------------------------
// Lấy thông tin người dùng
// --------------------------------------
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  let residentDetails = null;
  if (user.role === 'resident' && user.resident) {
    residentDetails = await Resident.findById(user.resident).populate('apartment');
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    residentId: user.resident,
    residentDetails,
  });
});

// ✅ Export tất cả hàm ở đây
module.exports = {
  loginUser,
  loginAdmin,
  registerAdmin,
  registerUser,
  getUserProfile,
};
