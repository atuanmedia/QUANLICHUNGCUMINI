import React, { useEffect, useState } from "react";
import axios from "../../api/api";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import "../../styles/admin/componentadmin.css";

const ApartmentManagement = () => {
    const [apartments, setApartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentApartment, setCurrentApartment] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form data;

    const [formData, setFormData] = useState({

        apartmentCode: "",
        name: "",
        area: "",
        floor: "", // ✅ thêm floor để backend không báo lỗi
        status: "empty",
    });

    // 📌 Lấy danh sách căn hộ
    const fetchApartments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const { data } = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL}/api/apartments`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { search: searchTerm },
                }
            );
            setApartments(data);
        } catch (err) {
            console.error("Error fetching apartments:", err);
            setError("Không thể tải danh sách căn hộ.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApartments();
    }, [searchTerm]);

    // 📌 Xử lý thay đổi input
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // 📌 Reset form
    const resetForm = () => {
        setCurrentApartment(null);
        setFormData({
            apartmentCode: "",
            name: "",
            area: "",
            floor: "",
            status: "empty",
        });
    };

    // 📌 Submit form (thêm hoặc sửa)
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

            // ✅ chuẩn hóa payload
            const payload = {
                ...formData,
                area: Number(formData.area),
                floor: Number(formData.floor),
            };
            console.log("📦 Payload gửi lên:", payload);

            if (currentApartment) {
                await axios.put(
                    `${import.meta.env.VITE_API_BASE_URL}/api/apartments/${currentApartment._id}`,
                    payload,
                    config
                );
            } else {
                await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/api/apartments`,
                    payload,
                    config
                );
            }

            fetchApartments();
            resetForm();
        } catch (err) {
            console.error("❌ Error saving apartment:", err);
            setError("Không thể lưu căn hộ.");
        }
    };

    // 📌 Xóa căn hộ
    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa căn hộ này?")) return;
        try {
            const token = localStorage.getItem("token");
            await axios.delete(
                `${import.meta.env.VITE_API_BASE_URL}/api/apartments/${id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchApartments();
        } catch (err) {
            console.error("Error deleting apartment:", err);
            setError("Không thể xóa căn hộ.");
        }
    };

    // 📌 Khi nhấn Sửa
    const handleEdit = (apartment) => {
        setCurrentApartment(apartment);
        setFormData({
            apartmentCode: apartment.apartmentCode,
            name: apartment.name,
            area: apartment.area,
            floor: apartment.floor || "",
            status: apartment.status,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="resident-page">
            <h2 className="resident-title">Quản lý Căn hộ</h2>

            {/* Form thêm/sửa căn hộ */}
            <form onSubmit={handleSubmit} className="resident-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Mã căn hộ *</label>
                        <input
                            type="text"
                            name="apartmentCode"
                            value={formData.apartmentCode}
                            onChange={handleChange}
                            placeholder="VD: A101"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Tên căn hộ *</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Căn hộ tầng 3 - Block A"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Diện tích (m²) *</label>
                        <input
                            type="number"
                            name="area"
                            value={formData.area}
                            onChange={handleChange}
                            placeholder="VD: 80"
                            required
                            min="10"
                        />
                    </div>

                    <div className="form-group">
                        <label>Tầng *</label>
                        <input
                            type="number"
                            name="floor"
                            value={formData.floor}
                            onChange={handleChange}
                            placeholder="VD: 2"
                            required
                        />
                    </div>


                    <div className="form-group">
                        <label>Trạng thái *</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                        >
                            <option value="empty">Trống</option>
                            <option value="occupied">Đang ở</option>
                            <option value="maintenance">Bảo trì</option>
                        </select>
                    </div>
                </div>

                <div className="modal-footer">
                    <button type="submit" className="btn-save">
                        {currentApartment ? "Cập nhật" : "Thêm mới"}
                    </button>
                    {currentApartment && (
                        <button type="button" onClick={resetForm} className="btn-cancel">
                            Hủy
                        </button>
                    )}
                </div>
            </form>

            {/* Thanh tìm kiếm */}
            <div className="resident-controls">
                <input
                    type="text"
                    placeholder="🔍 Tìm kiếm mã, tên căn hộ..."
                    className="resident-search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bảng danh sách căn hộ */}
            <div className="resident-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mã căn hộ</th>
                            <th>Tên căn hộ</th>
                            <th>Diện tích (m²)</th>
                            <th>Tầng</th>
                            <th>Trạng thái</th>
                            <th className="text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {apartments.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="no-data">
                                    Không có dữ liệu
                                </td>
                            </tr>
                        ) : (
                            apartments.map((apt) => (
                                <tr key={apt._id}>
                                    <td>{apt.apartmentCode}</td>
                                    <td>{apt.name}</td>
                                    <td>{apt.area}</td>
                                    <td>{apt.floor}</td>
                                    <td>
                                        {apt.status === "occupied" ? (
                                            <span className="badge-green">Đang ở</span>
                                        ) : apt.status === "maintenance" ? (
                                            <span className="badge-yellow">Bảo trì</span>
                                        ) : (
                                            <span className="badge-gray">Trống</span>
                                        )}
                                    </td>
                                    <td className="action-buttons">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleEdit(apt)}
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(apt._id)}
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

export default ApartmentManagement;
