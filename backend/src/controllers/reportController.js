const asyncHandler = require('express-async-handler');
const path = require('path');
const Report = require('../models/Report');
const Resident = require('../models/Resident');
const Apartment = require('../models/Apartment');
const Invoice = require('../models/Invoice');

// ======================================================
// GET: Danh sách phản ánh (Admin xem tất cả, Resident xem của mình)
// ======================================================
const getReports = asyncHandler(async (req, res) => {
    const { status, apartmentId, search } = req.query;
    let query = {};

    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident) {
            res.status(404);
            throw new Error('Resident profile not found for current user.');
        }
        query.resident = resident._id;
    } else if (req.user.role === 'admin' && apartmentId) {
        query.apartment = apartmentId;
    }

    if (status) query.status = status;
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

// ======================================================
// GET: Xem chi tiết 1 phản ánh
// ======================================================
const getReportById = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber');

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || report.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this report');
        }
    }

    res.json(report);
});

// ======================================================
// POST: Tạo phản ánh mới (Resident Only, hỗ trợ upload ảnh)
// ======================================================
const createReport = asyncHandler(async (req, res) => {
    const { title, content } = req.body;

    if (!title || !content) {
        res.status(400);
        throw new Error('Please provide title and content for the report');
    }

    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident) {
        res.status(404);
        throw new Error('Resident profile not found for current user.');
    }

    // ✅ Lấy đường dẫn ảnh từ multer
    let imageUrl = null;
    if (req.file) {
        imageUrl = `/uploads/reports/${req.file.filename}`;
    }

    const report = new Report({
        apartment: resident.apartment,
        resident: resident._id,
        title,
        content,
        images: imageUrl ? [imageUrl] : [],
        status: 'pending',
    });

    const createdReport = await report.save();
    res.status(201).json(createdReport);
});

// ======================================================
// PUT: Cập nhật phản ánh (Admin cập nhật trạng thái, Resident cập nhật nếu pending)
// ======================================================
const updateReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    if (req.user.role === 'admin') {
        const { status, adminNotes } = req.body;
        report.status = status || report.status;
        report.adminNotes = adminNotes ?? report.adminNotes;

        if (status === 'resolved' && !report.resolvedDate) {
            report.resolvedDate = new Date();
        } else if (status !== 'resolved') {
            report.resolvedDate = null;
        }

    } else if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || report.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this report');
        }
        if (report.status !== 'pending') {
            res.status(400);
            throw new Error('Can only update pending reports.');
        }

        const { title, content } = req.body;
        report.title = title || report.title;
        report.content = content || report.content;

        // Nếu resident upload lại ảnh
        if (req.file) {
            report.images = [`/uploads/reports/${req.file.filename}`];
        }
    } else {
        res.status(403);
        throw new Error('Not authorized to update this report');
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
});

// ======================================================
// DELETE: Xoá phản ánh (Admin only)
// ======================================================
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    await Report.deleteOne({ _id: report._id });
    res.json({ message: 'Report removed' });
});

// ======================================================
// GET: Dashboard thống kê (Admin only)
// ======================================================
const getStats = asyncHandler(async (req, res) => {
    try {
        const totalResidents = await Resident.countDocuments();
        const totalApartments = await Apartment.countDocuments();
        const occupiedApartmentIds = await Resident.distinct('apartment');
        const occupiedApartments = occupiedApartmentIds.length;
        const unpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });

        const totalReports = await Report.countDocuments();
        const pendingReports = await Report.countDocuments({ status: 'pending' });
        const resolvedReports = await Report.countDocuments({ status: 'resolved' });

        const totalRevenueAgg = await Invoice.aggregate([
            { $match: { status: 'paid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalDebtAgg = await Invoice.aggregate([
            { $match: { status: 'unpaid' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        res.json({
            residents: { total: totalResidents },
            apartments: { total: totalApartments, occupied: occupiedApartments },
            invoices: { unpaid: unpaidInvoices },
            reports: { total: totalReports, pending: pendingReports, resolved: resolvedReports },
            financials: {
                totalRevenue: totalRevenueAgg[0]?.total || 0,
                totalDebt: totalDebtAgg[0]?.total || 0,
            },
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
