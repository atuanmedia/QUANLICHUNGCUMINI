import React, { useEffect, useState } from "react";
import api from "../../api/api"; // ✅ axios instance có interceptor
import { FaFilePdf, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/temp-residence.css";

const TempResidenceAdmin = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  // ✅ Lấy danh sách hồ sơ
  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await api.get("/temp-residence");
      setRecords(res.data || []);
      toast.success(`📄 Đã tải ${res.data.length} hồ sơ thành công!`);
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

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📋 Quản lý Tạm trú / Tạm vắng</h2>

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
              {records.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Không có hồ sơ nào.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
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
        </div>
      )}
    </div>
  );
};

export default TempResidenceAdmin;
