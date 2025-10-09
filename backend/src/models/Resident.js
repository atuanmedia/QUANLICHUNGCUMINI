// backend/src/models/Resident.js
const mongoose = require('mongoose');

const residentSchema = mongoose.Schema({
    user: { // Liên kết với tài khoản User (để đăng nhập)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Mỗi resident chỉ có 1 user account
    },
    fullName: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
    },
    idCardNumber: { // Số căn cước
        type: String,
        required: true,
        unique: true,
    },
    email: { // Có thể giống email của User, nhưng cũng có thể là email khác
        type: String,
        required: true,
        unique: true,
    },
    apartment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Apartment',
        required: true,
    },
    isHeadOfHousehold: { // Có phải chủ hộ không
        type: Boolean,
        default: false,
    },
    avatar: { // URL ảnh đại diện
        type: String,
        default: 'https://i.ibb.co/4pDNDKq/avatar.png', // Placeholder avatar
    },
}, {
    timestamps: true,
});

const Resident = mongoose.model('Resident', residentSchema);

module.exports = Resident;