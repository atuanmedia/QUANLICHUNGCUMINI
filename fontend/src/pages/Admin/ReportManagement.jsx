import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faTrash } from "@fortawesome/free-solid-svg-icons";
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

  // 🔒 Escape HTML để tránh lỗi hiển thị HTML trong popup
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
      toast.success(`📋 Đã tải ${data.length} phản ánh thành công!`);
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

  // 👁️ Xem chi tiết phản ánh (popup đẹp + fix lỗi không đóng được)
  const handleViewDetail = (report) => {
    Swal.fire({
      title: `📢 ${escapeHtml(report.title || "Phản ánh")}`,
      html: `
        <div style="text-align:left; line-height:1.6">
          <p><b>👤 Người gửi:</b> ${escapeHtml(report.resident?.fullName || "N/A")}</p>
          <p><b>🏠 Căn hộ:</b> ${escapeHtml(report.apartment?.apartmentCode || "N/A")}</p>
          <p><b>📅 Ngày gửi:</b> ${new Date(report.createdAt).toLocaleDateString("vi-VN")}</p>
          <hr style="margin:10px 0"/>
          <p style="white-space:pre-line;"><b>Nội dung:</b><br/>${escapeHtml(
            report.content || "(Không có nội dung)"
          )}</p>
          ${
            report.images && report.images.length > 0
              ? `<img src="${report.images[0]}" alt="Ảnh phản ánh" style="margin-top:10px;border-radius:8px;max-height:200px;object-fit:cover"/>`
              : ""
          }
        </div>
      `,
      confirmButtonText: "Đóng",
      width: "600px",
      background: "#fff",
      color: "#111",
      confirmButtonColor: "#2563eb",
      allowOutsideClick: true, // ✅ click ra ngoài để đóng
      allowEscapeKey: true, // ✅ nhấn ESC để đóng
      didOpen: () => {
        // ✅ Ép z-index sau khi popup mở
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

      // Cập nhật lại danh sách
      setReports((prev) => prev.filter((r) => r._id !== reportId));
      toast.success("🗑️ Đã xoá phản ánh thành công!");
    } catch (err) {
      console.error("❌ Lỗi xoá phản ánh:", err);
      toast.error("Không thể xoá phản ánh, vui lòng thử lại!");
    }
  };

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

      {/* Bộ lọc trạng thái */}
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
            {reports.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có phản ánh nào
                </td>
              </tr>
            ) : (
              reports.map((r) => (
                <tr key={r._id}>
                  <td>{r.title}</td>
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
                      {r.status === "pending"
                        ? "Chờ xử lý"
                        : r.status === "in_progress"
                        ? "Đang xử lý"
                        : r.status === "resolved"
                        ? "Đã giải quyết"
                        : "Đã hủy"}
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
      </div>
    </div>
  );
};

export default ReportManagement;
