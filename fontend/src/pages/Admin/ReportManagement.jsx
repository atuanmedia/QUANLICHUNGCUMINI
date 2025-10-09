import React, { useEffect, useState } from "react";
import axios from "axios";
import { EyeIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/componentadmin.css";


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
      const token = localStorage.getItem("token");
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: filterStatus === "all" ? "" : filterStatus },
      };
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/reports`,
        config
      );
      setReports(data);
    } catch (err) {
      console.error("Error fetching reports:", err);
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
                      className={`badge ${r.status === "resolved"
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
                      onClick={() => alert(`Phản ánh: ${r.title}\n\n${r.description}`)}
                    >
                      {/* Icon Eye */}
                      <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
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
