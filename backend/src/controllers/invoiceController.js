const asyncHandler = require('express-async-handler');
const Invoice = require('../models/Invoice');
const Apartment = require('../models/Apartment');
const Resident = require('../models/Resident');


// =========================
// 🔹 LẤY HÓA ĐƠN THEO CƯ DÂN
// =========================
const getInvoicesByResident = asyncHandler(async (req, res) => {
  const resident = await Resident.findById(req.params.id).populate("apartment", "_id apartmentCode name");
  if (!resident) {
    return res.status(404).json({ message: "Resident not found" });
  }

  const filter = {
    $or: [
      { resident: resident._id },
      { apartment: resident.apartment?._id },
    ],
  };

  if (req.query.status) filter.status = req.query.status;

  const invoices = await Invoice.find(filter)
    .populate("apartment", "apartmentCode name")
    .populate("resident", "fullName email phoneNumber")
    .sort({ year: -1, month: -1, dueDate: 1 });

  res.json(invoices || []);
});


// =========================
// 🔹 LẤY DANH SÁCH HÓA ĐƠN
// =========================
const getInvoices = asyncHandler(async (req, res) => {
  const { status, apartmentId, month, year, search } = req.query;
  let query = {};

  if (req.user.role === "resident") {
    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident) {
      res.status(404);
      throw new Error("Resident profile not found for current user.");
    }
    query.resident = resident._id;
    query.apartment = resident.apartment;
  } else {
    if (apartmentId) query.apartment = apartmentId;
  }

  if (status) query.status = status;
  if (month) query.month = month;
  if (year) query.year = year;

  // 🔎 Tìm kiếm thông minh
  if (search) {
    const apartments = await Apartment.find({
      $or: [
        { apartmentCode: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ],
    });
    const apartmentIds = apartments.map((apt) => apt._id);

    const matchPeriod = search.match(/^(\d{4})[-/](\d{1,2})$/);
    const typeMap = {
      điện: "electricityBill",
      nước: "waterBill",
      phí: "serviceFee",
      quản: "serviceFee",
      khác: "otherFees",
    };
    const typeKey = Object.keys(typeMap).find((k) =>
      search.toLowerCase().includes(k)
    );

    const orConditions = [];
    if (apartmentIds.length > 0) orConditions.push({ apartment: { $in: apartmentIds } });
    if (typeKey) orConditions.push({ [typeMap[typeKey]]: { $gt: 0 } });
    if (matchPeriod)
      orConditions.push({
        year: Number(matchPeriod[1]),
        month: Number(matchPeriod[2]),
      });

    if (orConditions.length > 0) query.$or = orConditions;
  }

  const invoices = await Invoice.find(query)
    .populate("apartment", "apartmentCode name")
    .populate("resident", "fullName phoneNumber")
    .sort({ year: -1, month: -1, dueDate: 1 });

  res.json(invoices);
});


// =========================
// 🔹 LẤY HÓA ĐƠN THEO ID
// =========================
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("apartment", "apartmentCode name")
    .populate("resident", "fullName phoneNumber");

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  if (req.user.role === "resident") {
    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident || invoice.resident.toString() !== resident._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this invoice");
    }
  }

  res.json(invoice);
});


// =========================
// 🔹 TẠO MỚI HÓA ĐƠN
// =========================
const createInvoice = asyncHandler(async (req, res) => {
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
    notes,
  } = req.body;

  const existingApartment = await Apartment.findById(apartment);
  if (!existingApartment) {
    res.status(404);
    throw new Error("Apartment not found");
  }

  const headOfHousehold = await Resident.findOne({
    apartment,
    isHeadOfHousehold: true,
  });
  const fallbackResident = await Resident.findOne({ apartment });
  const residentId = headOfHousehold?._id || fallbackResident?._id || null;

  const existingInvoice = await Invoice.findOne({ apartment, month, year });
  if (existingInvoice) {
    res.status(400);
    throw new Error(
      `Invoice for apartment ${existingApartment.apartmentCode} in ${month}/${year} already exists.`
    );
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
    status: status || "unpaid",
    notes,
  });

  const createdInvoice = await invoice.save();
  res.status(201).json(createdInvoice);
});


// =========================
// 🔹 CẬP NHẬT HÓA ĐƠN
// =========================
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  if (req.user.role === "admin") {
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

    if (apartment && apartment !== invoice.apartment.toString()) {
      const newApartment = await Apartment.findById(apartment);
      if (!newApartment) {
        res.status(404);
        throw new Error("New apartment not found");
      }
      const newHeadOfHousehold = await Resident.findOne({
        apartment,
        isHeadOfHousehold: true,
      });
      invoice.resident = newHeadOfHousehold ? newHeadOfHousehold._id : null;
    }

    invoice.apartment = apartment || invoice.apartment;
    invoice.month = month || invoice.month;
    invoice.year = year || invoice.year;
    invoice.electricityBill = electricityBill ?? invoice.electricityBill;
    invoice.waterBill = waterBill ?? invoice.waterBill;
    invoice.serviceFee = serviceFee ?? invoice.serviceFee;
    invoice.otherFees = otherFees ?? invoice.otherFees;
    invoice.dueDate = dueDate || invoice.dueDate;
    invoice.status = status || invoice.status;
    invoice.paymentDate = paymentDate || invoice.paymentDate;
    invoice.paymentMethod = paymentMethod || invoice.paymentMethod;
    invoice.notes = notes || invoice.notes;
  } else if (req.user.role === "resident") {
    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident || invoice.resident.toString() !== resident._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to update this invoice");
    }

    const { status, paymentMethod } = req.body;
    if (status && (status === "paid" || status === "pending_payment")) {
      invoice.status = status;
      invoice.paymentMethod = paymentMethod || "cash";
      invoice.paymentDate = new Date();
    } else {
      res.status(400);
      throw new Error(
        "Residents can only mark invoices as paid or pending payment."
      );
    }
  }

  const updatedInvoice = await invoice.save();
  res.json(updatedInvoice);
});


// =========================
// 🔹 XÓA HÓA ĐƠN
// =========================
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);
  if (invoice) {
    await Invoice.deleteOne({ _id: invoice._id });
    res.json({ message: "Invoice removed" });
  } else {
    res.status(404);
    throw new Error("Invoice not found");
  }
});


// =========================
// 🔹 XUẤT PDF HÓA ĐƠN
// =========================
const generateInvoicePdf = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate("apartment", "apartmentCode name")
    .populate("resident", "fullName phoneNumber email");

  if (!invoice) {
    res.status(404);
    throw new Error("Invoice not found");
  }

  if (req.user.role === "resident") {
    const resident = await Resident.findOne({ user: req.user._id });
    if (!resident || invoice.resident.toString() !== resident._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to view this invoice PDF");
    }
  }

  res.json({
    message:
      "Returning invoice data for PDF generation (actual PDF generation not implemented in backend)",
    invoiceData: invoice,
  });
});


// ==============================
// 💰 THỐNG KÊ THU - CHI
// ==============================
const getMonthlyFinanceStats = asyncHandler(async (req, res) => {
  const year = parseInt(req.query.year) || new Date().getFullYear();
  const invoices = await Invoice.find({ year });

  const monthlyStats = Array(12).fill().map((_, i) => ({
    month: i + 1,
    income: 0,
    expense: 0,
  }));

  invoices.forEach((inv) => {
    const monthIdx = inv.month - 1;
    const total =
      (inv.electricityBill || 0) +
      (inv.waterBill || 0) +
      (inv.serviceFee || 0) +
      (inv.otherFees || 0);
    monthlyStats[monthIdx].income += total;
  });

  res.json({ year, monthlyStats });
});

const getYearlyFinanceStats = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({});
  const yearlyStats = {};

  invoices.forEach((inv) => {
    const year = inv.year;
    const total =
      (inv.electricityBill || 0) +
      (inv.waterBill || 0) +
      (inv.serviceFee || 0) +
      (inv.otherFees || 0);
    if (!yearlyStats[year]) yearlyStats[year] = { income: 0 };
    yearlyStats[year].income += total;
  });

  const result = Object.keys(yearlyStats).map((y) => ({
    year: Number(y),
    ...yearlyStats[y],
  }));

  res.json(result.sort((a, b) => a.year - b.year));
});


// =========================
// 📤 EXPORT MODULE
// =========================
module.exports = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  generateInvoicePdf,
  getInvoicesByResident,
  getMonthlyFinanceStats,
  getYearlyFinanceStats,
};
