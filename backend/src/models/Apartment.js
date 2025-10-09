// backend/src/models/Apartment.js
const mongoose = require('mongoose');

const apartmentSchema = mongoose.Schema({
    apartmentCode: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    area: { // Diện tích (m²)
        type: Number,
        required: true,
    },
    floor: { // Tầng
        type: Number,
        required: true,
    },
    residentsCount: { // Số cư dân trong căn hộ (có thể tự tính hoặc lưu)
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['empty', 'occupied', 'maintenance'],
        default: 'empty',
    },
}, {
    timestamps: true,
});

const Apartment = mongoose.model('Apartment', apartmentSchema);

module.exports = Apartment;