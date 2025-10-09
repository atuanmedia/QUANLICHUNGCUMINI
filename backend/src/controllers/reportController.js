// backend/src/controllers/reportController.js
const asyncHandler = require('express-async-handler');
const Report = require('../models/Report');
const Resident = require('../models/Resident');
const Apartment = require('../models/Apartment'); // 👈 THÊM DÒNG NÀY
const Invoice = require('../models/Invoice');

// @desc    Get all reports (Admin) or reports by a specific resident (Resident)
// @route   GET /api/reports
// @access  Private/Admin, Private/Resident
const getReports = asyncHandler(async (req, res) => {
    const { status, apartmentId, search } = req.query;
    let query = {};

    if (req.user.role === 'resident') {
        // Residents can only see their own reports
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident) {
            res.status(404);
            throw new Error('Resident profile not found for current user.');
        }
        query.resident = resident._id;
    } else { // Admin
        if (apartmentId) {
            query.apartment = apartmentId;
        }
    }

    if (status) {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
        ];
    }

    const reports = await Report.find(query)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber')
        .sort({ createdAt: -1 });
    res.json(reports);
});

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin, Private/Resident
const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber');

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    // If resident role, ensure they own this report
    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || report.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this report');
        }
    }

    res.json(report);
});

// @desc    Create new report (Resident only)
// @route   POST /api/reports
// @access  Private/Resident
const createReport = asyncHandler(async (req, res) => {
    const { title, content, images } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Please provide title and content for the report');
    }

    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident) {
        res.status(404);
        throw new Error('Resident profile not found for current user.');
    }

    const report = new Report({
        apartment: resident.apartment,
        resident: resident._id,
        title,
        content,
        images: images || [],
        status: 'pending',
    });

    const createdReport = await report.save();
    res.status(201).json(createdReport);
});

// @desc    Update a report (Admin can update status/notes, Resident can update content if pending)
// @route   PUT /api/reports/:id
// @access  Private/Admin, Private/Resident
const updateReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    if (req.user.role === 'admin') {
        // Admin can update status, adminNotes
        const { status, adminNotes } = req.body;
        report.status = status || report.status;
        report.adminNotes = adminNotes ?? report.adminNotes; // Allow setting to null/empty string

        if (status === 'resolved' && !report.resolvedDate) {
            report.resolvedDate = new Date();
        } else if (status !== 'resolved') {
            report.resolvedDate = null;
        }

    } else if (req.user.role === 'resident') {
        // Resident can only update title, content, images if report is 'pending' and they own it
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || report.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this report');
        }
        if (report.status !== 'pending') {
            res.status(400);
            throw new Error('Can only update pending reports.');
        }

        const { title, content, images } = req.body;
        report.title = title || report.title;
        report.content = content || report.content;
        report.images = images || report.images;

    } else {
        res.status(403);
        throw new Error('Not authorized to update this report');
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
});

// @desc    Delete a report (Admin only)
// @route   DELETE /api/reports/:id
// @access  Private/Admin
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (report) {
        await Report.deleteOne({ _id: report._id });
        res.json({ message: 'Report removed' });
    } else {
        res.status(404);
        throw new Error('Report not found');
    }
});

// @desc    Get dashboard statistics
// @route   GET /api/reports/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res) => {
    try {
        // ======= Cư dân =======
        const totalResidents = await Resident.countDocuments();

        // // ======= Căn hộ =======
        // const totalApartments = await Apartment.countDocuments();
        // // Nếu schema Apartment có field "status"
        // // const occupiedApartments = await Apartment.countDocuments({ status: 'occupied' });
        // // Nếu không có field status mà có trường "resident"
        // const occupiedApartments = await Apartment.countDocuments({ resident: { $ne: null } });
        // ======= Căn hộ =======
        const totalApartments = await Apartment.countDocuments();

        // Đếm số căn hộ có ít nhất một cư dân
        const occupiedApartmentIds = await Resident.distinct('apartment'); // danh sách _id căn hộ đang có cư dân
        const occupiedApartments = occupiedApartmentIds.length;

        // ======= Hóa đơn =======
        const unpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });

        // ======= Báo cáo =======
        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });

        // ======= Tổng quan tài chính =======
        const totalRevenueAgg = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalDebtAgg = await Invoice.aggregate([
            { $match: { status: 'unpaid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalRevenue = totalRevenueAgg[0]?.total || 0;
        const totalDebt = totalDebtAgg[0]?.total || 0;

        // ======= Response chuẩn hoá cho Dashboard =======
        res.json({
            residents: { total: totalResidents || 0 },
            apartments: { total: totalApartments || 0, occupied: occupiedApartments || 0 },
            invoices: { unpaid: unpaidInvoices || 0 },
            reports: { total: totalReports || 0, pending: pendingReports || 0, resolved: resolvedReports || 0 },
            financials: { totalRevenue: totalRevenue || 0, totalDebt: totalDebt || 0 },
        });
    } catch (error) {
        console.error("getStats error:", error);
        res.status(500).json({ message: "Error fetching dashboard stats", error: error.message });
    }
});


module.exports = {
    getReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    getStats,
};