// backend/src/models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = mongoose.Schema({
    apartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    resident: { // Người chịu trách nhiệm chính (chủ hộ)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
    year: {
        type: Number,
        required: true,
    },
    electricityBill: {
        type: Number,
        default: 0,
    },
    waterBill: {
        type: Number,
        default: 0,
    },
    serviceFee: {
        type: Number,
        default: 0,
    },
    otherFees: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    paymentDate: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['paid', 'unpaid', 'overdue', 'pending_payment'], // pending_payment cho thanh toán online
        default: 'unpaid',
    },
    notes: {
        type: String,
    },
    paymentMethod: { // Thêm trường phương thức thanh toán
        type: String,
        enum: ['cash', 'online', null],
        default: null,
    }
}, {
    timestamps: true,
});

// Middleware để tính tổng tiền trước khi lưu
invoiceSchema.pre('save', function (next) {
    this.totalAmount = this.electricityBill + this.waterBill + this.serviceFee + this.otherFees;
    next();
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;