import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
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
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "system",
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

  // 🧾 Gửi form (tạo hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
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
      setIsEditing(false);
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ Error saving announcement:", err);
      toast.error("Không thể lưu thông báo!");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
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

  // 📋 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              required
            />
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
                required
              >
                <option value="">-- Chọn căn hộ --</option>
                {apartments.map((apt) => (
                  <option key={apt._id} value={apt._id}>
                    {apt.apartmentCode}
                  </option>
                ))}
              </select>
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
            required
          ></textarea>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {isEditing ? "💾 Cập nhật" : "➕ Tạo thông báo"}
          </button>
          {isEditing && (
            <button
              type="button"
              className="btn-cancel"
              onClick={() => {
                setFormData({
                  title: "",
                  content: "",
                  scope: "system",
                  targetApartment: "",
                });
                setIsEditing(false);
              }}
            >
              Hủy
            </button>
          )}
        </div>
      </form>

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
            {announcements.length === 0 ? (
              <tr>
                <td colSpan="6" className="no-data">
                  Không có thông báo nào
                </td>
              </tr>
            ) : (
              announcements.map((a) => (
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
      </div>
    </div>
  );
};

export default AnnouncementManagement;
