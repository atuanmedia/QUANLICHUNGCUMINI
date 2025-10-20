import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";

const ApartmentManagement = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentApartment, setCurrentApartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Hiển thị 10 căn hộ/trang

  const [formData, setFormData] = useState({
    apartmentCode: "",
    name: "",
    area: "",
    floor: "",
    status: "empty",
  });

  // 📌 Lấy danh sách căn hộ
  const fetchApartments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/apartments`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm },
      });
      setApartments(data);
      console.log("📊 Dữ liệu căn hộ:", data);
      console.log("🔢 Số lượng căn hộ:", data?.length || 0);
    } catch (err) {
      console.error("Error fetching apartments:", err);
      setError("Không thể tải danh sách căn hộ.");
      toast.error("⚠️ Lỗi khi tải danh sách căn hộ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, [searchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 📌 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 📌 Reset form
  const resetForm = () => {
    setCurrentApartment(null);
    setFormData({
      apartmentCode: "",
      name: "",
      area: "",
      floor: "",
      status: "empty",
    });
  };

  // 📌 Thêm hoặc sửa căn hộ
  const handleSubmit = async (e) => {
    e.preventDefault();
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
        area: Number(formData.area),
        floor: Number(formData.floor),
      };

      if (currentApartment) {
        await api.put(`/apartments/${currentApartment._id}`, payload, config);
        toast.success("✅ Cập nhật căn hộ thành công!");
      } else {
        await api.post(`/apartments`, payload, config);
        toast.success("🏠 Thêm căn hộ mới thành công!");
      }

      fetchApartments();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving apartment:", err);
      setError("Không thể lưu căn hộ.");
      toast.error("❌ Không thể lưu thông tin căn hộ!");
    }
  };

  // 📌 Xóa căn hộ
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa căn hộ này?",
      text: "Thao tác này không thể hoàn tác!",
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
        await api.delete(`/apartments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("🗑️ Đã xóa căn hộ thành công!");
        fetchApartments();
      } catch (err) {
        console.error("Error deleting apartment:", err);
        toast.error("❌ Không thể xóa căn hộ!");
      }
    }
  };

  // 📌 Khi nhấn Sửa
  const handleEdit = (apartment) => {
    setCurrentApartment(apartment);
    setFormData({
      apartmentCode: apartment.apartmentCode,
      name: apartment.name,
      area: apartment.area,
      floor: apartment.floor || "",
      status: apartment.status,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.info("✏️ Đang chỉnh sửa thông tin căn hộ");
  };

  // Pagination calculations
  const totalPages = Math.ceil(apartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentApartments = apartments.slice(startIndex, startIndex + itemsPerPage);

  console.log("📄 Pagination Info:", {
    totalApartments: apartments.length,
    itemsPerPage,
    totalPages,
    currentPage,
    startIndex,
    endIndex: startIndex + itemsPerPage,
    currentApartmentsCount: currentApartments.length
  });

  // Pagination handlers
  const goToPage = (page) => {
    console.log("🔄 Chuyển đến trang:", page);
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
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    console.log("🔢 Số trang hiển thị:", pages);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  // Luôn hiển thị pagination khi có dữ liệu, kể cả chỉ có 1 trang
  const showPagination = !loading && apartments.length > 0;

  console.log("🎯 Điều kiện hiển thị pagination:", {
    loading,
    apartmentsCount: apartments.length,
    totalPages,
    showPagination
  });

  return (
    <div className="resident-page">
      <h2 className="resident-title">🏢 Quản lý Căn hộ</h2>

      {/* Form thêm/sửa căn hộ */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Mã căn hộ *</label>
            <input
              type="text"
              name="apartmentCode"
              value={formData.apartmentCode}
              onChange={handleChange}
              placeholder="VD: A101"
              required
            />
          </div>

          <div className="form-group">
            <label>Tên căn hộ *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Căn hộ tầng 3 - Block A"
              required
            />
          </div>

          <div className="form-group">
            <label>Diện tích (m²) *</label>
            <input
              type="number"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="VD: 80"
              required
              min="10"
            />
          </div>

          <div className="form-group">
            <label>Tầng *</label>
            <input
              type="number"
              name="floor"
              value={formData.floor}
              onChange={handleChange}
              placeholder="VD: 2"
              required
            />
          </div>

          <div className="form-group">
            <label>Trạng thái *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="empty">Trống</option>
              <option value="occupied">Đang ở</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {currentApartment ? "💾 Cập nhật" : "➕ Thêm mới"}
          </button>
          {currentApartment && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Thanh tìm kiếm */}
      <div className="resident-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm mã, tên căn hộ..."
          className="resident-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Thông tin tổng quan */}
      {!loading && apartments.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, apartments.length)}-
          {Math.min(startIndex + currentApartments.length, apartments.length)} 
          trên tổng số {apartments.length} căn hộ
        </div>
      )}

      {/* Bảng danh sách căn hộ */}
      <div className="resident-table">
        <table>
          <thead>
            <tr>
              <th>Mã căn hộ</th>
              <th>Tên căn hộ</th>
              <th>Diện tích (m²)</th>
              <th>Tầng</th>
              <th>Trạng thái</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="no-data">
                  <div className="loading-spinner">Đang tải dữ liệu...</div>
                </td>
              </tr>
            ) : currentApartments.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  {searchTerm ? "Không tìm thấy căn hộ phù hợp" : "Không có dữ liệu căn hộ"}
                </td>
              </tr>
            ) : (
              currentApartments.map((apt) => (
                <tr key={apt._id}>
                  <td>{apt.apartmentCode}</td>
                  <td>{apt.name}</td>
                  <td>{apt.area}</td>
                  <td>{apt.floor}</td>
                  <td>
                    {apt.status === "occupied" ? (
                      <span className="badge-green">Đang ở</span>
                    ) : apt.status === "maintenance" ? (
                      <span className="badge-yellow">Bảo trì</span>
                    ) : (
                      <span className="badge-gray">Trống</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(apt)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(apt._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Component - LUÔN HIỂN THỊ KHI CÓ DỮ LIỆU */}
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

export default ApartmentManagement;