import React, { useEffect, useState } from "react";
import api from "../../api/api"; // ✅ axios instance có interceptor
import { FaFilePdf, FaTrash } from "react-icons/fa";
import "../../styles/admin/temp-residence.css";
// import "../../styles/admin/componentadmin.css"; // optional nếu bạn muốn đồng nhất style

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
      console.log("📄 [TempResidenceAdmin] Fetching records...");
      const res = await api.get("/temp-residence"); // interceptor tự gắn token
      setRecords(res.data || []);
      console.log("✅ [TempResidenceAdmin] Loaded:", res.data.length);
    } catch (err) {
      console.error("❌ fetchRecords:", err);
      alert("❌ Lỗi khi tải danh sách hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xuất PDF
  const handleExportPDF = async (id, fullName) => {
    try {
      console.log("📤 [TempResidenceAdmin] Exporting PDF...");
      const res = await api.get(`/temp-residence/${id}/export`, {
        responseType: "blob", // ⚙️ Đảm bảo trả file PDF
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);

      // 🔹 Đặt tên file an toàn
      const safeName = fullName
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");

      link.download = `giay_tam_tru_tam_vang_${safeName || "unknown"}.pdf`;
      link.click();
    } catch (err) {
      console.error("❌ Export PDF error:", err);
      alert("❌ Lỗi khi xuất PDF!");
    }
  };

  // ✅ Xóa hồ sơ
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hồ sơ này không?")) return;
    try {
      await api.delete(`/temp-residence/${id}`);
      alert("🗑️ Đã xóa hồ sơ thành công!");
      fetchRecords(); // reload danh sách
    } catch (err) {
      console.error("❌ Delete error:", err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="resident-page fade-in">
      <h2 className="resident-title">📋 Quản lý Tạm trú / Tạm vắng</h2>

      {loading ? (
        <p className="loading-text">Đang tải dữ liệu...</p>
      ) : (
        <div className="resident-table">
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
