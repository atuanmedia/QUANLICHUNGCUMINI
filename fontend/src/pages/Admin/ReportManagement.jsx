import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api";

const ReportManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // 🔒 Escape HTML
  const escapeHtml = (unsafe) =>
    unsafe
      ?.replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  // 🟢 Lấy danh sách phản ánh
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get("/reports", {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filterStatus === "all" ? "" : filterStatus },
      });
      setReports(data);
      console.log("📊 Dữ liệu phản ánh:", data);
    } catch (err) {
      console.error("❌ Lỗi tải phản ánh:", err);
      toast.error("Không thể tải danh sách phản ánh!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") fetchReports();
  }, [user, filterStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  // 👁️ Xem chi tiết phản ánh (popup)
  const handleViewDetail = (report) => {
    Swal.fire({
      title: `📢 ${escapeHtml(report.title || "Phản ánh")}`,
      html: `
        <div style="text-align:left; line-height:1.6">
          <p><b>👤 Người gửi:</b> ${escapeHtml(report.resident?.fullName || "N/A")}</p>
          <p><b>🏠 Căn hộ:</b> ${escapeHtml(report.apartment?.apartmentCode || "N/A")}</p>
          <p><b>📅 Ngày gửi:</b> ${new Date(report.createdAt).toLocaleDateString("vi-VN")}</p>
          <hr style="margin:10px 0"/>
          <p style="white-space:pre-line;">
            <b>Nội dung:</b><br/>${escapeHtml(report.content || "(Không có nội dung)")}
          </p>
          ${
            report.images && report.images.length > 0
              ? `<div style="text-align:center;margin-top:10px">
                    <img 
                      src="https://quanlichungcumini.onrender.com${report.images[0]}" 
                      alt="Ảnh phản ánh"
                      style="
                        margin-top:10px;
                        border-radius:10px;
                        max-width:100%;
                        max-height:250px;
                        object-fit:contain;
                        display:block;
                        margin:auto;
                        box-shadow:0 2px 10px rgba(0,0,0,0.2);
                      "
                    />
                 </div>`
              : ""
          }
        </div>
      `,
      confirmButtonText: "Đóng",
      width: "600px",
      background: "#fff",
      color: "#111",
      confirmButtonColor: "#2563eb",
      allowOutsideClick: true,
      allowEscapeKey: true,
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = "99999";
      },
    });
  };

  // 🗑️ Xoá phản ánh
  const handleDelete = async (reportId) => {
    const confirm = await Swal.fire({
      title: "Bạn có chắc muốn xoá phản ánh này?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Xoá",
      cancelButtonText: "Huỷ",
      didOpen: () => {
        const swalContainer = document.querySelector(".swal2-container");
        if (swalContainer) swalContainer.style.zIndex = "99999";
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/reports/${reportId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success("🗑️ Đã xoá phản ánh thành công!");
    } catch (err) {
      console.error("❌ Lỗi xoá phản ánh:", err);
      toast.error("Không thể xoá phản ánh, vui lòng thử lại!");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(reports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentReports = reports.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages)
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const pageNumbers = getPageNumbers();
  const showPagination = !loading && reports.length > 0;

  if (loading)
    return (
      <div className="loading-overlay">
        <div className="spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📋 Quản lý phản ánh & báo cáo</h2>

      {/* Bộ lọc */}
      <div className="filter-status">
        <label>Lọc theo trạng thái:</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ xử lý</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã giải quyết</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Thông tin tổng quan */}
      {!loading && reports.length > 0 && (
        <div className="resident-summary">
          Hiển thị {Math.min(startIndex + 1, reports.length)}-
          {Math.min(startIndex + currentReports.length, reports.length)} trên{" "}
          {reports.length} phản ánh
        </div>
      )}

      {/* Bảng phản ánh */}
      <div className="resident-table animate-fade">
        <table>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Người gửi</th>
              <th>Căn hộ</th>
              <th>Ngày gửi</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentReports.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có phản ánh nào
                </td>
              </tr>
            ) : (
              currentReports.map((r) => (
                <tr key={r._id}>
                  <td className="report-title">{r.title}</td>
                  <td>{r.resident?.fullName || "N/A"}</td>
                  <td>{r.apartment?.apartmentCode || "N/A"}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString("vi-VN")}</td>
                  <td>
                    <span
                      className={`badge ${
                        r.status === "resolved"
                          ? "badge-green"
                          : r.status === "in_progress"
                          ? "badge-blue"
                          : r.status === "cancelled"
                          ? "badge-red"
                          : "badge-yellow"
                      }`}
                    >
                      {getStatusLabel(r.status)}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-view"
                      onClick={() => handleViewDetail(r)}
                      title="Xem chi tiết phản ánh"
                    >
                      <FontAwesomeIcon icon={faEye} className="icon-view" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(r._id)}
                      title="Xóa phản ánh"
                    >
                      <FontAwesomeIcon icon={faTrash} className="icon-delete" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {showPagination && (
          <div className="resident-pagination">
            <button
              className="pagination-btn"
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
            >
              <FaChevronLeft />
            </button>

            {pageNumbers.map((page) => (
              <button
                key={page}
                className={`pagination-btn ${
                  currentPage === page ? "active" : ""
                }`}
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

  function getStatusLabel(status) {
    switch (status) {
      case "pending":
        return "Chờ xử lý";
      case "in_progress":
        return "Đang xử lý";
      case "resolved":
        return "Đã giải quyết";
      case "cancelled":
        return "Đã hủy";
      default:
        return status;
    }
  }
};

export default ReportManagement;
