// backend/src/controllers/userController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Apartment = require('../models/Apartment');
const Resident = require('../models/Resident');
const Invoice = require('../models/Invoice');
const Report = require('../models/Report');

// @desc    Get all users (for admin management)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    res.json(users);
});

// @desc    Get user by ID (for admin management)
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user (Admin can change role, etc.)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        // Optionally, if role changes from resident, remove resident link
        if (req.body.role && req.body.role !== 'resident' && user.resident) {
            // Consider what to do with the actual Resident profile.
            // For simplicity, we just unlink here. Admin might manually delete resident profile.
            user.resident = undefined;
        }

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            residentId: updatedUser.resident,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin' && req.user._id.toString() === user._id.toString()) {
            res.status(400);
            throw new Error('Cannot delete your own admin account');
        }

        // If user is a resident, also delete the associated resident profile
        if (user.role === 'resident' && user.resident) {
            await Resident.deleteOne({ _id: user.resident });
            // TODO: Update apartment residents count - This needs to be done carefully
            // The residentController's deleteResident already handles this.
            // If deleting a user directly, need to manually find the apartment and update.
            // For simplicity, let's assume resident deletion is primarily via residentController.
            // If deleting a user that has a resident profile, ensure that resident profile is also cleared
            // which will trigger the apartment count update.
            // For now, if a user is deleted, their resident profile is also deleted.
            // The apartment count would need a separate trigger or manual update.
        }

        await User.deleteOne({ _id: user._id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get general reports for Admin Dashboard
// @route   GET /api/reports/admin-summary
// @access  Private/Admin
const getAdminSummaryReports = asyncHandler(async (req, res) => {
    // Total Apartments, Occupied, Empty, Maintenance
    const totalApartments = await Apartment.countDocuments();
    const occupiedApartments = await Apartment.countDocuments({ status: 'occupied' });
    const emptyApartments = await Apartment.countDocuments({ status: 'empty' });
    const maintenanceApartments = await Apartment.countDocuments({ status: 'maintenance' });

    // Total Residents
    const totalResidents = await Resident.countDocuments();

    // Invoices summary
    const totalUnpaidInvoices = await Invoice.countDocuments({ status: 'unpaid' });
    const totalOverdueInvoices = await Invoice.countDocuments({ status: 'overdue' });
    const totalPendingPaymentInvoices = await Invoice.countDocuments({ status: 'pending_payment' });

    // Sum of unpaid/overdue amounts
    const unpaidAmounts = await Invoice.aggregate([
        { $match: { status: { $in: ['unpaid', 'overdue', 'pending_payment'] } } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalOutstandingAmount = unpaidAmounts.length > 0 ? unpaidAmounts[0].total : 0;

    // Reports summary
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const inProgressReports = await Report.countDocuments({ status: 'in_progress' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });

    res.json({
        apartments: {
            total: totalApartments,
            occupied: occupiedApartments,
            empty: emptyApartments,
            maintenance: maintenanceApartments,
        },
        residents: {
            total: totalResidents,
        },
        invoices: {
            totalUnpaid: totalUnpaidInvoices,
            totalOverdue: totalOverdueInvoices,
            totalPendingPayment: totalPendingPaymentInvoices,
            totalOutstandingAmount: totalOutstandingAmount,
        },
        reports: {
            pending: pendingReports,
            inProgress: inProgressReports,
            resolved: resolvedReports,
        },
    });
});

// @desc    Get monthly invoice report (Admin)
// @route   GET /api/reports/monthly-invoice-summary
// @access  Private/Admin
const getMonthlyInvoiceSummary = asyncHandler(async (req, res) => {
    const { year } = req.query;
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const monthlySummary = await Invoice.aggregate([
        {
            $match: {
                year: targetYear,
            }
        },
        {
            $group: {
                _id: '$month',
                totalPaid: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'paid'] }, '$totalAmount', 0]
                    }
                },
                totalUnpaid: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'unpaid'] }, '$totalAmount', 0]
                    }
                },
                totalOverdue: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'overdue'] }, '$totalAmount', 0]
                    }
                },
                totalPendingPayment: {
                    $sum: {
                        $cond: [{ $eq: ['$status', 'pending_payment'] }, '$totalAmount', 0]
                    }
                },
                totalInvoices: { $sum: '$totalAmount' }
            }
        },
        {
            $sort: { _id: 1 } // Sort by month
        }
    ]);

    // Fill in months with no data
    const fullYearSummary = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        totalPaid: 0,
        totalUnpaid: 0,
        totalOverdue: 0,
        totalPendingPayment: 0,
        totalInvoices: 0,
    }));

    monthlySummary.forEach(data => {
        const monthIndex = data._id - 1;
        fullYearSummary[monthIndex] = {
            month: data._id,
            totalPaid: data.totalPaid,
            totalUnpaid: data.totalUnpaid,
            totalOverdue: data.totalOverdue,
            totalPendingPayment: data.totalPendingPayment,
            totalInvoices: data.totalInvoices,
        };
    });

    res.json(fullYearSummary);
});


module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getAdminSummaryReports,
    getMonthlyInvoiceSummary,
};