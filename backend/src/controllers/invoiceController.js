// backend/src/controllers/invoiceController.js
const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Apartment = require('../models/Apartment');
const Resident = require('../models/Resident');


// @desc    Get invoices by resident ID (include invoices linked by apartment if resident is null)
// @route   GET /api/invoices/resident/:id
// @access  Private
const getInvoicesByResident = asyncHandler(async (req, res) => {
  // 1️⃣ Tìm thông tin cư dân và căn hộ của họ
  const resident = await Resident.findById(req.params.id).populate("apartment", "_id apartmentCode name");
  if (!resident) {
    return res.status(404).json({ message: "Resident not found" });
  }

  // 2️⃣ Tạo điều kiện lọc: theo resident hoặc theo apartment (fallback nếu resident = null)
  const filter = {
    $or: [
      { resident: resident._id },
      { apartment: resident.apartment?._id }
    ]
  };

  // 3️⃣ Nếu có filter status (?status=unpaid)
  if (req.query.status) filter.status = req.query.status;

  // 4️⃣ Truy vấn dữ liệu
  const invoices = await Invoice.find(filter)
    .populate("apartment", "apartmentCode name")
    .populate("resident", "fullName email phoneNumber")
    .sort({ year: -1, month: -1, dueDate: 1 });

  // 5️⃣ Nếu không có kết quả thì trả mảng rỗng (tránh lỗi 404 trên frontend)
  res.json(invoices || []);
});



// @desc    Get all invoices (Admin) or invoices for a specific resident/apartment (Resident)
// @route   GET /api/invoices
// @access  Private/Admin, Private/Resident
// @desc    Get all invoices (Admin) or invoices for a specific resident/apartment (Resident)
// @route   GET /api/invoices
// @access  Private/Admin, Private/Resident
const getInvoices = asyncHandler(async (req, res) => {
    const { status, apartmentId, month, year, search } = req.query;
    let query = {};

    if (req.user.role === 'resident') {
        // Residents can only see their own invoices
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident) {
            res.status(404);
            throw new Error('Resident profile not found for current user.');
        }
        query.resident = resident._id;
        query.apartment = resident.apartment;
    } else {
        if (apartmentId) query.apartment = apartmentId;
    }

    if (status) query.status = status;
    if (month) query.month = month;
    if (year) query.year = year;

    // ✅ Tìm kiếm thông minh
    if (search) {
        const apartments = await Apartment.find({
            $or: [
                { apartmentCode: { $regex: search, $options: 'i' } },
                { name: { $regex: search, $options: 'i' } }
            ]
        });
        const apartmentIds = apartments.map((apt) => apt._id);

        // Nếu người dùng nhập kỳ kiểu "2025-10" thì tách ra
        const matchPeriod = search.match(/^(\d{4})[-/](\d{1,2})$/);

        // Ánh xạ từ khóa loại hóa đơn sang field trong DB
        const typeMap = {
            "điện": "electricityBill",
            "nước": "waterBill",
            "phí": "serviceFee",
            "quản lý": "serviceFee",
            "khác": "otherFees"
        };
        const typeKey = Object.keys(typeMap).find(k =>
            search.toLowerCase().includes(k)
        );

        const orConditions = [];

        if (apartmentIds.length > 0) {
            orConditions.push({ apartment: { $in: apartmentIds } });
        }
        if (typeKey) {
            orConditions.push({ [typeMap[typeKey]]: { $gt: 0 } });
        }
        if (matchPeriod) {
            orConditions.push({
                year: Number(matchPeriod[1]),
                month: Number(matchPeriod[2]),
            });
        }

        // Nếu không match gì, fallback về tìm kiếm trống để không lỗi
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
    }

    const invoices = await Invoice.find(query)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber')
        .sort({ year: -1, month: -1, dueDate: 1 });

    res.json(invoices);
});


// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private/Admin, Private/Resident
const getInvoiceById = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber');

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    // If resident role, ensure they own this invoice
    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || invoice.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this invoice');
        }
    }

    res.json(invoice);
});

// @desc    Create new invoice (Admin only)
// @route   POST /api/invoices
// @access  Private/Admin
const createInvoice = asyncHandler(async (req, res) => {
    console.log("📦 Dữ liệu nhận từ frontend:", req.body);
    const {
        apartment, // Apartment ID
        month,
        year,
        electricityBill,
        waterBill,
        serviceFee,
        otherFees,
        dueDate,
        status,
        notes,
    } = req.body;

    // Check if apartment exists
    const existingApartment = await Apartment.findById(apartment);
    if (!existingApartment) {
        res.status(404);
        throw new Error('Apartment not found');
    }

    // Find the head of household for this apartment to link to the invoice
    const headOfHousehold = await Resident.findOne({ apartment, isHeadOfHousehold: true });
    const fallbackResident = await Resident.findOne({ apartment });
    let residentId = headOfHousehold?._id || fallbackResident?._id || null;
    // Check if invoice for this apartment/month/year already exists
    const existingInvoice = await Invoice.findOne({ apartment, month, year });
    if (existingInvoice) {
        res.status(400);
        throw new Error(`Invoice for apartment ${existingApartment.apartmentCode} in ${month}/${year} already exists.`);
    }

    const invoice = new Invoice({
        apartment,
        resident: residentId,
        month,
        year,
        electricityBill: electricityBill || 0,
        waterBill: waterBill || 0,
        serviceFee: serviceFee || 0,
        otherFees: otherFees || 0,
        dueDate,
        status: status || 'unpaid',
        notes,
    });

    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
});

// @desc    Update an invoice (Admin only for most fields, Resident for payment status)
// @route   PUT /api/invoices/:id
// @access  Private/Admin, Private/Resident
const updateInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    if (req.user.role === 'admin') {
        // Admin can update all fields
        const {
            apartment,
            month,
            year,
            electricityBill,
            waterBill,
            serviceFee,
            otherFees,
            dueDate,
            status,
            paymentDate,
            paymentMethod,
            notes,
        } = req.body;

        // If apartment is changed, ensure the new one exists
        if (apartment && apartment !== invoice.apartment.toString()) {
            const newApartment = await Apartment.findById(apartment);
            if (!newApartment) {
                res.status(404);
                throw new Error('New apartment not found');
            }
            // Update resident link if apartment changes and head of household is different
            const newHeadOfHousehold = await Resident.findOne({ apartment, isHeadOfHousehold: true });
            invoice.resident = newHeadOfHousehold ? newHeadOfHousehold._id : null;
        }

        invoice.apartment = apartment || invoice.apartment;
        invoice.month = month || invoice.month;
        invoice.year = year || invoice.year;
        invoice.electricityBill = electricityBill ?? invoice.electricityBill; // Use nullish coalescing for 0 values
        invoice.waterBill = waterBill ?? invoice.waterBill;
        invoice.serviceFee = serviceFee ?? invoice.serviceFee;
        invoice.otherFees = otherFees ?? invoice.otherFees;
        invoice.dueDate = dueDate || invoice.dueDate;
        invoice.status = status || invoice.status;
        invoice.paymentDate = paymentDate || invoice.paymentDate;
        invoice.paymentMethod = paymentMethod || invoice.paymentMethod;
        invoice.notes = notes || invoice.notes;

    } else if (req.user.role === 'resident') {
        // Residents can only update payment status to 'pending_payment' (for online) or 'paid' (for cash)
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || invoice.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to update this invoice');
        }

        const { status, paymentMethod } = req.body;

        if (status && (status === 'paid' || status === 'pending_payment')) {
            invoice.status = status;
            invoice.paymentMethod = paymentMethod || 'cash'; // Default to cash if not specified
            invoice.paymentDate = new Date(); // Record payment date
        } else {
            res.status(400);
            throw new Error('Residents can only mark invoices as paid or pending payment.');
        }
    }

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
});

// @desc    Delete an invoice (Admin only)
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id);

    if (invoice) {
        await Invoice.deleteOne({ _id: invoice._id });
        res.json({ message: 'Invoice removed' });
    } else {
        res.status(404);
        throw new Error('Invoice not found');
    }
});

// @desc    Generate PDF (placeholder - just return JSON for now)
// @route   GET /api/invoices/:id/pdf
// @access  Private/Admin, Private/Resident
const generateInvoicePdf = asyncHandler(async (req, res) => {
    const invoice = await Invoice.findById(req.params.id)
        .populate('apartment', 'apartmentCode name')
        .populate('resident', 'fullName phoneNumber email');

    if (!invoice) {
        res.status(404);
        throw new Error('Invoice not found');
    }

    // If resident role, ensure they own this invoice
    if (req.user.role === 'resident') {
        const resident = await Resident.findOne({ user: req.user._id });
        if (!resident || invoice.resident.toString() !== resident._id.toString()) {
            res.status(403);
            throw new Error('Not authorized to view this invoice PDF');
        }
    }

    // In a real app, you would use a library like 'pdfkit' or 'html-pdf' here
    // For now, we'll just return the invoice data as JSON for simplicity.
    // Frontend can use this data to render a printable view.
    res.json({
        message: 'Returning invoice data for PDF generation (actual PDF generation not implemented in backend)',
        invoiceData: invoice
    });
});

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    generateInvoicePdf,
    getInvoicesByResident,
};