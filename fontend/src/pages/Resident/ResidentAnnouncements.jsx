import React, { useEffect, useState } from "react";
import { FaBullhorn, FaFilter, FaCalendarAlt } from "react-icons/fa";
import api from "../../api/api";
import "../../styles/client/announcements-client.css";

const ResidentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/announcements", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnnouncements(res.data || []);
      } catch (err) {
        console.error("Lỗi khi tải thông báo:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  const filtered =
    filter === "all"
      ? announcements
      : announcements.filter((a) => a.audienceScope === filter);

  return (
    <div className="announcement-page">
      <div className="announcement-header">
        <h1>
          <FaBullhorn className="icon" /> Thông báo cư dân
        </h1>
        <p className="subtitle">
          Nơi cập nhật các thông báo, sự kiện và tin tức mới nhất từ Ban quản lý.
        </p>
      </div>



      <div className="announcement-filter">
        <FaFilter className="filter-icon" />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">Tất cả thông báo</option>
          <option value="all">Toàn bộ cư dân</option>
          <option value="apartment">Theo căn hộ</option>
          <option value="urgent">Khẩn cấp</option>
          <option value="event">Sự kiện</option>
        </select>
      </div>

      {loading ? (
        <p className="announcement-loading">Đang tải thông báo...</p>
      ) : filtered.length === 0 ? (
        <p className="announcement-empty">Hiện chưa có thông báo nào 📭</p>
      ) : (
        <div className="announcement-list">
          {filtered.map((item) => (
            <div key={item._id} className="announcement-card">
              <div className="announcement-header-row">
                <h2 className="announcement-title">{item.title}</h2>
                <span
                  className={`announcement-tag ${
                    item.audienceScope === "urgent"
                      ? "tag-urgent"
                      : item.audienceScope === "event"
                      ? "tag-event"
                      : "tag-general"
                  }`}
                >
                  {item.audienceScope === "urgent"
                    ? "Khẩn cấp"
                    : item.audienceScope === "event"
                    ? "Sự kiện"
                    : "Chung"}
                </span>
              </div>
              <p className="announcement-content">{item.content}</p>

              <div className="announcement-footer">
                <FaCalendarAlt className="calendar-icon" />
                <span>
                  {new Date(item.publishAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="posted-by">
                  BQL: {item.createdBy?.name || "Không rõ"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResidentAnnouncements;
