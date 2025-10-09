import React, { useEffect, useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api"; // ✅ axios instance có interceptor

const ReportManagement = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  // 🟢 Lấy danh sách phản ánh
  const fetchReports = async () => {
    try {
      setLoading(true);
      console.log("📢 [Reports] Fetching reports...");
      const { data } = await api.get("/reports", {
        params: { status: filterStatus === "all" ? "" : filterStatus },
      });
      setReports(data);
      console.log("✅ [Reports] Loaded:", data.length, "reports");
    } catch (err) {
      console.error("❌ Error fetching reports:", err);
      setError("Không thể tải danh sách phản ánh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") fetchReports();
  }, [user, filterStatus]);

  if (loading) return <p className="loading-text">Đang tải dữ liệu...</p>;

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📋 Quản lý phản ánh & báo cáo</h2>

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

      {error && <p className="error-box">{error}</p>}

      <div className="resident-table">
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
                      onClick={() =>
                        alert(`Phản ánh: ${r.title}\n\n${r.description}`)
                      }
                    >
                      <EyeIcon className="h-5 w-5 text-gray-600" />
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
