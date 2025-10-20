import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/api";
import "../../styles/client/dashboard-client.css";

const DashboardResident = () => {
  const { user } = useAuth();
  const [resident, setResident] = useState(null);
  const [unpaidInvoices, setUnpaidInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // ✅ Lấy thông tin hồ sơ cư dân (gồm apartment populate)
        const profileRes = await api.get("/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Backend profile trả về user + residentDetails
        const residentData = profileRes.data?.residentDetails || null;
        setResident(residentData);

        // ✅ Nếu có residentId thì lấy hóa đơn chưa thanh toán
        const residentId =
          profileRes.data?.residentId ||
          residentData?._id ||
          user?.resident?._id;

        if (residentId) {
          const invoiceRes = await api.get(
            `/invoices/resident/${residentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          // Lọc ra các hóa đơn có status = 'unpaid'
          const unpaid = invoiceRes.data.filter(
            (inv) => inv.status === "unpaid"
          );
          setUnpaidInvoices(unpaid);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    fetchData();
  }, [user]);

  return (
    <div className="resident-dashboard">
      <h1 className="resident-dashboard-title">
        👋 Xin chào, {resident?.fullName || user?.name || "Cư dân"}!
      </h1>

      <p className="resident-dashboard-sub">
        Chào mừng bạn đến với cổng thông tin cư dân — nơi bạn có thể:
      </p>

      <ul className="resident-feature-list">
        <li>📢 <a href="/announcements">Xem thông báo mới nhất từ ban quản lý.</a></li>
        <li>💰 <a href="/invoices">Kiểm tra và thanh toán hóa đơn điện nước.</a></li>
        <li>🧾 <a href="/reports">Gửi và theo dõi báo cáo/sự cố của căn hộ.</a></li>
      </ul>

      <div className="resident-card-container">
        {/* 🧍‍♂️ Thông tin cư dân */}
        <div className="resident-card">
          <h3>🏠 Thông tin cư dân</h3>
          <p>
            <b>Họ tên:</b> {resident?.fullName || "—"}
          </p>
          <p>
            <b>Email:</b> {resident?.email || user?.email || "—"}
          </p>
          <p>
            <b>Số điện thoại:</b> {resident?.phoneNumber || "—"}
          </p>
        </div>

        {/* 🏢 Thông tin căn hộ */}
        <div className="resident-card">
          <h3>🏢 Thông tin căn hộ</h3>
          <p>
            <b>Mã căn hộ:</b>{" "}
            {resident?.apartment?.apartmentCode ||
              resident?.apartment?.code ||
              "—"}
          </p>
          <p>
            <b>Tầng:</b> {resident?.apartment?.floor || "—"}
          </p>
          <p>
            <b>Trạng thái:</b>{" "}
            {resident?.apartment?.status === "occupied"
              ? "Đang ở"
              : resident?.apartment?.status === "empty"
                ? "Trống"
                : "—"}
          </p>
        </div>

        {/* 💰 Hóa đơn chưa thanh toán */}
        <div className="resident-card">
          <h3>💰 Hóa đơn chưa thanh toán</h3>
          {unpaidInvoices.length > 0 ? (
            <ul>
              {unpaidInvoices.map((inv) => (
                <li key={inv._id}>
                  <b>
                    {inv.month}/{inv.year}
                  </b>{" "}
                  —{" "}
                  {(
                    inv.electricityBill +
                    inv.waterBill +
                    inv.serviceFee +
                    inv.otherFees
                  ).toLocaleString()}{" "}
                  ₫
                </li>
              ))}
            </ul>
          ) : (
            <p>Tất cả hóa đơn đã được thanh toán 🎉</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardResident;
