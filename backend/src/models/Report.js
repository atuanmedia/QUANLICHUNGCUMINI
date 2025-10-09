// backend/src/models/Report.js
const mongoose = require('mongoose');

const reportSchema = mongoose.Schema({
    apartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    resident: { // Người gửi phản ánh
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resident',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    images: [{ // Mảng URL ảnh
        type: String,
    }],
    status: {
        type: String,
        enum: ['pending', 'in_progress', 'resolved', 'rejected'],
        default: 'pending',
    },
    adminNotes: { // Ghi chú xử lý của admin
        type: String,
    },
    resolvedDate: {
        type: Date,
    },
}, {
    timestamps: true,
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;