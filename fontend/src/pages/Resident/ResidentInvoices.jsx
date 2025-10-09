import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaWallet } from "react-icons/fa";
import { motion } from "framer-motion";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import "../../styles/client/resident-invoices.css";

const ResidentInvoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInvoices(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải hóa đơn:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  if (loading) return <div className="invoice-loading">Đang tải hóa đơn...</div>;

  return (
    <div className="invoice-page">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="invoice-title"
      >
        💰 Hóa đơn của bạn
      </motion.h1>

      {invoices.length === 0 ? (
        <div className="invoice-empty">Không có hóa đơn nào hiển thị.</div>
      ) : (
        <div className="invoice-grid">
          {invoices.map((inv) => (
            <motion.div
              key={inv._id}
              className={`invoice-card ${
                inv.status === "paid"
                  ? "paid"
                  : inv.status === "unpaid"
                  ? "unpaid"
                  : "pending"
              }`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <div className="invoice-header">
                <h3>
                  Căn hộ: {inv.apartment?.apartmentCode || "N/A"} ({inv.month}/{inv.year})
                </h3>
                {inv.status === "paid" ? (
                  <FaCheckCircle className="icon paid-icon" />
                ) : inv.status === "unpaid" ? (
                  <FaExclamationCircle className="icon unpaid-icon" />
                ) : (
                  <FaWallet className="icon pending-icon" />
                )}
              </div>

              <ul className="invoice-detail">
                <li>💡 Điện: {inv.electricityBill?.toLocaleString()} ₫</li>
                <li>🚿 Nước: {inv.waterBill?.toLocaleString()} ₫</li>
                <li>🏢 Dịch vụ: {inv.serviceFee?.toLocaleString()} ₫</li>
                <li>📦 Khác: {inv.otherFees?.toLocaleString()} ₫</li>
              </ul>

              <div className="invoice-footer">
                <p>
                  <b>Tổng cộng:</b>{" "}
                  <span className="total">
                    {(
                      (inv.electricityBill || 0) +
                      (inv.waterBill || 0) +
                      (inv.serviceFee || 0) +
                      (inv.otherFees || 0)
                    ).toLocaleString()}{" "}
                    ₫
                  </span>
                </p>

                {inv.status === "unpaid" && (
                  <button className="btn-pay">Thanh toán ngay</button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentInvoices;
