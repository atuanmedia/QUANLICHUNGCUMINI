import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api";

const AnnouncementManagement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "system",
    targetApartment: "",
  });
  
  // State cho validation errors
  const [errors, setErrors] = useState({
    title: "",
    content: "",
    targetApartment: "",
  });

  // 📢 Lấy danh sách thông báo
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải thông báo:", err);
      toast.error("Không thể tải danh sách thông báo!");
    } finally {
      setLoading(false);
    }
  };

  // 🏢 Lấy danh sách căn hộ
  const fetchApartments = async () => {
    try {
      const res = await api.get("/apartments");
      setApartments(res.data);
    } catch (err) {
      console.error("❌ Lỗi tải căn hộ:", err);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAnnouncements();
      fetchApartments();
    }
  }, [user]);

  // 🎯 Validation function
  const validateForm = () => {
    const newErrors = {
      title: "",
      content: "",
      targetApartment: "",
    };

    let isValid = true;

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
      isValid = false;
    } else if (formData.title.length < 5) {
      newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự";
      isValid = false;
    } else if (formData.title.length > 100) {
      newErrors.title = "Tiêu đề không được vượt quá 100 ký tự";
      isValid = false;
    }

    // Validate content
    if (!formData.content.trim()) {
      newErrors.content = "Nội dung không được để trống";
      isValid = false;
    } else if (formData.content.length < 10) {
      newErrors.content = "Nội dung phải có ít nhất 10 ký tự";
      isValid = false;
    } else if (formData.content.length > 1000) {
      newErrors.content = "Nội dung không được vượt quá 1000 ký tự";
      isValid = false;
    }

    // Validate target apartment when scope is apartment
    if (formData.scope === "apartment" && !formData.targetApartment) {
      newErrors.targetApartment = "Vui lòng chọn căn hộ";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 🧾 Gửi form (tạo hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form trước khi submit
    if (!validateForm()) {
      toast.error("⚠️ Vui lòng kiểm tra lại thông tin trong form!");
      return;
    }

    try {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        scope: formData.scope,
        targetApartment:
          formData.scope === "apartment" ? formData.targetApartment : null,
        issuedBy: user?._id,
      };

      if (isEditing && formData._id) {
        await api.put(`/announcements/${formData._id}`, payload);
        toast.success("📢 Cập nhật thông báo thành công!");
      } else {
        await api.post("/announcements", payload);
        toast.success("📢 Tạo thông báo mới thành công!");
      }

      setFormData({
        title: "",
        content: "",
        scope: "system",
        targetApartment: "",
      });
      setErrors({
        title: "",
        content: "",
        targetApartment: "",
      });
      setIsEditing(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ Error saving announcement:", err);
      toast.error("Không thể lưu thông báo!");
    }
  };

  // 📋 Xử lý thay đổi input với real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error khi user bắt đầu nhập
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Real-time validation cho một số trường
    if (name === "title" && value.length > 100) {
      setErrors((prev) => ({ 
        ...prev, 
        title: "Tiêu đề không được vượt quá 100 ký tự" 
      }));
    }

    if (name === "content" && value.length > 1000) {
      setErrors((prev) => ({ 
        ...prev, 
        content: "Nội dung không được vượt quá 1000 ký tự" 
      }));
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    // Clear errors khi bắt đầu edit
    setErrors({
      title: "",
      content: "",
      targetApartment: "",
    });
    toast.info("✏️ Đang chỉnh sửa thông báo...");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ❌ Xóa
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa thông báo này?",
      text: "Hành động này không thể hoàn tác!",
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
        await api.delete(`/announcements/${id}`);
        toast.success("🗑️ Đã xóa thông báo!");
        fetchAnnouncements();
      } catch (err) {
        console.error("❌ Xóa thông báo lỗi:", err);
        toast.error("Không thể xóa thông báo!");
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

  // Hàm reset form
  const handleReset = () => {
    setFormData({
      title: "",
      content: "",
      scope: "system",
      targetApartment: "",
    });
    setErrors({
      title: "",
      content: "",
      targetApartment: "",
    });
    setIsEditing(false);
  };

  // Pagination calculations
  const totalPages = Math.ceil(announcements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAnnouncements = announcements.slice(startIndex, startIndex + itemsPerPage);

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
  const showPagination = !loading && announcements.length > 0;

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📢 Quản lý Thông báo</h2>

      {/* 🧾 Form thêm / sửa */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tiêu đề *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={errors.title ? "error" : ""}
              placeholder="Nhập tiêu đề thông báo..."
              required
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
            <div className="character-count">
              {formData.title.length}/100 ký tự
            </div>
          </div>

          <div className="form-group">
            <label>Phạm vi thông báo *</label>
            <select name="scope" value={formData.scope} onChange={handleChange}>
              <option value="system">Toàn hệ thống</option>
              <option value="apartment">Theo căn hộ</option>
            </select>
          </div>

          {formData.scope === "apartment" && (
            <div className="form-group">
              <label>Chọn căn hộ *</label>
              <select
                name="targetApartment"
                value={formData.targetApartment}
                onChange={handleChange}
                className={errors.targetApartment ? "error" : ""}
                required
              >
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map((apt) => (
                  <option key={apt._id} value={apt._id}>
                    {apt.apartmentCode}
                  </option>
                ))}
              </select>
              {errors.targetApartment && (
                <span className="error-message">{errors.targetApartment}</span>
              )}
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Nội dung *</label>
          <textarea
            name="content"
            rows="4"
            value={formData.content}
            onChange={handleChange}
            className={errors.content ? "error" : ""}
            placeholder="Nhập nội dung thông báo chi tiết..."
            required
          ></textarea>
          {errors.content && <span className="error-message">{errors.content}</span>}
          <div className="character-count">
            {formData.content.length}/1000 ký tự
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {isEditing ? "💾 Cập nhật" : "➕ Tạo thông báo"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn-cancel"
              onClick={handleReset}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Thông tin tổng quan */}
      {!loading && announcements.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, announcements.length)}-
          {Math.min(startIndex + currentAnnouncements.length, announcements.length)} 
          trên tổng số {announcements.length} thông báo
        </div>
      )}

      {/* 🗂️ Danh sách thông báo */}
      <div className="resident-table animate-fade">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Phạm vi</th>
              <th>Căn hộ</th>
              <th>Ngày đăng</th>
              <th>Người tạo</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentAnnouncements.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có thông báo nào
                </td>
              </tr>
            ) : (
              currentAnnouncements.map((a) => (
                <tr key={a._id}>
                  <td>{a.title}</td>
                  <td>
                    <span
                      className={`badge ${
                        a.scope === "system" ? "badge-blue" : "badge-yellow"
                      }`}
                    >
                      {a.scope === "system"
                        ? "Toàn hệ thống"
                        : "Theo căn hộ"}
                    </span>
                  </td>
                  <td>{a.targetApartment?.apartmentCode || "-"}</td>
                  <td>{new Date(a.publishDate).toLocaleDateString("vi-VN")}</td>
                  <td>{a.issuedBy?.name || "Admin"}</td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(a)}>
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(a._id)}
                    >
                      <TrashIcon className="h-5 w-5" />
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

export default AnnouncementManagement;