import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api";

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentInvoice, setCurrentInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    apartment: "",
    type: "management_fee",
    amount: "",
    dueDate: "",
    status: "unpaid",
    period: "",
  });

  // State cho validation errors
  const [errors, setErrors] = useState({
    apartment: "",
    type: "",
    amount: "",
    period: "",
    dueDate: "",
    status: "",
  });

  // 📦 Lấy danh sách hóa đơn
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/invoices", {
        params: { search: searchTerm },
      });
      setInvoices(data);
    } catch (err) {
      console.error("❌ Lỗi tải hóa đơn:", err);
      toast.error("⚠️ Không thể tải danh sách hóa đơn!");
    } finally {
      setLoading(false);
    }
  };

  // 🏢 Lấy danh sách căn hộ
  const fetchApartments = async () => {
    try {
      const { data } = await api.get("/apartments");
      setApartments(data);
    } catch (err) {
      console.error("❌ Lỗi tải căn hộ:", err);
      toast.error("⚠️ Không thể tải danh sách căn hộ!");
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchInvoices();
      fetchApartments();
    }
  }, [user, searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🎯 Validation function
  const validateForm = () => {
    const newErrors = {
      apartment: "",
      type: "",
      amount: "",
      period: "",
      dueDate: "",
      status: "",
    };

    let isValid = true;

    // Validate apartment
    if (!formData.apartment) {
      newErrors.apartment = "Vui lòng chọn căn hộ";
      isValid = false;
    }

    // Validate amount
    if (!formData.amount) {
      newErrors.amount = "Số tiền không được để trống";
      isValid = false;
    } else if (Number(formData.amount) <= 0) {
      newErrors.amount = "Số tiền phải lớn hơn 0";
      isValid = false;
    } else if (Number(formData.amount) > 100000000) {
      newErrors.amount = "Số tiền không được vượt quá 100,000,000 VND";
      isValid = false;
    }

    // Validate period (format: YYYY-MM)
    if (!formData.period) {
      newErrors.period = "Kỳ hóa đơn không được để trống";
      isValid = false;
    } else {
      const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!periodRegex.test(formData.period)) {
        newErrors.period = "Định dạng kỳ không hợp lệ (VD: 2025-10)";
        isValid = false;
      } else {
        const [year, month] = formData.period.split('-');
        const inputDate = new Date(Number(year), Number(month) - 1);
        const currentDate = new Date();
        
        if (inputDate > currentDate) {
          newErrors.period = "Kỳ hóa đơn không được ở tương lai";
          isValid = false;
        }
      }
    }

    // Validate due date
    if (!formData.dueDate) {
      newErrors.dueDate = "Ngày hết hạn không được để trống";
      isValid = false;
    } else {
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.dueDate = "Ngày hết hạn không được ở quá khứ";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // 📝 Xử lý thay đổi input với real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time validation cho amount
    if (name === "amount" && value) {
      if (Number(value) <= 0) {
        setErrors((prev) => ({ 
          ...prev, 
          amount: "Số tiền phải lớn hơn 0" 
        }));
      } else if (Number(value) > 100000000) {
        setErrors((prev) => ({ 
          ...prev, 
          amount: "Số tiền không được vượt quá 100,000,000 VND" 
        }));
      }
    }

    // Real-time validation cho period
    if (name === "period" && value) {
      const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!periodRegex.test(value)) {
        setErrors((prev) => ({ 
          ...prev, 
          period: "Định dạng kỳ không hợp lệ (VD: 2025-10)" 
        }));
      }
    }

    // Real-time validation cho due date
    if (name === "dueDate" && value) {
      const dueDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        setErrors((prev) => ({ 
          ...prev, 
          dueDate: "Ngày hết hạn không được ở quá khứ" 
        }));
      }
    }
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
    setErrors({
      apartment: "",
      type: "",
      amount: "",
      period: "",
      dueDate: "",
      status: "",
    });
  };

  // 💾 Thêm hoặc sửa hóa đơn
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("⚠️ Vui lòng kiểm tra lại thông tin trong form!");
      return;
    }

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
        toast.success("✅ Cập nhật hóa đơn thành công!");
      } else {
        await api.post("/invoices", invoiceData);
        toast.success("🧾 Tạo hóa đơn mới thành công!");
      }

      fetchInvoices();
      resetForm();
    } catch (err) {
      console.error("❌ Lỗi lưu hóa đơn:", err);
      toast.error("Không thể lưu hóa đơn, vui lòng kiểm tra lại!");
    }
  };

  // 🗑️ Xóa hóa đơn
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa hóa đơn này?",
      text: "Thao tác này sẽ xóa vĩnh viễn dữ liệu!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/invoices/${id}`);
        toast.success("🗑️ Đã xóa hóa đơn thành công!");
        fetchInvoices();
      } catch (err) {
        console.error("❌ Lỗi xóa hóa đơn:", err);
        toast.error("Không thể xóa hóa đơn!");
      }
    } else {
      Swal.fire({
        title: "Đã hủy thao tác",
        icon: "info",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  };

  // ✏️ Chỉnh sửa
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
    // Clear errors khi bắt đầu edit
    setErrors({
      apartment: "",
      type: "",
      amount: "",
      period: "",
      dueDate: "",
      status: "",
    });
    toast.info("✏️ Đang chỉnh sửa hóa đơn");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination calculations
  const totalPages = Math.ceil(invoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentInvoices = invoices.slice(startIndex, startIndex + itemsPerPage);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showPagination = !loading && invoices.length > 0;

  return (
    <div className="resident-page">
      <h2 className="resident-title">💰 Quản lý hóa đơn</h2>

      {/* Form thêm/sửa */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Căn hộ *</label>
            <select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              className={errors.apartment ? "error" : ""}
              required
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.apartmentCode} - {apt.name}
                </option>
              ))}
            </select>
            {errors.apartment && <span className="error-message">{errors.apartment}</span>}
          </div>

          <div className="form-group">
            <label>Loại hóa đơn *</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
            >
              <option value="management_fee">Phí quản lý</option>
              <option value="water">Tiền nước</option>
              <option value="electricity">Tiền điện</option>
              <option value="other">Khác</option>
            </select>
          </div>

          <div className="form-group">
            <label>Số tiền (VND) *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={errors.amount ? "error" : ""}
              placeholder="Nhập số tiền..."
              min="1"
              max="100000000"
              required
            />
            {errors.amount && <span className="error-message">{errors.amount}</span>}
            {formData.amount && !errors.amount && (
              <div className="amount-preview">
                {new Intl.NumberFormat("vi-VN").format(Number(formData.amount))} ₫
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Kỳ *</label>
            <input
              type="text"
              name="period"
              value={formData.period}
              onChange={handleChange}
              className={errors.period ? "error" : ""}
              placeholder="VD: 2025-10"
              maxLength="7"
              required
            />
            {errors.period && <span className="error-message">{errors.period}</span>}
            <div className="input-hint">Định dạng: NĂM-THÁNG (VD: 2025-10)</div>
          </div>

          <div className="form-group">
            <label>Ngày hết hạn *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className={errors.dueDate ? "error" : ""}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.dueDate && <span className="error-message">{errors.dueDate}</span>}
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
            {currentInvoice ? "💾 Cập nhật" : "➕ Thêm mới"}
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

      {/* Thông tin tổng quan */}
      {!loading && invoices.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, invoices.length)}-
          {Math.min(startIndex + currentInvoices.length, invoices.length)} 
          trên tổng số {invoices.length} hóa đơn
        </div>
      )}

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
            {loading ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="loading-spinner">Đang tải dữ liệu...</div>
                </td>
              </tr>
            ) : currentInvoices.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? "Không tìm thấy hóa đơn phù hợp" : "Không có dữ liệu hóa đơn"}
                </td>
              </tr>
            ) : (
              currentInvoices.map((inv) => (
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
                    {new Intl.NumberFormat("vi-VN").format(
                      inv.totalAmount || 0
                    )}{" "}
                    ₫
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

        {/* Pagination Component */}
        {showPagination && (
          <div className="resident-pagination">
            <button
              className="pagination-btn"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {pageNumbers.map(page => (
              <button
                key={page}
                className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => goToPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              className="pagination-btn"
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>

            <span className="pagination-info">
              Trang {currentPage} / {totalPages}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceManagement;