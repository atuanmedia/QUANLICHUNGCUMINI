import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api"; // ✅ dùng instance có interceptor

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    apartment: "",
    type: "management_fee",
    amount: "",
    dueDate: "",
    status: "unpaid",
    period: "",
  });

  // 📦 Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      console.log("📄 [Invoice] Fetching invoices...");
      const { data } = await api.get("/invoices", {
        params: { search: searchTerm },
      });
      setInvoices(data);
    } catch (err) {
      console.error("❌ Error fetching invoices:", err);
      setError("Không thể tải danh sách hóa đơn.");
    } finally {
      setLoading(false);
    }
  };

  // 📦 Lấy danh sách căn hộ
  const fetchApartments = async () => {
    try {
      console.log("🏠 [Invoice] Fetching apartments...");
      const { data } = await api.get("/apartments");
      setApartments(data);
    } catch (err) {
      console.error("❌ Error fetching apartments:", err);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchInvoices();
      fetchApartments();
    }
  }, [user, searchTerm]);

  // 📩 Xử lý form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const resetForm = () => {
    setCurrentInvoice(null);
    setFormData({
      apartment: "",
      type: "management_fee",
      amount: "",
      dueDate: "",
      status: "unpaid",
      period: "",
    });
  };

  // 📤 Thêm / sửa hóa đơn
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const [yearStr, monthStr] = formData.period.split("-");
      const invoiceData = {
        apartment: formData.apartment,
        month: Number(monthStr),
        year: Number(yearStr),
        electricityBill:
          formData.type === "electricity" ? Number(formData.amount) : 0,
        waterBill: formData.type === "water" ? Number(formData.amount) : 0,
        serviceFee:
          formData.type === "management_fee" ? Number(formData.amount) : 0,
        otherFees: formData.type === "other" ? Number(formData.amount) : 0,
        dueDate: formData.dueDate,
        status: formData.status,
      };

      if (currentInvoice) {
        await api.put(`/invoices/${currentInvoice._id}`, invoiceData);
        console.log("✅ [Invoice] Updated:", currentInvoice._id);
      } else {
        await api.post("/invoices", invoiceData);
        console.log("✅ [Invoice] Created new invoice");
      }

      fetchInvoices();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving invoice:", err);
      setError("Không thể lưu hóa đơn.");
    }
  };

  // 📄 Xóa hóa đơn
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa hóa đơn này?")) return;
    try {
      await api.delete(`/invoices/${id}`);
      console.log("🗑️ [Invoice] Deleted:", id);
      fetchInvoices();
    } catch (err) {
      console.error("❌ Error deleting invoice:", err);
      setError("Không thể xóa hóa đơn.");
    }
  };

  // ✏️ Sửa hóa đơn
  const handleEdit = (invoice) => {
    const periodValue =
      invoice.year && invoice.month
        ? `${invoice.year}-${String(invoice.month).padStart(2, "0")}`
        : "";
    setCurrentInvoice(invoice);
    setFormData({
      apartment: invoice.apartment?._id || "",
      type:
        invoice.electricityBill > 0
          ? "electricity"
          : invoice.waterBill > 0
          ? "water"
          : invoice.serviceFee > 0
          ? "management_fee"
          : "other",
      amount:
        invoice.electricityBill ||
        invoice.waterBill ||
        invoice.serviceFee ||
        invoice.otherFees,
      dueDate: invoice.dueDate?.split("T")[0] || "",
      status: invoice.status,
      period: periodValue,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="resident-page">
      <div className="header-flex">
        <h2 className="resident-title">Quản lý hóa đơn</h2>
      </div>

      {/* Form thêm/sửa */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Căn hộ *</label>
            <select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.apartmentCode} - {apt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Loại hóa đơn *</label>
            <select name="type" value={formData.type} onChange={handleChange}>
              <option value="management_fee">Phí quản lý</option>
              <option value="water">Tiền nước</option>
              <option value="electricity">Tiền điện</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số tiền (VND)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Kỳ *</label>
            <input
              type="text"
              name="period"
              value={formData.period}
              onChange={handleChange}
              placeholder="VD: 2025-10"
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày hết hạn *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Trạng thái *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {currentInvoice ? "Cập nhật" : "Thêm mới"}
          </button>
          {currentInvoice && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Tìm kiếm */}
      <div className="resident-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo căn hộ, loại, kỳ..."
          className="resident-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Bảng danh sách hóa đơn */}
      <div className="resident-table">
        <table>
          <thead>
            <tr>
              <th>Căn hộ</th>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Kỳ</th>
              <th>Ngày hết hạn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id}>
                  <td>{inv.apartment?.apartmentCode || "N/A"}</td>
                  <td>
                    {inv.electricityBill > 0
                      ? "Điện"
                      : inv.waterBill > 0
                      ? "Nước"
                      : inv.serviceFee > 0
                      ? "Phí quản lý"
                      : "Khác"}
                  </td>
                  <td>
                    {new Intl.NumberFormat("vi-VN").format(inv.totalAmount)} ₫
                  </td>
                  <td>
                    {inv.year}-{String(inv.month).padStart(2, "0")}
                  </td>
                  <td>{new Date(inv.dueDate).toLocaleDateString("vi-VN")}</td>
                  <td>
                    {inv.status === "paid" ? (
                      <span className="badge-green">Đã thanh toán</span>
                    ) : inv.status === "overdue" ? (
                      <span className="badge-red">Quá hạn</span>
                    ) : (
                      <span className="badge-yellow">Chưa thanh toán</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(inv)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(inv._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InvoiceManagement;
