import React, { useEffect, useState } from "react";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../context/AuthContext";
import "../../styles/admin/componentadmin.css";
import api from "../../api/api"; // ✅ axios instance tự động gắn token

const AnnouncementManagement = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    scope: "system",
    targetApartment: "",
  });

  // 🧩 Lấy danh sách thông báo
  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      console.log("📢 [Announcements] Fetching...");
      const res = await api.get("/announcements");
      setAnnouncements(res.data);
      console.log("✅ [Announcements] Loaded:", res.data.length);
    } catch (err) {
      console.error("❌ Error fetching announcements:", err);
      setError("Không thể tải danh sách thông báo.");
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
      console.error("❌ Error fetching apartments:", err);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchAnnouncements();
      fetchApartments();
    }
  }, [user]);

  // 🧾 Gửi form (tạo hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
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
        console.log("📝 Updated announcement:", formData._id);
      } else {
        await api.post("/announcements", payload);
        console.log("📨 Created new announcement");
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
      setError(err.response?.data?.message || "Không thể lưu thông báo.");
    }
  };

  // ✏️ Sửa
  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
  };

  // ❌ Xóa
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa thông báo này?")) return;
    try {
      await api.delete(`/announcements/${id}`);
      console.log("🗑️ Deleted announcement:", id);
      fetchAnnouncements();
    } catch (err) {
      console.error("❌ Error deleting announcement:", err);
      setError("Không thể xóa thông báo.");
    }
  };

  // 📋 Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) return <p className="loading-text">Đang tải dữ liệu...</p>;

  return (
    <div className="resident-page">
      <div className="header-flex">
        <h2 className="resident-title">📢 Quản lý Thông báo</h2>
      </div>

      {error && <p className="error-box">{error}</p>}

      {/* 🧾 Form thêm / sửa */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Tiêu đề</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phạm vi thông báo</label>
            <select name="scope" value={formData.scope} onChange={handleChange}>
              <option value="system">Toàn hệ thống</option>
              <option value="apartment">Theo căn hộ</option>
            </select>
          </div>

          {formData.scope === "apartment" && (
            <div className="form-group">
              <label>Chọn căn hộ</label>
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
          <label>Nội dung</label>
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
      <div className="resident-table">
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
