import React, { useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import "../../styles/client/support.css";

// ✅ Socket kết nối tới backend (thay domain nếu cần)
const socket = io("https://quanlichungcumini.onrender.com");

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // 🔗 Kết nối socket và nhận tin nhắn realtime
  useEffect(() => {
    socket.on("connect", () => console.log("✅ Kết nối thành công tới server socket"));
    socket.on("disconnect", () => console.log("❌ Mất kết nối socket"));

    // 📥 Nhận tin nhắn realtime
    socket.on("receive_message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.disconnect();
  }, []);

  // 📜 Lấy lịch sử tin nhắn từ backend (nếu có API)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch("https://quanlichungcumini.onrender.com/api/chat");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.warn("⚠️ Không thể tải lịch sử chat:", err.message);
      }
    };
    fetchHistory();
  }, []);

  // 🔽 Tự động scroll xuống cuối khi có tin mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✉️ Gửi tin nhắn
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      sender: "resident", // hoặc lấy từ user.role nếu có AuthContext
      content: input.trim(),
      createdAt: new Date(),
    };

    // Gửi tin nhắn lên server
    socket.emit("send_message", newMessage);
    // Hiển thị ngay ở giao diện local
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
  };

  // ================== GIAO DIỆN ==================
  return (
    <div className="support-wrapper">
      {/* 🔹 KHUNG CHAT */}
      <section className="chat-section">
        <h2 className="section-title">💬 Chat hỗ trợ cư dân</h2>

        <div className="chat-container">
          {messages.length === 0 ? (
            <p className="no-message">Chưa có tin nhắn nào</p>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`chat-row ${
                  msg.sender === "resident" ? "right" : "left"
                }`}
              >
                <div className="chat-bubble">
                  <strong>
                    {msg.sender === "resident" ? "Bạn" : "Admin"}:
                  </strong>{" "}
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Form gửi tin */}
        <form className="chat-input-box" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">Gửi</button>
        </form>
      </section>

      {/* 🔹 THÔNG TIN LIÊN HỆ */}
      <aside className="info-section">
        <h3 className="section-title">📍 Liên hệ Ban quản lý</h3>
        <div className="info-card">
          <p><strong>Ban Quản Lý Chung Cư Mini</strong></p>
          <p>📞 0909 000 111</p>
          <p>✉️ admin@chungcu-mini.vn</p>
          <p>🏢 Vinhomes Grand Park, Nguyễn Xiển, Quận 9</p>
        </div>

        <div className="map-container">
          <iframe
            title="Bản đồ"
            src="https://www.google.com/maps?q=Vinhomes%20Grand%20Park%2C%20Qu%E1%BA%ADn%209%2C%20TP.HCM&output=embed"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </aside>
    </div>
  );
};

export default Support;
