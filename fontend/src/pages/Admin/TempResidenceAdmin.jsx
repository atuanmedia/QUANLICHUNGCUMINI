// import React, { useEffect, useState } from "react";
// import api from "../../api/api";
// import { FaFilePdf, FaTrash } from "react-icons/fa";
// import "../../styles/admin/temp-residence.css";

// const TempResidenceAdmin = () => {
//   const [records, setRecords] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchRecords();
//   }, []);

//   // ✅ Lấy danh sách hồ sơ
//   const fetchRecords = async () => {
//     setLoading(true);
//     try {
//       const token = localStorage.getItem("token");
//       const res = await api.get("/temp-residence", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setRecords(res.data || []);
//     } catch (err) {
//       console.error("fetchRecords", err);
//       alert("❌ Lỗi khi tải danh sách hồ sơ!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Xuất PDF
//   const handleExportPDF = async (id, fullName) => {
//     try {
//       const token = localStorage.getItem("token");
//       const res = await api.get(`/temp-residence/${id}/export`, {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: "blob",
//       });

//       const blob = new Blob([res.data], { type: "application/pdf" });
//       const link = document.createElement("a");
//       link.href = window.URL.createObjectURL(blob);
//       // 🔹 Dùng tên file có tên cư dân
//       const safeName = fullName
//         ?.normalize("NFD")
//         .replace(/[\u0300-\u036f]/g, "")
//         .replace(/[^a-zA-Z0-9_-]/g, "_");
//       link.download = `giay_tam_tru_tam_vang_${safeName}.pdf`;
//       link.click();
//     } catch (err) {
//       console.error("Export PDF error:", err);
//       alert("❌ Lỗi khi xuất PDF");
//     }
//   };

//   // ✅ Xóa hồ sơ
//   const handleDelete = async (id) => {
//     if (!window.confirm("Bạn có chắc muốn xóa hồ sơ này không?")) return;
//     try {
//       const token = localStorage.getItem("token");
//       await api.delete(`/temp-residence/${id}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("🗑️ Đã xóa hồ sơ thành công!");
//       fetchRecords(); // load lại danh sách
//     } catch (err) {
//       console.error("Delete error:", err);
//       alert("❌ Xóa thất bại, vui lòng thử lại!");
//     }
//   };

//   return (
//     <div className="temp-admin">
//       <h2>📋 Quản lý Tạm trú / Tạm vắng</h2>

//       {loading ? (
//         <p className="loading-text">Đang tải dữ liệu...</p>
//       ) : records.length === 0 ? (
//         <p className="empty-text">Không có hồ sơ nào.</p>
//       ) : (
//         <table className="temp-table">
//           <thead>
//             <tr>
//               <th>Họ tên</th>
//               <th>Loại</th>
//               <th>Thời gian</th>
//               <th>Lý do</th>
//               <th>Nơi đến / tạm trú</th>
//               <th>Hành động</th>
//             </tr>
//           </thead>
//           <tbody>
//             {records.map((r) => (
//               <tr key={r._id}>
//                 <td>{r.resident?.fullName || "—"}</td>
//                 <td className={r.type === "tam_tru" ? "tamtru" : "tamvang"}>
//                   {r.type === "tam_tru" ? "Tạm trú" : "Tạm vắng"}
//                 </td>
//                 <td>
//                   {new Date(r.fromDate).toLocaleDateString("vi-VN")} →{" "}
//                   {new Date(r.toDate).toLocaleDateString("vi-VN")}
//                 </td>
//                 <td>{r.reason}</td>
//                 <td>{r.place}</td>
//                 <td className="actions">
//                   <button
//                     className="export-btn"
//                     onClick={() => handleExportPDF(r._id, r.resident?.fullName)}
//                   >
//                     <FaFilePdf /> Xuất PDF
//                   </button>
//                   <button
//                     className="delete-btn"
//                     onClick={() => handleDelete(r._id)}
//                   >
//                     <FaTrash /> Xóa
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default TempResidenceAdmin;


import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { FaFilePdf, FaTrash } from "react-icons/fa";
import "../../styles/admin/temp-residence.css";
// ✅ Có thể bạn sẽ cần import CSS chung nếu nó không được import ở nơi khác.
// import "../../styles/admin/componentadmin.css"; 

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
      const token = localStorage.getItem("token");
      const res = await api.get("/temp-residence", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecords(res.data || []);
    } catch (err) {
      console.error("fetchRecords", err);
      alert("❌ Lỗi khi tải danh sách hồ sơ!");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Xuất PDF
  const handleExportPDF = async (id, fullName) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/temp-residence/${id}/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      // 🔹 Dùng tên file có tên cư dân
      const safeName = fullName
        ?.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      link.download = `giay_tam_tru_tam_vang_${safeName}.pdf`;
      link.click();
    } catch (err) {
      console.error("Export PDF error:", err);
      alert("❌ Lỗi khi xuất PDF");
    }
  };

  // ✅ Xóa hồ sơ
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa hồ sơ này không?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/temp-residence/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Đã xóa hồ sơ thành công!");
      fetchRecords(); // load lại danh sách
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Xóa thất bại, vui lòng thử lại!");
    }
  };

  return (
    // 💡 Đổi class tổng thể để khớp với ReportManagement
    <div className="resident-page fade-in"> 
      <h2 className="resident-title">📋 Quản lý Tạm trú / Tạm vắng</h2>

      {loading ? (
        <p className="loading-text">Đang tải dữ liệu...</p>
      ) : (
        // 💡 Bọc bảng trong div có class resident-table
        <div className="resident-table"> 
          <table> {/* Bỏ className="temp-table" */}
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
                      {/* Dùng badge và class màu đã định nghĩa */}
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
                    {/* 💡 Dùng class action-buttons cho td chứa nút */}
                    <td className="action-buttons"> 
                      <button
                        // 💡 Dùng btn-edit hoặc một class chung cho nút icon nhỏ
                        className="btn-edit" 
                        onClick={() => handleExportPDF(r._id, r.resident?.fullName)}
                        title="Xuất PDF"
                      >
                        {/* FaFilePdf sẽ hoạt động như một SVG */}
                        <FaFilePdf className="h-5 w-5 text-red-600" /> 
                      </button>
                      <button
                        // 💡 Dùng btn-delete hoặc một class chung cho nút icon nhỏ
                        className="btn-delete" 
                        onClick={() => handleDelete(r._id)}
                        title="Xóa hồ sơ"
                      >
                        {/* FaTrash sẽ hoạt động như một SVG */}
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