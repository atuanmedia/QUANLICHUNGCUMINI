import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";

const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentResident, setCurrentResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    idCardNumber: "",
    email: "",
    password: "",
    apartment: "",
    isHeadOfHousehold: false,
  });

  // State cho validation errors
  const [errors, setErrors] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    idCardNumber: "",
    email: "",
    password: "",
    apartment: "",
  });

  // 📌 Fetch residents (search)
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/residents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm },
      });
      setResidents(data);
    } catch (err) {
      console.error("❌ Error fetching residents:", err);
      toast.error("⚠️ Lỗi khi tải danh sách cư dân!");
      setError("Không thể tải danh sách cư dân.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Fetch apartments
  const fetchApartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/apartments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApartments(data);
    } catch (err) {
      console.error("Error fetching apartments:", err);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResidents();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 🎯 Validation function
  const validateForm = () => {
    const newErrors = {
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      idCardNumber: "",
      email: "",
      password: "",
      apartment: "",
    };

    let isValid = true;

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Họ và tên không được để trống";
      isValid = false;
    } else if (formData.fullName.length < 2) {
      newErrors.fullName = "Họ và tên phải có ít nhất 2 ký tự";
      isValid = false;
    } else if (formData.fullName.length > 50) {
      newErrors.fullName = "Họ và tên không được vượt quá 50 ký tự";
      isValid = false;
    }

    // Validate date of birth
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Ngày sinh không được để trống";
      isValid = false;
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 100); // 100 years ago
      
      if (birthDate > today) {
        newErrors.dateOfBirth = "Ngày sinh không được ở tương lai";
        isValid = false;
      } else if (birthDate < minDate) {
        newErrors.dateOfBirth = "Ngày sinh không hợp lệ";
        isValid = false;
      } else {
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          newErrors.dateOfBirth = "Cư dân phải từ 18 tuổi trở lên";
          isValid = false;
        }
      }
    }

    // Validate phone number
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Số điện thoại không được để trống";
      isValid = false;
    } else if (!phoneRegex.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Số điện thoại không hợp lệ (VD: 0912345678)";
      isValid = false;
    }

    // Validate ID card number
    const idCardRegex = /^[0-9]{9}$|^[0-9]{12}$/;
    if (!formData.idCardNumber.trim()) {
      newErrors.idCardNumber = "Số CCCD/CMND không được để trống";
      isValid = false;
    } else if (!idCardRegex.test(formData.idCardNumber)) {
      newErrors.idCardNumber = "Số CCCD/CMND phải có 9 hoặc 12 số";
      isValid = false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email không được để trống";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Validate password (only for new residents)
    if (!currentResident && !formData.password) {
      newErrors.password = "Mật khẩu không được để trống";
      isValid = false;
    } else if (!currentResident && formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    // Validate apartment
    if (!formData.apartment) {
      newErrors.apartment = "Vui lòng chọn căn hộ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 📌 Handle change với real-time validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time validation
    if (name === "fullName" && value) {
      if (value.length < 2) {
        setErrors((prev) => ({ 
          ...prev, 
          fullName: "Họ và tên phải có ít nhất 2 ký tự" 
        }));
      } else if (value.length > 50) {
        setErrors((prev) => ({ 
          ...prev, 
          fullName: "Họ và tên không được vượt quá 50 ký tự" 
        }));
      }
    }

    if (name === "phoneNumber" && value) {
      const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
      if (!phoneRegex.test(value)) {
        setErrors((prev) => ({ 
          ...prev, 
          phoneNumber: "Số điện thoại không hợp lệ (VD: 0912345678)" 
        }));
      }
    }

    if (name === "idCardNumber" && value) {
      const idCardRegex = /^[0-9]{9}$|^[0-9]{12}$/;
      if (!idCardRegex.test(value)) {
        setErrors((prev) => ({ 
          ...prev, 
          idCardNumber: "Số CCCD/CMND phải có 9 hoặc 12 số" 
        }));
      }
    }

    if (name === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setErrors((prev) => ({ 
          ...prev, 
          email: "Email không hợp lệ" 
        }));
      }
    }

    if (name === "password" && value && !currentResident) {
      if (value.length < 6) {
        setErrors((prev) => ({ 
          ...prev, 
          password: "Mật khẩu phải có ít nhất 6 ký tự" 
        }));
      }
    }
  };

  // 📌 Reset form
  const resetForm = () => {
    setCurrentResident(null);
    setFormData({
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      idCardNumber: "",
      email: "",
      password: "",
      apartment: "",
      isHeadOfHousehold: false,
    });
    setErrors({
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      idCardNumber: "",
      email: "",
      password: "",
      apartment: "",
    });
  };

  // 📌 Submit form (Thêm / Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("⚠️ Vui lòng kiểm tra lại thông tin trong form!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ...formData,
        isHeadOfHousehold: !!formData.isHeadOfHousehold,
      };

      if (currentResident) {
        await api.put(`/residents/${currentResident._id}`, payload, config);
        toast.success("✅ Cập nhật cư dân thành công!");
      } else {
        await api.post(`/residents`, payload, config);
        toast.success("👤 Thêm cư dân mới thành công!");
      }

      fetchResidents();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving resident:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể lưu cư dân. Vui lòng kiểm tra thông tin!"
      );
    }
  };

  // 📌 Delete resident (SweetAlert confirm)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa cư dân này?",
      text: "Thao tác này sẽ xóa vĩnh viễn cư dân và tài khoản liên kết!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/residents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("🗑️ Đã xóa cư dân thành công!");
        fetchResidents();
      } catch (err) {
        console.error("Error deleting resident:", err);
        toast.error("❌ Không thể xóa cư dân!");
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

  // 📌 Edit resident
  const handleEdit = (resident) => {
    setCurrentResident(resident);
    setFormData({
      fullName: resident.fullName,
      dateOfBirth: resident.dateOfBirth?.split("T")[0] || "",
      phoneNumber: resident.phoneNumber,
      idCardNumber: resident.idCardNumber || "",
      email: resident.email || "",
      password: "",
      apartment: resident.apartment?._id || "",
      isHeadOfHousehold: resident.isHeadOfHousehold,
    });
    // Clear errors khi bắt đầu edit
    setErrors({
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      idCardNumber: "",
      email: "",
      password: "",
      apartment: "",
    });
    toast.info("✏️ Đang chỉnh sửa thông tin cư dân");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Pagination calculations
  const totalPages = Math.ceil(residents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentResidents = residents.slice(startIndex, startIndex + itemsPerPage);

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
  const showPagination = !loading && residents.length > 0;

  return (
    <div className="resident-page">
      <h2 className="resident-title">👥 Quản lý cư dân</h2>

      {/* ✅ Form thêm/sửa cư dân */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={errors.fullName ? "error" : ""}
              placeholder="Nhập họ và tên đầy đủ..."
              maxLength="50"
              required
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            <div className="character-count">
              {formData.fullName.length}/50 ký tự
            </div>
          </div>

          <div className="form-group">
            <label>Ngày sinh *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? "error" : ""}
              max={new Date().toISOString().split('T')[0]}
              required
            />
            {errors.dateOfBirth && <span className="error-message">{errors.dateOfBirth}</span>}
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={errors.phoneNumber ? "error" : ""}
              placeholder="VD: 0912345678"
              maxLength="10"
              required
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label>Số CCCD / CMND *</label>
            <input
              type="text"
              name="idCardNumber"
              value={formData.idCardNumber}
              onChange={handleChange}
              className={errors.idCardNumber ? "error" : ""}
              placeholder="Nhập 9 hoặc 12 số"
              maxLength="12"
              required
            />
            {errors.idCardNumber && <span className="error-message">{errors.idCardNumber}</span>}
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? "error" : ""}
              placeholder="VD: example@email.com"
              required
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {!currentResident && (
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                placeholder="Ít nhất 6 ký tự"
                required
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
              <div className="password-strength">
                {formData.password && (
                  <span className={formData.password.length >= 6 ? "strength-strong" : "strength-weak"}>
                    {formData.password.length >= 6 ? "✓ Mật khẩu mạnh" : "⚠ Mật khẩu yếu"}
                  </span>
                )}
              </div>
            </div>
          )}

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
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isHeadOfHousehold"
              checked={formData.isHeadOfHousehold}
              onChange={handleChange}
            />
            <span className="checkmark"></span>
            Là chủ hộ
          </label>
          <div className="checkbox-hint">
            {formData.isHeadOfHousehold 
              ? "⚠ Cư dân này sẽ có quyền quản lý căn hộ" 
              : "Cư dân bình thường"}
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {currentResident ? "💾 Cập nhật" : "➕ Thêm mới"}
          </button>
          {currentResident && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="resident-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, SĐT, CCCD hoặc căn hộ..."
          className="resident-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Thông tin tổng quan */}
      {!loading && residents.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, residents.length)}-
          {Math.min(startIndex + currentResidents.length, residents.length)} 
          trên tổng số {residents.length} cư dân
        </div>
      )}

      {/* 🧾 Bảng cư dân */}
      <div className="resident-table">
        <table>
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Căn hộ</th>
              <th>Chủ hộ</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="no-data">
                  <div className="loading-spinner">Đang tải dữ liệu...</div>
                </td>
              </tr>
            ) : currentResidents.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? "Không tìm thấy cư dân phù hợp" : "Không có dữ liệu cư dân"}
                </td>
              </tr>
            ) : (
              currentResidents.map((r) => (
                <tr key={r._id}>
                  <td>{r.fullName}</td>
                  <td>{r.dateOfBirth?.split("T")[0] || "-"}</td>
                  <td>{r.phoneNumber}</td>
                  <td>{r.email}</td>
                  <td>{r.apartment?.apartmentCode || "N/A"}</td>
                  <td>
                    {r.isHeadOfHousehold ? (
                      <span className="badge-green">Có</span>
                    ) : (
                      <span className="badge-gray">Không</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(r)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(r._id)}
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

export default ResidentManagement;