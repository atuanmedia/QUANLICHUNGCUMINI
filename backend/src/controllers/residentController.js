// backend/src/controllers/residentController.js
const asyncHandler = require('express-async-handler');
const Resident = require('../models/Resident');
const User = require('../models/User');
const { updateApartmentResidentsCount } = require('./apartmentController'); // Import internal helper

// @desc    Get all residents
// @route   GET /api/residents
// @access  Private/Admin
const getResidents = asyncHandler(async (req, res) => {
    const { search, apartmentId } = req.query;
    let query = {};

    if (search) {
        query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { phoneNumber: { $regex: search, $options: 'i' } },
            { idCardNumber: { $regex: search, $options: 'i' } },
        ];
    }
    if (apartmentId) {
        query.apartment = apartmentId;
    }

    const residents = await Resident.find(query)
        .populate('user', 'email role') // Lấy thông tin user liên quan
        .populate('apartment', 'apartmentCode name') // Lấy thông tin căn hộ
        .sort({ createdAt: -1 });
    res.json(residents);
});

// @desc    Get single resident by ID
// @route   GET /api/residents/:id
// @access  Private/Admin, Private/Resident (for self)
const getResidentById = asyncHandler(async (req, res) => {
    const resident = await Resident.findById(req.params.id)
        .populate('user', 'email role')
        .populate('apartment', 'apartmentCode name');

    if (!resident) {
        res.status(404);
        throw new Error('Resident not found');
    }

    // If resident role, ensure they are viewing their own profile
    if (req.user.role === 'resident' && resident.user._id.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to view this resident profile');
    }

    res.json(resident);
});

// @desc    Create new resident (Admin only)
// @route   POST /api/residents
// @access  Private/Admin
const createResident = asyncHandler(async (req, res) => {
     console.log("📩 Dữ liệu nhận từ frontend:", req.body);
    const {
        fullName,
        dateOfBirth,
        phoneNumber,
        idCardNumber,
        email,
        apartment, // This is apartment ID
        isHeadOfHousehold,
        password // Password for the new user account
    } = req.body;

    // Basic validation
    if (!fullName || !dateOfBirth || !phoneNumber || !idCardNumber || !email || !apartment || !password) {
        res.status(400);
        throw new Error('Please fill all required fields: fullName, dateOfBirth, phoneNumber, idCardNumber, email, apartment, password');
    }

    // Check if resident with same phone, ID or email exists
    const residentExists = await Resident.findOne({ $or: [{ phoneNumber }, { idCardNumber }, { email }] });
    if (residentExists) {
        res.status(400);
        throw new Error('A resident with this phone number, ID card, or email already exists.');
    }

    // Check if a user with this email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('A user account with this email already exists. Please use a different email or link to existing user.');
    }

    // Create a new User account for this resident
    const newUser = await User.create({
        name: fullName,
        email,
        password,
        role: 'resident',
    });

    if (!newUser) {
        res.status(500);
        throw new Error('Failed to create user account for resident.');
    }

    // Create the Resident profile
    const resident = new Resident({
        user: newUser._id,
        fullName,
        dateOfBirth,
        phoneNumber,
        idCardNumber,
        email,
        apartment,
        isHeadOfHousehold: isHeadOfHousehold || false,
    });

    const createdResident = await resident.save();

    // Link resident profile to user
    newUser.resident = createdResident._id;
    await newUser.save();

    // Update apartment residents count
    await updateApartmentResidentsCount(apartment);

    res.status(201).json(createdResident.populate('apartment', 'apartmentCode name'));
});

// @desc    Update a resident
// @route   PUT /api/residents/:id
// @access  Private/Admin, Private/Resident (for self)
const updateResident = asyncHandler(async (req, res) => {
    const {
        fullName,
        dateOfBirth,
        phoneNumber,
        idCardNumber,
        email,
        apartment,
        isHeadOfHousehold,
        avatar
    } = req.body;

    const resident = await Resident.findById(req.params.id);

    if (!resident) {
        res.status(404);
        throw new Error('Resident not found');
    }

    // If resident role, ensure they are updating their own profile
    if (req.user.role === 'resident' && resident.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to update this resident profile');
    }

    // Prevent changing apartment if already assigned and not admin
    if (apartment && apartment !== resident.apartment.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admins can change apartment assignments.');
    }

    let oldApartmentId = resident.apartment;

    resident.fullName = fullName || resident.fullName;
    resident.dateOfBirth = dateOfBirth || resident.dateOfBirth;
    resident.phoneNumber = phoneNumber || resident.phoneNumber;
    resident.idCardNumber = idCardNumber || resident.idCardNumber;
    resident.email = email || resident.email;
    resident.apartment = apartment || resident.apartment;
    resident.isHeadOfHousehold = typeof isHeadOfHousehold === 'boolean' ? isHeadOfHousehold : resident.isHeadOfHousehold;
    resident.avatar = avatar || resident.avatar;

    const updatedResident = await resident.save();

    // If apartment changed, update counts for both old and new apartments
    if (apartment && oldApartmentId.toString() !== apartment.toString()) {
        await updateApartmentResidentsCount(oldApartmentId);
        await updateApartmentResidentsCount(apartment);
    } else {
        await updateApartmentResidentsCount(resident.apartment);
    }

    // Also update the linked User's name and email if they changed
    const user = await User.findById(resident.user);
    if (user) {
        user.name = fullName || user.name;
        user.email = email || user.email;
        await user.save();
    }


    res.json(updatedResident.populate('apartment', 'apartmentCode name'));
});

// @desc    Delete a resident
// @route   DELETE /api/residents/:id
// @access  Private/Admin
const deleteResident = asyncHandler(async (req, res) => {
    const resident = await Resident.findById(req.params.id);

    if (resident) {
        const userId = resident.user;
        const apartmentId = resident.apartment;

        await Resident.deleteOne({ _id: resident._id });
        await User.deleteOne({ _id: userId }); // Xóa luôn tài khoản User liên quan

        // Update apartment residents count
        await updateApartmentResidentsCount(apartmentId);

        res.json({ message: 'Resident and associated user removed' });
    } else {
        res.status(404);
        throw new Error('Resident not found');
    }
});

module.exports = {
    getResidents,
    getResidentById,
    createResident,
    updateResident,
    deleteResident,
};