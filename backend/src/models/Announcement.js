// backend/src/models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    scope: { // Phạm vi thông báo
        type: String,
        enum: ['system', 'apartment'], // Toàn hệ thống hoặc theo căn hộ
        default: 'system',
    },
    targetApartment: { // Nếu scope là 'apartment', chỉ định căn hộ
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: function() { return this.scope === 'apartment'; }, // Chỉ bắt buộc nếu scope là 'apartment'
    },
    issuedBy: { // Admin tạo thông báo
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // User với role 'admin'
        required: true,
    },
    publishDate: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

const Announcement = mongoose.model('Announcement', announcementSchema);

module.exports = Announcement;