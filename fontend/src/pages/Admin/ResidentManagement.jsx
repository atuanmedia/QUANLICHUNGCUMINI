import React, { useEffect, useState } from "react";
import axios from "../../api/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
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
    apartment: "", // ✅ phải có key này
    isHeadOfHousehold: false,
  });

  // 📌 Lấy danh sách cư dân
  const fetchResidents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/residents`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { search: searchTerm },
        }
      );
      setResidents(data);
    } catch (err) {
      console.error("Error fetching residents:", err);
      setError("Không thể tải danh sách cư dân.");
    } finally {
      setLoading(false);
    }
  };

  // 📌 Lấy danh sách căn hộ
  const fetchApartments = async () => {
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/apartments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setApartments(data);
    } catch (err) {
      console.error("Error fetching apartments:", err);
    }
  };

  useEffect(() => {
    fetchResidents();
    fetchApartments();
  }, [searchTerm]);

  // 📌 Xử lý thay đổi input
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

  // 📌 Submit form (thêm hoặc sửa)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      console.log("🔑 Token gửi lên:", token);
      console.log("📦 Payload gửi lên:", formData);

      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      // ✅ Gửi đúng tên trường mà backend yêu cầu (apartment)
      const payload = { ...formData };

      if (!payload.apartment) {
        alert("Vui lòng chọn căn hộ trước khi lưu!");
        return;
      }

      if (currentResident) {
        await axios.put(
          `${import.meta.env.VITE_API_BASE_URL}/api/residents/${currentResident._id}`,
          payload,
          config
        );
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/residents`,
          payload,
          config
        );
      }

      fetchResidents();
      resetForm();
    } catch (err) {
      console.error("❌ Error saving resident:", err);
      setError("Không thể lưu cư dân.");
    }
  };

  // 📌 Xóa cư dân
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa cư dân này?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/api/residents/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchResidents();
    } catch (err) {
      console.error("Error deleting resident:", err);
      setError("Không thể xóa cư dân.");
    }
  };

  // 📌 Khi nhấn Sửa
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="resident-page">
      <h2 className="resident-title">Quản lý cư dân</h2>

      {/* Form thêm/sửa cư dân */}
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
            {currentResident ? "Cập nhật" : "Thêm mới"}
          </button>
          {currentResident && (
            <button type="button" onClick={resetForm} className="btn-cancel">
              Hủy
            </button>
          )}
        </div>
      </form>

      {/* Thanh tìm kiếm */}
      {/* <div className="resident-controls">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm theo tên, SĐT, email..."
          className="resident-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div> */}

      <div className="resident-controls">
        <div className="search-container">
          <div className="search-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>

          </div>
          <input
            type="text"
            className="resident-search"
            placeholder="Tìm kiếm theo căn hộ, loại, kỳ..."
          />
        </div>
      </div>

      {/* Bảng cư dân */}
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
