const dotenv = require('dotenv');
const colors = require('colors');
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');

// Load ENV
dotenv.config();

// Connect MongoDB
connectDB();

// ====== IMPORT MODELS ======
const User = require('./src/models/User');
const Apartment = require('./src/models/Apartment');
const Resident = require('./src/models/Resident');
const Invoice = require('./src/models/Invoice');
const Report = require('./src/models/Report');
const Announcement = require('./src/models/Announcement');
const TemporaryResidence = require('./src/models/TemporaryResidence'); // ✅ thêm mới

// ====== IMPORT DATA FUNCTION ======
const importData = async () => {
  try {
    console.log('🧹 Đang xóa dữ liệu cũ...'.yellow);
    await Promise.all([
      User.deleteMany(),
      Apartment.deleteMany(),
      Resident.deleteMany(),
      Invoice.deleteMany(),
      Report.deleteMany(),
      Announcement.deleteMany(),
      TemporaryResidence.deleteMany(),
    ]);

    console.log('🧨 Data cleared!'.red.inverse);

    // ====== Admin user ======
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    console.log(`✅ Admin User created: ${adminUser.email}`.cyan.inverse);

    // ====== Apartments ======
    const apartments = [];
    for (let i = 1; i <= 6; i++) {
      const apartment = await Apartment.create({
        apartmentCode: `A${100 + i}`,
        name: `Căn hộ số ${i}`,
        area: 50 + i * 5,
        floor: i,
        status: i % 2 === 0 ? 'occupied' : 'empty',
      });
      apartments.push(apartment);
    }
    console.log('🏠 Apartments created!'.green.inverse);

    // ====== Residents ======
    const residents = [];
    for (let i = 0; i < 3; i++) {
      const apt = apartments[i * 2]; // dùng căn chẵn
      const residentUser = await User.create({
        name: `Resident ${i + 1}`,
        email: `resident${i + 1}@example.com`,
        password: 'password123',
        role: 'resident',
      });

      const resident = await Resident.create({
        user: residentUser._id,
        fullName: `Nguyễn Văn Cư Dân ${i + 1}`,
        dateOfBirth: new Date(1990 + i, 5, 15),
        phoneNumber: `090123456${i}`,
        idCardNumber: `12345678901${i}`,
        email: residentUser.email,
        apartment: apt._id,
        isHeadOfHousehold: true,
        avatar: `https://api.dicebear.com/7.x/personas/svg?seed=resident${i + 1}`,
      });

      residents.push(resident);
      apt.status = 'occupied';
      apt.residentsCount = 1;
      await apt.save();
    }
    console.log('👥 Residents created!'.green.inverse);

    // ====== Invoices ======
    const invoices = [];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (const resident of residents) {
      const apartment = resident.apartment;

      const invoice1 = await Invoice.create({
        apartment: apartment,
        resident: resident._id,
        month: currentMonth - 1,
        year: currentYear,
        electricityBill: 150000,
        waterBill: 80000,
        serviceFee: 200000,
        otherFees: 0,
        dueDate: new Date(currentYear, currentMonth - 1, 20),
        status: 'unpaid',
      });

      const invoice2 = await Invoice.create({
        apartment: apartment,
        resident: resident._id,
        month: currentMonth - 2,
        year: currentYear,
        electricityBill: 120000,
        waterBill: 70000,
        serviceFee: 200000,
        otherFees: 0,
        dueDate: new Date(currentYear, currentMonth - 2, 20),
        status: 'paid',
        paymentDate: new Date(currentYear, currentMonth - 2, 15),
        paymentMethod: 'cash',
      });

      invoices.push(invoice1, invoice2);
    }
    console.log('💵 Invoices created!'.green.inverse);

    // ====== Reports ======
    for (const resident of residents) {
      await Report.create({
        apartment: resident.apartment,
        resident: resident._id,
        title: `Sửa chữa vòi nước căn ${resident.apartment.apartmentCode}`,
        content: 'Vòi nước nhà tôi bị rò rỉ, cần được xử lý sớm.',
        status: 'pending',
      });

      await Report.create({
        apartment: resident.apartment,
        resident: resident._id,
        title: `Thang máy hỏng tầng ${resident.apartment.floor}`,
        content: 'Thang máy dừng giữa tầng, cần sửa chữa khẩn cấp.',
        status: 'resolved',
        adminNotes: 'Đã sửa xong, hoạt động bình thường.',
        resolvedDate: new Date(),
      });
    }
    console.log('📋 Reports created!'.green.inverse);

    // ====== Announcements ======
    await Announcement.create([
      {
        title: 'Thông báo bảo trì điện nước',
        content: 'Tòa nhà bảo trì điện nước ngày 10/10/2025, từ 8h - 12h.',
        scope: 'system',
        issuedBy: adminUser._id,
      },
      {
        title: 'Nhắc thanh toán phí dịch vụ',
        content: 'Vui lòng thanh toán phí dịch vụ trước ngày 25/10/2025.',
        scope: 'system',
        issuedBy: adminUser._id,
      },
    ]);
    console.log('📢 Announcements created!'.green.inverse);

    // ====== Temporary Residence / Absence ======
    const tempRecords = [
      {
        resident: residents[0]._id,
        type: 'tam_tru',
        fromDate: new Date('2025-10-01'),
        toDate: new Date('2025-10-31'),
        reason: 'Đi công tác tại TP.HCM',
        place: 'Quận 1, TP.HCM',
        createdBy: adminUser._id,
      },
      {
        resident: residents[1]._id,
        type: 'tam_vang',
        fromDate: new Date('2025-09-05'),
        toDate: new Date('2025-09-15'),
        reason: 'Về quê thăm gia đình',
        place: 'Đà Lạt, Lâm Đồng',
        createdBy: adminUser._id,
      },
    ];

    await TemporaryResidence.insertMany(tempRecords);
    console.log('📝 Temporary residence/absence created!'.green.inverse);

    console.log('🎉 Tất cả dữ liệu mẫu đã được nhập thành công!'.bgGreen.white.bold);
    process.exit();
  } catch (error) {
    console.error(`❌ Lỗi khi seed: ${error.message}`.red.inverse);
    process.exit(1);
  }
};

// ====== DELETE ALL DATA FUNCTION ======
const destroyData = async () => {
  try {
    await Promise.all([
      User.deleteMany(),
      Apartment.deleteMany(),
      Resident.deleteMany(),
      Invoice.deleteMany(),
      Report.deleteMany(),
      Announcement.deleteMany(),
      TemporaryResidence.deleteMany(),
    ]);

    console.log('🗑️ Tất cả dữ liệu đã bị xóa!'.bgRed.white);
    process.exit();
  } catch (error) {
    console.error(`${error}`.red.inverse);
    process.exit(1);
  }
};

// ====== RUN SCRIPT ======
if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
