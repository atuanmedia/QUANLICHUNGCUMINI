import React, { useEffect, useState } from "react";
import api from "../../api/api";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/admin/componentadmin.css";

const ResidentManagement = () => {
  const [residents, setResidents] = useState([]);
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentResident, setCurrentResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    idCardNumber: "",
    email: "",
    password: "",
    apartment: "",
    isHeadOfHousehold: false,
  });

  // 📌 Fetch residents (search)
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/residents`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchTerm },
      });
      setResidents(data);
    } catch (err) {
      console.error("❌ Error fetching residents:", err);
      toast.error("⚠️ Lỗi khi tải danh sách cư dân!");
      setError("Không thể tải danh sách cư dân.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Fetch apartments
  const fetchApartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await api.get(`/apartments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApartments(data);
    } catch (err) {
      console.error("Error fetching apartments:", err);
    }
  };

  useEffect(() => {
    fetchApartments();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchResidents();
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  // 📌 Handle change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 📌 Reset form
  const resetForm = () => {
    setCurrentResident(null);
    setFormData({
      fullName: "",
      dateOfBirth: "",
      phoneNumber: "",
      idCardNumber: "",
      email: "",
      password: "",
      apartment: "",
      isHeadOfHousehold: false,
    });
  };

  // 📌 Submit form (Thêm / Sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      const payload = {
        ...formData,
        isHeadOfHousehold: !!formData.isHeadOfHousehold,
      };

      if (!payload.apartment) {
        toast.warn("⚠️ Vui lòng chọn căn hộ trước khi lưu!");
        return;
      }

      if (currentResident) {
        await api.put(`/residents/${currentResident._id}`, payload, config);
        toast.success("✅ Cập nhật cư dân thành công!");
      } else {
        await api.post(`/residents`, payload, config);
        toast.success("👤 Thêm cư dân mới thành công!");
      }

      fetchResidents();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving resident:", err);
      toast.error(
        err.response?.data?.message ||
          "Không thể lưu cư dân. Vui lòng kiểm tra thông tin!"
      );
    }
  };

  // 📌 Delete resident (SweetAlert confirm)
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Xóa cư dân này?",
      text: "Thao tác này sẽ xóa vĩnh viễn cư dân và tài khoản liên kết!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Xóa ngay",
      cancelButtonText: "Hủy",
      reverseButtons: true,
      background: "#fff",
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        await api.delete(`/residents/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("🗑️ Đã xóa cư dân thành công!");
        fetchResidents();
      } catch (err) {
        console.error("Error deleting resident:", err);
        toast.error("❌ Không thể xóa cư dân!");
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

  // 📌 Edit resident
  const handleEdit = (resident) => {
    setCurrentResident(resident);
    setFormData({
      fullName: resident.fullName,
      dateOfBirth: resident.dateOfBirth?.split("T")[0] || "",
      phoneNumber: resident.phoneNumber,
      idCardNumber: resident.idCardNumber || "",
      email: resident.email || "",
      password: "",
      apartment: resident.apartment?._id || "",
      isHeadOfHousehold: resident.isHeadOfHousehold,
    });
    toast.info("✏️ Đang chỉnh sửa thông tin cư dân");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="resident-page">
      <h2 className="resident-title">👥 Quản lý cư dân</h2>

      {/* ✅ Form thêm/sửa cư dân */}
      <form onSubmit={handleSubmit} className="resident-form">
        <div className="form-row">
          <div className="form-group">
            <label>Họ và tên *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Ngày sinh *</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại *</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Số CCCD / CMND *</label>
            <input
              type="text"
              name="idCardNumber"
              value={formData.idCardNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {!currentResident && (
            <div className="form-group">
              <label>Mật khẩu *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Căn hộ *</label>
            <select
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              required
            >
              <option value="">-- Chọn căn hộ --</option>
              {apartments.map((apt) => (
                <option key={apt._id} value={apt._id}>
                  {apt.apartmentCode} - {apt.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="isHeadOfHousehold"
              checked={formData.isHeadOfHousehold}
              onChange={handleChange}
            />
            Là chủ hộ
          </label>
        </div>

        <div className="modal-footer">
          <button type="submit" className="btn-save">
            {currentResident ? "💾 Cập nhật" : "➕ Thêm mới"}
          </button>
          {currentResident && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* 🔍 Thanh tìm kiếm */}
      <div className="resident-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, SĐT, CCCD hoặc căn hộ..."
          className="resident-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 🧾 Bảng cư dân */}
      <div className="resident-table">
        <table>
          <thead>
            <tr>
              <th>Họ và tên</th>
              <th>Ngày sinh</th>
              <th>SĐT</th>
              <th>Email</th>
              <th>Căn hộ</th>
              <th>Chủ hộ</th>
              <th className="text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              residents.map((r) => (
                <tr key={r._id}>
                  <td>{r.fullName}</td>
                  <td>{r.dateOfBirth?.split("T")[0] || "-"}</td>
                  <td>{r.phoneNumber}</td>
                  <td>{r.email}</td>
                  <td>{r.apartment?.apartmentCode || "N/A"}</td>
                  <td>
                    {r.isHeadOfHousehold ? (
                      <span className="badge-green">Có</span>
                    ) : (
                      <span className="badge-gray">Không</span>
                    )}
                  </td>
                  <td className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(r)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(r._id)}
                    >
                      <TrashIcon className="h-4 w-4" />
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

export default ResidentManagement;
