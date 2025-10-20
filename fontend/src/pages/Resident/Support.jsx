import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../../styles/client/support.css";

const API_BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://quanlichungcumini.onrender.com";

const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
};

const Support = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user")) || {
    _id: "guest",
    name: "Khách",
    apartmentCode: "N/A",
  };

  // 🧩 Load lịch sử
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat/${user._id}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải lịch sử chat:", err.message);
      }
    };
    fetchHistory();
  }, []);

  // 🔗 Kết nối socket
  useEffect(() => {
    socket.emit("resident_join", {
      _id: user._id,
      fullName: user.name,
      apartmentCode: user.apartmentCode,
    });

    socket.on("receive_message", (msg) => {
      if (msg.receiverId === user._id || msg.sender === "admin") {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => socket.off("receive_message");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      sender: "resident",
      senderId: user._id,
      receiverId: "admin",
      content: input.trim(),
      timestamp: new Date(),
    };

    socket.emit("send_message", newMsg);
    setInput("");
  };

  return (
    <div className="support-wrapper">
      <section className="chat-section">
        <h2 className="section-title">💬 Hỗ trợ cư dân trực tuyến</h2>

        <div className="chat-container">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-row ${m.sender === "resident" ? "right" : "left"}`}
            >
              <div className="chat-bubble">
                <div>
                  <strong>{m.sender === "resident" ? "Bạn" : "Admin"}:</strong>{" "}
                  {m.content}
                </div>
                <span className="time">{formatTime(m.createdAt || m.timestamp)}</span>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

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

      <aside className="info-section">
        <h3 className="section-title">📍 Ban Quản Lý Chung Cư</h3>
        <div className="info-card">
          <p><strong>Ban Quản Lý Chung Cư Mini</strong></p>
          <p>📞 0909 000 111</p>
          <p>✉️ admin@chungcu-mini.vn</p>
          <p>🏢 Vinhomes Grand Park, Quận 9</p>
        </div>
        <div className="map-container">
          <iframe
            title="Bản đồ"
            src="https://www.google.com/maps?q=Vinhomes%20Grand%20Park&output=embed"
            loading="lazy"
            allowFullScreen
          ></iframe>
        </div>
      </aside>
    </div>
  );
};

export default Support;
