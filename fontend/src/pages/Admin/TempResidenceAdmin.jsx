import React, { useEffect, useState } from "react";
import api from "../../api/api"; // ✅ axios instance có interceptor
import { FaFilePdf, FaTrash, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/temp-residence.css";

const TempResidenceAdmin = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Hiển thị 10 hồ sơ/trang

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ Lấy danh sách hồ sơ
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/temp-residence");
      setRecords(res.data || []);
      console.log("📊 Dữ liệu hồ sơ:", res.data);
      console.log("🔢 Số lượng hồ sơ:", res.data?.length || 0);
    } catch (err) {
      console.error("❌ fetchRecords:", err);
      toast.error("❌ Lỗi khi tải danh sách hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xuất PDF
  const handleExportPDF = async (id, fullName) => {
    try {
      const res = await api.get(`/temp-residence/${id}/export`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      const safeName = fullName
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      link.download = `giay_tam_tru_tam_vang_${safeName || "unknown"}.pdf`;
      link.click();

      toast.success(`📤 Xuất PDF cho ${fullName || "Cư dân"} thành công!`);
    } catch (err) {
      console.error("❌ Export PDF error:", err);
      toast.error("❌ Lỗi khi xuất file PDF!");
    }
  };

  // ✅ Xóa hồ sơ với SweetAlert confirm
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa hồ sơ này?",
      text: "Thao tác này không thể hoàn tác!",
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
        await api.delete(`/temp-residence/${id}`);
        toast.success("🗑️ Đã xóa hồ sơ thành công!");
        fetchRecords();
      } catch (err) {
        console.error("❌ Delete error:", err);
        toast.error("❌ Không thể xóa hồ sơ!");
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

  // Pagination calculations
  const totalPages = Math.ceil(records.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRecords = records.slice(startIndex, startIndex + itemsPerPage);

  console.log("📄 Pagination Info:", {
    totalRecords: records.length,
    itemsPerPage,
    totalPages,
    currentPage,
    startIndex,
    endIndex: startIndex + itemsPerPage,
    currentRecordsCount: currentRecords.length
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
  const showPagination = !loading && records.length > 0;

  console.log("🎯 Điều kiện hiển thị pagination:", {
    loading,
    recordsCount: records.length,
    totalPages,
    showPagination
  });

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📋 Quản lý Tạm trú / Tạm vắng</h2>

      {/* Thông tin tổng quan */}
      {!loading && records.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, records.length)}-
          {Math.min(startIndex + currentRecords.length, records.length)} 
          trên tổng số {records.length} hồ sơ
        </div>
      )}

      {loading ? (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="resident-table animate-fade">
          <table>
            <thead>
              <tr>
                <th>Họ tên</th>
                <th>Loại</th>
                <th>Thời gian</th>
                <th>Lý do</th>
                <th>Nơi đến / tạm trú</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Không có hồ sơ nào.
                  </td>
                </tr>
              ) : (
                currentRecords.map((r) => (
                  <tr key={r._id}>
                    <td>{r.resident?.fullName || "—"}</td>
                    <td>
                      <span
                        className={`badge ${
                          r.type === "tam_tru" ? "badge-blue" : "badge-yellow"
                        }`}
                      >
                        {r.type === "tam_tru" ? "Tạm trú" : "Tạm vắng"}
                      </span>
                    </td>
                    <td>
                      {new Date(r.fromDate).toLocaleDateString("vi-VN")} →{" "}
                      {new Date(r.toDate).toLocaleDateString("vi-VN")}
                    </td>
                    <td>{r.reason}</td>
                    <td>{r.place}</td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() =>
                          handleExportPDF(r._id, r.resident?.fullName)
                        }
                        title="Xuất PDF"
                      >
                        <FaFilePdf className="h-5 w-5 text-red-600" />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(r._id)}
                        title="Xóa hồ sơ"
                      >
                        <FaTrash className="h-5 w-5 text-gray-600" />
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
      )}
    </div>
  );
};

export default TempResidenceAdmin;