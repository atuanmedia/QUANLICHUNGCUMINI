import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import "../../styles/client/temp-residence.css"; // ✅ thêm dòng này

const TempResidenceResident = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: "tam_tru",
    fromDate: "",
    toDate: "",
    reason: "",
    place: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/temp-residence`,
        { ...form, resident: user.residentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Gửi khai báo thành công!");
      console.log("Created:", res.data);
    } catch (err) {
      console.error("Error:", err);
      setMessage("❌ Gửi thất bại, vui lòng thử lại!");
    }
  };

  return (
    <div className="temp-residence-container">
      <h1 className="page-title">📄 Khai báo Tạm trú / Tạm vắng</h1>

      <form onSubmit={handleSubmit} className="temp-residence-form">
        <div className="form-group">
          <label>Loại:</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="input-field"
          >
            <option value="tam_tru">Tạm trú</option>
            <option value="tam_vang">Tạm vắng</option>
          </select>
        </div>

        <div className="form-group">
          <label>Từ ngày:</label>
          <input
            type="date"
            name="fromDate"
            value={form.fromDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Đến ngày:</label>
          <input
            type="date"
            name="toDate"
            value={form.toDate}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Lý do:</label>
          <input
            type="text"
            name="reason"
            value={form.reason}
            onChange={handleChange}
            className="input-field"
            placeholder="Nhập lý do tạm trú / tạm vắng..."
          />
        </div>

        <div className="form-group">
          <label>Nơi đến / Nơi tạm trú:</label>
          <input
            type="text"
            name="place"
            value={form.place}
            onChange={handleChange}
            className="input-field"
            placeholder="Nhập địa chỉ nơi bạn sẽ ở / đến..."
          />
        </div>

        <button type="submit" className="submit-btn">
          Gửi khai báo
        </button>
      </form>

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default TempResidenceResident;
