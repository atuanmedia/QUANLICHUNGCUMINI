// backend/src/controllers/announcementController.js
const asyncHandler = require('express-async-handler');
const Announcement = require('../models/Announcement');
const Resident = require('../models/Resident');

// @desc    Get all announcements (Admin) or announcements relevant to resident
// @route   GET /api/announcements
// @access  Private/Admin, Private/Resident
const getAnnouncements = asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'resident') {
        // Residents see system-wide announcements and those targeted at their apartment
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident) {
            res.status(404);
            throw new Error('Resident profile not found for current user.');
        }
        query.$or = [
            { scope: 'system' },
            { targetApartment: resident.apartment }
        ];
    }
    // Admin sees all announcements

    const announcements = await Announcement.find(query)
        .populate('targetApartment', 'apartmentCode name')
        .populate('issuedBy', 'name email') // Who published it
        .sort({ publishDate: -1 });

    res.json(announcements);
});

// @desc    Get single announcement by ID
// @route   GET /api/announcements/:id
// @access  Private/Admin, Private/Resident
const getAnnouncementById = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id)
        .populate('targetApartment', 'apartmentCode name')
        .populate('issuedBy', 'name email');

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    // If resident role, ensure they are authorized to view it
    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident) {
            res.status(404);
            throw new Error('Resident profile not found for current user.');
        }
        if (announcement.scope === 'apartment' && announcement.targetApartment.toString() !== resident.apartment.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this announcement');
        }
    }

    res.json(announcement);
});

// @desc    Create new announcement (Admin only)
// @route   POST /api/announcements
// @access  Private/Admin
const createAnnouncement = asyncHandler(async (req, res) => {
    const { title, content, scope, targetApartment } = req.body;

    if (!title || !content || !scope) {
        res.status(400);
        throw new Error('Please provide title, content, and scope for the announcement');
    }

    if (scope === 'apartment' && !targetApartment) {
        res.status(400);
        throw new Error('Target apartment is required for apartment-scoped announcements');
    }

    const announcement = new Announcement({
        title,
        content,
        scope,
        targetApartment: scope === 'apartment' ? targetApartment : undefined,
        issuedBy: req.user._id, // Admin creating the announcement
        publishDate: new Date(),
    });

    const createdAnnouncement = await announcement.save();
    res.status(201).json(createdAnnouncement);
});

// @desc    Update an announcement (Admin only)
// @route   PUT /api/announcements/:id
// @access  Private/Admin
const updateAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
        res.status(404);
        throw new Error('Announcement not found');
    }

    const { title, content, scope, targetApartment } = req.body;

    // Validate scope and targetApartment if they are being updated
    if (scope && scope === 'apartment' && !targetApartment) {
        res.status(400);
        throw new Error('Target apartment is required for apartment-scoped announcements');
    }
    if (scope && scope !== 'apartment') {
        req.body.targetApartment = undefined; // Clear targetApartment if scope changes from 'apartment'
    }

    announcement.title = title || announcement.title;
    announcement.content = content || announcement.content;
    announcement.scope = scope || announcement.scope;
    announcement.targetApartment = req.body.targetApartment !== undefined ? req.body.targetApartment : announcement.targetApartment;

    const updatedAnnouncement = await announcement.save();
    res.json(updatedAnnouncement);
});

// @desc    Delete an announcement (Admin only)
// @route   DELETE /api/announcements/:id
// @access  Private/Admin
const deleteAnnouncement = asyncHandler(async (req, res) => {
    const announcement = await Announcement.findById(req.params.id);

    if (announcement) {
        await Announcement.deleteOne({ _id: announcement._id });
        res.json({ message: 'Announcement removed' });
    } else {
        res.status(404);
        throw new Error('Announcement not found');
    }
});

module.exports = {
    getAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
};