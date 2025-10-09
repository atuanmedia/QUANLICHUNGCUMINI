import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCommentDots, FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import api from "../../api/api";
import "../../styles/client/resident-reports.css";

const ResidentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", content: "" });
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  // 📥 Lấy danh sách phản ánh
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get("/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải phản ánh:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, [token]);

  // ✉️ Gửi phản ánh mới
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) {
      return alert("Vui lòng nhập đầy đủ tiêu đề và nội dung!");
    }

    setSubmitting(true);
    try {
      const res = await api.post("/reports", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReports([res.data, ...reports]);
      setForm({ title: "", content: "" });
    } catch (err) {
      console.error("Lỗi khi gửi phản ánh:", err);
      alert("Gửi phản ánh thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="reports-loading">Đang tải phản ánh...</div>;

  return (
    <div className="reports-page">
      <motion.h1
        className="reports-title"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        📢 Phản ánh từ cư dân
      </motion.h1>

      {/* Form gửi phản ánh */}
      <motion.form
        onSubmit={handleSubmit}
        className="report-form"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <input
          type="text"
          placeholder="Nhập tiêu đề phản ánh..."
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="report-input"
        />
        <textarea
          placeholder="Nhập nội dung phản ánh..."
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="report-textarea"
        ></textarea>
        <div className="button-container">
          <button
            type="submit"
            className="report-button"
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : (
              <>
                <FaPaperPlane /> Gửi phản ánh
              </>
            )}
          </button>
        </div>

      </motion.form>








      {/* Danh sách phản ánh */}
      <div className="reports-list">
        {reports.length === 0 ? (
          <div className="report-empty">Chưa có phản ánh nào.</div>
        ) : (
          reports.map((r) => (
            <motion.div
              key={r._id}
              className="report-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="report-header">
                <h3><FaCommentDots /> {r.title}</h3>
                {r.status === "resolved" && (
                  <span className="status-resolved"><FaCheckCircle /> Đã xử lý</span>
                )}
              </div>
              <p className="report-content">{r.content}</p>
              <div className="report-footer">
                <small>Ngày gửi: {new Date(r.createdAt).toLocaleDateString("vi-VN")}</small>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div >
  );
};

export default ResidentReports;
